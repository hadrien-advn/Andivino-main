// Chronique « Quel vin argentin choisir » (pages/chronique-choisir-vin-argentin.html) : le tableau des cuvées
// et les prix cités dans le texte viennent de data/wines.js, pour rester justes quand un prix ou un statut change.
//   <!--choisir:tableau-->     tableau de toutes les cuvées, de la moins chère à la plus chère
//   {prix:<id>}                prix pour le HTML (22&nbsp;€)
//   {prixbrut:<id>}            prix pour le JSON-LD (22 €)
//   {arrivee:<id>}             mois d'arrivée d'une cuvée à venir (janvier 2027)
//   {dispo:<id>}               disponibilité en toutes lettres, qui suit le statut (« attendu en janvier 2027 », « disponible »…)
//   <!--garde:tableau-->       tableau de garde de toutes les cuvées (élevage, garde, « à boire jusqu'en » = millésime + garde)
// Ces jetons servent aussi dans d'autres chroniques (torrontés, garde), via renderChoisir.
// Le texte, lui, est daté : il présente les trois Poesía comme disponibles pour Noël 2026 et les six autres
// comme attendues en janvier. À relire quand les statuts changent.
const { WINES, DOMAINES, STATUTS, wineUrl, cepagesTexte, prixTexte } = require('../data/wines');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nbsp = (s) => s.replace(/ (€|%)/g, '&nbsp;$1');

function vin(id) {
  const w = WINES.find((x) => x.id === id);
  if (!w) throw new Error(`chronique choisir : cuvée inconnue « ${id} »`);
  return w;
}

const moisArrivee = (w) => new Date(`${w.arrivee}T12:00:00Z`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });

function dispo(w) {
  if (w.statut === 'a-venir' || w.statut === 'precommande') return `Arrivée en ${moisArrivee(w)}`;
  return STATUTS[w.statut].label;
}

function dispoTexte(w) {
  switch (w.statut) {
    case 'a-venir': return `attendu en ${moisArrivee(w)}`;
    case 'precommande': return `en précommande, arrivée prévue en ${moisArrivee(w)}`;
    case 'bientot-epuise': return 'disponible en quantité limitée';
    case 'epuise': return 'épuisé';
    default: return 'disponible';
  }
}

function tableau() {
  const lignes = [...WINES]
    .sort((a, b) => a.prix - b.prix || a.nomComplet.localeCompare(b.nomComplet, 'fr'))
    .map((w) => {
      const style = `${w.couleur}, ${cepagesTexte(w)}`;
      const notes = w.scores.length ? w.scores.map((s) => `${s.note} ${s.source}`).join(', ') : '—';
      return `<tr><th scope="row"><a href="${wineUrl(w)}">${esc(w.nomComplet)}</a><span class="vins-dom-l">${esc(DOMAINES[w.domaine].nom)}</span></th>`
        + `<td data-label="Style">${nbsp(esc(style))}</td>`
        + `<td data-label="Garde">${nbsp(esc(w.garde || '—'))}</td>`
        + `<td data-label="Critique">${esc(notes)}</td>`
        + `<td data-label="Disponibilité">${esc(dispo(w))}</td>`
        + `<td data-label="Prix">${nbsp(prixTexte(w.prix))}</td></tr>`;
    });
  return `<div class="vins-table-wrap">
<table class="vins-table" aria-label="Les vins argentins d'Andivino, du moins cher au plus cher">
<thead>
<tr><th scope="col">Vin</th><th scope="col">Style</th><th scope="col">Garde</th><th scope="col">Critique</th><th scope="col">Disponibilité</th><th scope="col">Prix</th></tr>
</thead>
<tbody>
${lignes.join('\n')}
</tbody>
</table>
</div>`;
}

function tableauGarde() {
  const ans = (w) => parseInt(String(w.garde), 10) || 0;
  const lignes = [...WINES]
    .sort((a, b) => ans(b) - ans(a) || b.prix - a.prix)
    .map((w) => {
      const jusqu = w.millesime && ans(w) ? String(w.millesime + ans(w)) : '—';
      return `<tr><th scope="row"><a href="${wineUrl(w)}">${esc(w.nomComplet)}</a><span class="vins-dom-l">${esc(DOMAINES[w.domaine].nom)}</span></th>`
        + `<td data-label="Élevage">${nbsp(esc(w.elevage || '—'))}</td>`
        + `<td data-label="Garde">${nbsp(esc(w.garde || '—'))}</td>`
        + `<td data-label="Jusqu'en">${jusqu}</td></tr>`;
    });
  return `<div class="vins-table-wrap">
<table class="vins-table" aria-label="Potentiel de garde des vins d'Andivino">
<thead>
<tr><th scope="col">Vin</th><th scope="col">Élevage</th><th scope="col">Garde</th><th scope="col">À boire jusqu'en</th></tr>
</thead>
<tbody>
${lignes.join('\n')}
</tbody>
</table>
</div>`;
}

function renderChoisir(html) {
  return html
    .replace('<!--choisir:tableau-->', tableau())
    .replace('<!--garde:tableau-->', tableauGarde())
    .replace(/\{prix:([a-z0-9-]+)\}/g, (_, id) => nbsp(prixTexte(vin(id).prix)))
    .replace(/\{prixbrut:([a-z0-9-]+)\}/g, (_, id) => prixTexte(vin(id).prix))
    .replace(/\{arrivee:([a-z0-9-]+)\}/g, (_, id) => moisArrivee(vin(id)))
    .replace(/\{dispo:([a-z0-9-]+)\}/g, (_, id) => dispoTexte(vin(id)));
}

module.exports = { renderChoisir };
