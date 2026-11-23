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
      // Cachée seulement quand le bouton principal est visible : présente dès l'arrivée s'il est sous l'écran.
      sticky.hidden = e.isIntersecting;
    }).observe(cta);
  }
})();

// Loupe sur la bouteille : à la souris, la lentille suit le pointeur dès le survol ; au doigt, elle apparaît
// après un court appui (pour qu'un simple glissement fasse toujours défiler la page) et se place au-dessus
// du doigt. Elle lit data-zoom, la version haute définition de la photo quand elle existe.
(function () {
  var box = document.querySelector('.pdp-visual[data-zoom]');
  if (!box) return;
  var img = box.querySelector('img');
  var lens = box.querySelector('.pdp-lens');
  if (!img || !lens) return;
  var src = box.getAttribute('data-zoom');
  var charge = false;
  var actif = false;
  var touche = false;

  function prechargerHD() {
    if (charge) return;
    charge = true;
    lens.style.backgroundImage = 'url("' + img.currentSrc + '")';
    var hd = new Image();
    hd.onload = function () { lens.style.backgroundImage = 'url("' + src + '")'; };
    hd.src = src;
  }

  function placer(clientX, clientY) {
    var r = img.getBoundingClientRect();
    var b = box.getBoundingClientRect();
    var x = clientX - r.left;
    var y = clientY - r.top;
    if (!touche && (x < 0 || y < 0 || x > r.width || y > r.height)) { masquer(); return; }
    x = Math.max(0, Math.min(r.width, x));
    y = Math.max(0, Math.min(r.height, y));
    clientX = r.left + x;
    clientY = r.top + y;
    var d = lens.offsetWidth;
    var z = touche ? 2.8 : 2.5;
    lens.style.backgroundSize = (r.width * z) + 'px ' + (r.height * z) + 'px';
    lens.style.backgroundPosition = (d / 2 - x * z) + 'px ' + (d / 2 - y * z) + 'px';
    // Au doigt, la lentille monte au-dessus du doigt pour rester visible.
    var cx = clientX - b.left;
    var cy = clientY - b.top - (touche ? d * 0.75 : 0);
    lens.style.left = (cx - d / 2) + 'px';
    lens.style.top = (cy - d / 2) + 'px';
    if (!actif) { actif = true; box.classList.add('is-zooming'); }
  }
  function masquer() {
    if (!actif) return;
    actif = false;
    box.classList.remove('is-zooming');
  }

  // Souris / stylet
  img.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') prechargerHD(); });
  img.addEventListener('pointermove', function (e) { if (e.pointerType !== 'touch') { touche = false; placer(e.clientX, e.clientY); } });
  img.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch') masquer(); });

  // Doigt
  var minuterie = null;
  var depart = null;
  img.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    prechargerHD();
    var t = e.touches[0];
    depart = { x: t.clientX, y: t.clientY };
    clearTimeout(minuterie);
    minuterie = setTimeout(function () { touche = true; placer(depart.x, depart.y); }, 160);
  }, { passive: true });
  img.addEventListener('touchmove', function (e) {
    var t = e.touches[0];
    if (actif) { e.preventDefault(); placer(t.clientX, t.clientY); return; }
    if (depart && Math.abs(t.clientX - depart.x) + Math.abs(t.clientY - depart.y) > 10) { clearTimeout(minuterie); depart = null; }
  }, { passive: false });
  function fin() { clearTimeout(minuterie); depart = null; masquer(); }
  img.addEventListener('touchend', fin);
  img.addEventListener('touchcancel', fin);
  img.addEventListener('contextmenu', function (e) { if (actif || depart) e.preventDefault(); });
})();
