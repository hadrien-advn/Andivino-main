const path = require('path');
const fs = require('fs/promises');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Stripe = require('stripe');
require('dotenv').config();

const { PRODUCTS, buildOrder } = require('./data/catalog');
const { DEGUSTATIONS, upcomingDegustations } = require('./assets/js/degustations.js');

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
      scriptSrc: ["'self'", 'https://js.stripe.com', ...__liveSrc],
      styleSrc: ["'self'", ...(__impeccableLiveDev ? ["'unsafe-inline'"] : [])],
      fontSrc: ["'self'"],
      // *.stripe.com, checkout.stripe.com : paiement Stripe Checkout intégré à /degustation.
      imgSrc: ["'self'", 'data:', 'https://*.stripe.com'],
      connectSrc: ["'self'", 'https://api.stripe.com', 'https://checkout.stripe.com', ...__liveSrc],
      frameSrc: ['https://js.stripe.com', 'https://hooks.stripe.com', 'https://checkout.stripe.com'],
      formAction: ["'self'"],
      upgradeInsecureRequests: null
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Le site n'utilise ni caméra, ni micro, ni géolocalisation. (payment non restreint : Apple Pay / Google Pay via Stripe.)
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Anciennes URLs (indexées avant restructuration) -> page qui les remplace.
const LEGACY_REDIRECTS = {
  '/vins/poesia-2014': '/products/mendoza/lujan-de-cuyo/poesia-2014',
  '/vins/cuvee-helene-2016': '/products/mendoza/lujan-de-cuyo/cuvee-helene-2016',
  '/vins/clos-des-andes-2017': '/products/mendoza/lujan-de-cuyo/clos-des-andes-2017',
  '/chroniques/mendoza-terroir-andin': '/chroniques/malbec-argentin-histoire-terroirs',
  '/chroniques/malbec-cabernet-assemblage-argentin': '/chroniques/malbec-argentin-histoire-terroirs',
  '/chroniques/vendanges-bodega-poesia-recit': '/chroniques'
};

// Une seule URL par page : www.andivino.fr -> andivino.fr, /page/ -> /page, ancienne URL -> nouvelle,
// le tout en une seule redirection permanente.
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const host = (req.headers.host || '').toLowerCase();
  const isWww = host === 'www.andivino.fr';
  const hasTrailingSlash = req.path.length > 1 && req.path.endsWith('/');
  // Les barres en tête sont réduites à une seule : « //site.com/ » ne doit pas devenir une redirection externe.
  const pathname = '/' + (hasTrailingSlash ? req.path.replace(/\/+$/, '') : req.path).replace(/^\/+/, '');
  const legacyTarget = Object.prototype.hasOwnProperty.call(LEGACY_REDIRECTS, pathname) ? LEGACY_REDIRECTS[pathname] : null;
  if (!isWww && !hasTrailingSlash && !legacyTarget) return next();
  const query = req.originalUrl.slice(req.path.length);
  const finalPath = legacyTarget || pathname;
  const target = isWww ? `https://andivino.fr${finalPath}${query}` : `${finalPath}${query}`;
  return res.redirect(301, target);
});

// Version générée au démarrage — change à chaque redéploiement Railway
const BUILD_VERSION = Date.now().toString(36);

// Polices (auto-hébergées) : cache 30 jours, le fichier ne change pas sous le même nom
app.use('/assets/fonts', express.static(path.join(rootDir, 'assets/fonts'), {
  maxAge: '30d'
}));

// Images : cache 7 jours (rarement modifiées)
app.use('/assets/images', express.static(path.join(rootDir, 'assets/images'), {
  maxAge: '7d'
}));

// CSS et JS : avec ?v= (ajouté par getHtmlWithVersion, change à chaque déploiement), l'URL ne
// resservira jamais un autre contenu : cache d'un an. Sans ?v= : 1h, comme avant.
app.use('/assets', express.static(path.join(rootDir, 'assets'), {
  cacheControl: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', res.req.query.v ? 'public, max-age=31536000, immutable' : 'public, max-age=3600');
  }
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
    // Inscription à une dégustation (Stripe Checkout) : les participants partent au CRM, pas une vente de vin.
    // checkout.session.completed couvre aussi les invitations à 0 € (code promo 100 %, pas de paiement) ;
    // la page de confirmation les transmet de toute façon.
    if (event.type === 'payment_intent.succeeded' && event.data.object.metadata?.kind === 'degustation') {
      const sessions = await stripe.checkout.sessions.list({ payment_intent: event.data.object.id, limit: 1 });
      if (sessions.data[0]) await sendTastingToCrm(sessions.data[0]);
    } else if (event.type === 'checkout.session.completed' && event.data.object.metadata?.kind === 'degustation') {
      await sendTastingToCrm(event.data.object);
    } else if (event.type === 'payment_intent.succeeded') {
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

// Dégustations de l'accueil écrites dans le HTML (lisibles sans JavaScript), avec le même balisage que
// renderDeg() dans assets/js/home.js, qui reprend la main dans le navigateur. Source : assets/js/degustations.js.
const DEG_MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
const DEG_ICON_TIME = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
const DEG_ICON_PIN = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
const escHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function renderHomeDegustations(html) {
  const now = new Date();
  const upcoming = upcomingDegustations(now);
  const tab = upcoming.length ? 'upcoming' : 'past';
  const items = upcoming.length ? upcoming : DEGUSTATIONS
    .filter((d) => !upcoming.includes(d))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const list = items.map((d) => {
    const dt = new Date(d.date);
    const cta = tab === 'upcoming'
      ? (d.url ? `<a href="${escHtml(d.url)}" class="btn-or">S'inscrire</a>` : '<span class="btn-or disabled">Sur invitation</span>')
      : '';
    return `<div class="ditem">
      <div class="ddate"><div class="dday">${dt.getDate()}</div><div class="dmon">${DEG_MONTHS[dt.getMonth()]} ${dt.getFullYear()}</div></div>
      <div class="dinfo"><h3>${escHtml(d.titre)}</h3><div class="dmeta"><span>${DEG_ICON_TIME}${escHtml(d.heure)}</span><span>${DEG_ICON_PIN}${escHtml(d.lieu)}</span></div></div>
      ${cta}
    </div>`;
  }).join('');
  return html
    .replace('<div class="deg-list" id="degList"></div>', `<div class="deg-list" id="degList">${list}</div>`)
    .replace('<p class="deg-note" id="degNote" hidden>', tab === 'past' ? '<p class="deg-note" id="degNote">' : '<p class="deg-note" id="degNote" hidden>')
    .replace('<button class="dtab active" data-tab="upcoming" aria-pressed="true">', `<button class="dtab${tab === 'upcoming' ? ' active' : ''}" data-tab="upcoming" aria-pressed="${tab === 'upcoming'}">`)
    .replace('<button class="dtab" data-tab="past" aria-pressed="false">', `<button class="dtab${tab === 'past' ? ' active' : ''}" data-tab="past" aria-pressed="${tab === 'past'}">`);
}

async function getHtmlWithVersion(fileName) {
  if (htmlCache[fileName]) return htmlCache[fileName];
  let html = await fs.readFile(page(fileName), 'utf8');
  if (fileName === 'home.html') html = renderHomeDegustations(html);
  html = html.replace(/(href|src)="(\/assets\/[^"]+\.(css|js))"/g, `$1="$2?v=${BUILD_VERSION}"`);
  htmlCache[fileName] = html;
  return html;
}

function sendPage(fileName) {
  return async (req, res) => {
    try {
      const html = await getHtmlWithVersion(fileName);
      // no-cache (revalidation via ETag) plutôt que no-store, qui empêche le retour arrière instantané du navigateur.
      res.setHeader('Cache-Control', 'no-cache');
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
app.get('/vins-argentins', sendPage('vins-argentins.html'));
app.get('/vin-argentin-paris', sendPage('vin-argentin-paris.html'));
app.get('/professionnels', sendPage('professionnels.html'));
app.get(['/chroniques', '/chroniques/'], sendPage('chroniques.html'));
app.get(['/chroniques/malbec-argentin-histoire-terroirs', '/chroniques/malbec-argentin-histoire-terroirs/'], sendPage('chronique-malbec-argentin-histoire-terroirs.html'));
app.get(['/chroniques/accords-mets-vins-malbec-argentin', '/chroniques/accords-mets-vins-malbec-argentin/'], sendPage('chronique-accords-mets-vins-malbec-argentin.html'));
app.get(['/products/mendoza/lujan-de-cuyo/poesia-2014', '/products/mendoza/lujan-de-cuyo/poesia-2014/'], sendPage('vin-poesia-2014.html'));
app.get(['/products/mendoza/lujan-de-cuyo/cuvee-helene-2016', '/products/mendoza/lujan-de-cuyo/cuvee-helene-2016/'], sendPage('vin-cuvee-helene-2016.html'));
app.get(['/products/mendoza/lujan-de-cuyo/clos-des-andes-2017', '/products/mendoza/lujan-de-cuyo/clos-des-andes-2017/'], sendPage('vin-clos-des-andes-2017.html'));

app.get(['/paiement/success', '/paiement/success/'], sendPage('payment-success.html'));
app.get(['/paiement/cancel', '/paiement/cancel/'], sendPage('payment-cancel.html'));
app.get(['/newsletter', '/newsletter/'], sendPage('newsletter.html'));
app.get('/degustation', sendPage('degustation.html'));
app.get('/degustation/merci', sendPage('degustation-merci.html'));
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

// ─── Inscription aux dégustations : andivino.fr/degustation ─────────────────────────────────────
// La dégustation ouverte est la première à venir qui a un champ `inscription` (assets/js/degustations.js).
// Paiement par Stripe Checkout intégré à la page : Apple Pay / Google Pay / carte, codes promo créés
// dans le tableau de bord Stripe (un code à 100 % sert d'invitation, la commande passe alors à 0 €).
// Les places sont comptées dans Stripe : sessions terminées + sessions ouvertes pas encore expirées
// (une place est tenue 30 minutes pendant le paiement), pour ne jamais dépasser la jauge.
// Chaque participant (prénom, nom, email) part au CRM, qui le crée s'il n'y est pas encore.
const TASTING_MAX_PER_ORDER = 6;
const TASTING_HOLD_SECONDS = 31 * 60; // Stripe exige au moins 30 minutes avant expiration.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function currentTasting(now = new Date()) {
  return upcomingDegustations(now).find((d) => d.inscription) || null;
}

// Décalage de Paris (en minutes) à un instant donné : +60 l'hiver, +120 l'été.
function parisOffsetMinutes(date) {
  const name = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Paris', timeZoneName: 'longOffset' })
    .formatToParts(date).find((part) => part.type === 'timeZoneName').value;
  const match = /GMT([+-])(\d{2}):?(\d{2})?/.exec(name);
  return match ? (match[1] === '-' ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3] || 0)) : 0;
}

// Début de la dégustation (« 19h30 », heure de Paris) : les inscriptions ferment à cette heure-là.
function tastingStartsAt(d) {
  const [y, mo, day] = d.date.split('-').map(Number);
  const [h, m] = String(d.heure).split(/h/i).map((v) => Number(v) || 0);
  const utcGuess = new Date(Date.UTC(y, mo - 1, day, h, m));
  return new Date(utcGuess.getTime() - parisOffsetMinutes(utcGuess) * 60000);
}

function tastingDateLabel(d) {
  return new Date(`${d.date}T12:00:00Z`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });
}

function publicTasting(d) {
  return { id: d.id, titre: d.titre, date: d.date, dateLabel: tastingDateLabel(d), heure: d.heure, lieu: d.lieu, adresse: d.adresse, prix: d.inscription.prix, places: d.inscription.places };
}

// paid : places réservées (session terminée) ; held : places tenues par un paiement en cours.
// La page affiche total - paid ; une nouvelle réservation n'est acceptée que dans total - paid - held.
let placesCache = null;
async function placesTaken(eventId, fresh = false) {
  if (!fresh && placesCache && placesCache.eventId === eventId && Date.now() - placesCache.at < 15000) return placesCache.counts;
  const now = Math.floor(Date.now() / 1000);
  const counts = { paid: 0, held: 0 };
  let seen = 0;
  for await (const session of stripe.checkout.sessions.list({ limit: 100 })) {
    if (++seen > 3000) break;
    if (session.metadata?.kind !== 'degustation' || session.metadata.event_id !== eventId) continue;
    const places = Number(session.metadata.places) || 0;
    if (session.status === 'complete') counts.paid += places;
    else if (session.status === 'open' && session.expires_at > now) counts.held += places;
  }
  placesCache = { eventId, counts, at: Date.now() };
  return counts;
}

function participantsFromSession(session) {
  const count = Number(session.metadata?.places) || 0;
  const list = [];
  for (let i = 1; i <= count; i++) {
    try {
      const [firstName, lastName, email] = JSON.parse(session.metadata[`p${i}`] || '[]');
      if (firstName || lastName || email) list.push({ firstName, lastName, email });
    } catch (error) { /* participant illisible : ignoré */ }
  }
  return list;
}

// Une seule fois par session et par processus ; le CRM ignore de toute façon une session déjà reçue.
const tastingsSent = new Set();
async function sendTastingToCrm(session) {
  if (tastingsSent.has(session.id)) return;
  if (!ordersSecret) throw new Error('ORDERS_API_SECRET manquant');
  const d = DEGUSTATIONS.find((x) => x.id === session.metadata?.event_id);
  const crmResponse = await fetch(`${crmUrl}/api/tastings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ordersSecret}` },
    body: JSON.stringify({
      sessionId: session.id,
      event: d ? { id: d.id, title: d.titre, date: d.date, time: d.heure, place: d.adresse } : { id: session.metadata?.event_id },
      amountPaid: session.amount_total,
      amountDiscount: session.total_details?.amount_discount || 0,
      currency: session.currency,
      paidAt: new Date((session.created || Date.now() / 1000) * 1000).toISOString(),
      buyerEmail: session.customer_details?.email || session.customer_email || null,
      participants: participantsFromSession(session)
    }),
    signal: AbortSignal.timeout(10000)
  });
  if (!crmResponse.ok) throw new Error(`CRM ${crmResponse.status}`);
  tastingsSent.add(session.id);
}

// URL de retour après paiement : jamais tirée de l'en-tête Host, sauf en local.
function siteOrigin(req) {
  const host = String(req.headers.host || '');
  return /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host) ? `http://${host}` : 'https://andivino.fr';
}

app.get('/api/degustation', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const d = currentTasting();
  if (!d) return res.json({ event: null });
  let remaining = null;
  if (stripe) {
    try {
      remaining = Math.max(0, d.inscription.places - (await placesTaken(d.id)).paid);
    } catch (error) {
      console.error('[degustation] comptage des places impossible :', error.message);
    }
  }
  return res.json({
    event: publicTasting(d),
    remaining,
    open: Date.now() < tastingStartsAt(d).getTime(),
    maxPerOrder: TASTING_MAX_PER_ORDER,
    publishableKey: stripePublishableKey || null
  });
});

app.post('/api/degustation/checkout', paymentLimiter, async (req, res) => {
  try {
    if (!stripe || !stripePublishableKey) {
      return res.status(503).json({ error: 'Paiement indisponible pour le moment. Écrivez-nous à contact@andivino.fr.' });
    }
    const body = req.body || {};
    if (cleanText(body.site, 200)) return res.status(400).json({ error: 'Requête invalide.' });

    const d = currentTasting();
    if (!d || Date.now() >= tastingStartsAt(d).getTime()) {
      return res.status(410).json({ error: 'Les inscriptions à cette dégustation sont closes.' });
    }

    const raw = Array.isArray(body.participants) ? body.participants : [];
    if (raw.length < 1 || raw.length > TASTING_MAX_PER_ORDER) {
      return res.status(400).json({ error: `Entre 1 et ${TASTING_MAX_PER_ORDER} places par inscription.` });
    }
    const participants = raw.map((p) => ({
      firstName: cleanText(p && p.prenom, 80),
      lastName: cleanText(p && p.nom, 80),
      email: cleanText(p && p.email, 160).toLowerCase()
    }));
    const invalid = participants.findIndex((p) => !p.firstName || !p.lastName || !EMAIL_RE.test(p.email));
    if (invalid !== -1) {
      return res.status(400).json({ error: `Participant ${invalid + 1} : prénom, nom et email valides requis.`, participant: invalid });
    }

    const { paid, held } = await placesTaken(d.id, true);
    const unpaid = d.inscription.places - paid;
    const available = unpaid - held;
    if (participants.length > available) {
      let error;
      if (unpaid <= 0) error = 'C\'est complet : toutes les places viennent de partir.';
      else if (participants.length <= unpaid) error = `${available > 0 ? `Il ne reste que ${available} place${available > 1 ? 's' : ''} libre${available > 1 ? 's' : ''} : ` : ''}d'autres personnes sont en train de payer les dernières places. Réessayez dans une demi-heure : elles se libèrent si le paiement n'aboutit pas.`;
      else error = `Il ne reste que ${unpaid} place${unpaid > 1 ? 's' : ''}.`;
      return res.status(409).json({ error, remaining: Math.max(0, unpaid) });
    }

    const metadata = { kind: 'degustation', event_id: d.id, places: String(participants.length) };
    participants.forEach((p, i) => { metadata[`p${i + 1}`] = JSON.stringify([p.firstName, p.lastName, p.email]); });

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      locale: 'fr',
      line_items: [{
        quantity: participants.length,
        price_data: {
          currency: 'eur',
          unit_amount: d.inscription.prix,
          product_data: {
            name: `Dégustation Andivino — ${tastingDateLabel(d)}, ${d.heure}`,
            description: `${participants.map((p) => `${p.firstName} ${p.lastName}`).join(', ')} · ${d.adresse}`.slice(0, 500)
          }
        }
      }],
      allow_promotion_codes: true,
      customer_email: participants[0].email,
      expires_at: Math.floor(Date.now() / 1000) + TASTING_HOLD_SECONDS,
      return_url: `${siteOrigin(req)}/degustation/merci?session_id={CHECKOUT_SESSION_ID}`,
      metadata,
      payment_intent_data: {
        description: `Dégustation ${d.date} — ${participants.length} place${participants.length > 1 ? 's' : ''}`,
        metadata: { kind: 'degustation', event_id: d.id }
      },
      custom_text: {
        submit: { message: 'Places nominatives. Un événement daté n\'ouvre pas de droit de rétractation (art. L221-28 du Code de la consommation) : en cas d\'empêchement, écrivez-nous à contact@andivino.fr.' }
      }
    });
    placesCache = null;
    issuedSecrets.set(session.id, session.client_secret);
    return res.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('[degustation] création du paiement impossible :', error.message);
    return res.status(500).json({ error: 'Impossible de préparer le paiement. Réessayez dans un instant.' });
  }
});

// Retour au formulaire avant d'avoir payé : la session est expirée pour rendre ses places tout de suite.
// Stripe ne renvoie pas le client_secret à la lecture d'une session : on garde ceux qu'on a émis (en
// mémoire ; après un redéploiement, la session expire seule au bout de 31 minutes).
const issuedSecrets = new Map();
app.post('/api/degustation/release', paymentLimiter, async (req, res) => {
  try {
    if (!stripe) return res.json({ ok: false });
    const clientSecret = cleanText(req.body && req.body.clientSecret, 1000); // ~430 caractères chez Stripe
    const id = clientSecret.split('_secret_')[0];
    if (!/^cs_\w+$/.test(id)) return res.status(400).json({ ok: false });
    if (issuedSecrets.get(id) !== clientSecret) return res.json({ ok: false });
    issuedSecrets.delete(id);
    const session = await stripe.checkout.sessions.retrieve(id);
    if (session.metadata?.kind !== 'degustation' || session.status !== 'open') return res.json({ ok: false });
    await stripe.checkout.sessions.expire(id);
    placesCache = null;
    return res.json({ ok: true });
  } catch (error) {
    return res.json({ ok: false });
  }
});

// Page de confirmation : état de la session, et envoi au CRM si le webhook ne l'a pas déjà fait
// (seule voie pour une invitation à 0 € si le webhook ne reçoit pas checkout.session.completed).
app.get('/api/degustation/session', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (!stripe) return res.status(503).json({ error: 'Paiement indisponible.' });
    const id = cleanText(req.query.id, 200);
    if (!/^cs_\w+$/.test(id)) return res.status(400).json({ error: 'Inscription introuvable.' });
    const session = await stripe.checkout.sessions.retrieve(id);
    if (session.metadata?.kind !== 'degustation') return res.status(404).json({ error: 'Inscription introuvable.' });
    if (session.status === 'complete') {
      placesCache = null;
      await sendTastingToCrm(session).catch((error) => console.error(`[degustation] ${session.id} non transmis au CRM :`, error.message));
    }
    const d = DEGUSTATIONS.find((x) => x.id === session.metadata.event_id);
    return res.json({
      status: session.status,
      event: d && d.inscription ? publicTasting(d) : null,
      participants: participantsFromSession(session).map((p) => `${p.firstName} ${p.lastName}`),
      email: session.customer_details?.email || session.customer_email || null,
      amountTotal: session.amount_total
    });
  } catch (error) {
    return res.status(404).json({ error: 'Inscription introuvable.' });
  }
});

app.use((req, res) => {
  res.status(404).sendFile(page('404.html'));
});

app.listen(port, () => {
  console.log(`Andivino pret sur http://localhost:${port}`);
});
