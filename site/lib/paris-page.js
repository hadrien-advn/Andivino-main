// Page /vin-argentin-paris : cuvées, dégustation, accords et FAQ rendus depuis data/wines.js et
// assets/js/degustations.js (repères <!--paris:…--> et {{paris:…}} de pages/vin-argentin-paris.html).
// Tout est recalculé à chaque vidage du cache HTML (une fois par jour) : la page suit le catalogue.
const { WINES, DOMAINES, STATUTS, wineUrl, cepagesTexte, prixTexte } = require('../data/wines');
const { DEGUSTATIONS, upcomingDegustations } = require('../assets/js/degustations.js');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fine = (s) => esc(s).replace(/ (%|€|:|;|\?|!)/g, '&nbsp;$1');
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const moisArrivee = (iso) => { const [y, m] = iso.split('-').map(Number); return `${MOIS[m - 1]} ${y}`; };
const MOTS = ['zéro', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze'];
const mot = (n) => MOTS[n] || String(n);
const listeFr = (a) => (a.length > 1 ? `${a.slice(0, -1).join(', ')} et ${a[a.length - 1]}` : a[0] || '');
const sansBalises = (html) => html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

// Nom affiché sur la carte, sans millésime ni nom de domaine (domaine et millésime sont écrits dessous).
const nomCarte = (w) => w.nom.replace(/^Poesía — /, '').replace(new RegExp(`^${DOMAINES[w.domaine].nom} `), '');
const cepCourt = (w) => (w.cepages.length > 1 ? w.cepages.map((c) => c.nom.split(' ')[0]).join('-') : `100 % ${w.cepages[0].nom}`);

const achetables = () => WINES.filter((w) => STATUTS[w.statut].achetable);
// Du moins cher au plus cher : Clos des Andes, Cuvée Hélène, Poesía.
const dispo = () => achetables().filter((w) => w.statut !== 'precommande').sort((a, b) => a.prix - b.prix);
const precommandes = () => achetables().filter((w) => w.statut === 'precommande');

const ICON_MOINS = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14"/></svg>';
const ICON_PLUS = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';

// Une bouteille posée sur sa feuille froissée (papier/fond-1 à 4, comme la page dégustation).
// Sans JavaScript, « Ajouter » mène à /commande?ajout=<id> ; avec, il remplit le bon de la page.
function carte(w, i, { first = false } = {}) {
  const d = DOMAINES[w.domaine];
  const url = wineUrl(w);
  const img = w.image
    ? `<img src="${esc(w.image.src)}" alt="${esc(w.image.alt)}" width="${w.image.width}" height="${w.image.height}"${first ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`
    : '';
  const pre = w.statut === 'precommande';
  const flag = w.statut === 'bientot-epuise' ? `<span class="pv-flag">${esc(STATUTS[w.statut].label)}</span>` : '';
  const nom = esc(w.nomComplet);
  return `<li class="pv-item" data-id="${esc(w.id)}" data-nom="${nom}" data-prix="${w.prix}"${pre ? ` data-arrivee="${esc(moisArrivee(w.arrivee))}"` : ''} style="--papier:url('/assets/images/papier/fond-${(i % 4) + 1}.webp')">
          <a class="pv-visual" href="${url}" tabindex="-1" aria-hidden="true">${img}</a>
          <h3 class="pv-nm"><a href="${url}">${esc(nomCarte(w))}</a></h3>
          <p class="pv-meta">${esc(d.nom)} · ${w.millesime}</p>
          <p class="pv-cep">${fine(cepCourt(w))}${w.couleur === 'Blanc' ? ' · blanc' : ''}</p>
          <p class="pv-px">${fine(prixTexte(w.prix))}${flag}</p>
          <div class="pv-act">
            <a class="pv-add" href="/commande?ajout=${esc(w.id)}" aria-label="${pre ? 'Précommander' : 'Ajouter'} ${nom}">${pre ? 'Précommander' : 'Ajouter'}</a>
            <div class="pv-qty" role="group" aria-label="Quantité de ${nom}" hidden>
              <button type="button" data-step="-1" aria-label="Retirer une bouteille de ${nom}">${ICON_MOINS}</button>
              <output aria-live="polite">0</output>
              <button type="button" data-step="1" aria-label="Ajouter une bouteille de ${nom}">${ICON_PLUS}</button>
            </div>
          </div>
        </li>`;
}

function grilleDispo() {
  return `<ul class="pv-shelf">
        ${dispo().map((w, i) => carte(w, i, { first: i === 0 })).join('\n        ')}
      </ul>`;
}

// Étagère des précommandes : elle disparaît quand il n'y en a plus.
function sectionPre() {
  const pre = precommandes();
  if (!pre.length) return '';
  const doms = [...new Set(pre.map((w) => w.domaine))].map((s) => DOMAINES[s]);
  const domsHtml = listeFr(doms.map((d) => (d.page ? `<a href="${d.page}">${esc(d.nom)}</a>` : esc(d.nom))));
  return `<div class="px-block px-pre" id="precommande">
      <div class="px-hd">
        <h2>En précommande, <em>arrivée en ${esc(moisArrivee(pre[0].arrivee))}</em></h2>
        <p>${mot(pre.length).replace(/^./, (c) => c.toUpperCase())} nouvelles cuvées de ${domsHtml}. Payées à la commande, elles vous sont remises en main propre à leur arrivée&nbsp;: nous vous contactons pour convenir de la date.</p>
      </div>
      <ul class="pv-shelf pv-shelf--pre">
        ${pre.map((w, i) => carte(w, i + 1)).join('\n        ')}
      </ul>
    </div>`;
}

// Accords repris des fiches (serviceHtml, resume) : ne rien ajouter qui n'y figure pas.
const ACCORDS = [
  { plat: 'Viande grillée, asado', id: 'clos-2017', pourquoi: '100 % Malbec aux tanins souples, à son meilleur devant une bavette saisie à la braise.' },
  { plat: 'Plat mijoté, magret, agneau de sept heures', id: 'helene-2016', pourquoi: "Malbec-Cabernet d'une parcelle d'un hectare plantée en 1935, à passer une heure en carafe." },
  { plat: 'Gibier, fromages affinés', id: 'poesia-2014', pourquoi: 'La plus longuement élevée des trois cuvées de la Bodega Poesía : 24 mois en fût de chêne.' },
  { plat: 'Empanadas, cuisine asiatique, poissons', id: 'altus-torrontes-2026', pourquoi: "Un blanc d'altitude de la Valle de Uco, sec, vif et désaltérant." }
];

function accords() {
  return `<div class="pa-grid">
      ${ACCORDS.map((a) => {
        const w = WINES.find((x) => x.id === a.id);
        if (!w || !STATUTS[w.statut].achetable) return '';
        const pre = w.statut === 'precommande' ? `<span class="pa-pre">précommande, ${esc(moisArrivee(w.arrivee))}</span>` : '';
        return `<div class="pa-item">
        <p class="pa-plat">${esc(a.plat)}</p>
        <p class="pa-vin"><a href="${wineUrl(w)}">${esc(w.nomComplet)}</a></p>
        <p class="pa-why">${fine(a.pourquoi)}</p>
        <p class="pa-px">${fine(prixTexte(w.prix))}${pre}</p>
      </div>`;
      }).join('\n      ')}
    </div>`;
}

function prochaine() {
  return upcomingDegustations(new Date()).find((d) => d.url) || null;
}

function passeesParis() {
  return DEGUSTATIONS
    .filter((d) => d.passee && /Paris/.test(d.lieu))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function degustation() {
  const next = prochaine();
  const passees = passeesParis();
  // Un lieu par soirée passée, le plus récent d'abord : « Paris 7e (mai 2026), HEC Paris (avril 2026) ».
  const vus = [];
  for (const d of passees) {
    const dt = new Date(d.date);
    const lib = `${d.lieu} (${MOIS[dt.getMonth()]} ${dt.getFullYear()})`;
    if (!vus.some((v) => v.startsWith(`${d.lieu} (`))) vus.push(lib);
  }
  const deja = vus.length ? `<p class="pt-past">Déjà servis à ${esc(listeFr(vus))}.</p>` : '';
  if (!next) {
    return `<div class="pt-next pt-next--none">
          <p>Pas de nouvelle date pour l'instant. <a href="/newsletter">Inscrivez-vous à la newsletter</a> pour être prévenu de la prochaine soirée.</p>
        </div>
        ${deja}`;
  }
  const dt = new Date(`${next.date}T12:00:00+01:00`);
  const salle = next.adresse.split(',')[0];
  return `<div class="pt-next">
          <p class="pt-date"><span class="pt-day">${dt.getDate()}</span><span class="pt-mon">${MOIS[dt.getMonth()]} ${dt.getFullYear()}</span></p>
          <div class="pt-info">
            <h3>${esc(next.titre)}</h3>
            <p class="pt-meta">${esc(next.heure)} · ${esc(salle)}, ${esc(next.lieu)}</p>
            <p>${esc(next.description)}</p>
            <a class="pv-btn" href="${esc(next.url)}">Réserver ma place</a>
          </div>
        </div>
        ${deja}`;
}

function faq() {
  const next = prochaine();
  const doms = Object.values(DOMAINES).filter((d) => WINES.some((w) => w.domaine === d.slug));
  const prix = achetables().map((w) => w.prix);
  const pre = precommandes();
  const arrivee = pre.length ? moisArrivee(pre[0].arrivee) : '';
  const quand = next ? `${new Date(`${next.date}T12:00:00+01:00`).getDate()} ${MOIS[new Date(`${next.date}T12:00:00+01:00`).getMonth()]} à ${next.heure}` : '';
  const retrait = next
    ? `Le retrait lors de notre prochaine dégustation est gratuit (<a href="${esc(next.url)}">le ${quand}, ${esc(next.lieu)}</a>).`
    : "Le retrait lors de l'une de nos dégustations est gratuit, quand une date est prévue.";
  const qr = [
    ['Où acheter du vin argentin à Paris ?',
      `Sur andivino.fr&nbsp;: nous importons en direct les vins de ${esc(listeFr(doms.map((d) => d.nom)))}, à Mendoza, et les livrons en main propre à Paris et en petite couronne. ${mot(achetables().length).replace(/^./, (c) => c.toUpperCase())} cuvées, de ${fine(prixTexte(Math.min(...prix)))} à ${fine(prixTexte(Math.max(...prix)))} la bouteille${pre.length ? `, dont ${mot(pre.length)} en précommande pour ${esc(arrivee)}` : ''}.`],
    ['Combien coûte la livraison à Paris ?',
      `5&nbsp;€ par commande, dès une bouteille, à Paris (75) et en petite couronne (92, 93, 94). ${retrait}`],
    ['Quel est le délai de livraison ?',
      `Sous 7 jours pour les cuvées disponibles.${pre.length ? ` Une commande qui contient une précommande est remise en une seule fois, à l'arrivée des bouteilles (prévue en ${esc(arrivee)})&nbsp;: nous vous contactons pour convenir de la date.` : ''}`],
    ['Livrez-vous en dehors de Paris et de la petite couronne ?',
      "Pas pour l'instant&nbsp;: l'expédition par transporteur est suspendue. Écrivez-nous à <a href=\"mailto:contact@andivino.fr\">contact@andivino.fr</a>."],
    ['Peut-on goûter les vins avant de les acheter ?',
      next
        ? `Oui&nbsp;: nous organisons des dégustations à Paris. La prochaine a lieu le ${quand} (${esc(next.lieu)})&nbsp;: <a href="${esc(next.url)}">réservez votre place</a>.`
        : 'Oui, lors de nos dégustations à Paris. <a href="/newsletter">Inscrivez-vous à la newsletter</a> pour être prévenu de la prochaine date.']
  ];
  const html = `<div class="pf-grid">
      ${qr.map(([q, a]) => `<div class="pf-item">
        <h3>${fine(q)}</h3>
        <p>${a}</p>
      </div>`).join('\n      ')}
    </div>`;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qr.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: sansBalises(a) } }))
  };
  return { html, ld: `<script type="application/ld+json">\n${JSON.stringify(ld, null, 2).replace(/<\//g, '<\\/')}\n</script>` };
}

function renderParis(html) {
  const prix = achetables().map((w) => w.prix);
  const pre = precommandes();
  const f = faq();
  const doms = Object.values(DOMAINES).filter((d) => WINES.some((w) => w.domaine === d.slug));
  const tokens = {
    nb: mot(achetables().length),
    'nb-dispo': mot(dispo().length),
    'nb-pre': mot(pre.length),
    'nb-domaines': mot(doms.length),
    'prix-min': fine(prixTexte(Math.min(...prix))),
    'prix-max': fine(prixTexte(Math.max(...prix))),
    'prix-min-n': String(Math.min(...prix) / 100),
    'prix-max-n': String(Math.max(...prix) / 100),
    arrivee: pre.length ? esc(moisArrivee(pre[0].arrivee)) : '',
    offre: `${mot(dispo().length).replace(/^./, (c) => c.toUpperCase())} cuvées disponibles tout de suite${pre.length ? `, ${mot(pre.length)} autres en précommande pour ${esc(moisArrivee(pre[0].arrivee))}` : ''}.`,
    'domaines-pre': esc(listeFr([...new Set(pre.map((w) => DOMAINES[w.domaine].nom))]))
  };
  return html
    .replace('<!--paris:faq-jsonld-->', f.ld)
    .replace('<!--paris:dispo-->', grilleDispo())
    .replace('<!--paris:precommande-->', sectionPre())
    .replace('<!--paris:accords-->', accords())
    .replace('<!--paris:degustation-->', degustation())
    .replace('<!--paris:faq-->', f.html)
    .replace(/\{\{paris:([a-z-]+)\}\}/g, (m, k) => (k in tokens ? tokens[k] : m));
}

module.exports = { renderParis };
