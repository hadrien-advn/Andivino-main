// /vin-argentin-paris : le bon de commande de la page. Les quantités choisies ici vont dans le même panier
// que le reste du site (localStorage « andivino_v1 », champ cart : [{ id, qty }]), que /commande reprend.
(function () {
  var STORE = 'andivino_v1';
  var LIVRAISON = 500; // remise en main propre, en centimes (data/catalog.js)
  var MAX = 36;

  function lire() {
    try { var d = JSON.parse(localStorage.getItem(STORE) || '{}'); return Array.isArray(d.cart) ? d.cart : []; }
    catch (e) { return []; }
  }
  function ecrire(cart) {
    try {
      var d = JSON.parse(localStorage.getItem(STORE) || '{}');
      d.cart = cart;
      localStorage.setItem(STORE, JSON.stringify(d));
    } catch (e) { /* stockage indisponible : le bon reste juste pour cette visite */ }
  }

  var items = Array.prototype.slice.call(document.querySelectorAll('.pv-item[data-id]'));
  if (!items.length) return;
  var parId = {};
  items.forEach(function (li) { parId[li.dataset.id] = li; });

  var cart = lire();
  var memoire = cart.slice();

  function prix(c) {
    var e = c / 100;
    return (c % 100 ? e.toFixed(2).replace('.', ',') : String(e)) + ' €';
  }
  function qte(id) {
    var l = cart.filter(function (x) { return x.id === id; })[0];
    return l ? l.qty : 0;
  }
  function fixer(id, q) {
    q = Math.max(0, Math.min(MAX, q));
    cart = cart.filter(function (x) { return x.id !== id; });
    if (q > 0) cart.push({ id: id, qty: q });
    memoire = cart.slice();
    ecrire(cart);
    rendre(id);
  }

  var lines = document.getElementById('bonLines');
  var empty = document.getElementById('bonEmpty');
  var total = document.getElementById('bonTotal');
  var preNote = document.getElementById('bonPre');
  var bon = document.getElementById('bon');
  var bar = document.getElementById('bonBar');
  var barQty = document.getElementById('barQty');
  var barTotal = document.getElementById('barTotal');

  function rendre(changed) {
    var somme = 0, n = 0, arrivee = '';
    var html = '';
    items.forEach(function (li) {
      var id = li.dataset.id, q = qte(id);
      var add = li.querySelector('.pv-add'), box = li.querySelector('.pv-qty');
      add.hidden = q > 0;
      box.hidden = q === 0;
      box.querySelector('output').textContent = q;
      box.querySelector('[data-step="1"]').disabled = q >= MAX;
      li.classList.toggle('is-in', q > 0);
      if (!q) return;
      var p = +li.dataset.prix;
      somme += p * q; n += q;
      if (li.dataset.arrivee) arrivee = li.dataset.arrivee;
      html += '<li' + (id === changed ? ' class="is-new"' : '') + '><span><b>' + q + ' ×</b> ' + li.dataset.nom +
        (li.dataset.arrivee ? '<small>Précommande</small>' : '') + '</span><span class="bon-n">' + prix(p * q) + '</span></li>';
    });
    // Lignes du panier venues d'autres pages pour des vins absents d'ici : comptées, sans détail.
    cart.forEach(function (x) { if (!parId[x.id]) n += x.qty; });
    lines.innerHTML = html;
    empty.hidden = n > 0;
    total.textContent = somme ? prix(somme + LIVRAISON) : '—';
    preNote.hidden = !arrivee;
    if (arrivee) preNote.textContent = 'Votre commande contient une précommande : elle vous sera remise en une fois, à l’arrivée des bouteilles (' + arrivee + ').';
    bon.classList.toggle('is-full', n > 0);
    bar.hidden = n === 0;
    barQty.textContent = n + (n > 1 ? ' bouteilles' : ' bouteille') + ', livraison comprise';
    barTotal.textContent = somme ? prix(somme + LIVRAISON) : '';
  }

  document.addEventListener('click', function (e) {
    var add = e.target.closest('.pv-add');
    if (add) {
      var li = add.closest('.pv-item');
      if (!li) return;
      e.preventDefault();
      fixer(li.dataset.id, 1);
      var plus = li.querySelector('[data-step="1"]');
      if (plus) plus.focus();
      return;
    }
    var step = e.target.closest('.pv-qty button[data-step]');
    if (step) {
      var item = step.closest('.pv-item');
      var avant = qte(item.dataset.id);
      fixer(item.dataset.id, avant + (+step.dataset.step));
      if (avant + (+step.dataset.step) <= 0) item.querySelector('.pv-add').focus();
    }
  });

  // Un autre onglet (ou /commande) a changé le panier : on suit.
  window.addEventListener('storage', function (e) {
    if (e.key !== STORE) return;
    cart = lire();
    if (JSON.stringify(cart) !== JSON.stringify(memoire)) { memoire = cart.slice(); rendre(); }
  });

  rendre();
})();
