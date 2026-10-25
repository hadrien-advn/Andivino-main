// Bandeau du haut : il glisse hors de l'écran au fil du défilement vers le bas
// et revient dès qu'on remonte. Une fois le geste fini, il se cale tout ouvert ou tout fermé.
(function(){
  const nav=document.querySelector('nav');
  if(!nav||getComputedStyle(nav).position!=='fixed')return;

  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const baseTransition=getComputedStyle(nav).transition;
  let offset=0,lastY=Math.max(0,window.scrollY),ticking=false,settleTimer=null;

  // +2px pour cacher aussi le filet doré sous le bandeau
  const maxOffset=()=>nav.offsetHeight+2;
  // Menu mobile ou panier ouvert : la page est bloquée et le bandeau doit rester visible
  const isLocked=()=>document.body.style.overflow==='hidden';

  function apply(animate){
    nav.style.transition=animate&&!reduceMotion.matches?`${baseTransition}, transform .35s cubic-bezier(.2,.7,.2,1)`:'';
    nav.style.transform=offset?`translateY(${-offset}px)`:'';
  }

  function settle(){
    const max=maxOffset();
    if(offset>0&&offset<max){
      offset=offset>max/2&&lastY>max?max:0;
      apply(true);
    }
  }

  function update(){
    ticking=false;
    const y=Math.max(0,window.scrollY);
    if(isLocked()||y<=0)offset=0;
    else offset=Math.min(maxOffset(),Math.max(0,offset+(y-lastY)));
    lastY=y;
    apply(false);
    clearTimeout(settleTimer);
    settleTimer=setTimeout(settle,140);
  }

  window.addEventListener('scroll',()=>{
    if(!ticking){ticking=true;requestAnimationFrame(update);}
  },{passive:true});

  // Navigation au clavier : le bandeau réapparaît quand un de ses liens prend le focus
  nav.addEventListener('focusin',()=>{offset=0;apply(true);});
})();
