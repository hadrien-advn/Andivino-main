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
  relais: 'Point relais',
  domicile: 'Livraison a domicile'
});

// Expedition en France metropolitaine (hors Corse), au depart de Paris. Tarifs TTC en centimes par
// tranche de bouteilles ; offerte quand le panier (vins seuls) depasse FREE_SHIPPING_ABOVE.
// Meme grille dans assets/js/checkout.js et pages/legal-cgv.html.
const SHIPPING_TIERS = Object.freeze({
  relais: [
    { max: 3, amount: 900 },
    { max: 6, amount: 1200 },
    { max: 12, amount: 1700 },
    { max: Infinity, amount: 2500 }
  ],
  domicile: [
    { max: 3, amount: 1200 },
    { max: 6, amount: 1500 },
    { max: 12, amount: 2000 },
    { max: Infinity, amount: 3000 }
  ]
});
const FREE_SHIPPING_ABOVE = 30000;

function shippingAmount(mode, bottleCount, postalCode = '', subtotal = 0) {
  if (!Object.prototype.hasOwnProperty.call(SHIPPING_MODES, mode)) {
    throw new Error('Mode de livraison invalide.');
  }

  if (mode === 'degustation') {
    return 0;
  }

  const cp = String(postalCode).trim();

  if (mode === 'main-propre') {
    if (!/^(75|92|93|94)\d{3}$/.test(cp)) {
      throw new Error('La remise en main propre est limitee a Paris et petite couronne.');
    }
    return 500;
  }

  if (!/^\d{5}$/.test(cp) || /^(20|97|98)/.test(cp)) {
    throw new Error("L'expedition est limitee a la France metropolitaine, hors Corse. Pour une autre destination, ecrivez-nous a contact@andivino.fr.");
  }
  if (subtotal > FREE_SHIPPING_ABOVE) {
    return 0;
  }
  return SHIPPING_TIERS[mode].find((tier) => bottleCount <= tier.max).amount;
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
    throw new Error("Le retrait en dégustation n'est pas possible pour une précommande : aucune dégustation n'est prévue après l'arrivée des bouteilles. Choisissez la remise en main propre ou l'expédition.");
  }

  const bottleCount = lineItems.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const shippingTotal = shippingAmount(shipping, bottleCount, customer.cp, subtotal);
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
  SHIPPING_TIERS,
  FREE_SHIPPING_ABOVE,
  buildOrder
};
