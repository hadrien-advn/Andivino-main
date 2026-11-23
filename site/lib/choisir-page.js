// Chronique « Quel vin argentin choisir » (pages/chronique-choisir-vin-argentin.html) : le tableau des cuvées
// et les prix cités dans le texte viennent de data/wines.js, pour rester justes quand un prix ou un statut change.
//   <!--choisir:tableau-->     tableau de toutes les cuvées, de la moins chère à la plus chère
//   {prix:<id>}                prix pour le HTML (22&nbsp;€)
//   {prixbrut:<id>}            prix pour le JSON-LD (22 €)
//   {arrivee:<id>}             mois d'arrivée d'une cuvée à venir (janvier 2027)
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

function tableau() {
  const lignes = [...WINES]
    .sort((a, b) => a.prix - b.prix || a.nomComplet.localeCompare(b.nomComplet, 'fr'))
    .map((w) => {
      const style = `${w.couleur}, ${cepagesTexte(w)}`;
      const notes = w.scores.length ? w.scores.map((s) => `${s.note} ${s.source}`).join(', ') : '—';
      return `<tr><th scope="row"><a href="${wineUrl(w)}">${esc(w.nomComplet)}</a></th>`
        + `<td data-label="Domaine">${esc(DOMAINES[w.domaine].nom)}</td>`
        + `<td data-label="Style">${nbsp(esc(style))}</td>`
        + `<td data-label="Garde">${nbsp(esc(w.garde || '—'))}</td>`
        + `<td data-label="Critique">${esc(notes)}</td>`
        + `<td data-label="Disponibilité">${esc(dispo(w))}</td>`
        + `<td data-label="Prix">${nbsp(prixTexte(w.prix))}</td></tr>`;
    });
  return `<div class="vins-table-wrap">
<table class="vins-table" aria-label="Les vins argentins d'Andivino, du moins cher au plus cher">
<thead>
<tr><th scope="col">Vin</th><th scope="col">Domaine</th><th scope="col">Style</th><th scope="col">Garde</th><th scope="col">Critique</th><th scope="col">Disponibilité</th><th scope="col">Prix</th></tr>
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
    .replace(/\{prix:([a-z0-9-]+)\}/g, (_, id) => nbsp(prixTexte(vin(id).prix)))
    .replace(/\{prixbrut:([a-z0-9-]+)\}/g, (_, id) => prixTexte(vin(id).prix))
    .replace(/\{arrivee:([a-z0-9-]+)\}/g, (_, id) => moisArrivee(vin(id)));
}

module.exports = { renderChoisir };
