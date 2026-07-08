(function(){
  var STORE_AGE = 'andivino_age_verified';
  var STORE_COOKIE = 'andivino_cookie_consent';
  var COOKIE_CONSENT_MS = 180 * 24 * 60 * 60 * 1000; // CNIL : redemander le consentement sous ~6 mois

  function getCookieConsent(){
    try {
      var raw = localStorage.getItem(STORE_COOKIE);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (Date.now() - data.date > COOKIE_CONSENT_MS) return null;
      return data.choice;
    } catch (e) { return null; }
  }
  function setCookieConsent(choice){
    try { localStorage.setItem(STORE_COOKIE, JSON.stringify({ choice: choice, date: Date.now() })); } catch (e) {}
  }
  // Exposé pour un futur script de mesure d'audience : ne charger qu'après consentement explicite.
  window.AndivinoConsent = {
    hasAnalyticsConsent: function () { return getCookieConsent() === 'accepted'; }
  };

  function isAgeVerified(){
    try { return localStorage.getItem(STORE_AGE) === 'true'; } catch (e) { return false; }
  }
  function setAgeVerified(){
    try { localStorage.setItem(STORE_AGE, 'true'); } catch (e) {}
  }

  function showCookieBanner(){
    if (document.getElementById('cookieBanner')) return;
    var el = document.createElement('div');
    el.className = 'cookie-banner';
    el.id = 'cookieBanner';
    el.innerHTML =
      '<div class="cookie-in">' +
        '<p>Nous utilisons uniquement des cookies et stockages strictement nécessaires au fonctionnement du site (panier, paiement sécurisé Stripe). Aucun cookie de mesure d\'audience ou publicitaire n\'est déposé sans votre consentement. <a href="/legal/mentions-legales#cookies">En savoir plus</a></p>' +
        '<div class="cookie-actions">' +
          '<button type="button" class="cookie-btn-refuse" id="cookieRefuse">Tout refuser</button>' +
          '<button type="button" class="cookie-btn-accept" id="cookieAccept">Tout accepter</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    document.getElementById('cookieAccept').addEventListener('click', function () {
      setCookieConsent('accepted');
      el.remove();
    });
    document.getElementById('cookieRefuse').addEventListener('click', function () {
      setCookieConsent('refused');
      el.remove();
    });
  }

  function maybeShowCookieBanner(){
    if (getCookieConsent() === null) showCookieBanner();
  }

  function showAgeGate(){
    var el = document.createElement('div');
    el.className = 'age-gate';
    el.id = 'ageGate';
    el.innerHTML =
      '<div class="age-box">' +
        '<img src="/assets/images/logo-sans-fond.png" alt="Andivino" class="age-logo">' +
        '<h2>Vérification de votre âge</h2>' +
        '<p>Andivino commercialise des boissons alcoolisées. Conformément à l\'article L.3342-1 du Code de la santé publique, la vente d\'alcool est interdite aux mineurs. L\'accès à ce site est réservé aux personnes majeures.</p>' +
        '<p class="age-warning">L\'abus d\'alcool est dangereux pour la santé, à consommer avec modération.</p>' +
        '<div class="age-actions">' +
          '<button type="button" class="age-btn-yes" id="ageYes">J\'ai 18 ans ou plus</button>' +
          '<button type="button" class="age-btn-no" id="ageNo">J\'ai moins de 18 ans</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    document.body.style.overflow = 'hidden';
    document.getElementById('ageYes').addEventListener('click', function () {
      setAgeVerified();
      el.remove();
      document.body.style.overflow = '';
      maybeShowCookieBanner();
    });
    document.getElementById('ageNo').addEventListener('click', function () {
      window.location.href = 'https://www.google.com';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!isAgeVerified()) {
      showAgeGate();
    } else {
      maybeShowCookieBanner();
    }
  });
})();
