const PRODUCTS = Object.freeze({
  'clos-2017': Object.freeze({
    id: 'clos-2017',
    name: 'Clos des Andes 2017',
    unitAmount: 1999
  }),
  'helene-2016': Object.freeze({
    id: 'helene-2016',
    name: 'Poesia - Cuvee Helene 2016',
    unitAmount: 3599
  }),
  'poesia-2014': Object.freeze({
    id: 'poesia-2014',
    name: 'Poesia 2014',
    unitAmount: 3999
  })
});

const SHIPPING_MODES = Object.freeze({
  degustation: 'Retrait degustation',
  'main-propre': 'Remise en main propre',
  colissimo: 'Colissimo',
  'mondial-relay': 'Mondial Relay'
});

function shippingAmount(mode, bottleCount, postalCode = '') {
  if (!Object.prototype.hasOwnProperty.call(SHIPPING_MODES, mode)) {
    throw new Error('Mode de livraison invalide.');
  }

  if (mode === 'degustation') return 0;

  if (mode === 'main-propre') {
    if (!/^(75|92|93|94)/.test(String(postalCode).trim())) {
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
    lineItems
  };
}

module.exports = {
  PRODUCTS,
  SHIPPING_MODES,
  buildOrder
};
