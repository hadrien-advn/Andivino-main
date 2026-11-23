// Modes de livraison annoncés à Google (balisage Product dans lib/product-page.js et flux Merchant Center
// dans lib/merchant-feed.js), dérivés de la grille de data/catalog.js : tarif de la première tranche
// (1 à 3 bouteilles). La gratuité au-delà de FREE_SHIPPING_ABOVE et les tranches suivantes se règlent
// dans les paramètres de livraison de Merchant Center. Délais : CGV art. 6 (main propre : « sous 7 jours »).
const { SHIPPING_TIERS } = require('../data/catalog');

const PARIS = ['75', '92', '93', '94'];
// Pas d'expédition en Corse (20) ni outre-mer (97, 98).
const EXCLUS = ['20', '97', '98'];

const SHIPPING_OPTIONS = Object.freeze([
  { id: 'main-propre', service: 'Remise en main propre', price: 500, prefixes: PARIS, transit: [1, 7] },
  { id: 'relais', service: 'Point relais', price: SHIPPING_TIERS.relais[0].amount, prefixes: null, transit: [3, 5] },
  { id: 'domicile', service: 'Livraison à domicile', price: SHIPPING_TIERS.domicile[0].amount, prefixes: null, transit: [2, 5] }
]);

module.exports = { SHIPPING_OPTIONS, PARIS, EXCLUS };
