// Prix et noms Stripe dérivés de data/wines.js (source unique des cuvées).
const { WINES, STATUTS } = require('./wines');
const { upcomingDegustations } = require('../assets/js/degustations.js');
const PRODUCTS = Object.freeze(Object.fromEntries(WINES
  .filter((w) => STATUTS[w.statut].achetable)
  .map((w) => [w.id, Object.freeze({
    id: w.id,
    name: w.nomStripe,
    unitAmount: w.prix,
    // Précommande : payée à la commande, remise à l'arrivée des bouteilles (arrivee, AAAA-MM-JJ).
    preorder: w.statut === 'precommande',
    arrivee: w.statut === 'precommande' ? w.arrivee : null
  })])));

const SHIPPING_MODES = Object.freeze({
  degustation: 'Retrait degustation',
  'main-propre': 'Remise en main propre',
  colissimo: 'Colissimo',
  'mondial-relay': 'Mondial Relay'
});

// Livraison par transporteur suspendue tant que son cout reel n'est pas chiffre. Pour la rouvrir,
// vider cette liste et celle de assets/js/checkout.js, et revoir le texte de assets/js/degustations.js.
const SUSPENDED_SHIPPING_MODES = Object.freeze(['colissimo', 'mondial-relay']);

function shippingAmount(mode, bottleCount, postalCode = '') {
  if (!Object.prototype.hasOwnProperty.call(SHIPPING_MODES, mode)) {
    throw new Error('Mode de livraison invalide.');
  }
  if (SUSPENDED_SHIPPING_MODES.includes(mode)) {
    throw new Error('La livraison par Colissimo et Mondial Relay est momentanément suspendue. Choisissez la remise en main propre (Paris et petite couronne) ou écrivez-nous à contact@andivino.fr.');
  }

  if (mode === 'degustation') {
    return 0;
  }

  if (mode === 'main-propre') {
    if (!/^(75|92|93|94)\d{3}$/.test(String(postalCode).trim())) {
      throw new Error('La remise en main propre est limitee a Paris et petite couronne.');
    }
    return 500;
  }

  const tiers = {
    colissimo: [
      { max: 3, amount: 990 },
      { max: 6, amount: 1290 },
      { max: 99, amount: 1690 }
    ],
    'mondial-relay': [
      { max: 3, amount: 790 },
      { max: 6, amount: 1090 },
      { max: 99, amount: 1490 }
    ]
  };

  return tiers[mode].find((tier) => bottleCount <= tier.max).amount;
}

function buildOrder(cart, shipping, customer = {}) {
  if (!Array.isArray(cart) || cart.length === 0) {
    throw new Error('Le panier est vide.');
  }
  if (cart.length > 10) {
    throw new Error('Le panier contient trop de lignes.');
  }

  const lineItems = cart.map((item) => {
    const product = PRODUCTS[item.id];
    const qty = Number(item.qty);

    if (!product) throw new Error('Produit inconnu.');
    if (!Number.isInteger(qty) || qty < 1 || qty > 36) {
      throw new Error('Quantite invalide.');
    }

    return {
      id: product.id,
      name: product.name,
      qty,
      unitAmount: product.unitAmount,
      amount: product.unitAmount * qty
    };
  });

  // Une commande qui contient une précommande est remise en une fois, à l'arrivée de la dernière cuvée.
  const preorderItems = lineItems.filter((item) => PRODUCTS[item.id].preorder);
  const preorder = preorderItems.length
    ? { arrivee: preorderItems.map((item) => PRODUCTS[item.id].arrivee).sort().pop(), ids: preorderItems.map((item) => item.id) }
    : null;
  if (preorder && shipping === 'degustation'
    && !upcomingDegustations().some((d) => d.date >= preorder.arrivee)) {
    throw new Error("Le retrait en dégustation n'est pas possible pour une précommande : aucune dégustation n'est prévue après l'arrivée des bouteilles. Choisissez la remise en main propre.");
  }

  const bottleCount = lineItems.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const shippingTotal = shippingAmount(shipping, bottleCount, customer.cp);
  const amount = subtotal + shippingTotal;

  if (amount < 50) {
    throw new Error('Montant de commande invalide.');
  }

  return {
    currency: 'eur',
    amount,
    subtotal,
    shippingAmount: shippingTotal,
    shippingMode: shipping,
    shippingLabel: SHIPPING_MODES[shipping],
    bottleCount,
    lineItems,
    preorder
  };
}

module.exports = {
  PRODUCTS,
  SHIPPING_MODES,
  buildOrder
};
