// Inscription à la dégustation (andivino.fr/degustation) : places restantes, participants, puis
// paiement Stripe Checkout intégré à la page. Voir /api/degustation* dans server.js.
(function () {
  var form = document.getElementById('bookForm');
  if (!form) return;

  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var state = { price: 2500, total: 15, remaining: null, max: 6, qty: 1, publishableKey: null, open: true };
  var els = {
    participants: document.getElementById('participants'),
    qty: document.getElementById('qtyValue'),
    minus: document.getElementById('qtyMinus'),
    plus: document.getElementById('qtyPlus'),
    total: document.getElementById('totalValue'),
    status: document.getElementById('bookStatus'),
    submit: document.getElementById('bookSubmit'),
    placesLine: document.getElementById('placesLine'),
    badge: document.getElementById('placesBadge'),
    heroCta: document.getElementById('heroCta'),
    closed: document.getElementById('bookClosed'),
    closedText: document.getElementById('bookClosedText'),
    pay: document.getElementById('payStep'),
    paySummary: document.getElementById('paySummary'),
    payEdit: document.getElementById('payEdit')
  };
  var checkout = null;
  var clientSecret = null;

  function euros(cents) {
    var v = cents / 100;
    return (v % 1 ? v.toFixed(2).replace('.', ',') : String(v)) + ' €';
  }
  function plural(n, word) { return n + ' ' + word + (n > 1 ? 's' : ''); }
  function maxQty() {
    return Math.max(1, Math.min(state.max, state.remaining == null ? state.max : state.remaining));
  }

  // ── Participants ────────────────────────────────────────────────────────────────────────────
  function personHtml(i) {
    var id = 'p' + i;
    return '<fieldset class="person" data-i="' + i + '">' +
      '<legend>' + (i === 0 ? 'Vous' : 'Participant ' + (i + 1)) + (i === 0 ? ' <small>Participant 1</small>' : '') + '</legend>' +
      '<div class="form-row">' +
        '<div class="form-group"><label for="' + id + '-prenom">Prénom *</label><input type="text" id="' + id + '-prenom" name="prenom" autocomplete="' + (i === 0 ? 'given-name' : 'off') + '" maxlength="80" required></div>' +
        '<div class="form-group"><label for="' + id + '-nom">Nom *</label><input type="text" id="' + id + '-nom" name="nom" autocomplete="' + (i === 0 ? 'family-name' : 'off') + '" maxlength="80" required></div>' +
      '</div>' +
      '<div class="form-group"><label for="' + id + '-email">Email *</label><input type="email" id="' + id + '-email" name="email" autocomplete="' + (i === 0 ? 'email' : 'off') + '" maxlength="160" required placeholder="' + (i === 0 ? 'vous@exemple.fr' : 'son.email@exemple.fr') + '"></div>' +
    '</fieldset>';
  }

  function renderParticipants() {
    var current = els.participants.querySelectorAll('.person').length;
    if (current < state.qty) {
      var html = '';
      for (var i = current; i < state.qty; i++) html += personHtml(i);
      els.participants.insertAdjacentHTML('beforeend', html);
    } else {
      // On garde ce qui est déjà saisi : seuls les derniers blocs partent.
      var blocks = els.participants.querySelectorAll('.person');
      for (var j = blocks.length - 1; j >= state.qty; j--) blocks[j].remove();
    }
    els.qty.textContent = state.qty;
    els.minus.disabled = state.qty <= 1;
    els.plus.disabled = state.qty >= maxQty();
    els.total.textContent = euros(state.price * state.qty);
  }

  els.minus.addEventListener('click', function () {
    if (state.qty > 1) { state.qty--; renderParticipants(); }
  });
  els.plus.addEventListener('click', function () {
    if (state.qty < maxQty()) {
      state.qty++;
      renderParticipants();
      var last = els.participants.querySelector('.person:last-child input');
      if (last) last.focus();
    }
  });
  form.addEventListener('input', function (e) {
    if (e.target.removeAttribute) e.target.removeAttribute('aria-invalid');
  });

  // ── Places ──────────────────────────────────────────────────────────────────────────────────
  function showAvailability() {
    var r = state.remaining;
    var full = r === 0;
    var closed = !state.open;

    if (closed || full) {
      form.hidden = true;
      els.pay.hidden = true;
      els.closed.hidden = false;
      els.closedText.textContent = closed
        ? 'Les inscriptions sont closes. Merci à tous, et à la prochaine dégustation.'
        : 'C\'est complet : les ' + state.total + ' places sont parties. Inscrivez-vous à la newsletter pour être prévenu en premier de la prochaine date.';
      els.placesLine.textContent = closed ? 'Inscriptions closes.' : 'Complet.';
      els.heroCta.textContent = closed ? 'Inscriptions closes' : 'Complet : être prévenu';
      els.heroCta.href = closed ? '#reserver' : '/newsletter';
    } else {
      els.closed.hidden = true;
    }

    if (r == null) return;
    els.badge.hidden = false;
    els.badge.classList.toggle('low', r > 0 && r <= 5);
    els.badge.classList.toggle('full', full);
    els.badge.textContent = full ? 'Complet' : r <= 5 ? 'Plus que ' + plural(r, 'place') : plural(r, 'place') + ' restante' + (r > 1 ? 's' : '');
    if (!full && !closed) {
      els.placesLine.innerHTML = '<strong>' + plural(r, 'place') + ' restante' + (r > 1 ? 's' : '') + '</strong> sur ' + state.total + ', ' + euros(state.price) + ' par personne.';
    }
    if (state.qty > maxQty()) { state.qty = maxQty(); }
    renderParticipants();
  }

  function loadAvailability() {
    return fetch('/api/degustation', { cache: 'no-store' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (!data) return;
        if (!data.event) { state.open = false; showAvailability(); return; }
        state.price = data.event.prix;
        state.total = data.event.places;
        state.remaining = data.remaining;
        state.max = data.maxPerOrder || state.max;
        state.open = data.open;
        state.publishableKey = data.publishableKey;
        showAvailability();
      })
      .catch(function () { /* la page reste utilisable : le serveur vérifie les places au paiement */ });
  }

  // ── Paiement ────────────────────────────────────────────────────────────────────────────────
  function fail(message, input) {
    els.status.textContent = message;
    if (input) { input.setAttribute('aria-invalid', 'true'); input.focus(); }
  }

  function readParticipants() {
    var list = [];
    var blocks = els.participants.querySelectorAll('.person');
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      var who = i === 0 ? '' : ' (participant ' + (i + 1) + ')';
      var p = { prenom: b.querySelector('[name=prenom]').value.trim(), nom: b.querySelector('[name=nom]').value.trim(), email: b.querySelector('[name=email]').value.trim() };
      if (!p.prenom) { fail('Indiquez le prénom' + who + '.', b.querySelector('[name=prenom]')); return null; }
      if (!p.nom) { fail('Indiquez le nom' + who + '.', b.querySelector('[name=nom]')); return null; }
      if (!EMAIL.test(p.email)) { fail('Indiquez une adresse email valide' + who + '.', b.querySelector('[name=email]')); return null; }
      list.push(p);
    }
    return list;
  }

  function loadStripe() {
    if (window.Stripe) return Promise.resolve(window.Stripe);
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://js.stripe.com/v3/';
      s.onload = function () { resolve(window.Stripe); };
      s.onerror = function () { reject(new Error('Le module de paiement ne se charge pas. Vérifiez votre connexion.')); };
      document.head.appendChild(s);
    });
  }

  // Libère les places tenues par un paiement abandonné (retour au formulaire).
  function release() {
    if (checkout) { checkout.destroy(); checkout = null; }
    if (clientSecret) {
      var body = JSON.stringify({ clientSecret: clientSecret });
      clientSecret = null;
      fetch('/api/degustation/release', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }).catch(function () {});
    }
  }

  els.payEdit.addEventListener('click', function () {
    release();
    els.pay.hidden = true;
    form.hidden = false;
    loadAvailability();
    els.submit.focus();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    els.status.textContent = '';
    var participants = readParticipants();
    if (!participants) return;

    els.submit.disabled = true;
    els.submit.textContent = 'Préparation du paiement…';
    var stripeReady = loadStripe();
    fetch('/api/degustation/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participants: participants, site: form.elements.site.value })
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (!res.ok) {
            if (typeof data.remaining === 'number') { state.remaining = data.remaining; showAvailability(); }
            throw new Error(data.error || 'Impossible de préparer le paiement. Réessayez dans un instant.');
          }
          return data;
        });
      })
      .then(function (data) {
        clientSecret = data.clientSecret;
        return stripeReady.then(function (Stripe) {
          if (!state.publishableKey) throw new Error('Paiement indisponible pour le moment. Écrivez-nous à contact@andivino.fr.');
          return Stripe(state.publishableKey).initEmbeddedCheckout({ fetchClientSecret: function () { return Promise.resolve(data.clientSecret); } });
        });
      })
      .then(function (instance) {
        checkout = instance;
        var names = participants.map(function (p) { return p.prenom + ' ' + p.nom; });
        els.paySummary.textContent = plural(participants.length, 'place') + ' · ' + names.join(', ') + ' · ' + euros(state.price * participants.length);
        form.hidden = true;
        els.pay.hidden = false;
        checkout.mount('#checkout');
        document.getElementById('reserver').scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
      .catch(function (err) {
        release();
        fail(err.message === 'Failed to fetch' ? 'Connexion impossible. Vérifiez votre réseau et réessayez.' : err.message);
      })
      .finally(function () {
        els.submit.disabled = false;
        els.submit.textContent = 'Continuer vers le paiement';
      });
  });

  renderParticipants();
  loadAvailability();
})();
