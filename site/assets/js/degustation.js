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
    payEdit: document.getElementById('payEdit'),
    qtyHint: document.getElementById('qtyHint'),
    newsletter: document.getElementById('bk-newsletter'),
    bookTitle: document.getElementById('book-title'),
    legal: document.getElementById('legalNote')
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
  function field(id, label, type, name, auto, max, placeholder) {
    return '<div class="form-group"><label for="' + id + '">' + label + ' *</label>' +
      '<input type="' + type + '" id="' + id + '" name="' + name + '" autocomplete="' + auto + '" maxlength="' + max + '" required' +
      (placeholder ? ' placeholder="' + placeholder + '"' : '') + (type === 'email' ? ' inputmode="email" autocapitalize="off" spellcheck="false"' : '') + '>' +
      '<p class="field-error" id="' + id + '-err" hidden></p>' +
      (type === 'email' ? '<p class="field-hint" id="' + id + '-hint" hidden></p>' : '') +
      '</div>';
  }
  function personHtml(i) {
    var id = 'p' + i;
    var me = i === 0;
    return '<fieldset class="person" data-i="' + i + '">' +
      '<legend>' + (me ? 'Vous' : 'Participant ' + (i + 1)) + '</legend>' +
      '<div class="form-row">' +
        field(id + '-prenom', 'Prénom', 'text', 'prenom', me ? 'given-name' : 'off', 80) +
        field(id + '-nom', 'Nom', 'text', 'nom', me ? 'family-name' : 'off', 80) +
      '</div>' +
      field(id + '-email', 'Email', 'email', 'email', me ? 'email' : 'off', 160, me ? 'vous@exemple.fr' : 'son.email@exemple.fr') +
    '</fieldset>';
  }

  // ── Erreurs sous chaque champ ───────────────────────────────────────────────────────────────
  function setError(input, message) {
    var err = document.getElementById(input.id + '-err');
    err.textContent = message;
    err.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', err.id);
  }
  function clearError(input) {
    var err = document.getElementById(input.id + '-err');
    if (err) { err.textContent = ''; err.hidden = true; }
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }

  // Fautes de frappe fréquentes dans le domaine : on propose la correction, sans bloquer.
  var DOMAIN_FIX = {
    'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmail.co': 'gmail.com', 'gmail.con': 'gmail.com', 'gmail.cm': 'gmail.com',
    'gamil.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gnail.com': 'gmail.com', 'gmaill.com': 'gmail.com',
    'hotmial.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'hotmail.con': 'hotmail.com', 'hotmial.fr': 'hotmail.fr', 'hotmal.fr': 'hotmail.fr', 'hotmail.f': 'hotmail.fr',
    'outlok.com': 'outlook.com', 'outloo.com': 'outlook.com', 'outlook.con': 'outlook.com', 'outlok.fr': 'outlook.fr',
    'yahoo.con': 'yahoo.com', 'yaho.fr': 'yahoo.fr', 'yahou.fr': 'yahoo.fr', 'yahooo.fr': 'yahoo.fr',
    'orange.fe': 'orange.fr', 'oragne.fr': 'orange.fr', 'ornage.fr': 'orange.fr', 'wanadoo.fe': 'wanadoo.fr', 'wanado.fr': 'wanadoo.fr',
    'free.fe': 'free.fr', 'sfr.fe': 'sfr.fr', 'icloud.con': 'icloud.com', 'iclou.com': 'icloud.com', 'icoud.com': 'icloud.com',
    'laposte.ne': 'laposte.net', 'laposte.nte': 'laposte.net'
  };
  function emailSuggestion(value) {
    var at = value.lastIndexOf('@');
    if (at < 1) return null;
    var fix = DOMAIN_FIX[value.slice(at + 1).toLowerCase()];
    return fix ? value.slice(0, at + 1) + fix : null;
  }
  function updateHint(input) {
    var hint = document.getElementById(input.id + '-hint');
    if (!hint) return;
    var s = emailSuggestion(input.value.trim());
    hint.hidden = !s;
    hint.innerHTML = '';
    if (!s) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'link-inline';
    btn.textContent = s;
    btn.addEventListener('click', function () {
      input.value = s;
      hint.hidden = true;
      clearError(input);
      input.focus();
    });
    hint.appendChild(document.createTextNode('Vouliez-vous dire '));
    hint.appendChild(btn);
    hint.appendChild(document.createTextNode(' ?'));
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
    // Dit pourquoi « + » ne va pas plus loin : la limite par réservation ou les dernières places.
    var atMax = state.qty >= maxQty() && state.qty > 1;
    els.qtyHint.hidden = !atMax;
    if (atMax) {
      els.qtyHint.innerHTML = state.remaining != null && state.remaining < state.max
        ? 'Il ne reste que ' + plural(state.remaining, 'place') + '.'
        : state.max + ' places au maximum par réservation. Pour un groupe, <a href="mailto:contact@andivino.fr">écrivez-nous</a>.';
    }
  }

  els.minus.addEventListener('click', function () {
    if (state.qty > 1) { state.qty--; renderParticipants(); }
  });
  els.plus.addEventListener('click', function () {
    // Le focus reste sur « + » : sur téléphone, sauter au nouveau champ ouvrirait le clavier
    // et éloignerait le compteur. Le nombre de places est annoncé par l'<output> (aria-live).
    if (state.qty < maxQty()) { state.qty++; renderParticipants(); }
  });
  form.addEventListener('input', function (e) {
    var t = e.target;
    if (!t.id || !document.getElementById(t.id + '-err')) return;
    clearError(t);
    if (statusIsValidation) {
      var left = form.querySelectorAll('[aria-invalid="true"]').length;
      setStatus(left > 1 ? left + ' champs sont à compléter ou corriger.' : '', true);
    }
  });
  form.addEventListener('focusout', function (e) {
    if (e.target.name === 'email') updateHint(e.target);
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
      els.bookTitle.innerHTML = closed ? 'Inscriptions <em>closes</em>' : 'C\'est <em>complet</em>';
      els.placesLine.textContent = closed ? 'Merci à tous, et à la prochaine dégustation.' : 'Les ' + state.total + ' places sont parties.';
      els.closedText.textContent = 'Inscrivez-vous à la newsletter pour connaître en premier la date de la prochaine dégustation.';
      if (els.legal) els.legal.hidden = true;
      els.heroCta.textContent = closed ? 'Inscriptions closes' : 'Complet : être prévenu';
      els.heroCta.href = closed ? '#reserver' : '/newsletter';
    } else {
      // Des places se sont libérées (paiement abandonné) : on rouvre la réservation.
      els.closed.hidden = true;
      if (els.pay.hidden) form.hidden = false;
      els.bookTitle.innerHTML = 'Réserver <em>vos places</em>';
      if (els.legal) els.legal.hidden = false;
      els.heroCta.textContent = 'Réserver ma place';
      els.heroCta.href = '#reserver';
    }

    updateBar(r, full, closed);
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

  // ── Barre de réservation mobile ─────────────────────────────────────────────────────────────
  var bar = document.getElementById('bookBar');
  var barMeta = document.getElementById('bookBarMeta');
  var barCta = document.getElementById('bookBarCta');
  var BAR_DATE = barMeta ? barMeta.textContent : '';

  function updateBar(r, full, closed) {
    if (!bar) return;
    document.getElementById('bookBarPrice').textContent = euros(state.price);
    bar.classList.toggle('low', r != null && r > 0 && r <= 5);
    if (closed) {
      barMeta.textContent = 'Inscriptions closes';
      barCta.textContent = 'Détails';
      barCta.href = '#reserver';
    } else if (full) {
      barMeta.textContent = 'Complet';
      barCta.textContent = 'Être prévenu';
      barCta.href = '/newsletter';
    } else {
      barMeta.textContent = r == null ? BAR_DATE : BAR_DATE.split(' · ')[0] + ' · ' + (r <= 5 ? 'plus que ' : '') + plural(r, 'place');
      barCta.textContent = 'Réserver';
      barCta.href = '#reserver';
    }
  }

  // Visible seulement quand ni le bouton du haut, ni la réservation, ni le pied de page ne sont à l'écran.
  if (bar && 'IntersectionObserver' in window) {
    var inView = new Set();
    var watched = [els.heroCta, document.getElementById('reserver'), document.querySelector('footer')].filter(Boolean);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) inView.add(en.target); else inView.delete(en.target); });
      bar.classList.toggle('show', inView.size === 0);
    });
    watched.forEach(function (el) { io.observe(el); });
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
  var statusIsValidation = false;
  function setStatus(message, isValidation) {
    els.status.textContent = message;
    statusIsValidation = !!isValidation;
  }

  // Vérifie tous les champs d'un coup ; chaque erreur s'affiche sous son champ.
  function readParticipants() {
    var list = [];
    var firstInvalid = null;
    var count = 0;
    var blocks = els.participants.querySelectorAll('.person');
    for (var i = 0; i < blocks.length; i++) {
      var inputs = { prenom: blocks[i].querySelector('[name=prenom]'), nom: blocks[i].querySelector('[name=nom]'), email: blocks[i].querySelector('[name=email]') };
      var p = { prenom: inputs.prenom.value.trim(), nom: inputs.nom.value.trim(), email: inputs.email.value.trim() };
      var checks = [
        [inputs.prenom, !p.prenom && 'Indiquez le prénom.'],
        [inputs.nom, !p.nom && 'Indiquez le nom.'],
        [inputs.email, !p.email ? 'Indiquez une adresse email.' : !EMAIL.test(p.email) && 'Cette adresse semble incomplète. Exemple : prenom@domaine.fr']
      ];
      checks.forEach(function (c) {
        if (c[1]) { setError(c[0], c[1]); count++; if (!firstInvalid) firstInvalid = c[0]; }
        else clearError(c[0]);
      });
      list.push(p);
    }
    if (!count) return list;
    setStatus(count > 1 ? count + ' champs sont à compléter ou corriger.' : '', true);
    firstInvalid.focus();
    return null;
  }

  function loadStripe() {
    if (window.Stripe) return Promise.resolve(window.Stripe);
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://js.stripe.com/v3/';
      s.onload = function () { resolve(window.Stripe); };
      s.onerror = function () { s.remove(); reject(new Error('Le module de paiement ne se charge pas. Vérifiez votre connexion, puis réessayez.')); };
      document.head.appendChild(s);
    });
  }

  // Libère les places tenues par un paiement abandonné (retour au formulaire).
  // Volontairement pas au départ de la page : certains moyens de paiement quittent la page
  // pour revenir ensuite, et libérer à ce moment annulerait un paiement en cours.
  var payTimer = null;
  function release() {
    clearTimeout(payTimer);
    if (checkout) { checkout.destroy(); checkout = null; }
    if (clientSecret) {
      var body = JSON.stringify({ clientSecret: clientSecret });
      clientSecret = null;
      fetch('/api/degustation/release', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }).catch(function () {});
    }
  }
  function backToForm() {
    release();
    els.pay.hidden = true;
    form.hidden = false;
    loadAvailability();
  }

  els.payEdit.addEventListener('click', function () {
    backToForm();
    els.submit.focus();
  });

  // Stripe garde les places 31 minutes : passé 30, on revient au formulaire (saisie conservée).
  var PAY_WINDOW = 30 * 60 * 1000;
  function onPayTimeout() {
    backToForm();
    setStatus('Le délai de paiement de 30 minutes est passé : vos places ont été libérées. Vos informations sont conservées, relancez le paiement quand vous voulez.');
    document.getElementById('reserver').scrollIntoView({ block: 'start' });
  }

  function postCheckout(payload) {
    var ctrl = 'AbortController' in window ? new AbortController() : null;
    var timer = ctrl && setTimeout(function () { ctrl.abort(); }, 20000);
    return fetch('/api/degustation/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      clearTimeout(timer);
      if (res.status === 429) throw new Error('Trop de tentatives en peu de temps. Patientez une minute, puis réessayez.');
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) {
          if (typeof data.remaining === 'number') { state.remaining = data.remaining; showAvailability(); }
          throw new Error(data.error || 'Impossible de préparer le paiement. Réessayez dans un instant.');
        }
        if (!data.clientSecret) throw new Error('Impossible de préparer le paiement. Réessayez dans un instant.');
        return data;
      });
    }, function (err) {
      clearTimeout(timer);
      throw new Error(err && err.name === 'AbortError'
        ? 'Le serveur met trop de temps à répondre. Vérifiez votre connexion, puis réessayez.'
        : 'Connexion impossible. Vérifiez votre réseau, puis réessayez.');
    });
  }

  var submitting = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (submitting) return;
    setStatus('');
    var participants = readParticipants();
    if (!participants) return;

    submitting = true;
    els.submit.disabled = true;
    els.submit.textContent = 'Préparation du paiement…';
    var stripeReady = loadStripe();
    postCheckout({ participants: participants, newsletter: els.newsletter.checked, site: form.elements.site.value })
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
        payTimer = setTimeout(onPayTimeout, PAY_WINDOW);
        document.getElementById('reserver').scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
      .catch(function (err) {
        release();
        setStatus(err.message);
      })
      .finally(function () {
        submitting = false;
        els.submit.disabled = false;
        els.submit.textContent = 'Continuer vers le paiement';
      });
  });

  // Compteur à jour pendant la visite : toutes les minutes, et au retour sur l'onglet.
  function refreshIfIdle() {
    if (document.visibilityState === 'visible' && els.pay.hidden && !submitting) loadAvailability();
  }
  setInterval(refreshIfIdle, 60000);
  document.addEventListener('visibilitychange', refreshIfIdle);

  renderParticipants();
  loadAvailability();
})();
