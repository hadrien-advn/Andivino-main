// Panier latéral, sur toutes les pages qui ont le bandeau du site (sauf /commande, qui est la page panier elle-même).
// Le serveur ajoute ce script et cart.css (server.js, getHtmlWithVersion). Le panier vit dans le navigateur :
// localStorage « andivino_v1 », champ cart : [{ id, qty }], le même que /commande, la page Paris et l'accueil.
//
// - Le bouton panier du bandeau ouvre un volet à droite (plein écran sur téléphone) : bouteilles, quantités,
//   sous-total, puis « Commander » vers /commande.
// - Les boutons d'achat (catalogue, fiche produit) ajoutent au panier et ouvrent le volet au lieu de quitter la page.
(function () {
  var STORE = 'andivino_v1';
  var MAX = 36;
  var BAG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>';

  function lire() {
    try { var d = JSON.parse(localStorage.getItem(STORE) || '{}'); return Array.isArray(d.cart) ? d.cart : []; }
    catch (e) { return []; }
  }
  function ecrire(cart) {
    try {
      var d = JSON.parse(localStorage.getItem(STORE) || '{}');
      d.cart = cart;
      localStorage.setItem(STORE, JSON.stringify(d));
    } catch (e) {}
    try { window.dispatchEvent(new Event('andivino:panier')); } catch (e) {}
  }
  function vins() { return Array.isArray(window.ANDIVINO_WINES) ? window.ANDIVINO_WINES : []; }
  function vin(id) { return vins().filter(function (w) { return w.id === id; })[0]; }
  // Seuls les vins en vente comptent : un id resté d'une ancienne visite (cuvée retirée) est ignoré.
  function lignes() {
    var liste = vins();
    var cart = lire();
    if (!liste.length) return cart;
    return cart.filter(function (l) { var w = vin(l.id); return w && w.achetable !== false && l.qty > 0; });
  }
  function nombre() { return lignes().reduce(function (s, l) { return s + l.qty; }, 0); }
  function prix(w) { return w.reduction ? Math.round(w.prix * (1 - w.reduction / 100) * 100) / 100 : w.prix; }
  function euros(n) { return n.toFixed(2).replace('.', ',').replace(',00', '') + ' €'; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function fixer(id, qty) {
    var cart = lire().filter(function (l) { return l.id !== id; });
    var q = Math.max(0, Math.min(MAX, qty));
    if (q > 0) {
      var i = lire().map(function (l) { return l.id; }).indexOf(id);
      if (i < 0 || i > cart.length) cart.push({ id: id, qty: q });
      else cart.splice(i, 0, { id: id, qty: q });
    }
    ecrire(cart);
  }
  function ajouter(id, qty) {
    var l = lire().filter(function (x) { return x.id === id; })[0];
    fixer(id, (l ? l.qty : 0) + (qty || 1));
  }

  // ── Bouton du bandeau ──
  var nav = document.querySelector('nav');
  var bouton = document.getElementById('cartBtn');
  var badge = document.getElementById('cartBadge');
  if (!bouton && nav) {
    bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'nav-panier';
    bouton.innerHTML = BAG + '<span class="nav-panier-n" aria-hidden="true"></span>';
    badge = bouton.querySelector('.nav-panier-n');
    var fin = document.createElement('div');
    fin.className = 'nav-fin';
    var retour = nav.querySelector(':scope > .back-link');
    nav.appendChild(fin);
    fin.appendChild(bouton);
    if (retour) fin.appendChild(retour);
  }
  if (!bouton) return;
  bouton.setAttribute('aria-haspopup', 'dialog');
  bouton.setAttribute('aria-controls', 'panier');

  // ── Volet ──
  var volet = document.createElement('div');
  volet.className = 'cd';
  volet.id = 'panier';
  volet.hidden = true;
  volet.innerHTML =
    '<div class="cd-voile" data-cd-fermer></div>' +
    '<section class="cd-panneau" role="dialog" aria-modal="true" aria-labelledby="cd-titre" tabindex="-1">' +
      '<header class="cd-tete">' +
        '<h2 class="cd-titre" id="cd-titre">Votre panier</h2>' +
        '<p class="cd-nb" aria-live="polite"></p>' +
        '<button type="button" class="cd-x" data-cd-fermer aria-label="Fermer le panier"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg></button>' +
      '</header>' +
      '<div class="cd-corps" data-lenis-prevent><ul class="cd-liste"></ul>' +
        '<div class="cd-vide"><p>Votre panier est vide.</p><a href="/vins-argentins" class="cd-lien">Découvrir nos vins</a></div>' +
      '</div>' +
      '<footer class="cd-pied">' +
        '<p class="cd-total"><span>Sous-total</span><strong></strong></p>' +
        '<p class="cd-note">Livraison et paiement à l\'étape suivante.</p>' +
        '<a href="/commande" class="cd-go">Commander</a>' +
        '<button type="button" class="cd-suite" data-cd-fermer>Continuer mes achats</button>' +
      '</footer>' +
    '</section>';
  document.body.appendChild(volet);
  var panneau = volet.querySelector('.cd-panneau');
  var liste = volet.querySelector('.cd-liste');
  var ouvert = false;
  var avant = null;

  function rendre() {
    var ls = lignes();
    var n = ls.reduce(function (s, l) { return s + l.qty; }, 0);
    var total = 0;
    liste.innerHTML = ls.map(function (l) {
      var w = vin(l.id);
      if (!w) return '';
      var p = prix(w);
      total += p * l.qty;
      return '<li class="cd-ligne" data-id="' + esc(w.id) + '">' +
        '<a class="cd-img" href="' + esc(w.url || '/vins-argentins') + '" tabindex="-1" aria-hidden="true">' + (w.image ? '<img src="' + esc(w.image) + '" alt="" loading="lazy">' : '') + '</a>' +
        '<div class="cd-info">' +
          '<p class="cd-dom">' + esc(w.bodega || '') + '</p>' +
          '<p class="cd-nom"><a href="' + esc(w.url || '/vins-argentins') + '">' + esc(w.nom) + '</a> <span>' + esc(w.millesime || '') + '</span></p>' +
          '<div class="cd-bas">' +
            '<div class="cd-qte" role="group" aria-label="Quantité de ' + esc(w.nom) + '">' +
              '<button type="button" data-pas="-1" aria-label="Une bouteille de moins">−</button>' +
              '<span aria-live="polite">' + l.qty + '</span>' +
              '<button type="button" data-pas="1" aria-label="Une bouteille de plus"' + (l.qty >= MAX ? ' disabled' : '') + '>+</button>' +
            '</div>' +
            '<p class="cd-px">' + euros(p * l.qty) + '</p>' +
          '</div>' +
          '<button type="button" class="cd-retirer" data-retirer>Retirer</button>' +
        '</div>' +
      '</li>';
    }).join('');
    volet.classList.toggle('cd--vide', n === 0);
    volet.querySelector('.cd-nb').textContent = n ? n + (n > 1 ? ' bouteilles' : ' bouteille') : '';
    volet.querySelector('.cd-total strong').textContent = euros(total);
    if (badge) { badge.textContent = n; badge.classList.toggle('on', n > 0); }
    bouton.setAttribute('aria-label', n ? 'Voir le panier, ' + n + (n > 1 ? ' bouteilles' : ' bouteille') : 'Voir le panier, vide');
  }

  function focusables() {
    return Array.prototype.filter.call(panneau.querySelectorAll('a[href],button:not([disabled])'), function (el) { return el.offsetParent !== null && el.tabIndex !== -1; });
  }
  function ouvrir() {
    if (ouvert) return;
    ouvert = true;
    avant = document.activeElement;
    rendre();
    volet.hidden = false;
    document.body.style.overflow = 'hidden';
    bouton.setAttribute('aria-expanded', 'true');
    // lecture forcée de la mise en page : le volet part de sa position fermée, puis glisse
    void panneau.offsetWidth;
    volet.classList.add('cd--ouvert');
    var go = volet.querySelector('.cd-go');
    setTimeout(function () { (volet.classList.contains('cd--vide') ? volet.querySelector('.cd-lien') : go).focus({ preventScroll: true }); }, 60);
  }
  function fermer() {
    if (!ouvert) return;
    ouvert = false;
    volet.classList.remove('cd--ouvert');
    document.body.style.overflow = '';
    bouton.setAttribute('aria-expanded', 'false');
    var fini = function () { if (!ouvert) volet.hidden = true; };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) fini();
    else setTimeout(fini, 420);
    if (avant && avant.focus) avant.focus({ preventScroll: true });
  }

  bouton.addEventListener('click', function (e) { e.preventDefault(); e.stopImmediatePropagation(); ouvert ? fermer() : ouvrir(); }, true);
  volet.addEventListener('click', function (e) {
    if (e.target.closest('[data-cd-fermer]')) { fermer(); return; }
    var ligne = e.target.closest('.cd-ligne');
    if (!ligne) return;
    var id = ligne.getAttribute('data-id');
    var l = lire().filter(function (x) { return x.id === id; })[0];
    var pas = e.target.closest('[data-pas]');
    if (pas && l) { fixer(id, l.qty + parseInt(pas.getAttribute('data-pas'), 10)); }
    else if (e.target.closest('[data-retirer]')) { fixer(id, 0); }
    else return;
    rendre();
    // Le focus reste dans le volet si la ligne a disparu
    var cible = liste.querySelector('.cd-ligne[data-id="' + id + '"] ' + (pas ? '[data-pas="' + pas.getAttribute('data-pas') + '"]' : 'button'));
    (cible || volet.querySelector(volet.classList.contains('cd--vide') ? '.cd-lien' : '.cd-go')).focus({ preventScroll: true });
  });
  document.addEventListener('keydown', function (e) {
    if (!ouvert) return;
    if (e.key === 'Escape') { fermer(); return; }
    if (e.key !== 'Tab') return;
    var f = focusables();
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
  // Un autre onglet (ou la page commande) a changé le panier
  window.addEventListener('storage', function (e) { if (e.key === STORE) rendre(); });
  window.addEventListener('andivino:panier', function (e) { if (e.detail === 'paris') rendre(); });
  // Retour arrière depuis /commande : la page sort du cache du navigateur avec un panier peut-être changé
  window.addEventListener('pageshow', function (e) { if (e.persisted) rendre(); });

  // ── Boutons d'achat : ajout au panier puis volet, sans quitter la page ──
  // Catalogue (/vins-argentins) et pages domaine : liens « /commande?ajout=<id> »
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href^="/commande?ajout="]');
    if (!a || a.hasAttribute('data-add-id')) return;
    var id = new URL(a.href, location.href).searchParams.get('ajout');
    var w = vin(id);
    if (!w || w.achetable === false) return;
    e.preventDefault();
    ajouter(id, 1);
    ouvrir();
  });
  // Fiche produit : formulaire quantité + « Commander »
  var form = document.getElementById('pdp-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var id = form.querySelector('input[name="ajout"]').value;
      var w = vin(id);
      if (!w || w.achetable === false) return;
      e.preventDefault();
      var q = parseInt((form.querySelector('input[name="qte"]') || {}).value, 10) || 1;
      ajouter(id, Math.max(1, Math.min(MAX, q)));
      ouvrir();
    });
  }

  window.AndivinoCart = { ouvrir: ouvrir, fermer: fermer, rendre: rendre, ajouter: function (id, q) { ajouter(id, q); rendre(); } };
  rendre();
})();
