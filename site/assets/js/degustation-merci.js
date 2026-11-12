// Confirmation après Stripe Checkout : /degustation/merci?session_id=cs_… (voir /api/degustation/session).
(function () {
  var id = new URLSearchParams(location.search).get('session_id') || '';
  var TITLES = {
    thanksLoading: 'Vérification de votre inscription',
    thanksDone: 'Inscription confirmée',
    thanksOpen: 'Paiement non finalisé',
    thanksRetry: 'Vérification impossible',
    thanksError: 'Inscription introuvable'
  };
  function show(name) {
    Object.keys(TITLES).forEach(function (k) {
      document.getElementById(k).hidden = k !== name;
    });
    document.title = TITLES[name] + ' — Andivino';
    if (name !== 'thanksLoading') {
      var title = document.querySelector('#' + name + ' h1');
      title.setAttribute('tabindex', '-1');
      title.focus();
    }
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function render(data) {
    if (data.status !== 'complete') { show('thanksOpen'); return; }
    var names = data.participants || [];
    var ev = data.event;
    document.getElementById('thanksName').textContent = (names[0] || '').split(' ')[0];
    var n = names.length;
    document.getElementById('thanksLead').textContent = (n > 1 ? 'Vos ' + n + ' places sont réservées.' : 'Votre place est réservée.') +
      (data.email ? ' Nous vous écrivons à ' + data.email + ' avant la soirée.' : '');
    if (ev) {
      var date = ev.dateLabel.charAt(0).toUpperCase() + ev.dateLabel.slice(1);
      document.getElementById('thanksTicket').innerHTML =
        '<div><dt>Date</dt><dd>' + esc(date) + '</dd></div>' +
        '<div><dt>Heure</dt><dd>' + esc(ev.heure) + '</dd></div>' +
        '<div><dt>Lieu</dt><dd>' + esc(ev.adresse) + '</dd></div>' +
        '<div><dt>' + (n > 1 ? 'Participants' : 'Participant') + '</dt><dd>' + names.map(esc).join('<br>') + '</dd></div>';
      document.getElementById('thanksIcs').href = '/degustation/agenda.ics?id=' + encodeURIComponent(ev.id);
      document.getElementById('thanksMap').href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(ev.adresse);
    } else {
      document.querySelector('.thanks-tools').hidden = true;
    }
    show('thanksDone');
  }

  function check() {
    show('thanksLoading');
    fetch('/api/degustation/session?id=' + encodeURIComponent(id), { cache: 'no-store' })
      .then(function (res) {
        if (res.status === 400 || res.status === 404) return show('thanksError');
        if (!res.ok) return show('thanksRetry');
        return res.json().then(render);
      })
      .catch(function () { show('thanksRetry'); });
  }

  document.getElementById('thanksRetryBtn').addEventListener('click', check);
  if (!/^cs_\w+$/.test(id)) { show('thanksError'); return; }
  check();
})();
