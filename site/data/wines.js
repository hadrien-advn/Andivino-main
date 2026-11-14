// Source unique des cuvées : fiches produits (/vins/<domaine>/<cuvée>), prix serveur (data/catalog.js),
// panier et page commande (/assets/js/wines-data.js), sitemap et liens « Du même domaine ».
//
// Ajouter une cuvée = ajouter une entrée dans WINES (et son domaine dans DOMAINES s'il est nouveau),
// déposer la photo de bouteille dans assets/images/, puis redémarrer le serveur.
//
// Champs « html » : HTML de confiance écrit par nous (liens, &nbsp;), inséré tel quel dans la page.
// Tous les autres textes sont échappés au rendu.
//
// statut : 'en-stock' | 'bientot-epuise' | 'precommande' (avec arrivee 'AAAA-MM-JJ') | 'epuise'

const DOMAINES = {
  'bodega-poesia': {
    slug: 'bodega-poesia',
    nom: 'Bodega Poesía',
    appellation: 'Luján de Cuyo',
    region: 'Mendoza',
    pays: 'AR',
    schemaId: 'https://andivino.fr/#bodega-poesia',
    // Page du domaine (/vins/bodega-poesia) : null tant qu'elle n'existe pas.
    page: null,
    // Phrase « dégustation » commune aux cuvées servies lors de nos soirées.
    degustationHtml: 'servi avec les deux autres cuvées de la Bodega Poesía lors de notre <a href="/degustation">dégustation de vins argentins à Paris</a>'
  }
};

const LIENS_MALBEC = [
  { href: '/chroniques/malbec-argentin-histoire-terroirs', texte: "Le Malbec argentin : histoire et terroirs d'un cépage venu de Cahors" },
  { href: '/chroniques/accords-mets-vins-malbec-argentin', texte: 'Accords mets-vins avec un Malbec argentin' }
];

const WINES = [
  {
    id: 'poesia-2014',
    slug: 'poesia-2014',
    domaine: 'bodega-poesia',
    nom: 'Poesía',
    millesime: 2014,
    nomComplet: 'Poesía 2014',
    nomStripe: 'Poesia 2014',
    prix: 4500,
    statut: 'bientot-epuise',
    couleur: 'Rouge',
    format: '75 cl',
    cepages: [{ nom: 'Malbec', part: 60 }, { nom: 'Cabernet Sauvignon', part: 40 }],
    vendanges: 'Manuelles',
    elevage: '18 à 24 mois',
    garde: '25 ans',
    scores: [
      { note: 94, source: 'Wine Advocate' },
      { note: 91, source: 'Vinous' },
      { note: 92, source: 'James Suckling' }
    ],
    image: { src: '/assets/images/bout-poesia.webp', width: 221, height: 900, alt: 'Bouteille de Poesía 2014, vin argentin de Mendoza' },
    og: '/assets/images/og/poesia-2014.jpg',
    maj: '2026-11-14',
    seo: {
      title: 'Poesía 2014 — Vin argentin de Mendoza | 94 pts | Andivino',
      description: 'Poesía 2014, assemblage Malbec-Cabernet Sauvignon de la Bodega Poesía à Luján de Cuyo. 94 pts Wine Advocate, 91 Vinous, 92 James Suckling. Commandez en ligne.',
      ogTitle: 'Poesía 2014 — Vin argentin de Mendoza | Andivino',
      ogDescription: 'Assemblage Malbec-Cabernet Sauvignon de la Bodega Poesía, Luján de Cuyo. 94 pts Wine Advocate.'
    },
    // Texte court du panier et de la page commande.
    resume: "Poesía s'exprime avec distinction et profondeur à travers une robe rouge rubis intense.",
    // Description du balisage Product.
    descriptionSchema: "Poesía s'exprime avec distinction et profondeur à travers une robe rouge rubis intense. Assemblage 60% Malbec — 40% Cabernet Sauvignon, Luján de Cuyo, Mendoza.",
    proprietes: [
      ['Cépages', '60 % Malbec, 40 % Cabernet Sauvignon'],
      ['Vendanges', 'Manuelles'],
      ['Vignes', 'Plantées en 1935, franc de pied'],
      ['Sol', 'Sablo-argileux'],
      ['Altitude', '900 m'],
      ['Élevage', '18 à 24 mois'],
      ['Garde', '25 ans']
    ],
    leadHtml: "<strong>Poesía 2014</strong> est un vin rouge argentin de la Bodega Poesía, à Luján de Cuyo (Mendoza)&nbsp;: un assemblage de 60&nbsp;% Malbec et 40&nbsp;% Cabernet Sauvignon issu de vignes plantées en 1935 en franc de pied et vendangées à la main. Élevé de 18 à 24 mois, il se garde 25 ans. Il est noté 94 points par Wine Advocate, 91 par Vinous et 92 par James Suckling. 45&nbsp;€ la bouteille.",
    notesHtml: "Poesía s'exprime avec distinction et profondeur à travers une robe rouge rubis intense. Le nez, raffiné et complexe, mêle fruits rouges et noirs mûrs (framboise, cerise noire, mûre) à de subtiles notes de pain grillé, café, moka et cèdre, complétées par des touches de minéralité, d'épices fines et florales. La bouche offre une texture soyeuse, un équilibre précis et une fraîcheur élégante. Le fruit s'étire sur une trame minérale et des tanins fins et enveloppants, avant une finale longue, nette et raffinée.",
    fiche: [
      ['Origine', 'Bodega Poesía, Luján de Cuyo – Mendoza, Argentine', true],
      ['Cépages', '60 % Malbec, 40 % Cabernet Sauvignon'],
      ['Vendanges', 'Manuelles'],
      ['Superficie', '13 ha plantés en 1935, franc de pied'],
      ['Sol', 'Sablo-argileux'],
      ['Cuves de fermentation', 'Inox et fûts de chêne'],
      ['Élevage', '18 à 24 mois'],
      ['Garde', '25 ans']
    ],
    serviceHtml: [
      "Servez-le entre 16 et 17&nbsp;°C, jamais trop chaud&nbsp;: la chaleur ferait ressortir l'alcool et écraserait le fruit. Élevé de 18 à 24 mois, il gagne à passer une bonne heure en carafe.",
      "Nous le conseillons avec des plats de caractère&nbsp;: un gibier, une viande longuement mijotée, puis un fromage affiné (Comté de 24 mois, vieux Manchego) ou un carré de chocolat noir à 70&nbsp;% pour finir. D'autres idées dans nos <a href=\"/chroniques/accords-mets-vins-malbec-argentin\">accords mets-vins avec un Malbec argentin</a>.",
      'Pour le goûter avant de commander, il est {degustation}.'
    ],
    terroirHtml: [
      "Poesía 2014 est le plus ancien millésime de nos trois cuvées et le plus longuement élevé&nbsp;: 18 à 24 mois, contre 16 à 18 pour la Cuvée Hélène, qui partage le même assemblage de 60&nbsp;% Malbec et 40&nbsp;% Cabernet Sauvignon. Comme elle, il se garde 25 ans.",
      "Les raisins viennent de vignes plantées en 1935 en franc de pied, jamais greffées, sur le sol sablo-argileux de Luján de Cuyo, à 900 mètres d'altitude. Pour aller plus loin&nbsp;:"
    ],
    liens: LIENS_MALBEC
  },
  {
    id: 'helene-2016',
    slug: 'cuvee-helene-2016',
    domaine: 'bodega-poesia',
    nom: 'Poesía — Cuvée Hélène',
    millesime: 2016,
    nomComplet: 'Poesía — Cuvée Hélène 2016',
    nomStripe: 'Poesia - Cuvee Helene 2016',
    prix: 3600,
    statut: 'bientot-epuise',
    couleur: 'Rouge',
    format: '75 cl',
    cepages: [{ nom: 'Malbec', part: 60 }, { nom: 'Cabernet Sauvignon', part: 40 }],
    vendanges: 'Manuelles',
    elevage: '16 à 18 mois',
    garde: '25 ans',
    scores: [],
    image: { src: '/assets/images/bout-helene-2016.webp', width: 234, height: 900, alt: 'Bouteille de la Cuvée Hélène 2016, vin argentin de Mendoza' },
    og: '/assets/images/og/cuvee-helene-2016.jpg',
    maj: '2026-11-14',
    seo: {
      title: 'Poesía — Cuvée Hélène 2016, vin de Mendoza | Andivino',
      description: "Poesía — Cuvée Hélène 2016, assemblage Malbec-Cabernet Sauvignon d'une parcelle plantée en 1935 à Luján de Cuyo, Mendoza. Élevage 16 à 18 mois.",
      ogTitle: 'Poesía — Cuvée Hélène 2016, vin de Mendoza | Andivino',
      ogDescription: 'Assemblage Malbec-Cabernet Sauvignon de la Bodega Poesía, Luján de Cuyo, Mendoza.'
    },
    resume: "D'une robe rouge sombre et brillante, le vin offre un nez subtil et complexe de framboise noire, moka et espresso.",
    descriptionSchema: "D'une robe rouge sombre et brillante, un nez subtil et complexe de framboise noire, moka et espresso. Assemblage 60% Malbec — 40% Cabernet Sauvignon, Luján de Cuyo, Mendoza.",
    proprietes: [
      ['Cépages', '60 % Malbec, 40 % Cabernet Sauvignon'],
      ['Vendanges', 'Manuelles'],
      ['Vignes', 'Parcelle de 1 ha plantée en 1935, franc de pied'],
      ['Sol', 'Sablo-argileux'],
      ['Altitude', '900 m'],
      ['Élevage', '16 à 18 mois'],
      ['Garde', '25 ans']
    ],
    leadHtml: "<strong>Poesía — Cuvée Hélène 2016</strong> est un vin rouge argentin de la Bodega Poesía, à Luján de Cuyo (Mendoza)&nbsp;: 60&nbsp;% Malbec et 40&nbsp;% Cabernet Sauvignon issus d'une parcelle d'un hectare plantée en 1935 en franc de pied, vendangée à la main. Élevée de 16 à 18 mois, elle se garde 25 ans. 36&nbsp;€ la bouteille.",
    notesHtml: "D'une robe rouge sombre et brillante, le vin offre un nez subtil et complexe de framboise noire, moka et espresso, relevé d'une délicate note florale. La bouche séduit par la pureté et la maturité du fruit, sans excès de torréfaction, enrichie de baies noires, d'épices fines et d'un boisé fumé de grande qualité. La finale, longue et persistante, repose sur des tanins nobles et harmonieux. Un vin déjà remarquable, d'une grande élégance et profondeur.",
    fiche: [
      ['Origine', 'Bodega Poesía, Luján de Cuyo – Mendoza, Argentine', true],
      ['Cépages', '60 % Malbec, 40 % Cabernet Sauvignon'],
      ['Vendanges', 'Manuelles'],
      ['Superficie', '1 ha planté en 1935, franc de pied'],
      ['Sol', 'Sablo-argileux'],
      ['Cuves de fermentation', 'Inox et fûts de chêne'],
      ['Élevage', '16 à 18 mois'],
      ['Garde', '25 ans']
    ],
    serviceHtml: [
      "Servez-la entre 16 et 17&nbsp;°C, après une bonne heure en carafe. Les plats mijotés et les viandes marquées lui vont bien&nbsp;: magret de canard, agneau de sept heures, joue de bœuf braisée, daube. D'autres idées dans nos <a href=\"/chroniques/accords-mets-vins-malbec-argentin\">accords mets-vins avec un Malbec argentin</a>.",
      'Pour la goûter avant de commander, elle est {degustation:e}.'
    ],
    terroirHtml: [
      "La Cuvée Hélène vient d'une seule parcelle d'à peine 1 hectare, plantée en 1935 en franc de pied à Luján de Cuyo, sur un sol sablo-argileux à 900 mètres d'altitude. Elle partage l'assemblage de Poesía (60&nbsp;% Malbec, 40&nbsp;% Cabernet Sauvignon) avec un élevage un peu plus court, de 16 à 18 mois.",
      "Entre le Clos des Andes, 100&nbsp;% Malbec de garde 15 ans, et Poesía 2014, la plus longuement élevée, elle offre la garde de Poesía (25 ans) à un prix plus doux. Pour en savoir plus sur ce terroir et cet assemblage&nbsp;:"
    ],
    liens: LIENS_MALBEC
  },
  {
    id: 'clos-2017',
    slug: 'clos-des-andes-2017',
    domaine: 'bodega-poesia',
    nom: 'Clos des Andes',
    millesime: 2017,
    nomComplet: 'Clos des Andes 2017',
    nomStripe: 'Clos des Andes 2017',
    prix: 2200,
    statut: 'en-stock',
    couleur: 'Rouge',
    format: '75 cl',
    cepages: [{ nom: 'Malbec', part: 100 }],
    vendanges: 'Manuelles',
    elevage: '10 à 12 mois',
    garde: '15 ans',
    scores: [],
    image: { src: '/assets/images/bout-cda.webp', width: 212, height: 900, alt: 'Bouteille de Clos des Andes 2017, Malbec argentin de Mendoza' },
    og: '/assets/images/og/clos-des-andes-2017.jpg',
    maj: '2026-11-14',
    seo: {
      title: 'Clos des Andes 2017 — Malbec argentin de Mendoza | Andivino',
      description: 'Clos des Andes 2017, 100% Malbec de vieilles vignes franc de pied (1935) à Luján de Cuyo, Mendoza. Vendanges manuelles, élevage 10 à 12 mois.',
      ogTitle: 'Clos des Andes 2017 — Malbec argentin de Mendoza | Andivino',
      ogDescription: '100% Malbec de vieilles vignes franc de pied (1935) à Luján de Cuyo, Mendoza.'
    },
    resume: "Le Clos des Andes dévoile un bouquet ample et expressif, marqué par des arômes de cerise noire mûre et de cassis, relevés d'une subtile note de chocolat noir.",
    descriptionSchema: "Bouquet ample et expressif marqué par des arômes de cerise noire mûre et de cassis, relevés d'une subtile note de chocolat noir. 100% Malbec, Luján de Cuyo, Mendoza.",
    proprietes: [
      ['Cépages', '100 % Malbec'],
      ['Vendanges', 'Manuelles'],
      ['Vignes', '2 ha plantés en 1935, franc de pied'],
      ['Sol', 'Sablo-argileux'],
      ['Altitude', '900 m'],
      ['Élevage', '10 à 12 mois'],
      ['Garde', '15 ans']
    ],
    leadHtml: "<strong>Clos des Andes 2017</strong> est un Malbec argentin de la Bodega Poesía, à Luján de Cuyo (Mendoza)&nbsp;: 100&nbsp;% Malbec issu de vignes plantées en 1935 en franc de pied et vendangées à la main. Élevé de 10 à 12 mois, il se garde 15 ans. 22&nbsp;€ la bouteille.",
    notesHtml: "Le Clos des Andes dévoile un bouquet ample et expressif, marqué par des arômes de cerise noire mûre et de cassis, relevés d'une subtile note de chocolat noir. La bouche, mi-corsée, séduit par des tanins souples et harmonieux. Les saveurs de prune noire et de mûre, généreuses et arrondies, s'étirent avec élégance vers une finale douce et veloutée, gagnant en finesse et en complexité à l'aération.",
    fiche: [
      ['Origine', 'Bodega Poesía, Luján de Cuyo – Mendoza, Argentine', true],
      ['Cépages', '100 % Malbec'],
      ['Vendanges', 'Manuelles'],
      ['Superficie', '2 ha plantés en 1935, franc de pied'],
      ['Sol', 'Sablo-argileux'],
      ['Cuves de fermentation', 'Inox et fûts de chêne'],
      ['Élevage', '10 à 12 mois'],
      ['Garde', '15 ans']
    ],
    serviceHtml: [
      "Servez-le entre 16 et 17&nbsp;°C&nbsp;; une petite carafe de trente minutes suffit. Son accord naturel est la viande grillée au feu de bois&nbsp;: c'est devant une bavette saisie à la braise que le Clos des Andes se montre le plus réussi. D'autres idées dans nos <a href=\"/chroniques/accords-mets-vins-malbec-argentin\">accords mets-vins avec un Malbec argentin</a>.",
      'Pour le goûter avant de commander, il est {degustation}.'
    ],
    terroirHtml: [
      "Clos des Andes est le seul 100&nbsp;% Malbec de nos trois cuvées et la porte d'entrée de la Bodega Poesía&nbsp;: 2 hectares de vignes plantées en 1935 en franc de pied, un élevage court de 10 à 12 mois et une garde de 15 ans. Sans le Cabernet Sauvignon des deux cuvées Poesía, c'est le Malbec de Luján de Cuyo qui parle seul&nbsp;: cerise noire, cassis, prune et des tanins souples.",
      "Le sol sablo-argileux et les 900 mètres d'altitude du piedmont andin lui donnent sa maturité et sa fraîcheur. Pour comprendre ce terroir&nbsp;:"
    ],
    liens: LIENS_MALBEC
  }
];

const STATUTS = {
  'en-stock': { label: 'En stock', schema: 'https://schema.org/InStock', cta: 'Commander', achetable: true },
  'bientot-epuise': { label: 'Bientôt épuisé', schema: 'https://schema.org/LimitedAvailability', cta: 'Commander', achetable: true },
  precommande: { label: 'Précommande', schema: 'https://schema.org/PreOrder', cta: 'Précommander', achetable: true },
  epuise: { label: 'Épuisé', schema: 'https://schema.org/OutOfStock', cta: null, achetable: false }
};

const SITE = 'https://andivino.fr';
const wineUrl = (w) => `/vins/${w.domaine}/${w.slug}`;
const cepagesTexte = (w) => w.cepages.map((c) => (c.part === 100 ? `100 % ${c.nom}` : `${c.part} % ${c.nom}`)).join(', ');
// Prix ronds affichés sans centimes (22 €), sinon avec (22,50 €).
const prixTexte = (cents) => (cents % 100 === 0 ? `${cents / 100} €` : `${(cents / 100).toFixed(2).replace('.', ',')} €`);

// Validation au chargement : une erreur de saisie plante le démarrage plutôt que de produire une fiche cassée.
for (const w of WINES) {
  for (const k of ['id', 'slug', 'domaine', 'nom', 'millesime', 'nomComplet', 'nomStripe', 'prix', 'statut', 'image', 'seo', 'leadHtml', 'notesHtml', 'fiche']) {
    if (w[k] === undefined || w[k] === null || w[k] === '') throw new Error(`data/wines.js : ${w.id || '?'} sans « ${k} »`);
  }
  if (!DOMAINES[w.domaine]) throw new Error(`data/wines.js : domaine inconnu « ${w.domaine} » pour ${w.id}`);
  if (!STATUTS[w.statut]) throw new Error(`data/wines.js : statut inconnu « ${w.statut} » pour ${w.id}`);
  if (w.statut === 'precommande' && !/^\d{4}-\d{2}-\d{2}$/.test(w.arrivee || '')) throw new Error(`data/wines.js : ${w.id} en précommande sans date d'arrivée (arrivee: 'AAAA-MM-JJ')`);
  if (!Number.isInteger(w.prix) || w.prix <= 0) throw new Error(`data/wines.js : prix invalide pour ${w.id} (en centimes)`);
}
if (new Set(WINES.map((w) => w.id)).size !== WINES.length) throw new Error('data/wines.js : id en double');

module.exports = { WINES, DOMAINES, STATUTS, SITE, wineUrl, cepagesTexte, prixTexte };
