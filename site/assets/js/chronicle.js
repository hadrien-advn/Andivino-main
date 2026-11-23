// Chroniques : la colonne « Dans cette chronique » suit la lecture (chapitre courant en bordeaux).
(function(){
  const links=[...document.querySelectorAll('.art-rail a[href^="#"]')];
  if(!links.length||!('IntersectionObserver' in window))return;
  const map=new Map(links.map(a=>[decodeURIComponent(a.hash.slice(1)),a]));
  const heads=[...map.keys()].map(id=>document.getElementById(id)).filter(Boolean);
  let current=null;
  const set=(id)=>{
    if(id===current)return;
    current=id;
    links.forEach(a=>a.removeAttribute('aria-current'));
    const a=map.get(id);
    if(a)a.setAttribute('aria-current','true');
  };
  // Le chapitre courant est le dernier titre passé au-dessus du premier tiers de l'écran.
  const pick=()=>{
    const line=window.innerHeight*.33;
    let id=null;
    for(const h of heads){if(h.getBoundingClientRect().top<=line)id=h.id;else break;}
    set(id);
  };
  const io=new IntersectionObserver(pick,{rootMargin:'0px 0px -60% 0px',threshold:[0,1]});
  heads.forEach(h=>io.observe(h));
  let raf=0;
  window.addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;pick();});},{passive:true});
  pick();
})();
