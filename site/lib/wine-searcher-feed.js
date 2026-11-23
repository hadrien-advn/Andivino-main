// Liste de prix pour Wine-Searcher, servie sur /wine-searcher.txt (texte séparé par des tabulations, une ligne par vin).
// Générée depuis data/wines.js. Seules les cuvées achetables y figurent : les vins « a-venir » apparaissent
// d'eux-mêmes quand leur statut passe à « en-stock » ou « precommande ». Chaque ligne pointe vers la fiche du vin.
const { WINES, DOMAINES, STATUTS, SITE, wineUrl } = require('../data/wines');

const COLONNES = ['Producer', 'Wine', 'Vintage', 'Bottle size', 'Price', 'Currency', 'Availability', 'Region', 'Colour', 'Link'];
const DISPO = { 'en-stock': 'In stock', 'bientot-epuise': 'In stock', precommande: 'Pre-order' };
const COULEUR = { Rouge: 'Red', Blanc: 'White', 'Rosé': 'Rosé' };
const propre = (s) => String(s).replace(/[\t\r\n]+/g, ' ').replace(/ — /g, ' ').trim();

function ligne(w) {
  const d = DOMAINES[w.domaine];
  // « Carmelo Patti Malbec » devient « Malbec » : le producteur a sa propre colonne.
  const vin = w.nom.startsWith(d.nom + ' ') ? w.nom.slice(d.nom.length + 1) : w.nom;
  return [
    d.nom,
    vin,
    w.millesime,
    w.format || '75 cl',
    (w.prix / 100).toFixed(2),
    'EUR',
    DISPO[w.statut],
    `${d.appellation || d.lieu}, ${d.region || 'Mendoza'}, Argentina`,
    COULEUR[w.couleur] || w.couleur,
    SITE + wineUrl(w)
  ].map(propre).join('\t');
}

function wineSearcherTxt() {
  const vins = WINES.filter((w) => STATUTS[w.statut].achetable);
  return [COLONNES.join('\t'), ...vins.map(ligne)].join('\n') + '\n';
}

module.exports = { wineSearcherTxt };
