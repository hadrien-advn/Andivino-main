// Flux produits Google Merchant Center (onglet Shopping, fiches gratuites), servi sur /merchant-feed.xml.
// Généré depuis data/wines.js : ajouter ou modifier une cuvée met le flux à jour au redémarrage.
// Spécification : https://support.google.com/merchants/answer/7052112
// Les frais et délais reprennent ceux du balisage Product (lib/product-page.js) et de data/catalog.js :
// main propre à Paris et petite couronne, point relais et domicile en France métropolitaine (lib/shipping-offers.js).
const fs = require('fs');
const path = require('path');
const { WINES, DOMAINES, SITE, wineUrl, cepagesTexte } = require('../data/wines');
const { SHIPPING_OPTIONS } = require('./shipping-offers');

const xml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const prix = (cents) => `${(cents / 100).toFixed(2)} EUR`;

// statut du site → valeur Merchant Center
const DISPO = { 'en-stock': 'in_stock', 'bientot-epuise': 'in_stock', precommande: 'preorder', epuise: 'out_of_stock', 'a-venir': 'out_of_stock' };
const ASSETS = path.join(__dirname, '..', 'assets');

// Packshot carré sur fond blanc (scripts/shopping-images.py) en premier, puis l'image OG et la photo de bouteille.
const packshot = (w) => (fs.existsSync(path.join(ASSETS, 'images/shopping', `${w.id}.jpg`)) ? `/assets/images/shopping/${w.id}.jpg` : null);
function images(w) {
  return [packshot(w), w.og, w.image && w.image.src].filter(Boolean).map((src) => SITE + src);
}

function item(w) {
  const d = DOMAINES[w.domaine];
  const [image, ...autres] = images(w);
  const titre = `${w.nomComplet} – ${d.nom}, vin ${w.couleur.toLowerCase()} argentin, ${cepagesTexte(w).replace(/ %/g, ' %')}, ${w.format || '75 cl'}`;
  const lignes = [
    ['g:id', w.id],
    ['g:title', titre.slice(0, 150)],
    ['g:description', w.descriptionSchema || w.resume],
    ['g:link', SITE + wineUrl(w)],
    ['g:image_link', image],
    ...autres.slice(0, 10).map((src) => ['g:additional_image_link', src]),
    ['g:availability', DISPO[w.statut]],
    ...(w.statut === 'precommande' ? [['g:availability_date', `${w.arrivee}T00:00:00+01:00`]] : []),
    ['g:price', prix(w.prix)],
    ['g:condition', 'new'],
    ['g:brand', d.nom],
    // Pas encore de code EAN (questionnaire fondateurs) : à remplacer par g:gtin dès qu'on l'a.
    ['g:identifier_exists', 'no'],
    ['g:google_product_category', '421'],
    ['g:product_type', `Vins argentins > Vin ${w.couleur.toLowerCase()} > ${d.nom}`],
    ['g:color', w.couleur],
    ['g:size', w.format || '75 cl'],
    // Prix au litre (obligatoire en France) : Google le calcule à partir de ces deux valeurs.
    ['g:unit_pricing_measure', (w.format || '75 cl').replace(/\s+/g, '')],
    ['g:unit_pricing_base_measure', '1l'],
    ['g:min_handling_time', '0'],
    ['g:max_handling_time', '2']
  ];
  // Un g:shipping par mode (data/catalog.js via lib/shipping-offers.js) ; main propre limitée à Paris et petite couronne.
  const ligne = (o, cp) => `      <g:shipping><g:country>FR</g:country>${cp ? `<g:postal_code>${cp}*</g:postal_code>` : ''}<g:service>${xml(o.service)}</g:service><g:price>${prix(o.price)}</g:price><g:min_transit_time>${o.transit[0]}</g:min_transit_time><g:max_transit_time>${o.transit[1]}</g:max_transit_time></g:shipping>`;
  const shipping = SHIPPING_OPTIONS.flatMap((o) => (o.prefixes ? o.prefixes.map((cp) => ligne(o, cp)) : [ligne(o, null)]));
  return `    <item>\n${lignes.map(([k, v]) => `      <${k}>${xml(v)}</${k}>`).join('\n')}\n${shipping.join('\n')}\n    </item>`;
}

function merchantFeedXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Andivino – vins argentins</title>
    <link>${SITE}/</link>
    <description>Cuvées importées d'Argentine par Andivino</description>
${WINES.filter((w) => w.statut !== 'a-venir').map(item).join('\n')}
  </channel>
</rss>
`;
}

module.exports = { merchantFeedXml, packshot };
