// Confirmation après Stripe Checkout : /degustation/merci?session_id=cs_… (voir /api/degustation/session).
(function () {
  var id = new URLSearchParams(location.search).get('session_id') || '';
  function show(name) {
    ['thanksLoading', 'thanksDone', 'thanksOpen', 'thanksError'].forEach(function (k) {
      document.getElementById(k).hidden = k !== name;
    });
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  if (!/^cs_\w+$/.test(id)) { show('thanksError'); return; }
  fetch('/api/degustation/session?id=' + encodeURIComponent(id), { cache: 'no-store' })
    .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
    .then(function (data) {
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
      }
      show('thanksDone');
      var title = document.querySelector('#thanksDone h1');
      title.setAttribute('tabindex', '-1');
      title.focus();
    })
    .catch(function () { show('thanksError'); });
})();
