(function(){
  var root   = document.getElementById('carousel');
  var track  = document.getElementById('carouselTrack');
  var slides = track ? track.children : [];
  var n      = slides.length;
  var cur    = 0;
  var timer;
  // Pas de défilement automatique si le visiteur a demandé moins d'animations ; sinon il peut le mettre en pause.
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var paused = reduceMotion;
  var hovering = false;

  var dotsEl = document.getElementById('carDots');
  var dots   = [];
  for (var i = 0; i < n; i++) {
    var d = document.createElement('button');
    d.type = 'button';
    d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('data-i', i);
    d.setAttribute('aria-label', 'Photo ' + (i + 1) + ' sur ' + n);
    if (i === 0) d.setAttribute('aria-current', 'true');
    d.addEventListener('click', function(){ goTo(+this.getAttribute('data-i')); });
    dotsEl.appendChild(d);
    dots.push(d);
  }

  function goTo(idx) {
    cur = (idx + n) % n;
    track.style.transform = 'translateX(-' + (cur * 100) + '%)';
    dots.forEach(function(d, i){
      d.classList.toggle('active', i === cur);
      if (i === cur) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
    });
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    if (paused || hovering) return;
    timer = setInterval(function(){ goTo(cur + 1); }, 5000);
  }

  var pauseBtn = document.getElementById('carPause');
  function renderPause() {
    pauseBtn.setAttribute('aria-pressed', String(paused));
    pauseBtn.setAttribute('aria-label', paused ? 'Reprendre le défilement des photos' : 'Mettre en pause le défilement des photos');
    pauseBtn.classList.toggle('is-paused', paused);
  }
  pauseBtn.addEventListener('click', function(){ paused = !paused; renderPause(); resetTimer(); });
  renderPause();

  // Le survol ou le focus clavier dans le carrousel suspend le défilement le temps de regarder.
  root.addEventListener('mouseenter', function(){ hovering = true; resetTimer(); });
  root.addEventListener('mouseleave', function(){ hovering = false; resetTimer(); });
  root.addEventListener('focusin', function(){ hovering = true; resetTimer(); });
  root.addEventListener('focusout', function(){ hovering = false; resetTimer(); });

  document.getElementById('carPrev').addEventListener('click', function(){ goTo(cur - 1); });
  document.getElementById('carNext').addEventListener('click', function(){ goTo(cur + 1); });
  resetTimer();
})();
