// Fiche produit : boutons de quantité et barre d'achat fixe sur mobile.
(function () {
  var input = document.getElementById('pdp-qte');
  if (input) {
    var clamp = function (n) { return Math.min(36, Math.max(1, n || 1)); };
    document.querySelectorAll('[data-qty-step]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        input.value = clamp(parseInt(input.value, 10) + parseInt(btn.getAttribute('data-qty-step'), 10));
      });
    });
    input.addEventListener('change', function () { input.value = clamp(parseInt(input.value, 10)); });
  }

  // La barre fixe n'apparaît que lorsque le bouton principal est sorti de l'écran.
  var sticky = document.getElementById('pdp-sticky');
  var cta = document.getElementById('pdp-cta');
  if (sticky && cta && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      sticky.hidden = e.isIntersecting || e.boundingClientRect.top > 0;
    }).observe(cta);
  }
})();
