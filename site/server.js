const path = require('path');
const fs = require('fs/promises');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Stripe = require('stripe');
require('dotenv').config();

const { buildOrder } = require('./data/catalog');

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

app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      scriptSrc: ["'self'", 'https://js.stripe.com', "'sha256-wdcBSdLWsvB7koKbH4Q4rVx7/fjw4vYHJKGw3NnqCC8='"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'https://api.stripe.com'],
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

    if (event.type === 'payment_intent.succeeded') {
      await recordPaymentIntentEvent(event);
    }

    await markProcessedEvent(event.id);
    return res.json({ received: true });
  } catch (error) {
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

function normalizeCustomer(raw = {}) {
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

  if (!customer.prenom || !customer.nom || !customer.email || !customer.adresse || !customer.cp || !customer.ville) {
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

async function recordPaymentIntentEvent(event) {
  const paymentIntent = event.data.object;
  await fs.mkdir(storageDir, { recursive: true });

  const record = {
    receivedAt: new Date().toISOString(),
    eventId: event.id,
    eventType: event.type,
    paymentIntentId: paymentIntent.id,
    status: paymentIntent.status,
    amount: paymentIntent.amount_received || paymentIntent.amount,
    currency: paymentIntent.currency,
    customerEmail: paymentIntent.receipt_email || paymentIntent.metadata?.customer_email || null,
    customerName: paymentIntent.shipping?.name || paymentIntent.metadata?.customer_name || null,
    shippingMode: paymentIntent.metadata?.shipping_mode || null,
    bottleCount: Number(paymentIntent.metadata?.bottle_count || 0),
    cart: parseMetadataCart(paymentIntent.metadata?.cart),
    shipping: paymentIntent.shipping ? {
      name: paymentIntent.shipping.name || null,
      phone: paymentIntent.shipping.phone || null,
      address: paymentIntent.shipping.address || null
    } : null
  };

  await fs.appendFile(orderEventsFile, `${JSON.stringify(record)}\n`);
}

app.get('/', sendPage('home.html'));
app.get(['/commande', '/commande/'], sendPage('commande.html'));
app.get(['/chroniques', '/chroniques/'], sendPage('chroniques.html'));
app.get(['/chroniques/mendoza-terroir-andin', '/chroniques/mendoza-terroir-andin/'], sendPage('chronique-mendoza-terroir-andin.html'));
app.get(['/chroniques/malbec-cabernet-assemblage-argentin', '/chroniques/malbec-cabernet-assemblage-argentin/'], sendPage('chronique-malbec-cabernet-assemblage-argentin.html'));
app.get(['/chroniques/vendanges-bodega-poesia-recit', '/chroniques/vendanges-bodega-poesia-recit/'], sendPage('chronique-vendanges-bodega-poesia-recit.html'));
app.get(['/paiement/success', '/paiement/success/'], sendPage('payment-success.html'));
app.get(['/paiement/cancel', '/paiement/cancel/'], sendPage('payment-cancel.html'));
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

app.post('/api/create-payment-intent', paymentLimiter, async (req, res) => {
  try {
    if (!stripe || !stripePublishableKey) {
      return res.status(503).json({ error: 'Configuration Stripe serveur manquante.' });
    }

    const customer = normalizeCustomer(req.body.customer);
    const order = buildOrder(req.body.cart, req.body.shipping, customer);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.amount,
      currency: order.currency,
      receipt_email: customer.email,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      shipping: {
        name: `${customer.prenom} ${customer.nom}`,
        phone: customer.tel || undefined,
        address: {
          line1: customer.adresse,
          postal_code: customer.cp,
          city: customer.ville,
          country: 'FR'
        }
      },
      metadata: {
        customer_name: `${customer.prenom} ${customer.nom}`,
        customer_email: customer.email,
        shipping_mode: order.shippingMode,
        bottle_count: String(order.bottleCount),
        order_total_cents: String(order.amount),
        cart: JSON.stringify(order.lineItems.map((item) => ({ id: item.id, qty: item.qty }))).slice(0, 450)
      }
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

app.use((req, res) => {
  res.status(404).sendFile(page('404.html'));
});

app.listen(port, () => {
  console.log(`Andivino pret sur http://localhost:${port}`);
});
