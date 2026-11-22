// Accueil : carrousel des cuvées (repère <!--vins:carrousel--> de pages/home.html), rendu depuis data/wines.js
// pour rester lisible sans JavaScript. home.js branche les flèches et les boutons « Ajouter » (data-add-id) ;
// sans JavaScript, ces boutons mènent à /commande?ajout=<id>.
const { WINES, DOMAINES, STATUTS, wineUrl, cepagesTexte, prixTexte } = require('../data/wines');
const { papier } = require('./product-page');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fine = (s) => esc(s).replace(/ (%|€|:|;|\?|!)/g, '&nbsp;$1');
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const moisArrivee = (iso) => { const [y, m] = iso.split('-').map(Number); return `${MOIS[m - 1]} ${y}`; };
const FLECHE = (d) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

function item(w, i) {
  const d = DOMAINES[w.domaine];
  const s = STATUTS[w.statut];
  // Le domaine est écrit au-dessus : « Carmelo Patti Malbec » devient « Malbec ».
  const nom = w.nom.startsWith(d.nom + ' ') ? w.nom.slice(d.nom.length + 1) : w.nom;
  const flag = w.statut === 'precommande' ? `Précommande · ${moisArrivee(w.arrivee)}`
    : (w.statut === 'bientot-epuise' || w.statut === 'epuise') ? s.label : '';
  const img = w.image
    ? `<img src="${esc(w.image.src)}" width="${w.image.width}" height="${w.image.height}" alt="${esc(w.image.alt)}" loading="${i < 4 ? 'eager' : 'lazy'}" decoding="async">`
    : '';
  const cta = s.achetable
    ? `<a class="btn-add" href="/commande?ajout=${esc(w.id)}" data-add-id="${esc(w.id)}" aria-label="${esc(s.cta)} ${esc(w.nomComplet)}">${esc(s.cta === 'Commander' ? 'Ajouter' : s.cta)}</a>`
    : '';
  return `<li class="vc-item" data-wine-id="${esc(w.id)}">
        <a class="vc-visual" href="${wineUrl(w)}" style="${papier(w)}" tabindex="-1" aria-hidden="true">${img}</a>
        <p class="vc-dom">${esc(d.nom)}</p>
        <h3 class="vc-nm"><a href="${wineUrl(w)}">${esc(nom)} <span>${esc(w.millesime)}</span></a></h3>
        <p class="vc-cep">${fine(cepagesTexte(w))}</p>
        ${flag ? `<p class="vc-flag">${esc(flag)}</p>` : ''}
        <div class="vc-buy"><p class="vc-px">${fine(prixTexte(w.prix))}</p>${cta}</div>
      </li>`;
}

// Les domaines sous le carrousel : blason (à défaut, la bouteille phare du domaine), nom et appellation,
// chacun menant à sa page.
function domaines() {
  return Object.values(DOMAINES).filter((d) => d.page).map((d) => {
    const b = WINES.find((w) => w.domaine === d.slug && w.image);
    const v = d.logo || (b && b.image);
    const img = v ? `<img class="${d.logo ? 'vd-logo' : 'vd-btl'}" src="${esc(v.src)}" width="${v.width}" height="${v.height}" alt="" loading="lazy" decoding="async">` : '';
    return `<li><a href="${d.page}"><span class="vd-img">${img}</span><span class="vd-nm">${esc(d.nom)}</span><span class="vd-reg">${esc(d.appellation)}</span></a></li>`;
  }).join('\n      ');
}

function renderHomeVins(html) {
  const bloc = `<div class="vc" role="region" aria-roledescription="carrousel" aria-label="Nos ${WINES.length} cuvées">
    <ul class="vc-track" id="vinsGrid" tabindex="0" aria-label="Cuvées, faire défiler à l'horizontale">
      ${WINES.map(item).join('\n      ')}
    </ul>
    <div class="vc-bar">
      <button type="button" class="vc-btn" data-vc="-1" aria-controls="vinsGrid" aria-label="Cuvées précédentes">${FLECHE('M15 6l-6 6 6 6')}</button>
      <button type="button" class="vc-play" aria-controls="vinsGrid" aria-label="Mettre en pause le défilement" aria-pressed="false" hidden><span aria-hidden="true"></span></button>
      <button type="button" class="vc-btn" data-vc="1" aria-controls="vinsGrid" aria-label="Cuvées suivantes">${FLECHE('M9 6l6 6-6 6')}</button>
    </div>
  </div>
  <div class="vd" role="navigation" aria-label="Nos domaines">
    <p class="sl centered"><span>Nos trois domaines</span></p>
    <ul>
      ${domaines()}
    </ul>
  </div>`;
  return html.replace('<!--vins:carrousel-->', bloc);
}

module.exports = { renderHomeVins };
