// Vide le panier local maintenant que le paiement est confirmé
try {
  var STORE = 'andivino_v1';
  var raw = localStorage.getItem(STORE);
  if (raw) {
    var d = JSON.parse(raw);
    d.cart = [];
    localStorage.setItem(STORE, JSON.stringify(d));
  }
} catch (e) {}

// Récapitulatif laissé par la page commande juste avant la redirection (voir saveReceipt dans
// checkout.js). Sans lui (autre onglet, lien direct), la page garde son texte générique.
(function () {
  var params = new URLSearchParams(window.location.search);
  var ref = params.get('payment_intent');
  var receipt = null;
  try { receipt = JSON.parse(sessionStorage.getItem('andivino_derniere_commande') || 'null'); } catch (e) {}
  if (!receipt || !ref || receipt.ref !== ref || !Array.isArray(receipt.lines) || !receipt.lines.length) return;

  var BOTTLES = {
    'clos-2017': '/assets/images/bout-cda.png',
    'helene-2016': '/assets/images/cuvee-h-bouteille.png',
    'poesia-2014': '/assets/images/bout-poesia.png'
  };
  var SHIPPING = {
    degustation: 'Retrait à la dégustation',
    'main-propre': 'Remise en main propre',
    colissimo: 'Colissimo',
    'mondial-relay': 'Mondial Relay'
  };
  var LAST_STEP = {
    degustation: ['Retrait à la dégustation', 'Nous vous écrivons pour vous donner la date de retrait. Les prochaines dégustations sont annoncées sur le site.'],
    'main-propre': ['Remise en main propre', 'Nous vous écrivons pour vous donner la date de remise à votre adresse.'],
    colissimo: ['Expédition Colissimo', 'Vous recevez l’email de suivi dès que le colis part, pour une livraison en 48 h.'],
    'mondial-relay': ['Expédition Mondial Relay', 'Vous recevez l’email de suivi dès que le colis part vers votre point relais.']
  };

  var money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
  function eur(cents) { return money.format(cents / 100); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var pending = receipt.status === 'processing';
  var email = receipt.email || '';

  // Titre et chapeau
  var title = document.getElementById('confTitle');
  if (receipt.prenom) {
    title.textContent = 'Merci, ';
    title.appendChild(el('em', null, receipt.prenom));
    title.appendChild(document.createTextNode('.'));
  }
  var lead = document.getElementById('confLead');
  lead.textContent = pending
    ? 'Votre banque valide encore le paiement. Dès qu’il est confirmé, un email part '
    : 'Votre paiement est confirmé. Un email de confirmation vient de partir ';
  if (email) {
    lead.appendChild(document.createTextNode('à '));
    lead.appendChild(el('strong', null, email));
    lead.appendChild(document.createTextNode(', avec le récapitulatif et la facture.'));
  } else {
    lead.appendChild(document.createTextNode('avec le récapitulatif et la facture.'));
  }
  if (pending) document.title = 'Commande enregistrée — Andivino';

  // Étapes selon le mode de livraison
  var steps = document.querySelectorAll('#suiteSteps li');
  if (pending) {
    steps[0].classList.remove('is-done');
    steps[0].querySelector('.suite-mark').textContent = '';
    steps[0].querySelector('strong').textContent = 'Paiement en cours de validation';
    steps[0].querySelector('p').textContent = 'Votre banque le confirme sous peu.';
  } else {
    var paid = new Date(receipt.paidAt || Date.now());
    steps[0].querySelector('p').textContent = 'Le ' + paid.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) + ', votre commande est enregistrée.';
  }
  var last = LAST_STEP[receipt.liv];
  if (last) {
    steps[2].querySelector('strong').textContent = last[0];
    var p = steps[2].querySelector('p');
    p.textContent = last[1];
    if (receipt.liv === 'degustation') {
      p.textContent = 'Nous vous écrivons pour vous donner la date de retrait. ';
      var a = el('a', 'text-link', 'Voir les prochaines dégustations');
      a.href = '/#degustations';
      p.appendChild(a);
    }
  }

  // Bon de commande
  document.getElementById('bonRef').textContent = receipt.ref;
  var list = document.getElementById('bonLines');
  var subtotal = 0;
  var bottles = 0;
  receipt.lines.forEach(function (line) {
    subtotal += line.amount;
    bottles += line.qty;
    var li = el('li', 'bon-line');
    var fig = el('span', 'bon-bottle');
    if (BOTTLES[line.id]) {
      var img = el('img');
      img.src = BOTTLES[line.id];
      img.alt = '';
      img.decoding = 'async';
      fig.appendChild(img);
    }
    var body = el('span', 'bon-wine');
    body.appendChild(el('span', 'bon-name', line.nom));
    body.appendChild(el('span', 'bon-meta', [line.millesime, line.qty + (line.qty > 1 ? '\u00a0bouteilles' : '\u00a0bouteille')].filter(Boolean).join(' · ')));
    li.appendChild(fig);
    li.appendChild(body);
    li.appendChild(el('span', 'bon-amount', eur(line.amount)));
    list.appendChild(li);
  });

  var shipping = typeof receipt.shipping === 'number' ? receipt.shipping : null;
  document.getElementById('bonSubtotal').textContent = eur(typeof receipt.subtotal === 'number' ? receipt.subtotal : subtotal);
  if (SHIPPING[receipt.liv]) document.getElementById('bonShipLabel').textContent = SHIPPING[receipt.liv];
  var shipEl = document.getElementById('bonShipping');
  if (shipping === 0) {
    shipEl.textContent = 'Gratuit';
    shipEl.className = 'is-free';
  } else if (shipping != null) {
    shipEl.textContent = eur(shipping);
  } else {
    shipEl.parentNode.hidden = true;
  }
  document.getElementById('bonTotal').textContent = eur(receipt.total);
  document.getElementById('bonDate').textContent = (pending ? 'Commandée le ' : 'Réglée le ')
    + new Date(receipt.paidAt || Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    + ' · ' + bottles + (bottles > 1 ? '\u00a0bouteilles' : '\u00a0bouteille');
  if (pending) document.querySelector('.bon-total dt').textContent = 'Total';

  document.getElementById('bon').hidden = false;
  document.getElementById('conf').classList.add('has-bon');
})();
