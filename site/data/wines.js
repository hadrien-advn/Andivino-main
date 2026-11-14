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

const { DOMAINES } = require('./domaines');

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
    elevage: '24 mois',
    garde: '25 ans',
    scores: [
      { note: 94, source: 'Wine Advocate' },
      { note: 94, source: 'James Suckling' }
    ],
    image: { src: '/assets/images/bout-poesia.webp', width: 221, height: 900, alt: 'Bouteille de Poesía 2014, vin argentin de Mendoza' },
    og: '/assets/images/og/poesia-2014.jpg',
    maj: '2026-11-14',
    seo: {
      title: 'Poesía 2014 — Vin argentin de Mendoza | 94 pts | Andivino',
      description: 'Poesía 2014, assemblage Malbec-Cabernet Sauvignon de la Bodega Poesía à Luján de Cuyo. 94 pts Wine Advocate et 94 James Suckling. Commandez en ligne.',
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
      ['Élevage', '24 mois en fût de chêne'],
      ['Garde', '25 ans']
    ],
    leadHtml: "<strong>Poesía 2014</strong> est un vin rouge argentin de la Bodega Poesía, à Luján de Cuyo (Mendoza)&nbsp;: un assemblage de 60&nbsp;% Malbec et 40&nbsp;% Cabernet Sauvignon issu de vignes plantées en 1935 en franc de pied et vendangées à la main. Élevé 24 mois en fût de chêne, il se garde 25 ans. Il est noté 94 points par Wine Advocate et 94 par James Suckling. 45&nbsp;€ la bouteille.",
    notesHtml: "Poesía s'exprime avec distinction et profondeur à travers une robe rouge rubis intense. Le nez, raffiné et complexe, mêle fruits rouges et noirs mûrs (framboise, cerise noire, mûre) à de subtiles notes de pain grillé, café, moka et cèdre, complétées par des touches de minéralité, d'épices fines et florales. La bouche offre une texture soyeuse, un équilibre précis et une fraîcheur élégante. Le fruit s'étire sur une trame minérale et des tanins fins et enveloppants, avant une finale longue, nette et raffinée.",
    fiche: [
      ['Origine', 'Bodega Poesía, Luján de Cuyo – Mendoza, Argentine', true],
      ['Cépages', '60 % Malbec, 40 % Cabernet Sauvignon'],
      ['Vendanges', 'Manuelles'],
      ['Superficie', '13 ha plantés en 1935, franc de pied'],
      ['Sol', 'Sablo-argileux'],
      ['Cuves de fermentation', 'Inox et fûts de chêne'],
      ['Élevage', '24 mois en fût de chêne'],
      ['Garde', '25 ans']
    ],
    serviceHtml: [
      "Servez-le entre 16 et 17&nbsp;°C, jamais trop chaud&nbsp;: la chaleur ferait ressortir l'alcool et écraserait le fruit. Élevé 24 mois en fût de chêne, il gagne à passer une bonne heure en carafe.",
      "Nous le conseillons avec des plats de caractère&nbsp;: un gibier, une viande longuement mijotée, puis un fromage affiné (Comté de 24 mois, vieux Manchego) ou un carré de chocolat noir à 70&nbsp;% pour finir. D'autres idées dans nos <a href=\"/chroniques/accords-mets-vins-malbec-argentin\">accords mets-vins avec un Malbec argentin</a>.",
      'Pour le goûter avant de commander, il est {degustation}.'
    ],
    terroirHtml: [
      "Poesía 2014 est le plus ancien millésime de nos trois cuvées et le plus longuement élevé&nbsp;: 24 mois, contre 16 pour la Cuvée Hélène, qui partage le même assemblage de 60&nbsp;% Malbec et 40&nbsp;% Cabernet Sauvignon. Comme elle, il se garde 25 ans.",
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
    elevage: '16 mois',
    garde: '25 ans',
    scores: [
      { note: '92+', source: 'Wine Advocate' },
      { note: 91, source: 'James Suckling' }
    ],
    image: { src: '/assets/images/bout-helene-2016.webp', width: 234, height: 900, alt: 'Bouteille de la Cuvée Hélène 2016, vin argentin de Mendoza' },
    og: '/assets/images/og/cuvee-helene-2016.jpg',
    maj: '2026-11-14',
    seo: {
      title: 'Poesía — Cuvée Hélène 2016, vin de Mendoza | Andivino',
      description: "Poesía — Cuvée Hélène 2016, assemblage Malbec-Cabernet Sauvignon d'une parcelle plantée en 1935 à Luján de Cuyo, Mendoza. Élevage 16 mois en fût de chêne.",
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
      ['Élevage', '16 mois en fût de chêne'],
      ['Garde', '25 ans']
    ],
    leadHtml: "<strong>Poesía — Cuvée Hélène 2016</strong> est un vin rouge argentin de la Bodega Poesía, à Luján de Cuyo (Mendoza)&nbsp;: 60&nbsp;% Malbec et 40&nbsp;% Cabernet Sauvignon issus d'une parcelle d'un hectare plantée en 1935 en franc de pied, vendangée à la main. Élevée 16 mois en fût de chêne, elle se garde 25 ans. Elle est notée 92+ par Wine Advocate et 91 par James Suckling. 36&nbsp;€ la bouteille.",
    notesHtml: "D'une robe rouge sombre et brillante, le vin offre un nez subtil et complexe de framboise noire, moka et espresso, relevé d'une délicate note florale. La bouche séduit par la pureté et la maturité du fruit, sans excès de torréfaction, enrichie de baies noires, d'épices fines et d'un boisé fumé de grande qualité. La finale, longue et persistante, repose sur des tanins nobles et harmonieux. Un vin déjà remarquable, d'une grande élégance et profondeur.",
    fiche: [
      ['Origine', 'Bodega Poesía, Luján de Cuyo – Mendoza, Argentine', true],
      ['Cépages', '60 % Malbec, 40 % Cabernet Sauvignon'],
      ['Vendanges', 'Manuelles'],
      ['Superficie', '1 ha planté en 1935, franc de pied'],
      ['Sol', 'Sablo-argileux'],
      ['Cuves de fermentation', 'Inox et fûts de chêne'],
      ['Élevage', '16 mois en fût de chêne'],
      ['Garde', '25 ans']
    ],
    serviceHtml: [
      "Servez-la entre 16 et 17&nbsp;°C, après une bonne heure en carafe. Les plats mijotés et les viandes marquées lui vont bien&nbsp;: magret de canard, agneau de sept heures, joue de bœuf braisée, daube. D'autres idées dans nos <a href=\"/chroniques/accords-mets-vins-malbec-argentin\">accords mets-vins avec un Malbec argentin</a>.",
      'Pour la goûter avant de commander, elle est {degustation:e}.'
    ],
    terroirHtml: [
      "La Cuvée Hélène vient d'une seule parcelle d'à peine 1 hectare, plantée en 1935 en franc de pied à Luján de Cuyo, sur un sol sablo-argileux à 900 mètres d'altitude. Elle partage l'assemblage de Poesía (60&nbsp;% Malbec, 40&nbsp;% Cabernet Sauvignon) avec un élevage un peu plus court, de 16 mois.",
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
    elevage: '12 mois',
    garde: '15 ans',
    scores: [],
    image: { src: '/assets/images/bout-cda.webp', width: 212, height: 900, alt: 'Bouteille de Clos des Andes 2017, Malbec argentin de Mendoza' },
    og: '/assets/images/og/clos-des-andes-2017.jpg',
    maj: '2026-11-14',
    seo: {
      title: 'Clos des Andes 2017 — Malbec argentin de Mendoza | Andivino',
      description: 'Clos des Andes 2017, 100% Malbec de vieilles vignes franc de pied (1935) à Luján de Cuyo, Mendoza. Vendanges manuelles, élevage 12 mois en fût de chêne.',
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
      ['Élevage', '12 mois en fût de chêne'],
      ['Garde', '15 ans']
    ],
    leadHtml: "<strong>Clos des Andes 2017</strong> est un Malbec argentin de la Bodega Poesía, à Luján de Cuyo (Mendoza)&nbsp;: 100&nbsp;% Malbec issu de vignes plantées en 1935 en franc de pied et vendangées à la main. Élevé 12 mois en fût de chêne, il se garde 15 ans. 22&nbsp;€ la bouteille.",
    notesHtml: "Le Clos des Andes dévoile un bouquet ample et expressif, marqué par des arômes de cerise noire mûre et de cassis, relevés d'une subtile note de chocolat noir. La bouche, mi-corsée, séduit par des tanins souples et harmonieux. Les saveurs de prune noire et de mûre, généreuses et arrondies, s'étirent avec élégance vers une finale douce et veloutée, gagnant en finesse et en complexité à l'aération.",
    fiche: [
      ['Origine', 'Bodega Poesía, Luján de Cuyo – Mendoza, Argentine', true],
      ['Cépages', '100 % Malbec'],
      ['Vendanges', 'Manuelles'],
      ['Superficie', '2 ha plantés en 1935, franc de pied'],
      ['Sol', 'Sablo-argileux'],
      ['Cuves de fermentation', 'Inox et fûts de chêne'],
      ['Élevage', '12 mois en fût de chêne'],
      ['Garde', '15 ans']
    ],
    serviceHtml: [
      "Servez-le entre 16 et 17&nbsp;°C&nbsp;; une petite carafe de trente minutes suffit. Son accord naturel est la viande grillée au feu de bois&nbsp;: c'est devant une bavette saisie à la braise que le Clos des Andes se montre le plus réussi. D'autres idées dans nos <a href=\"/chroniques/accords-mets-vins-malbec-argentin\">accords mets-vins avec un Malbec argentin</a>.",
      'Pour le goûter avant de commander, il est {degustation}.'
    ],
    terroirHtml: [
      "Clos des Andes est le seul 100&nbsp;% Malbec de nos trois cuvées et la porte d'entrée de la Bodega Poesía&nbsp;: 2 hectares de vignes plantées en 1935 en franc de pied, un élevage court de 12 mois et une garde de 15 ans. Sans le Cabernet Sauvignon des deux cuvées Poesía, c'est le Malbec de Luján de Cuyo qui parle seul&nbsp;: cerise noire, cassis, prune et des tanins souples.",
      "Le sol sablo-argileux et les 900 mètres d'altitude du piedmont andin lui donnent sa maturité et sa fraîcheur. Pour comprendre ce terroir&nbsp;:"
    ],
    liens: LIENS_MALBEC
  }
  ,
  // ── Carmelo Patti (Perdriel, Luján de Cuyo) : catalogue 2026, précommande, arrivée janvier 2027 ──
  {
    id: 'cp-malbec-2019',
    slug: 'malbec-2019',
    domaine: 'carmelo-patti',
    nom: 'Carmelo Patti Malbec',
    millesime: 2019,
    nomComplet: 'Carmelo Patti Malbec 2019',
    nomStripe: 'Carmelo Patti Malbec 2019',
    prix: 3200,
    statut: 'precommande',
    arrivee: '2027-01-04',
    couleur: 'Rouge',
    format: '75 cl',
    cepages: [{ nom: 'Malbec', part: 100 }],
    vendanges: 'Manuelles',
    elevage: '24 mois',
    garde: '35 ans',
    scores: [
      { note: 93, source: 'Wine Advocate' },
      { note: 95, source: 'Descorchados' }
    ],
    image: { src: '/assets/images/bout-carmelo-patti-malbec-2019.webp', width: 113, height: 450, alt: 'Bouteille de Carmelo Patti Malbec 2019, vin argentin de Luján de Cuyo' },
    og: '/assets/images/og/carmelo-patti-malbec-2019.jpg',
    maj: '2026-11-14',
    seo: {
      title: 'Carmelo Patti Malbec 2019, Luján de Cuyo | 95 pts | Andivino',
      description: 'Carmelo Patti Malbec 2019 : 100 % Malbec de Perdriel (Luján de Cuyo), 24 mois en fût, sans collage ni filtration. 93 pts Wine Advocate, 95 Descorchados.',
      ogTitle: 'Carmelo Patti Malbec 2019 — Luján de Cuyo | Andivino',
      ogDescription: 'Le Malbec de garde de Carmelo Patti, en exclusivité en France chez Andivino.'
    },
    resume: "Un Malbec de tradition : fruits rouges et noirs mûrs, sous-bois, tabac et épices douces, une finale longue et délicatement épicée.",
    descriptionSchema: "Ce Malbec s'exprime avec authenticité et caractère à travers une robe rouge profond aux reflets bleutés. 100 % Malbec, Perdriel, Luján de Cuyo, Mendoza.",
    proprietes: [
      ['Cépages', '100 % Malbec'],
      ['Vendanges', 'Manuelles'],
      ['Sol', 'Sablo-argileux'],
      ['Altitude', '960 m'],
      ['Élevage', '24 mois en fût de chêne'],
      ['Garde', '35 ans']
    ],
    leadHtml: "<strong>Carmelo Patti Malbec 2019</strong> est un Malbec argentin de la bodega Carmelo Patti, à Perdriel (Luján de Cuyo, Mendoza)&nbsp;: 100&nbsp;% Malbec né à 960 mètres d'altitude, vendangé à la main, élevé 24 mois en fût de chêne et mis en bouteille sans collage ni filtration. Il se garde 35 ans. Il est noté 93 points par Wine Advocate et 95 par Descorchados. 32&nbsp;€ la bouteille, en exclusivité en France chez Andivino, en précommande pour une arrivée en janvier 2027.",
    notesHtml: "Ce Malbec s'exprime avec authenticité et caractère à travers une robe rouge profond aux reflets bleutés. Le nez, profond et complexe, mêle fruits rouges et noirs mûrs (fraise, cerise, cassis, prune) à des notes plus terriennes de sous-bois et de tabac, rehaussées de touches d'épices douces, de cacao et de menthe, issues d'un élevage en cuve béton puis en barriques de chêne français. La bouche offre une texture souple et ronde, une fraîcheur vive et un équilibre naturel. Le fruit, juteux et généreux, s'appuie sur des tanins fins et caressants, avant une finale longue, douce et délicatement épicée. Un Malbec de tradition, sincère et racé, né à 960 mètres d'altitude à Perdriel, au cœur de Luján de Cuyo.",
    fiche: [
      ['Origine', 'Carmelo Patti, Perdriel, Luján de Cuyo – Mendoza, Argentine', true],
      ['Cépages', '100 % Malbec'],
      ['Vendanges', 'Manuelles'],
      ['Altitude', '960 m'],
      ['Sol', 'Sablo-argileux'],
      ['Élevage', '24 mois en fût de chêne'],
      ['Mise en bouteille', 'Sans collage ni filtration'],
      ['Garde', '35 ans']
    ],
    terroirHtml: [
      "Les raisins viennent de Perdriel, au cœur de Luján de Cuyo, à 960 mètres d'altitude, sur un sol sablo-argileux. Carmelo Patti les vinifie avec des levures indigènes, élève ses vins en cuve béton puis en barriques, et les met en bouteille sans collage ni filtration. Il ne les libère que lorsqu'il les juge prêts, souvent cinq ans après la récolte.",
      "Son Malbec a été élu meilleur Malbec du monde en 2007. Pour aller plus loin&nbsp;:"
    ],
    liens: [{ href: '/vins/carmelo-patti', texte: 'Carmelo Patti, un vigneron de garde à Luján de Cuyo' }, ...LIENS_MALBEC]
  },
  {
    id: 'cp-cabernet-sauvignon-2018',
    slug: 'cabernet-sauvignon-2018',
    domaine: 'carmelo-patti',
    nom: 'Carmelo Patti Cabernet Sauvignon',
    millesime: 2018,
    nomComplet: 'Carmelo Patti Cabernet Sauvignon 2018',
    nomStripe: 'Carmelo Patti Cabernet Sauvignon 2018',
    prix: 3400,
    statut: 'precommande',
    arrivee: '2027-01-04',
    couleur: 'Rouge',
    format: '75 cl',
    cepages: [{ nom: 'Cabernet Sauvignon', part: 100 }],
    vendanges: 'Manuelles',
    elevage: '24 mois',
    garde: '35 ans',
    scores: [
      { note: 95, source: 'Wine Advocate' },
      { note: 94, source: 'Descorchados' }
    ],
    image: { src: '/assets/images/bout-carmelo-patti-cabernet-sauvignon-2018.webp', width: 107, height: 447, alt: 'Bouteille de Carmelo Patti Cabernet Sauvignon 2018, vin argentin de Luján de Cuyo' },
    og: '/assets/images/og/carmelo-patti-cabernet-sauvignon-2018.jpg',
    maj: '2026-11-14',
    seo: {
      title: 'Carmelo Patti Cabernet Sauvignon 2018 | 95 pts WA | Andivino',
      description: 'Carmelo Patti Cabernet Sauvignon 2018 : 100 % Cabernet Sauvignon de Luján de Cuyo, 24 mois en fût, garde 35 ans. 95 pts Wine Advocate, 94 Descorchados.',
      ogTitle: 'Carmelo Patti Cabernet Sauvignon 2018 | Andivino',
      ogDescription: 'Le Cabernet Sauvignon culte de Carmelo Patti, en exclusivité en France chez Andivino.'
    },
    resume: "Un Cabernet de grande tradition : groseille, framboise, cassis et cerise, des notes d'épices et de café, une acidité vive.",
    descriptionSchema: "Ce Cabernet Sauvignon s'exprime avec finesse à travers une robe rouge profond, nuancée de reflets rouge feu. 100 % Cabernet Sauvignon, Perdriel, Luján de Cuyo, Mendoza.",
    proprietes: [
      ['Cépages', '100 % Cabernet Sauvignon'],
      ['Vendanges', 'Manuelles'],
      ['Sol', 'Sablo-argileux'],
      ['Altitude', '960 m'],
      ['Élevage', '24 mois en fût de chêne'],
      ['Garde', '35 ans']
    ],
    leadHtml: "<strong>Carmelo Patti Cabernet Sauvignon 2018</strong> est un vin rouge argentin de la bodega Carmelo Patti, à Perdriel (Luján de Cuyo, Mendoza)&nbsp;: 100&nbsp;% Cabernet Sauvignon vendangé à la main, élevé 24 mois en fût de chêne et mis en bouteille sans collage ni filtration. Il se garde 35 ans. Il est noté 95 points par Wine Advocate et 94 par Descorchados. 34&nbsp;€ la bouteille, en exclusivité en France chez Andivino, en précommande pour une arrivée en janvier 2027.",
    notesHtml: "Ce Cabernet Sauvignon s'exprime avec finesse à travers une robe rouge profond, nuancée de reflets rouge feu qui témoignent de sa lente évolution en bouteille. Le nez, nuancé et raffiné, associe fruits rouges et noirs mûrs (groseille, framboise, cassis, cerise) à des notes d'épices, de fruits secs et de café, sur un fond légèrement terrien. La bouche offre une texture fine et précise, un équilibre remarquable et une acidité vive qui lui confère tension et élégance. Le fruit, pur et délié, s'étire sur des tanins fondus et très aimables, avant une finale persistante aux accents minéraux. Un Cabernet de grande tradition, d'inspiration européenne, devenu une référence culte en Argentine.",
    fiche: [
      ['Origine', 'Carmelo Patti, Perdriel, Luján de Cuyo – Mendoza, Argentine', true],
      ['Cépages', '100 % Cabernet Sauvignon'],
      ['Vendanges', 'Manuelles'],
      ['Altitude', '960 m'],
      ['Sol', 'Sablo-argileux'],
      ['Élevage', '24 mois en fût de chêne'],
      ['Mise en bouteille', 'Sans collage ni filtration'],
      ['Garde', '35 ans']
    ],
    terroirHtml: [
      "Les raisins viennent de Perdriel, au cœur de Luján de Cuyo, à 960 mètres d'altitude, sur un sol sablo-argileux. Carmelo Patti les vinifie avec des levures indigènes, élève ses vins en cuve béton puis en barriques, et les met en bouteille sans collage ni filtration. Il ne les libère que lorsqu'il les juge prêts, souvent cinq ans après la récolte. Pour découvrir le domaine&nbsp;:"
    ],
    liens: [{ href: '/vins/carmelo-patti', texte: 'Carmelo Patti, un vigneron de garde à Luján de Cuyo' }]
  },
  {
    id: 'cp-cabernet-franc-2021',
    slug: 'cabernet-franc-2021',
    domaine: 'carmelo-patti',
    nom: 'Carmelo Patti Cabernet Franc',
    millesime: 2021,
    nomComplet: 'Carmelo Patti Cabernet Franc 2021',
    nomStripe: 'Carmelo Patti Cabernet Franc 2021',
    prix: 3200,
    statut: 'precommande',
    arrivee: '2027-01-04',
    couleur: 'Rouge',
    format: '75 cl',
    cepages: [{ nom: 'Cabernet Franc', part: 100 }],
    vendanges: 'Manuelles',
    elevage: '24 mois',
    garde: '30 ans',
    scores: [{ note: 93, source: 'Wine Advocate' }],
    image: { src: '/assets/images/bout-carmelo-patti-cabernet-franc-2021.webp', width: 108, height: 451, alt: 'Bouteille de Carmelo Patti Cabernet Franc, vin argentin de Luján de Cuyo' },
    og: '/assets/images/og/carmelo-patti-cabernet-franc-2021.jpg',
    maj: '2026-11-14',
    seo: {
      title: 'Carmelo Patti Cabernet Franc 2021, Luján de Cuyo | Andivino',
      description: 'Carmelo Patti Cabernet Franc 2021 : 100 % Cabernet Franc de Perdriel (Luján de Cuyo), 24 mois en fût de chêne, garde 30 ans. 93 pts Wine Advocate.',
      ogTitle: 'Carmelo Patti Cabernet Franc 2021 | Andivino',
      ogDescription: 'Le Cabernet Franc de Carmelo Patti, en exclusivité en France chez Andivino.'
    },
    resume: "Fraise, framboise et cassis, les notes de poivron doux, de menthol et de feuille de tabac du cépage, une bouche souple et digeste.",
    descriptionSchema: "Ce Cabernet Franc s'exprime avec fraîcheur et singularité à travers une robe rouge grenat. 100 % Cabernet Franc, Perdriel, Luján de Cuyo, Mendoza.",
    proprietes: [
      ['Cépages', '100 % Cabernet Franc'],
      ['Vendanges', 'Manuelles'],
      ['Sol', 'Sablo-argileux'],
      ['Altitude', '960 m'],
      ['Élevage', '24 mois en fût de chêne'],
      ['Garde', '30 ans']
    ],
    leadHtml: "<strong>Carmelo Patti Cabernet Franc 2021</strong> est un vin rouge argentin de la bodega Carmelo Patti, à Perdriel (Luján de Cuyo, Mendoza)&nbsp;: 100&nbsp;% Cabernet Franc vendangé à la main, élevé 24 mois en fût de chêne et mis en bouteille sans collage ni filtration. Il se garde 30 ans. Il est noté 93 points par Wine Advocate. 32&nbsp;€ la bouteille, en exclusivité en France chez Andivino, en précommande pour une arrivée en janvier 2027.",
    notesHtml: "Ce Cabernet Franc s'exprime avec fraîcheur et singularité à travers une robe rouge grenat. Le nez, expressif et nuancé, mêle fruits rouges et noirs (fraise, framboise, cassis) aux notes signatures du cépage&nbsp;: poivron doux, menthol et feuille de tabac, complétées de touches fumées et d'épices fines issues d'un élevage en barriques de chêne français. La bouche offre une texture souple, un équilibre précis et une fraîcheur digeste. Le fruit, croquant et lumineux, se prolonge sur des tanins délicats et des saveurs de réglisse et de cassis, avant une finale longue et harmonieuse. Un Cabernet Franc de caractère, fidèle à la philosophie sans artifice de Carmelo Patti.",
    fiche: [
      ['Origine', 'Carmelo Patti, Perdriel, Luján de Cuyo – Mendoza, Argentine', true],
      ['Cépages', '100 % Cabernet Franc'],
      ['Vendanges', 'Manuelles'],
      ['Altitude', '960 m'],
      ['Sol', 'Sablo-argileux'],
      ['Élevage', '24 mois en fût de chêne'],
      ['Mise en bouteille', 'Sans collage ni filtration'],
      ['Garde', '30 ans']
    ],
    terroirHtml: [
      "Les raisins viennent de Perdriel, au cœur de Luján de Cuyo, à 960 mètres d'altitude, sur un sol sablo-argileux. Carmelo Patti les vinifie avec des levures indigènes, élève ses vins en cuve béton puis en barriques, et les met en bouteille sans collage ni filtration. Il ne les libère que lorsqu'il les juge prêts. Pour découvrir le domaine&nbsp;:"
    ],
    liens: [{ href: '/vins/carmelo-patti', texte: 'Carmelo Patti, un vigneron de garde à Luján de Cuyo' }]
  },
  // ── Gualtallary Wines (Tupungato, Valle de Uco) : catalogue 2026, précommande, arrivée janvier 2027 ──
  {
    id: 'altus-malbec-2026',
    slug: 'altus-malbec-2026',
    domaine: 'gualtallary-wines',
    nom: 'Altus Malbec',
    millesime: 2026,
    nomComplet: 'Altus Malbec 2026',
    nomStripe: 'Gualtallary Altus Malbec 2026',
    prix: 1500,
    statut: 'precommande',
    arrivee: '2027-01-04',
    couleur: 'Rouge',
    format: '75 cl',
    cepages: [{ nom: 'Malbec', part: 100 }],
    elevage: '6 mois',
    garde: '5 ans',
    scores: [],
    image: { src: '/assets/images/bout-altus-malbec-2026.webp', width: 106, height: 416, alt: 'Bouteille de Gualtallary Altus Malbec, vin argentin de la Valle de Uco' },
    og: '/assets/images/og/altus-malbec-2026.jpg',
    maj: '2026-11-14',
    seo: {
      title: 'Altus Malbec 2026, Malbec d\'altitude de Gualtallary | Andivino',
      description: 'Altus Malbec 2026 de Gualtallary Wines : 100 % Malbec né à 1500 m dans la Valle de Uco (Mendoza), 6 mois en fût de chêne. Cerise, prune, poivre. 15 €.',
      ogTitle: 'Altus Malbec 2026 — Gualtallary, Valle de Uco | Andivino',
      ogDescription: 'Un Malbec de haute altitude, né à 1500 mètres au pied des Andes.'
    },
    resume: "Un Malbec de haute altitude : cerise, prune et framboise, des épices douces et du poivre, une bouche souple et fraîche.",
    descriptionSchema: "Ce Malbec de Gualtallary s'exprime avec éclat et gourmandise à travers une robe rouge intense aux reflets pourpres. 100 % Malbec, Gualtallary, Valle de Uco, Mendoza.",
    proprietes: [
      ['Cépages', '100 % Malbec'],
      ['Sol', 'Alluvial, riche en carbonate de calcium'],
      ['Altitude', '1500 m'],
      ['Élevage', '6 mois en fût de chêne'],
      ['Garde', '5 ans']
    ],
    leadHtml: "<strong>Altus Malbec 2026</strong> est un Malbec argentin de Gualtallary Wines, à Tupungato (Valle de Uco, Mendoza)&nbsp;: 100&nbsp;% Malbec né à 1500 mètres d'altitude sur des sols alluviaux calcaires, élevé 6 mois en fût de chêne. Il se garde 5 ans. 15&nbsp;€ la bouteille, en précommande pour une arrivée en janvier 2027.",
    notesHtml: "Ce Malbec de Gualtallary s'exprime avec éclat et gourmandise à travers une robe rouge intense aux reflets pourpres. Le nez, intense et fruité, mêle fruits rouges et noirs frais (cerise, prune, framboise) à de délicates touches d'épices douces et de poivre, reflet de la pureté du fruit d'altitude. La bouche offre un bon volume, une texture souple et une fraîcheur vive. Le fruit, juteux et éclatant, s'appuie sur des tanins aimables et fondus, avant une finale harmonieuse et équilibrée. Un Malbec de haute altitude, sincère et généreux, né à 1500 mètres au pied des Andes, à Gualtallary, au cœur de la vallée de l'Uco.",
    fiche: [
      ['Origine', 'Gualtallary Wines, Tupungato, Valle de Uco – Mendoza, Argentine', true],
      ['Cépages', '100 % Malbec'],
      ['Altitude', '1500 m'],
      ['Sol', 'Alluvial, riche en carbonate de calcium'],
      ['Élevage', '6 mois en fût de chêne'],
      ['Garde', '5 ans'],
      ['Vinification', "Macarena Giménez, avec les conseils d'Alberto Antonini", true]
    ],
    terroirHtml: [
      "Gualtallary, dans la Valle de Uco, est l'un des secteurs les plus prisés de Mendoza. L'altitude et les sols alluviaux, à forte teneur en carbonate de calcium, y donnent des vins tendus et salins, à l'acidité franche&nbsp;: un Malbec plus frais que le Malbec solaire auquel l'Argentine est souvent réduite.",
      "La vinification est signée Macarena Giménez, avec les conseils d'Alberto Antonini. Pour aller plus loin&nbsp;:"
    ],
    liens: [{ href: '/vins/gualtallary-wines', texte: "Gualtallary Wines, vins d'altitude de la Valle de Uco" }, ...LIENS_MALBEC]
  },
  {
    id: 'gran-chardonnay-2024',
    slug: 'gran-chardonnay-2024',
    domaine: 'gualtallary-wines',
    nom: 'Gran Chardonnay',
    millesime: 2024,
    nomComplet: 'Gran Chardonnay 2024',
    nomStripe: 'Gualtallary Gran Chardonnay 2024',
    prix: 2400,
    statut: 'precommande',
    arrivee: '2027-01-04',
    couleur: 'Blanc',
    format: '75 cl',
    cepages: [{ nom: 'Chardonnay', part: 100 }],
    elevage: '8 mois',
    garde: '15 ans',
    scores: [
      { note: 96, source: 'Decanter WWA 2026' },
      { note: 92, source: 'Vinous' }
    ],
    image: { src: '/assets/images/bout-gran-chardonnay-2024.webp', width: 113, height: 424, alt: 'Bouteille de Gualtallary Gran Chardonnay, vin blanc argentin de la Valle de Uco' },
    og: '/assets/images/og/gran-chardonnay-2024.jpg',
    maj: '2026-11-14',
    seo: {
      title: 'Gran Chardonnay 2024 de Gualtallary | 96 pts | Andivino',
      description: "Gran Chardonnay 2024 de Gualtallary Wines : Chardonnay d'altitude à 1600 m (Valle de Uco), 8 mois en fût de chêne français. 96 pts Decanter, 92 Vinous.",
      ogTitle: 'Gran Chardonnay 2024 — Gualtallary, Valle de Uco | Andivino',
      ogDescription: "Un Chardonnay d'altitude racé, 96 points aux Decanter World Wine Awards 2026."
    },
    resume: "Un Chardonnay d'altitude : ananas, mangue et fruit de la passion, agrumes et fleurs blanches, une touche de vanille et de noisette grillée.",
    descriptionSchema: "Ce Gran Chardonnay s'exprime avec éclat et élégance à travers une robe jaune brillant aux légers reflets verts. 100 % Chardonnay, Gualtallary, Valle de Uco, Mendoza.",
    proprietes: [
      ['Cépages', '100 % Chardonnay'],
      ['Sol', 'Alluvial, riche en carbonate de calcium'],
      ['Altitude', '1600 m'],
      ['Élevage', '8 mois en fût de chêne français'],
      ['Garde', '15 ans']
    ],
    leadHtml: "<strong>Gran Chardonnay 2024</strong> est un vin blanc argentin de Gualtallary Wines, à Tupungato (Valle de Uco, Mendoza)&nbsp;: 100&nbsp;% Chardonnay issu de vignes à 1600 mètres d'altitude, élevé 8 mois en fût de chêne français. Il se garde 15 ans. Il a obtenu 96 points aux Decanter World Wine Awards 2026 et 92 chez Vinous. 24&nbsp;€ la bouteille, en précommande pour une arrivée en janvier 2027.",
    notesHtml: "Ce Gran Chardonnay s'exprime avec éclat et élégance à travers une robe jaune brillant aux légers reflets verts. Le nez, complexe et expressif, mêle fruits tropicaux mûrs (ananas, mangue, fruit de la passion) à des notes d'agrumes et de fleurs blanches, complétées de subtiles touches de vanille et de noisette grillée, issues d'un élevage en barriques de chêne français. La bouche offre une belle concentration, une texture ample et une acidité juteuse qui lui confère tension et fraîcheur. Le fruit, mûr et lumineux, s'étire sur un boisé délicat et parfaitement intégré, avant une finale longue et raffinée. Un Chardonnay d'altitude racé et élégant, révélant la fraîcheur unique de Gualtallary.",
    fiche: [
      ['Origine', 'Gualtallary Wines, Tupungato, Valle de Uco – Mendoza, Argentine', true],
      ['Cépages', '100 % Chardonnay'],
      ['Altitude', '1600 m'],
      ['Sol', 'Alluvial, riche en carbonate de calcium'],
      ['Élevage', '8 mois en fût de chêne français'],
      ['Garde', '15 ans'],
      ['Vinification', "Macarena Giménez, avec les conseils d'Alberto Antonini", true]
    ],
    terroirHtml: [
      "Les raisins viennent de Gualtallary, dans la Valle de Uco, l'un des secteurs les plus prisés de Mendoza&nbsp;: des vignes à 1600 mètres d'altitude, sur des sols alluviaux riches en carbonate de calcium, qui donnent des vins tendus et salins, à l'acidité franche.",
      "La vinification est signée Macarena Giménez, avec les conseils d'Alberto Antonini. Pour découvrir le domaine&nbsp;:"
    ],
    liens: [{ href: '/vins/gualtallary-wines', texte: "Gualtallary Wines, vins d'altitude de la Valle de Uco" }]
  },
  {
    id: 'altus-torrontes-2026',
    slug: 'altus-torrontes-2026',
    domaine: 'gualtallary-wines',
    nom: 'Altus Torrontés',
    millesime: 2026,
    nomComplet: 'Altus Torrontés 2026',
    nomStripe: 'Gualtallary Altus Torrontes 2026',
    prix: 1500,
    statut: 'precommande',
    arrivee: '2027-01-04',
    couleur: 'Blanc',
    format: '75 cl',
    cepages: [{ nom: 'Torrontés', part: 100 }],
    elevage: 'Cuve inox, sans bois',
    garde: '3 ans',
    scores: [],
    // Photo de la bouteille à venir (celle du catalogue montre une étiquette de Chardonnay).
    image: null,
    og: '/assets/images/og/altus-torrontes-2026.jpg',
    maj: '2026-11-14',
    seo: {
      title: 'Altus Torrontés 2026, vin blanc de Gualtallary | Andivino',
      description: "Altus Torrontés 2026 de Gualtallary Wines (Valle de Uco, Mendoza) : 100 % Torrontés à 1600 m, cuve inox. Fleur d'oranger, jasmin, agrumes. 15 € la bouteille.",
      ogTitle: 'Altus Torrontés 2026 — Gualtallary, Valle de Uco | Andivino',
      ogDescription: "Un Torrontés d'altitude vibrant, idéal avec des empanadas, la cuisine asiatique et les poissons."
    },
    resume: "Une robe or pâle, un nez de fleur d'oranger, de jasmin et d'agrumes, une bouche sèche, vive et désaltérante.",
    descriptionSchema: "Ce Torrontés de Gualtallary s'exprime avec fraîcheur à travers une robe or pâle aux reflets verts. 100 % Torrontés, Gualtallary, Valle de Uco, Mendoza.",
    proprietes: [
      ['Cépages', '100 % Torrontés'],
      ['Sol', 'Alluvial, riche en carbonate de calcium'],
      ['Altitude', '1600 m'],
      ['Élevage', 'Cuve inox, sans bois'],
      ['Garde', '3 ans']
    ],
    leadHtml: "<strong>Altus Torrontés 2026</strong> est un vin blanc argentin de Gualtallary Wines, à Tupungato (Valle de Uco, Mendoza)&nbsp;: 100&nbsp;% Torrontés, le grand cépage blanc d'Argentine, issu de vignes à 1600 mètres d'altitude et vinifié en cuve inox, sans bois. Il se garde 3 ans. 15&nbsp;€ la bouteille, en précommande pour une arrivée en janvier 2027.",
    notesHtml: "Ce Torrontés de Gualtallary s'exprime avec fraîcheur à travers une robe or pâle aux reflets verts. Le nez, expressif et aromatique, mêle notes florales (fleur d'oranger, jasmin) à des touches d'agrumes, zeste d'orange et pamplemousse, préservées par une vinification en cuve inox. La bouche offre une attaque sèche, une texture vive et une fraîcheur éclatante. Le fruit, pur et ciselé, s'étire sur une belle tension acide, avant une finale nette, persistante et désaltérante.",
    fiche: [
      ['Origine', 'Gualtallary Wines, Tupungato, Valle de Uco – Mendoza, Argentine', true],
      ['Cépages', '100 % Torrontés'],
      ['Altitude', '1600 m'],
      ['Sol', 'Alluvial, riche en carbonate de calcium'],
      ['Élevage', 'Cuve inox, sans bois'],
      ['Garde', '3 ans'],
      ['Vinification', "Macarena Giménez, avec les conseils d'Alberto Antonini", true]
    ],
    serviceHtml: [
      "Un Torrontés d'altitude vibrant, idéal avec des empanadas, la cuisine asiatique, les poissons et les fromages doux."
    ],
    terroirHtml: [
      "Les raisins viennent de Gualtallary, dans la Valle de Uco, l'un des secteurs les plus prisés de Mendoza&nbsp;: des vignes à 1600 mètres d'altitude, sur des sols alluviaux riches en carbonate de calcium, qui donnent des vins tendus et salins, à l'acidité franche.",
      "La vinification est signée Macarena Giménez, avec les conseils d'Alberto Antonini. Pour découvrir le domaine&nbsp;:"
    ],
    liens: [{ href: '/vins/gualtallary-wines', texte: "Gualtallary Wines, vins d'altitude de la Valle de Uco" }]
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
  // image : facultative (null tant que la photo de la bouteille manque ; la fiche montre alors le domaine).
  for (const k of ['id', 'slug', 'domaine', 'nom', 'millesime', 'nomComplet', 'nomStripe', 'prix', 'statut', 'og', 'seo', 'leadHtml', 'notesHtml', 'fiche']) {
    if (w[k] === undefined || w[k] === null || w[k] === '') throw new Error(`data/wines.js : ${w.id || '?'} sans « ${k} »`);
  }
  if (!DOMAINES[w.domaine]) throw new Error(`data/wines.js : domaine inconnu « ${w.domaine} » pour ${w.id}`);
  if (!STATUTS[w.statut]) throw new Error(`data/wines.js : statut inconnu « ${w.statut} » pour ${w.id}`);
  if (w.statut === 'precommande' && !/^\d{4}-\d{2}-\d{2}$/.test(w.arrivee || '')) throw new Error(`data/wines.js : ${w.id} en précommande sans date d'arrivée (arrivee: 'AAAA-MM-JJ')`);
  if (!Number.isInteger(w.prix) || w.prix <= 0) throw new Error(`data/wines.js : prix invalide pour ${w.id} (en centimes)`);
}
if (new Set(WINES.map((w) => w.id)).size !== WINES.length) throw new Error('data/wines.js : id en double');

module.exports = { WINES, DOMAINES, STATUTS, SITE, wineUrl, cepagesTexte, prixTexte };
