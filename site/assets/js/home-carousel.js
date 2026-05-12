(function(){
  var track  = document.getElementById('carouselTrack');
  var slides = track ? track.children : [];
  var n      = slides.length;
  var cur    = 0;
  var timer;

  var dotsEl = document.getElementById('carDots');
  var dots   = [];
  for (var i = 0; i < n; i++) {
    var d = document.createElement('button');
    d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('data-i', i);
    d.addEventListener('click', function(){ goTo(+this.getAttribute('data-i')); });
    dotsEl.appendChild(d);
    dots.push(d);
  }

  function goTo(idx) {
    cur = (idx + n) % n;
    track.style.transform = 'translateX(-' + (cur * 100) + '%)';
    dots.forEach(function(d, i){ d.classList.toggle('active', i === cur); });
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(function(){ goTo(cur + 1); }, 5000);
  }

  document.getElementById('carPrev').addEventListener('click', function(){ goTo(cur - 1); });
  document.getElementById('carNext').addEventListener('click', function(){ goTo(cur + 1); });
  resetTimer();
})();
