// Gabarit des chroniques (pages/chronique-*.html) : la mise en page de lecture est calculée ici, pour que
// chaque nouvel article en profite sans balisage supplémentaire.
//   - le titre prend son fragment en italique (ce qui suit « : » ou « ? ») ;
//   - la première photo, si elle précède le premier chapitre, devient la photo d'ouverture ;
//   - chaque chapitre (h2) reçoit une ancre, et la colonne « Dans cette chronique » est construite à partir d'eux ;
//   - le temps de lecture s'ajoute à la ligne de date ;
//   - les bouteilles de fin d'article sont posées sur la feuille de papier propre à chaque cuvée.
const { WINES, wineUrl } = require('../data/wines');
const { papier } = require('./product-page');

const strip = (s) => s
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&#x27;|&#39;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();

const slug = (s) => strip(s)
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .split('-').slice(0, 6).join('-');

// Libellé court pour le sommaire : « Pourquoi l'Argentine ? Le Malbec y a… » → « Pourquoi l'Argentine ? ».
function shortTitle(html) {
  const t = strip(html);
  const m = t.match(/^(.+?)\s?([?:])\s+\S/);
  if (!m) return t;
  const head = m[2] === '?' ? `${m[1]} ?` : m[1];
  return m[1].split(/\s+/).length >= 2 ? head : t;
}

const escText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function renderChronicle(html) {
  const open = '<div class="article-wrap art-body">';
  const start = html.indexOf(open);
  const end = html.indexOf('</article>', start);
  if (start < 0 || end < 0) return html;
  const close = html.lastIndexOf('</div>', end);
  let body = html.slice(start + open.length, close);

  // Chapitres : ancre stable, et repérage de la foire aux questions.
  const toc = [];
  const used = new Set();
  body = body.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/g, (all, attrs = '', inner) => {
    if (/class="/.test(attrs)) return all;
    let id = (attrs.match(/id="([^"]+)"/) || [])[1];
    if (!id) {
      id = slug(inner) || `chapitre-${toc.length + 1}`;
      while (used.has(id)) id += '-2';
    }
    used.add(id);
    const faq = /^questions fréquentes$/i.test(strip(inner));
    toc.push({ id, label: shortTitle(inner) });
    return `<h2 id="${id}"${faq ? ' class="art-faq-t"' : ''}>${inner}</h2>`;
  });

  // Photo d'ouverture : la première figure, si elle vient avant le premier chapitre.
  let hero = '';
  let portrait = false;
  const fig = body.match(/<figure class="art-figure( art-figure-portrait)?">[\s\S]*?<\/figure>/);
  const firstH2 = body.search(/<h2 id=/);
  if (fig && (firstH2 < 0 || fig.index < firstH2)) {
    portrait = Boolean(fig[1]);
    body = body.slice(0, fig.index) + body.slice(fig.index + fig[0].length);
    hero = fig[0]
      .replace(/class="art-figure( art-figure-portrait)?"/, `class="art-hero${portrait ? ' art-hero-portrait' : ''}"`)
      .replace(/\s(loading|decoding)="[^"]*"/g, '')
      .replace('<img ', '<img fetchpriority="high" ')
      .replace(/sizes="[^"]*"/, `sizes="${portrait ? '(max-width: 960px) 100vw, 440px' : '(max-width: 1160px) 100vw, 1160px'}"`);
  }

  // Temps de lecture, compté sur le texte de l'article.
  const words = strip(body).split(' ').length;
  const minutes = Math.max(1, Math.round(words / 230));

  const rail = toc.length > 2
    ? `<div class="art-rail" role="navigation" aria-labelledby="art-rail-t"><p class="art-rail-t" id="art-rail-t">Dans cette chronique</p><ol>${toc.map((t) => `<li><a href="#${t.id}">${escText(t.label)}</a></li>`).join('')}</ol></div>\n`
    : '';

  let out = html.slice(0, start)
    + (hero && !portrait ? `${hero}\n` : '')
    + `<div class="art-layout">\n${rail}${open}${body}</div>\n</div>\n`
    + html.slice(end);

  // En-tête : fragment italique du titre, temps de lecture, photo portrait à côté du titre.
  out = out.replace(/(<div class="article-header">\s*<h1>)([\s\S]*?)(<\/h1>)/, (all, a, title, c) => {
    if (/<em>/.test(title)) return all;
    const t = title.replace(/^(.+?(?:&nbsp;|\s)[:?])\s+(.+)$/, '$1 <em>$2</em>');
    return a + t + c;
  });
  out = out.replace(/(<div class="art-meta">[\s\S]*?)(<\/div>)/, `$1 · ${minutes}&nbsp;min de lecture$2`);
  if (hero && portrait) {
    out = out.replace(/(<div class="article-header)(">[\s\S]*?<div class="art-meta">[\s\S]*?<\/div>)/, `$1 article-header-portrait$2\n  ${hero}`);
  }

  // Bouteilles de fin d'article : chacune sur sa feuille de papier.
  out = out.replace(/<a href="([^"]+)"><img ([^>]*?)>(<span class="art-next-n">)/g, (all, href, img, n) => {
    const w = WINES.find((x) => wineUrl(x) === href);
    if (!w) return all;
    return `<a href="${href}"><span class="art-next-v" style="${papier(w)}"><img ${img}></span>${n}`;
  });

  return out
    .replace('<body>', '<body class="chron">')
    .replace(/<\/body>(?![\s\S]*<\/body>)/, '<script src="/assets/js/chronicle.js" defer></script>\n</body>');
}

module.exports = { renderChronicle };
