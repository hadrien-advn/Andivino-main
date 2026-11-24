// Catalogue /vins-argentins : un chapitre par domaine (emblème, accroche, bouteilles sur papier froissé) et
// JSON-LD, rendus depuis data/wines.js et data/domaines.js (repères <!--vins:…--> de pages/vins-argentins.html).
// La carte des vins de /professionnels (renderPros) est rendue ici aussi.
const { WINES, DOMAINES, STATUTS, SITE, wineUrl, cepagesTexte, prixTexte } = require('../data/wines');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fine = (s) => esc(s).replace(/ (%|€|:|;|\?|!)/g, '&nbsp;$1');
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const moisArrivee = (iso) => { const [y, m] = iso.split('-').map(Number); return `${MOIS[m - 1]} ${y}`; };
const { papier } = require('./product-page');

// Le domaine est écrit en tête de chapitre : « Carmelo Patti Malbec » devient « Malbec ».
const nomCourt = (w) => {
  const d = DOMAINES[w.domaine];
  return w.nom.startsWith(d.nom + ' ') ? w.nom.slice(d.nom.length + 1) : w.nom;
};

function flag(w) {
  if (w.statut === 'precommande') return `Précommande · ${moisArrivee(w.arrivee)}`;
  if (w.statut === 'a-venir') return `Arrivée prévue · ${moisArrivee(w.arrivee)}`;
  if (w.statut === 'bientot-epuise' || w.statut === 'epuise') return STATUTS[w.statut].label;
  return '';
}

// Une bouteille posée sur sa feuille (la même que sur sa fiche), puis nom, cépages, prix et action.
function bouteille(w, rang, sansMention) {
  const s = STATUTS[w.statut];
  const f = sansMention ? '' : flag(w);
  const img = w.image
    ? `<img src="${esc(w.image.src)}" width="${w.image.width}" height="${w.image.height}" alt="${esc(w.image.alt)}"${rang === 0 ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`
    : '';
  const cta = s.achetable
    ? `<a class="ct-add" href="/commande?ajout=${esc(w.id)}" aria-label="${esc(s.cta === 'Commander' ? 'Ajouter au panier' : s.cta)} : ${esc(w.nomComplet)}">${esc(s.cta === 'Commander' ? 'Ajouter' : s.cta)}</a>`
    : '';
  return `<li class="ct-item">
          <a class="ct-visual" href="${wineUrl(w)}" style="${papier(w)}" tabindex="-1" aria-hidden="true">${img}</a>
          <h3 class="ct-nm"><a href="${wineUrl(w)}">${esc(nomCourt(w))} <span>${esc(w.millesime)}</span></a></h3>
          <p class="ct-cep">${fine(cepagesTexte(w))}</p>
          <p class="ct-flag">${esc(f)}</p>
          <div class="ct-buy"><p class="ct-px">${fine(prixTexte(w.prix))}</p>${cta}</div>
        </li>`;
}

// Un chapitre par domaine : emblème, nom, appellation, accroche, puis ses bouteilles.
function chapitres() {
  let rang = 0;
  const fleche = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  return Object.values(DOMAINES).map((d, i) => {
    const vins = WINES.filter((w) => w.domaine === d.slug);
    if (!vins.length) return '';
    const aVenir = vins.every((w) => w.statut === 'a-venir');
    const nom = d.page ? `<a href="${d.page}">${esc(d.nom)}</a>` : esc(d.nom);
    const embleme = d.logo ? `<img class="ct-emb" src="${esc(d.logo.src)}" width="${d.logo.width}" height="${d.logo.height}" alt="" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async">` : '';
    const html = `<section class="ct-dom${i % 2 ? ' ct-dom--alt' : ''}" id="${esc(d.slug)}" aria-labelledby="ct-${esc(d.slug)}">
    <div class="ct-wrap">
      <header class="ct-dom-hd">
        ${embleme}
        <div class="ct-dom-id">
          <h2 class="ct-dom-nm" id="ct-${esc(d.slug)}">${nom}</h2>
          <p class="ct-dom-lieu">${esc(d.lieu)}</p>
        </div>
        <div class="ct-dom-side">
          ${d.accroche ? `<p class="ct-dom-acc">${esc(d.accroche)}</p>` : ''}
          ${aVenir ? `<p class="ct-dom-note">Arrivée en France en ${esc(moisArrivee(vins[0].arrivee))}, en vente à l'arrivée. <a href="/newsletter">Être prévenu</a></p>` : ''}
          ${d.page ? `<a class="ct-dom-more" href="${d.page}">Le domaine ${fleche}</a>` : ''}
        </div>
      </header>
      <ul class="ct-shelf">
        ${vins.map((w) => bouteille(w, rang++, aVenir)).join('\n        ')}
      </ul>
    </div>
  </section>`;
    return html;
  }).join('\n\n  ');
}

function jsonLd() {
  const page = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Vins argentins de Mendoza',
    url: `${SITE}/vins-argentins`,
    inLanguage: 'fr-FR',
    description: `Les cuvées de ${Object.values(DOMAINES).map((d) => d.nom).join(', ').replace(/, ([^,]*)$/, ' et $1')} (Mendoza, Argentine) importées par Andivino.`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: WINES.length,
      itemListElement: WINES.map((w, i) => ({ '@type': 'ListItem', position: i + 1, name: w.nomComplet, url: SITE + wineUrl(w) }))
    }
  };
  return `<script type="application/ld+json">\n${JSON.stringify(page, null, 2).replace(/<\//g, '<\\/')}\n</script>`;
}

function renderCatalogue(html) {
  return html
    .replace('<!--vins:jsonld-->', jsonLd())
    .replace('<!--vins:chapitres-->', chapitres())
    .replace(/<!--vins:nombre-->/g, String(WINES.length))
    .replace(/<!--vins:nombre-mot-->/g, ['Une', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf', 'Dix', 'Onze', 'Douze'][WINES.length - 1] || String(WINES.length));
}

// Page /professionnels : la carte des vins, domaine par domaine, comme une carte de restaurant
// (nom de la cuvée, points de conduite, prix public ; cépages, élevage et garde dessous). Repère <!--pro:carte-->.
const NOTES_PRO = {
  'bodega-poesia': "Le Clos des Andes en Malbec de découverte, sur une viande grillée ; la Cuvée Hélène et Poesía 2014, assemblages de garde, pour les plats mijotés et le gibier."
};

function ligneCarte(w) {
  const e = w.elevage ? (/^\d/.test(w.elevage) ? `élevage ${w.elevage}` : w.elevage.charAt(0).toLowerCase() + w.elevage.slice(1)) : '';
  const details = [w.couleur, cepagesTexte(w), e, w.garde ? `garde ${w.garde}` : ''].filter(Boolean).join(' · ');
  return `<li class="pc-vin">
          <p class="pc-ligne"><a class="pc-nm" href="${wineUrl(w)}">${esc(nomCourt(w))}&nbsp;<span>${esc(w.millesime)}</span></a></p>
          <p class="pc-det">${fine(details)}</p>
        </li>`;
}

function carte() {
  return Object.values(DOMAINES).map((d) => {
    const vins = WINES.filter((w) => w.domaine === d.slug);
    if (!vins.length) return '';
    const aVenir = vins.every((w) => w.statut === 'a-venir');
    const note = aVenir
      ? `Arrivée en France en ${esc(moisArrivee(vins[0].arrivee))}, en exclusivité. Pour être parmi les premiers à les proposer, dites-le-nous.`
      : (NOTES_PRO[d.slug] ? fine(NOTES_PRO[d.slug]) : '');
    const emb = d.logo ? `<img class="pc-emb" src="${esc(d.logo.src)}" width="${d.logo.width}" height="${d.logo.height}" alt="" loading="lazy" decoding="async">` : '';
    return `<section class="pc-dom" aria-labelledby="pc-${esc(d.slug)}">
        <header class="pc-dom-hd">
          ${emb}
          <h3 class="pc-dom-nm" id="pc-${esc(d.slug)}">${d.page ? `<a href="${d.page}">${esc(d.nom)}</a>` : esc(d.nom)}</h3>
          <p class="pc-dom-lieu">${esc(d.lieu)}</p>
        </header>
        <ul class="pc-vins">
        ${vins.map(ligneCarte).join('\n        ')}
        </ul>
        ${note ? `<p class="pc-note">${note}</p>` : ''}
      </section>`;
  }).join('\n      ');
}

function renderPros(html) {
  return html.replace('<!--pro:carte-->', carte());
}

module.exports = { renderCatalogue, renderPros };
