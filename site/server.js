const path = require('path');
const fs = require('fs/promises');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Stripe = require('stripe');
require('dotenv').config();

const { PRODUCTS, buildOrder } = require('./data/catalog');

const app = express();
const port = Number(process.env.PORT || 4242);
const rootDir = __dirname;
const pagesDir = path.join(rootDir, 'pages');
const storageDir = path.join(rootDir, 'storage');
const orderEventsFile = path.join(storageDir, 'stripe-order-events.jsonl');
const processedEventsFile = path.join(storageDir, 'stripe-processed-events.json');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

// CRM Andivino (andivinocrm.vercel.app) : reçoit les inscriptions newsletter et les commandes payées,
// de serveur à serveur. Les clés partagées ne quittent jamais le serveur.
const crmUrl = (process.env.CRM_URL || 'https://andivinocrm.vercel.app').replace(/\/+$/, '');
const ordersSecret = process.env.ORDERS_API_SECRET;

app.disable('x-powered-by');
// Dev-only allowance so impeccable live mode can load. Never active on Railway or in production.
const __impeccableLiveDev = !process.env.RAILWAY_ENVIRONMENT && process.env.NODE_ENV !== 'production';
const __liveSrc = __impeccableLiveDev ? ['http://localhost:8400'] : [];

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      scriptSrc: ["'self'", 'https://js.stripe.com', "'sha256-wdcBSdLWsvB7koKbH4Q4rVx7/fjw4vYHJKGw3NnqCC8='", ...__liveSrc],
      styleSrc: ["'self'", 'https://fonts.googleapis.com', ...(__impeccableLiveDev ? ["'unsafe-inline'"] : [])],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'https://api.stripe.com', ...__liveSrc],
      frameSrc: ['https://js.stripe.com', 'https://hooks.stripe.com'],
      formAction: ["'self'"],
      upgradeInsecureRequests: null
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Version générée au démarrage — change à chaque redéploiement Railway
const BUILD_VERSION = Date.now().toString(36);

// Images : cache 7 jours (rarement modifiées)
app.use('/assets/images', express.static(path.join(rootDir, 'assets/images'), {
  maxAge: '7d'
}));

// CSS et JS : cache 1h, invalidé par ?v= dans les URLs HTML
app.use('/assets', express.static(path.join(rootDir, 'assets'), {
  maxAge: '1h'
}));

app.post('/api/stripe/webhook', express.raw({ type: 'application/json', limit: '100kb' }), async (req, res) => {
  if (!stripe || !stripeWebhookSecret) {
    return res.status(503).json({ error: 'Webhook Stripe non configure.' });
  }

  const signature = req.headers['stripe-signature'];
  if (!signature) {
    return res.status(400).send('Signature Stripe manquante.');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, stripeWebhookSecret);
  } catch (error) {
    return res.status(400).send('Signature Stripe invalide.');
  }

  try {
    if (await hasProcessedEvent(event.id)) {
      return res.json({ received: true, duplicate: true });
    }

    // La commande part au CRM ; tant qu'il ne l'a pas acceptée, l'événement n'est pas marqué traité
    // et Stripe le renvoie (le CRM ignore une commande qu'il a déjà).
    if (event.type === 'payment_intent.succeeded') {
      const order = orderFromPaymentIntent(event);
      await recordPaymentIntentEvent(event, order);
      await sendOrderToCrm(order);
    }

    await markProcessedEvent(event.id);
    return res.json({ received: true });
  } catch (error) {
    console.error(`[stripe] ${event.type} ${event.id} non traité :`, error.message);
    return res.status(500).json({ error: 'Webhook recu mais non traite.' });
  }
});

app.use(express.json({ limit: '30kb' }));

const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});

function page(fileName) {
  return path.join(pagesDir, fileName);
}

// Cache HTML en mémoire avec version injectée dans les URLs CSS/JS
const htmlCache = {};

async function getHtmlWithVersion(fileName) {
  if (htmlCache[fileName]) return htmlCache[fileName];
  let html = await fs.readFile(page(fileName), 'utf8');
  html = html.replace(/(href|src)="(\/assets\/[^"]+\.(css|js))"/g, `$1="$2?v=${BUILD_VERSION}"`);
  htmlCache[fileName] = html;
  return html;
}

function sendPage(fileName) {
  return async (req, res) => {
    try {
      const html = await getHtmlWithVersion(fileName);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (e) {
      res.status(500).send('Erreur serveur');
    }
  };
}

function cleanText(value, maxLength = 120) {
  return String(value || '').trim().slice(0, maxLength);
}

// Pas d'adresse pour un retrait en degustation.
function normalizeCustomer(raw = {}, shippingMode) {
  const customer = {
    prenom: cleanText(raw.prenom, 80),
    nom: cleanText(raw.nom, 80),
    email: cleanText(raw.email, 160).toLowerCase(),
    tel: cleanText(raw.tel, 40),
    adresse: cleanText(raw.adresse, 180),
    cp: cleanText(raw.cp, 12),
    ville: cleanText(raw.ville, 100),
    message: cleanText(raw.message, 600)
  };

  const needsAddress = shippingMode !== 'degustation';
  if (!customer.prenom || !customer.nom || !customer.email || (needsAddress && (!customer.adresse || !customer.cp || !customer.ville))) {
    throw new Error('Coordonnees incompletes.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    throw new Error('Email invalide.');
  }

  return customer;
}

async function readProcessedEventIds() {
  try {
    const content = await fs.readFile(processedEventsFile, 'utf8');
    const ids = JSON.parse(content);
    return Array.isArray(ids) ? ids : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function hasProcessedEvent(eventId) {
  const ids = await readProcessedEventIds();
  return ids.includes(eventId);
}

async function markProcessedEvent(eventId) {
  await fs.mkdir(storageDir, { recursive: true });
  const ids = await readProcessedEventIds();
  if (!ids.includes(eventId)) ids.push(eventId);
  await fs.writeFile(processedEventsFile, `${JSON.stringify(ids.slice(-5000), null, 2)}\n`);
}

function parseMetadataCart(cart) {
  try {
    const parsed = JSON.parse(cart || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

// La commande telle que le CRM la reçoit, reconstruite depuis le PaymentIntent : les lignes et leurs
// prix viennent du catalogue serveur, le port est ce qui reste du montant encaissé.
function orderFromPaymentIntent(event) {
  const paymentIntent = event.data.object;
  const metadata = paymentIntent.metadata || {};
  const amountPaid = paymentIntent.amount_received || paymentIntent.amount;
  const lines = parseMetadataCart(metadata.cart).map((item) => {
    const product = PRODUCTS[item.id];
    return {
      productId: String(item.id || ''),
      name: product ? product.name : String(item.id || ''),
      quantity: Number(item.qty) || 0,
      unitAmount: product ? product.unitAmount : null
    };
  });
  const wineAmount = lines.reduce((sum, line) => sum + (line.unitAmount || 0) * line.quantity, 0);
  const fullName = cleanText(metadata.customer_name || paymentIntent.shipping?.name, 160);
  // Commandes antérieures aux champs prénom / nom séparés : on coupe au premier espace.
  const firstName = metadata.customer_first_name ?? fullName.split(' ')[0];
  const lastName = metadata.customer_last_name ?? fullName.split(' ').slice(1).join(' ');
  const address = paymentIntent.shipping?.address || {};

  return {
    paymentIntentId: paymentIntent.id,
    paidAt: new Date((event.created || Date.now() / 1000) * 1000).toISOString(),
    amountPaid,
    currency: paymentIntent.currency,
    customer: {
      firstName,
      lastName,
      email: paymentIntent.receipt_email || metadata.customer_email || null,
      phone: paymentIntent.shipping?.phone || metadata.customer_phone || null,
      message: metadata.customer_message || null
    },
    shipping: {
      mode: metadata.shipping_mode || null,
      amount: lines.every((line) => line.unitAmount !== null) && amountPaid >= wineAmount ? amountPaid - wineAmount : null,
      address: {
        line1: address.line1 || null,
        postalCode: address.postal_code || null,
        city: address.city || null,
        country: address.country || null
      }
    },
    lines
  };
}

// Journal local de secours (perdu au redéploiement Railway) : une ligne par réception, retries compris.
async function recordPaymentIntentEvent(event, order) {
  try {
    await fs.mkdir(storageDir, { recursive: true });
    const record = { receivedAt: new Date().toISOString(), eventId: event.id, status: event.data.object.status, order };
    await fs.appendFile(orderEventsFile, `${JSON.stringify(record)}\n`);
  } catch (error) {
    console.error('[stripe] journal local des commandes impossible :', error.message);
  }
}

async function sendOrderToCrm(order) {
  if (!ordersSecret) throw new Error('ORDERS_API_SECRET manquant');
  const crmResponse = await fetch(`${crmUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ordersSecret}` },
    body: JSON.stringify(order),
    signal: AbortSignal.timeout(10000)
  });
  if (!crmResponse.ok) throw new Error(`CRM ${crmResponse.status}`);
}

app.get('/', sendPage('home.html'));
app.get(['/commande', '/commande/'], sendPage('commande.html'));
app.get(['/chroniques', '/chroniques/'], sendPage('chroniques.html'));
// Anciennes chroniques supprimées -> redirection permanente
app.get(['/chroniques/mendoza-terroir-andin', '/chroniques/mendoza-terroir-andin/'], (req, res) => res.redirect(301, '/chroniques/malbec-argentin-histoire-terroirs'));
app.get(['/chroniques/malbec-cabernet-assemblage-argentin', '/chroniques/malbec-cabernet-assemblage-argentin/'], (req, res) => res.redirect(301, '/chroniques/malbec-argentin-histoire-terroirs'));
app.get(['/chroniques/vendanges-bodega-poesia-recit', '/chroniques/vendanges-bodega-poesia-recit/'], (req, res) => res.redirect(301, '/chroniques'));
app.get(['/chroniques/malbec-argentin-histoire-terroirs', '/chroniques/malbec-argentin-histoire-terroirs/'], sendPage('chronique-malbec-argentin-histoire-terroirs.html'));
app.get(['/chroniques/accords-mets-vins-malbec-argentin', '/chroniques/accords-mets-vins-malbec-argentin/'], sendPage('chronique-accords-mets-vins-malbec-argentin.html'));
app.get(['/products/mendoza/lujan-de-cuyo/poesia-2014', '/products/mendoza/lujan-de-cuyo/poesia-2014/'], sendPage('vin-poesia-2014.html'));
app.get(['/products/mendoza/lujan-de-cuyo/cuvee-helene-2016', '/products/mendoza/lujan-de-cuyo/cuvee-helene-2016/'], sendPage('vin-cuvee-helene-2016.html'));
app.get(['/products/mendoza/lujan-de-cuyo/clos-des-andes-2017', '/products/mendoza/lujan-de-cuyo/clos-des-andes-2017/'], sendPage('vin-clos-des-andes-2017.html'));

// Anciennes URLs /vins/xxx (indexées avant restructuration) -> redirection permanente
app.get(['/vins/poesia-2014', '/vins/poesia-2014/'], (req, res) => res.redirect(301, '/products/mendoza/lujan-de-cuyo/poesia-2014'));
app.get(['/vins/cuvee-helene-2016', '/vins/cuvee-helene-2016/'], (req, res) => res.redirect(301, '/products/mendoza/lujan-de-cuyo/cuvee-helene-2016'));
app.get(['/vins/clos-des-andes-2017', '/vins/clos-des-andes-2017/'], (req, res) => res.redirect(301, '/products/mendoza/lujan-de-cuyo/clos-des-andes-2017'));
app.get(['/paiement/success', '/paiement/success/'], sendPage('payment-success.html'));
app.get(['/paiement/cancel', '/paiement/cancel/'], sendPage('payment-cancel.html'));
app.get(['/newsletter', '/newsletter/'], sendPage('newsletter.html'));
app.get(['/legal/cgv', '/legal/cgv/'], sendPage('legal-cgv.html'));
app.get(['/legal/mentions-legales', '/legal/mentions-legales/'], sendPage('legal-mentions-legales.html'));

app.get('/robots.txt', (req, res) => res.sendFile(path.join(rootDir, 'robots.txt')));
app.get('/sitemap.xml', (req, res) => res.sendFile(path.join(rootDir, 'sitemap.xml')));

app.get('/api/stripe-config', (req, res) => {
  if (!stripePublishableKey) {
    return res.status(503).json({ error: 'Configuration Stripe publique manquante.' });
  }
  return res.json({ publishableKey: stripePublishableKey });
});

// Coordonnees portees par le PaymentIntent : a la creation, puis si le client corrige un champ apres
// avoir saisi sa carte (sans remonter le formulaire Stripe).
function paymentIntentCustomerFields(order, customer) {
  return {
    receipt_email: customer.email,
    // Stripe exige une adresse dans shipping : rien a envoyer pour un retrait.
    ...(customer.adresse ? {
      shipping: {
        name: `${customer.prenom} ${customer.nom}`,
        phone: customer.tel || undefined,
        address: {
          line1: customer.adresse,
          postal_code: customer.cp,
          city: customer.ville,
          country: 'FR'
        }
      }
    } : {}),
    metadata: {
      customer_name: `${customer.prenom} ${customer.nom}`,
      customer_first_name: customer.prenom,
      customer_last_name: customer.nom,
      customer_email: customer.email,
      // Chaine vide = cle effacee par Stripe, si le client vide le champ entre deux mises a jour.
      customer_phone: customer.tel,
      customer_message: customer.message.slice(0, 500),
      shipping_mode: order.shippingMode,
      bottle_count: String(order.bottleCount),
      order_total_cents: String(order.amount),
      cart: JSON.stringify(order.lineItems.map((item) => ({ id: item.id, qty: item.qty }))).slice(0, 450)
    }
  };
}

app.post('/api/create-payment-intent', paymentLimiter, async (req, res) => {
  try {
    if (!stripe || !stripePublishableKey) {
      return res.status(503).json({ error: 'Configuration Stripe serveur manquante.' });
    }

    const customer = normalizeCustomer(req.body.customer, req.body.shipping);
    const order = buildOrder(req.body.cart, req.body.shipping, customer);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.amount,
      currency: order.currency,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      ...paymentIntentCustomerFields(order, customer)
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      order: {
        amount: order.amount,
        currency: order.currency,
        subtotal: order.subtotal,
        shippingAmount: order.shippingAmount,
        shippingLabel: order.shippingLabel
      }
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Impossible de preparer le paiement.' });
  }
});

// Le client a modifie ses coordonnees apres la preparation du paiement : on met a jour le
// PaymentIntent existant. Le panier et le mode de livraison, eux, imposent un nouveau paiement.
app.post('/api/update-payment-intent', paymentLimiter, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Configuration Stripe serveur manquante.' });
    }

    const clientSecret = cleanText(req.body.clientSecret, 300);
    const paymentIntentId = clientSecret.split('_secret_')[0];
    const paymentIntent = paymentIntentId ? await stripe.paymentIntents.retrieve(paymentIntentId) : null;
    if (!paymentIntent || paymentIntent.client_secret !== clientSecret) {
      return res.status(400).json({ error: 'Paiement introuvable. Rechargez la page.' });
    }
    if (!['requires_payment_method', 'requires_confirmation'].includes(paymentIntent.status)) {
      return res.status(409).json({ error: 'Ce paiement ne peut plus être modifié.' });
    }

    const customer = normalizeCustomer(req.body.customer, req.body.shipping);
    const order = buildOrder(req.body.cart, req.body.shipping, customer);
    if (order.amount !== paymentIntent.amount || order.shippingMode !== paymentIntent.metadata.shipping_mode) {
      return res.status(409).json({ error: 'Votre commande a changé. Préparez à nouveau le paiement.' });
    }

    await stripe.paymentIntents.update(paymentIntentId, paymentIntentCustomerFields(order, customer));
    return res.json({ ok: true });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Impossible de mettre à jour le paiement.' });
  }
});

// Inscription newsletter : le formulaire de /newsletter poste ici, le serveur transmet au CRM, qui
// stocke les inscrits.
const newsletterSecret = process.env.NEWSLETTER_API_SECRET;

const newsletterLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives. Réessayez dans quelques minutes.' }
});

app.post('/api/newsletter', newsletterLimiter, async (req, res) => {
  const body = req.body || {};
  // Champ piège rempli : un robot. On répond comme si tout allait bien, sans rien enregistrer.
  if (cleanText(body.site, 200)) return res.json({ ok: true });

  const firstName = cleanText(body.prenom, 80);
  const lastName = cleanText(body.nom, 80);
  const email = cleanText(body.email, 160).toLowerCase();
  if (!firstName || !lastName) return res.status(400).json({ error: 'Indiquez votre prénom et votre nom.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Indiquez une adresse email valide.' });
  if (body.consent !== true) return res.status(400).json({ error: 'Cochez la case pour accepter de recevoir la newsletter.' });

  if (!newsletterSecret) {
    console.error('[newsletter] NEWSLETTER_API_SECRET manquant');
    return res.status(503).json({ error: 'Inscription indisponible pour le moment. Écrivez-nous à contact@andivino.fr.' });
  }

  try {
    const crmResponse = await fetch(`${crmUrl}/api/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${newsletterSecret}` },
      body: JSON.stringify({ email, firstName, lastName, source: 'site' }),
      signal: AbortSignal.timeout(8000)
    });
    if (!crmResponse.ok) throw new Error(`CRM ${crmResponse.status}`);
    return res.json({ ok: true });
  } catch (error) {
    console.error('[newsletter] envoi au CRM impossible :', error.message);
    return res.status(502).json({ error: 'Inscription impossible pour le moment. Réessayez dans quelques minutes.' });
  }
});

app.use((req, res) => {
  res.status(404).sendFile(page('404.html'));
});

app.listen(port, () => {
  console.log(`Andivino pret sur http://localhost:${port}`);
});
