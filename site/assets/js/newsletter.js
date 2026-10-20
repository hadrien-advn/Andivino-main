(function () {
  var form = document.getElementById('newsletterForm');
  if (!form) return;
  var status = document.getElementById('nlStatus');
  var submit = document.getElementById('nlSubmit');
  var done = document.getElementById('nlDone');
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function field(name) { return form.elements[name]; }

  function fail(message, input) {
    status.textContent = message;
    if (input) { input.setAttribute('aria-invalid', 'true'); input.focus(); }
  }

  form.addEventListener('input', function (e) {
    if (e.target.removeAttribute) e.target.removeAttribute('aria-invalid');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';
    var prenom = field('prenom').value.trim();
    var nom = field('nom').value.trim();
    var email = field('email').value.trim();

    if (!prenom) return fail('Indiquez votre prénom.', field('prenom'));
    if (!nom) return fail('Indiquez votre nom.', field('nom'));
    if (!EMAIL.test(email)) return fail('Indiquez une adresse email valide.', field('email'));
    if (!field('consent').checked) return fail('Cochez la case pour accepter de recevoir la newsletter.', field('consent'));

    submit.disabled = true;
    submit.textContent = 'Inscription…';
    fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prenom: prenom, nom: nom, email: email, consent: true, site: field('site').value })
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (!res.ok) throw new Error(data.error || 'Inscription impossible pour le moment. Réessayez dans quelques minutes.');
        });
      })
      .then(function () {
        document.getElementById('nlDoneName').textContent = prenom;
        form.hidden = true;
        done.hidden = false;
        var title = done.querySelector('h2');
        title.setAttribute('tabindex', '-1');
        title.focus();
      })
      .catch(function (err) {
        fail(err.message === 'Failed to fetch' ? 'Connexion impossible. Vérifiez votre réseau et réessayez.' : err.message);
      })
      .finally(function () {
        submit.disabled = false;
        submit.textContent = "S'inscrire";
      });
  });
})();
