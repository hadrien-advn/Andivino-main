// Catalogue /vins-argentins : étagères, présentation des cuvées par domaine, tableau comparatif et
// JSON-LD rendus depuis data/wines.js et data/domaines.js (repères <!--vins:…--> de pages/vins-argentins.html).
const { WINES, DOMAINES, STATUTS, SITE, wineUrl, cepagesTexte, prixTexte } = require('../data/wines');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fine = (s) => esc(s).replace(/ (%|€|:|;|\?|!)/g, '&nbsp;$1');
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const moisArrivee = (iso) => { const [y, m] = iso.split('-').map(Number); return `${MOIS[m - 1]} ${y}`; };
const court = (w) => w.nomComplet.replace(/^Poesía — /, '');
// Cépages en abrégé pour l'étagère : « Malbec-Cabernet », « 100 % Malbec ».
const cepCourt = (w) => (w.cepages.length > 1 ? w.cepages.map((c) => c.nom.split(' ')[0]).join('-') : `100 % ${w.cepages[0].nom}`);

function flag(w) {
  if (w.statut === 'precommande') return `Précommande · ${moisArrivee(w.arrivee)}`;
  if (w.statut === 'bientot-epuise' || w.statut === 'epuise') return STATUTS[w.statut].label;
  return '';
}

function shelf(vins, first) {
  return `<div class="art-next-wines vins-shelf">
    ${vins.map((w, i) => {
      const img = w.image
        ? `<img src="${esc(w.image.src)}" alt="${esc(w.image.alt)}" width="${w.image.width}" height="${w.image.height}"${first && i === 0 ? ' fetchpriority="high"' : ' loading="lazy"'}>`
        : (DOMAINES[w.domaine].logo ? `<img class="shelf-logo" src="${esc(DOMAINES[w.domaine].logo.src)}" alt="" width="${DOMAINES[w.domaine].logo.width}" height="${DOMAINES[w.domaine].logo.height}" loading="lazy">` : '');
      const f = flag(w);
      const cta = STATUTS[w.statut].achetable
        ? `<a class="shelf-buy" href="/commande?ajout=${esc(w.id)}" aria-label="${esc(STATUTS[w.statut].cta)} ${esc(court(w))}">${esc(STATUTS[w.statut].cta)}</a>`
        : '';
      return `<div class="shelf-item"><a href="${wineUrl(w)}">${img}<span class="art-next-n">${esc(court(w))}</span><span class="art-next-c">${fine(cepCourt(w))}</span><span class="shelf-price">${fine(prixTexte(w.prix))}</span>${f ? `<span class="art-next-flag">${esc(f)}</span>` : ''}</a>${cta}</div>`;
    }).join('\n    ')}
  </div>`;
}

function presentation(w) {
  const bits = [`${cepagesTexte(w)}.`, w.resume || ''];
  const fin = [w.elevage && `Élevage ${w.elevage.charAt(0).toLowerCase()}${w.elevage.slice(1)}`, w.garde && `garde ${w.garde}`].filter(Boolean).join(', ');
  if (fin) bits.push(`${fin.charAt(0).toUpperCase()}${fin.slice(1)}.`);
  if ((w.scores || []).length) bits.push(`${w.scores.map((s) => `${s.note} points ${s.source}`).join(', ')}.`);
  bits.push(w.statut === 'precommande' ? `${prixTexte(w.prix)}, en précommande pour une arrivée en ${moisArrivee(w.arrivee)}.` : `${prixTexte(w.prix)} la bouteille.`);
  return `<h3><a href="${wineUrl(w)}">${esc(w.nomComplet)}</a></h3>\n  <p>${fine(bits.filter(Boolean).join(' '))}</p>`;
}

function domaines() {
  return Object.values(DOMAINES).map((d, i) => {
    const vins = WINES.filter((w) => w.domaine === d.slug);
    if (!vins.length) return '';
    return `<h2 id="${esc(d.slug)}">${d.page ? `<a href="${d.page}">${esc(d.nom)}</a>` : esc(d.nom)}</h2>
  <p class="vins-dom">${esc(d.lieu)}${d.accroche ? ` · ${esc(d.accroche)}` : ''}</p>
  ${shelf(vins, i === 0)}
  ${vins.map(presentation).join('\n\n  ')}`;
  }).join('\n\n  ');
}

function table() {
  return `<div class="vins-table-wrap">
    <table class="vins-table">
      <thead>
        <tr><th scope="col">Cuvée</th><th scope="col">Domaine</th><th scope="col">Cépages</th><th scope="col">Élevage</th><th scope="col">Garde</th><th scope="col">Prix</th></tr>
      </thead>
      <tbody>
        ${WINES.map((w) => `<tr><th scope="row"><a href="${wineUrl(w)}">${esc(w.nomComplet)}</a></th><td data-label="Domaine">${esc(DOMAINES[w.domaine].nom)}</td><td data-label="Cépages">${fine(cepagesTexte(w))}</td><td data-label="Élevage">${esc(w.elevage || '—')}</td><td data-label="Garde">${esc(w.garde || '—')}</td><td data-label="Prix">${fine(prixTexte(w.prix))}${w.statut === 'precommande' ? '<span class="vins-pre">précommande</span>' : ''}</td></tr>`).join('\n        ')}
      </tbody>
    </table>
  </div>`;
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
    .replace('<!--vins:domaines-->', domaines())
    .replace('<!--vins:table-->', table())
    .replace(/<!--vins:nombre-->/g, String(WINES.length));
}

module.exports = { renderCatalogue };
