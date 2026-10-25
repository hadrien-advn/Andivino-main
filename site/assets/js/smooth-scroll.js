// Défilement amorti à la molette (Lenis), réglé comme chateau-margaux.com : chaque cran glisse
// sur 0,7 s au lieu de sauter. Le tactile garde le défilement natif du téléphone, et Lenis
// se coupe de lui-même si le visiteur a demandé à réduire les animations.
(function(){
  if(typeof Lenis!=='function')return;

  const lenis=new Lenis({duration:.7,autoRaf:true,allowNestedScroll:true});
  window.lenis=lenis;

  // Menu mobile, panier ou vérification d'âge ouverts : la page est bloquée, Lenis aussi
  const syncLock=()=>{document.body.style.overflow==='hidden'?lenis.stop():lenis.start();};
  new MutationObserver(syncLock).observe(document.body,{attributes:true,attributeFilter:['style']});
  syncLock();

  // Liens d'ancre de la page (#vins, #bodega…) : même glissé que la molette
  document.addEventListener('click',e=>{
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    const a=e.target.closest('a[href^="#"]');
    const id=a&&a.getAttribute('href');
    if(!id||id==='#')return;
    let target;
    try{target=document.querySelector(id);}catch(err){return;}
    if(!target)return;
    e.preventDefault();
    history.pushState(null,'',id);
    lenis.scrollTo(target);
  });
})();
