// Gabarit des fiches produits (/vins/<domaine>/<cuvée>), rendu par le serveur depuis data/wines.js.
// Une seule mise en page pour toutes les cuvées : modifier ce fichier modifie toutes les fiches.
const { WINES, DOMAINES, STATUTS, SITE, wineUrl, cepagesTexte, prixTexte } = require('../data/wines');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// Espaces insécables avant « % », « € », « : » dans les textes simples (déjà échappés).
const fine = (s) => esc(s).replace(/ (%|€|:|;|\?|!)/g, '&nbsp;$1');
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const moisArrivee = (iso) => { const [y, m] = iso.split('-').map(Number); return `${MOIS[m - 1]} ${y}`; };
const prixSchema = (cents) => (cents / 100).toFixed(2);

function statutDe(w) {
  const s = STATUTS[w.statut];
  const label = w.statut === 'precommande' ? `Précommande · arrivée prévue en ${moisArrivee(w.arrivee)}` : s.label;
  return { ...s, label };
}

function jsonLd(w, d) {
  const url = SITE + wineUrl(w);
  const s = statutDe(w);
  const offer = {
    '@type': 'Offer',
    url,
    priceCurrency: 'EUR',
    price: prixSchema(w.prix),
    availability: s.schema,
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@type': 'Organization', '@id': `${SITE}/#organization`, name: 'Andivino', url: `${SITE}/` },
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingRate: { '@type': 'MonetaryAmount', value: '5.00', currency: 'EUR' },
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'FR', postalCodePrefix: ['75', '92', '93', '94'] },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 2, unitCode: 'DAY' },
        transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 5, unitCode: 'DAY' }
      }
    },
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'FR',
      returnPolicyCountry: 'FR',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 14,
      returnMethod: 'https://schema.org/ReturnByMail',
      returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
      merchantReturnLink: `${SITE}/legal/cgv`
    }
  };
  if (w.statut === 'precommande') offer.availabilityStarts = `${w.arrivee}T00:00:00+01:00`;
  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: w.nomComplet,
    sku: w.id,
    description: w.descriptionSchema,
    image: [SITE + w.og, SITE + w.image.src].filter((x, i, a) => a.indexOf(x) === i),
    brand: { '@type': 'Brand', name: d.nom },
    manufacturer: {
      '@type': 'Organization',
      '@id': d.schemaId,
      name: d.nom,
      address: { '@type': 'PostalAddress', addressLocality: d.appellation, addressRegion: d.region, addressCountry: d.pays }
    },
    countryOfOrigin: { '@type': 'Country', name: 'Argentine' },
    category: `Vin ${w.couleur.toLowerCase()} argentin`,
    additionalProperty: (w.proprietes || []).map(([name, value]) => ({ '@type': 'PropertyValue', name, value })),
    offers: offer
  };
  if (w.scores && w.scores.length) product.award = w.scores.map((x) => `${x.source} ${x.note}/100`);
  const crumbs = [
    { name: 'Accueil', item: `${SITE}/` },
    { name: 'Les vins', item: `${SITE}/vins-argentins` },
    ...(d.page ? [{ name: d.nom, item: SITE + d.page }] : []),
    { name: w.nomComplet, item: url }
  ];
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item }))
  };
  // « </ » ne doit jamais apparaître dans un <script>.
  const out = (o) => JSON.stringify(o, null, 2).replace(/<\//g, '<\\/');
  return `<script type="application/ld+json">\n${out(product)}\n</script>\n<script type="application/ld+json">\n${out(breadcrumb)}\n</script>`;
}

function buyBlock(w, s) {
  if (!s.achetable) {
    return `<p class="pdp-out">Cette cuvée est épuisée pour le moment.</p>
      <a href="/newsletter" class="pdp-cta pdp-cta--alt">Être prévenu de son retour</a>`;
  }
  return `<form class="pdp-form" id="pdp-form" action="/commande" method="get">
        <input type="hidden" name="ajout" value="${esc(w.id)}">
        <div class="pdp-qty">
          <button type="button" class="pdp-qty-btn" data-qty-step="-1" aria-label="Une bouteille de moins">−</button>
          <input type="number" name="qte" id="pdp-qte" value="1" min="1" max="36" inputmode="numeric" aria-label="Nombre de bouteilles">
          <button type="button" class="pdp-qty-btn" data-qty-step="1" aria-label="Une bouteille de plus">+</button>
        </div>
        <button type="submit" class="pdp-cta" id="pdp-cta">${esc(s.cta)}</button>
      </form>`;
}

function card(w) {
  const d = DOMAINES[w.domaine];
  const s = statutDe(w);
  return `<div class="pdp-card">
      <img src="${esc(w.image.src)}" width="${w.image.width}" height="${w.image.height}" alt="" loading="lazy">
      <p class="pdp-card-dom">${esc(d.nom)}</p>
      <h3 class="pdp-card-name"><a href="${wineUrl(w)}">${esc(w.nomComplet)}</a></h3>
      <p class="pdp-card-cep">${fine(cepagesTexte(w))}</p>
      <p class="pdp-card-price">${fine(prixTexte(w.prix))}${w.statut !== 'en-stock' ? ` <span>${esc(s.label)}</span>` : ''}</p>
    </div>`;
}

const NAV = `<nav>
  <a href="/" class="nl">
    <img src="/assets/images/logo-ecusson.webp" alt="Andivino" width="116" height="150" class="nav-logo-img"><img src="/assets/images/logotype-andivino.webp" alt="" width="530" height="80" class="nav-text-img">
  </a>
  <ul class="nlinks">
    <li><a href="/vins-argentins">Les vins</a></li>
    <li><a href="/commande">Commander</a></li>
    <li><a href="/chroniques">Chroniques</a></li>
  </ul>
  <a href="/vins-argentins" class="back-link">← Les vins</a>
</nav>`;

function footer() {
  const vins = WINES.map((w) => `<a href="${wineUrl(w)}">${esc(w.nomComplet.replace(/^Poesía — /, ''))}</a>`).join('');
  return `<footer>
  <div class="ft-in">
    <div class="ft-br">
      <div class="ft-brand-row">
        <img src="/assets/images/logo-ecusson.webp" alt="Andivino" width="116" height="150" class="ft-logo-mark">
        <img src="/assets/images/logotype-andivino.webp" alt="" width="530" height="80" class="ft-logo-text">
      </div>
      <p>Importateur de vins argentins d'exception. Bodega Poesía — Luján de Cuyo, Mendoza.</p>
    </div>
    <div class="ft-col"><h4>Navigation</h4><a href="/#philosophie">Notre histoire</a><a href="/#bodega">La Bodega</a><a href="/vins-argentins">Les vins</a><a href="/degustation">Dégustations</a><a href="/chroniques">Chroniques</a></div>
    <div class="ft-col"><h4>Commander</h4>${vins}<a href="/commande">Particuliers (B2C)</a><a href="/vin-argentin-paris">Livraison à Paris</a><a href="/professionnels">Professionnels (B2B)</a><a href="/legal/cgv">Livraison &amp; CGV</a></div>
    <div class="ft-col"><h4>Contact</h4><a href="mailto:contact@andivino.fr">contact@andivino.fr</a><a href="/newsletter">Newsletter</a><p class="ft-note">L'abus d'alcool est dangereux pour la santé. À consommer avec modération.</p></div>
  </div>
  <div class="ft-btm">
    <p>© 2026 Andivino — Tous droits réservés</p>
    <div class="ft-links"><a href="/legal/mentions-legales">Mentions légales</a><a href="/legal/cgv">CGV</a></div>
  </div>
</footer>`;
}

function renderProductPage(w) {
  const d = DOMAINES[w.domaine];
  const s = statutDe(w);
  const url = SITE + wineUrl(w);
  const lieu = `${d.appellation}, ${d.region}`;
  const sub = [`Vin ${w.couleur.toLowerCase()}`, cepagesTexte(w), w.format].filter(Boolean).join(' · ');
  const scores = (w.scores || []).length
    ? `<div class="scores-row pdp-scores">${w.scores.map((x) => `<div class="score-it"><div class="score-pts">${esc(x.note)}<sup>pts</sup></div><div class="score-src">${esc(x.source)}</div></div>`).join('')}</div>`
    : '';
  const statusClass = { 'en-stock': 'ok', 'bientot-epuise': 'low', precommande: 'pre', epuise: 'out' }[w.statut];
  const facts = [
    ['Appellation', lieu],
    ['Cépages', cepagesTexte(w)],
    w.elevage && ['Élevage', w.elevage],
    w.garde && ['Garde', w.garde]
  ].filter(Boolean);
  const degust = (txt) => txt
    .replace('{degustation:e}', (d.degustationHtml || '').replace(/^servi /, 'servie '))
    .replace('{degustation}', d.degustationHtml || '');
  const autres = WINES.filter((x) => x.domaine === w.domaine && x.id !== w.id);
  const related = autres.length ? autres : WINES.filter((x) => x.id !== w.id);
  const crumbDomaine = d.page ? `<a href="${d.page}">${esc(d.nom)}</a>` : esc(d.nom);
  const preorderNote = w.statut === 'precommande'
    ? `<li><strong>Précommande</strong> Vos bouteilles vous sont remises dès leur arrivée en France, prévue en ${moisArrivee(w.arrivee)}.</li>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${esc(w.seo.title)}</title>
<meta name="description" content="${esc(w.seo.description)}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${url}">
<meta property="og:type" content="product">
<meta property="og:site_name" content="Andivino">
<meta property="og:title" content="${esc(w.seo.ogTitle || w.seo.title)}">
<meta property="og:description" content="${esc(w.seo.ogDescription || w.seo.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}${esc(w.og)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon-32.png">
<link rel="icon" type="image/png" sizes="64x64" href="/assets/images/favicon-64.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/images/favicon-180.png">
<link rel="preload" href="/assets/fonts/dm-sans-normal-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/fonts.css">
<link rel="stylesheet" href="/assets/css/chronicles.css">
<link rel="stylesheet" href="/assets/css/product.css">
<link rel="stylesheet" href="/assets/css/footer.css">
<link rel="stylesheet" href="/assets/css/legal-banners.css">
${jsonLd(w, d)}
</head>
<body class="pdp-page">
${NAV}

<main id="contenu">
<div class="breadcrumb pdp-crumb"><a href="/">Accueil</a> / <a href="/vins-argentins">Les vins</a> / ${crumbDomaine} / ${esc(w.nomComplet)}</div>

<article class="pdp">
  <section class="pdp-top" aria-labelledby="pdp-titre">
    <div class="pdp-media">
      <img src="${esc(w.image.src)}" width="${w.image.width}" height="${w.image.height}" fetchpriority="high" alt="${esc(w.image.alt)}">
    </div>
    <div class="pdp-buy">
      <p class="pdp-eyebrow">${esc(d.nom)} · ${esc(lieu)}</p>
      <h1 class="pdp-title" id="pdp-titre">${esc(w.nomComplet)}</h1>
      <p class="pdp-sub">${fine(sub)}</p>
      ${scores}
      <div class="pdp-price-row">
        <p class="pdp-price">${fine(prixTexte(w.prix))} <span>TTC · ${esc(w.format || 'la bouteille')}</span></p>
        <p class="pdp-status pdp-status--${statusClass}">${esc(s.label)}</p>
      </div>
      ${buyBlock(w, s)}
      <ul class="pdp-reassure">
        ${preorderNote}
        <li><strong>Livraison et retours</strong> <span data-delivery-note>Remise en main propre sous 7 jours à <a href="/vin-argentin-paris">Paris et petite couronne</a>. Retour possible sous 14 jours (bouteilles non ouvertes). Pas d'expédition ailleurs pour l'instant : <a href="mailto:contact@andivino.fr">écrivez-nous</a>.</span></li>
        <li><strong>Paiement sécurisé</strong> Par Stripe, confirmation immédiate par email.</li>
      </ul>
      <dl class="pdp-facts">
        ${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${fine(v)}</dd></div>`).join('\n        ')}
      </dl>
    </div>
  </section>

  <div class="pdp-body art-body">
    <p class="wine-lead pdp-lead">${w.leadHtml}</p>

    <h2>Notes de dégustation</h2>
    <p>${w.notesHtml}</p>

    <h2>Fiche technique</h2>
    <dl class="m-specs">
      ${w.fiche.map(([k, v, wide]) => `<div${wide ? ' class="wide"' : ''}><dt class="msl">${esc(k)}</dt><dd class="msv">${fine(v)}</dd></div>`).join('\n      ')}
    </dl>
${(w.serviceHtml || []).length ? `
    <h2>Service et accords</h2>
    ${w.serviceHtml.map((p) => `<p>${degust(p)}</p>`).join('\n    ')}
` : ''}${(w.terroirHtml || []).length ? `
    <h2>Le terroir et la parcelle</h2>
    ${w.terroirHtml.map((p) => `<p>${p}</p>`).join('\n    ')}
    ${(w.liens || []).length ? `<ul>\n      ${w.liens.map((l) => `<li><a href="${esc(l.href)}">${esc(l.texte)}</a></li>`).join('\n      ')}\n    </ul>` : ''}
` : ''}
  </div>

  <section class="pdp-related" aria-labelledby="pdp-related-t">
    <h2 id="pdp-related-t">${autres.length ? `Les autres cuvées de la ${esc(d.nom)}` : 'Nos autres cuvées'}</h2>
    <div class="pdp-cards">
    ${related.map(card).join('\n    ')}
    </div>
    <p class="pdp-all"><a href="/vins-argentins">Voir toutes nos cuvées</a></p>
  </section>
</article>

${s.achetable ? `<div class="pdp-sticky" id="pdp-sticky" hidden>
  <div class="pdp-sticky-info"><span class="pdp-sticky-name">${esc(w.nomComplet)}</span><span class="pdp-sticky-price">${fine(prixTexte(w.prix))}</span></div>
  <button type="submit" form="pdp-form" class="pdp-cta">${esc(s.cta)}</button>
</div>` : ''}
</main>

${footer()}

<script src="/assets/js/degustations.js" defer></script>
<script src="/assets/js/product.js" defer></script>
<script src="/assets/js/nav-autohide.js" defer></script>
<script src="/assets/js/vendor/lenis.min.js" defer></script>
<script src="/assets/js/smooth-scroll.js" defer></script>
<script src="/assets/js/legal-banners.js" defer></script>
</body>
</html>
`;
}

// Données exposées au navigateur (panier, page commande, confirmation) : /assets/js/wines-data.js
function winesDataJs() {
  const data = WINES.map((w) => ({
    id: w.id,
    nom: w.nom,
    millesime: w.millesime,
    prix: w.prix / 100,
    reduction: 0,
    bodega: DOMAINES[w.domaine].nom,
    appellation: `${DOMAINES[w.domaine].appellation}, ${DOMAINES[w.domaine].region}`,
    cepages: cepagesTexte(w),
    description: w.resume || '',
    statut: w.statut,
    achetable: STATUTS[w.statut].achetable,
    url: wineUrl(w),
    image: w.image.src
  }));
  return `// Généré par le serveur depuis data/wines.js.\nwindow.ANDIVINO_WINES = ${JSON.stringify(data).replace(/<\//g, '<\\/')};\n`;
}

module.exports = { renderProductPage, winesDataJs };
