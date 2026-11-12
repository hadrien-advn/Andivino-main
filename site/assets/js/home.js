const STORE='andivino_v1';
const ICON_TIME='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
const ICON_PIN='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
const MN=['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const DEF={wines:[
  {id:'clos-2017',nom:'Clos des Andes',millesime:2017,prix:21.99,reduction:0,bodega:'Bodega Poesía',appellation:'Luján de Cuyo, Mendoza',cepages:'100\u00a0% Malbec',vendanges:'vendanges manuelles',superficie:'2 ha plantés en 1935, franc de pied',sol:'Sablo-argileux',fermentation:'Inox et fûts de chêne',elevage:'10 à 12 mois',garde:'15 ans',dispo:true,description:"Le Clos des Andes dévoile un bouquet ample et expressif, marqué par des arômes de cerise noire mûre et de cassis, relevés d'une subtile note de chocolat noir. La bouche, mi-corsée, séduit par des tanins souples et harmonieux. Les saveurs de prune noire et de mûre, généreuses et arrondies, s'étirent avec élégance vers une finale douce et veloutée, gagnant en finesse et en complexité à l'aération."},
  {id:'helene-2016',nom:'Poesía — Cuvée Hélène',millesime:2016,prix:35.99,reduction:0,bodega:'Bodega Poesía',appellation:'Luján de Cuyo, Mendoza',cepages:'60\u00a0% Malbec, 40\u00a0% Cabernet Sauvignon',vendanges:'vendanges manuelles',superficie:'1 ha planté en 1935, franc de pied',sol:'Sablo-argileux',fermentation:'Inox et fûts de chêne',elevage:'16 à 18 mois',garde:'25 ans',dispo:true,description:"D'une robe rouge sombre et brillante, le vin offre un nez subtil et complexe de framboise noire, moka et espresso, relevé d'une délicate note florale. La bouche séduit par la pureté et la maturité du fruit, sans excès de torréfaction, enrichie de baies noires, d'épices fines et d'un boisé fumé de grande qualité. La finale, longue et persistante, repose sur des tanins nobles et harmonieux. Un vin déjà remarquable, d'une grande élégance et profondeur."},
  {id:'poesia-2014',nom:'Poesía',millesime:2014,prix:44.99,reduction:0,bodega:'Bodega Poesía',appellation:'Luján de Cuyo, Mendoza',cepages:'60\u00a0% Malbec, 40\u00a0% Cabernet Sauvignon',vendanges:'vendanges manuelles',superficie:'13 ha plantés en 1935, franc de pied',sol:'Sablo-argileux',fermentation:'Inox et fûts de chêne',elevage:'18 à 24 mois',garde:'25 ans',dispo:true,resume:"Un nez raffiné de framboise, cerise noire et mûre, relevé de notes de pain grillé, de moka et de cèdre. La bouche, soyeuse et fraîche, s'étire sur des tanins fins jusqu'à une finale longue et raffinée.",description:"Poesía s'exprime avec distinction et profondeur à travers une robe rouge rubis intense. Le nez, raffiné et complexe, mêle fruits rouges et noirs mûrs (framboise, cerise noire, mûre) à de subtiles notes de pain grillé, café, moka et cèdre, complétées par des touches de minéralité, d'épices fines et florales. La bouche offre une texture soyeuse, un équilibre précis et une fraîcheur élégante. Le fruit s'étire sur une trame minérale et des tanins fins et enveloppants, avant une finale longue, nette et raffinée."}
],degustations:window.ANDIVINO_DEGUSTATIONS||[],chroniques:[
  {id:'c1',titre:'Mendoza vue de l\'intérieur : comprendre le terroir andin',categorie:'Terroir',date:'2025-01-10',resume:'À 900 mètres d\'altitude, entre sol sablo-argileux et sous-sol de graviers, la Bodega Poesía produit des vins d\'une minéralité rare.',contenu:'<p>Le terroir de Mendoza est singulier. À l\'ouest, la Cordillère des Andes agit comme un mur climatique naturel. L\'air y est rare, le ciel intense.</p>'},
  {id:'c2',titre:'Malbec &amp; Cabernet : le grand assemblage argentin',categorie:'Éducation',date:'2025-02-14',resume:'Pourquoi associer le Malbec local au Cabernet bordelais ? La Bodega Poesía révèle sa philosophie d\'assemblage.',contenu:'<p>L\'assemblage Malbec-Cabernet Sauvignon est au cœur de l\'identité de Bodega Poesía.</p>'},
  {id:'c3',titre:'Trois Français aux vendanges : le récit de Gaspard',categorie:'Reportage',date:'2025-03-01',resume:'Gaspard, Esteban et Hadrien racontent leurs premières vendanges à Luján de Cuyo. Une expérience fondatrice.',contenu:'<p>C\'était en été austral, sous un soleil de mars brûlant.</p>'}
],cart:[]};

function getData(){try{const r=localStorage.getItem(STORE);const d=r?JSON.parse(r):{};return{wines:DEF.wines,degustations:DEF.degustations,chroniques:DEF.chroniques,cart:d.cart||[]};}catch(e){return JSON.parse(JSON.stringify(DEF));}}
function saveData(d){try{localStorage.setItem(STORE,JSON.stringify(d));}catch(e){}}
if(!localStorage.getItem(STORE))saveData(JSON.parse(JSON.stringify(DEF)));
function fmtDate(s){return new Date(s).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});}
function getCart(){return getData().cart||[];}
function saveCart(c){const d=getData();d.cart=c;saveData(d);}
function cartCount(){return getCart().reduce((s,i)=>s+i.qty,0);}
function addToCart(id,qty=1){const c=getCart();const i=c.findIndex(x=>x.id===id);if(i>-1)c[i].qty+=qty;else c.push({id,qty});saveCart(c);updateBadge();}
function updateBadge(){
  const n=cartCount();
  const b=document.getElementById('cartBadge');
  if(b){b.textContent=n;b.classList.toggle('on',n>0);}
  // Sur téléphone l'icône panier est masquée : le bouton « Commander » porte le nombre de bouteilles.
  const cta=document.querySelector('nav .nav-cta');
  if(cta){
    if(n>0){cta.dataset.count=n;cta.setAttribute('aria-label','Commander, '+n+' bouteille'+(n>1?'s':'')+' dans le panier');}
    else{delete cta.dataset.count;cta.removeAttribute('aria-label');}
  }
}
function showToast(msg='Ajouté au panier'){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.style.opacity='1';setTimeout(()=>t.style.opacity='0',2400);}

function observeFade(){
  const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');obs.unobserve(e.target);}});},{threshold:.1});
  document.querySelectorAll('.fi:not(.show)').forEach(el=>obs.observe(el));
}

/* ── WINES ── */
// Les cartes des cuvées (texte, prix, liens vers les fiches) sont écrites dans pages/home.html, pour être
// lisibles sans JavaScript, de même que le bloc « Cuvées en importation » : ici on ne fait que brancher les boutons.
function renderWines(){
  const {wines}=getData();const g=document.getElementById('vinsGrid');if(!g)return;
  g.querySelectorAll('[data-add-id]').forEach(btn=>{
    btn.addEventListener('click',(event)=>{
      event.preventDefault();
      const w=wines.find(x=>x.id===btn.dataset.addId);
      addToCart(btn.dataset.addId);
      if(w)showToast(`${w.nom} ${w.millesime} ajouté au panier`);
    });
  });
  observeFade();
}

/* ── DÉGUSTATIONS ── */
function renderDeg(tab='upcoming'){
  const {degustations}=getData();const now=new Date();
  const list=document.getElementById('degList');if(!list)return;
  // Même règle « à venir » que le serveur et la commande (assets/js/degustations.js).
  const upcoming=window.andivinoUpcomingDegustations?window.andivinoUpcomingDegustations(now):[];
  const items=degustations.filter(d=>tab==='upcoming'?upcoming.includes(d):!upcoming.includes(d)).sort((a,b)=>tab==='upcoming'?new Date(a.date)-new Date(b.date):new Date(b.date)-new Date(a.date));
  if(!items.length){list.innerHTML=tab==='upcoming'
    ?`<div class="deg-empty">Aucune dégustation programmée pour le moment.<small>Les prochaines dates sont annoncées sur <a href="https://www.instagram.com/andivino.fr/" target="_blank" rel="noopener noreferrer">Instagram</a>.</small></div>`
    :`<div class="deg-empty">Aucun événement passé.</div>`;return;}
  list.innerHTML=items.map(d=>{
    const dt=new Date(d.date);
    return `<div class="ditem">
      <div class="ddate"><div class="dday">${dt.getDate()}</div><div class="dmon">${MN[dt.getMonth()]} ${dt.getFullYear()}</div></div>
      <div class="dinfo"><h3>${d.titre}</h3><div class="dmeta"><span>${ICON_TIME}${d.heure}</span><span>${ICON_PIN}${d.lieu}</span></div></div>
      ${tab==='upcoming'?(d.url?`<a href="${d.url}" class="btn-or">S'inscrire</a>`:`<span class="btn-or disabled">Sur invitation</span>`):''}
    </div>`;
  }).join('');
}
// Sans date à venir, on montre les dernières dégustations plutôt qu'un onglet vide.
function initDeg(){
  const hasUpcoming=(window.andivinoUpcomingDegustations?window.andivinoUpcomingDegustations():[]).length>0;
  const tab=hasUpcoming?'upcoming':'past';
  document.querySelectorAll('.dtab').forEach(b=>{const on=b.dataset.tab===tab;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  const note=document.getElementById('degNote');if(note)note.hidden=hasUpcoming;
  renderDeg(tab);
}
document.querySelectorAll('.dtab').forEach(b=>{
  b.addEventListener('click', function(){
    document.querySelectorAll('.dtab').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-pressed','false');});
    this.classList.add('active');this.setAttribute('aria-pressed','true');renderDeg(this.dataset.tab);
  });
});

function fmtDate(s){return new Date(s).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});}

/* ── NAV + CART ── */
const navEl=document.getElementById('nav');
window.addEventListener('scroll',()=>{navEl.classList.toggle('scrolled',window.scrollY>50);},{passive:true});
updateBadge();

/* ── NAV : lien de la section en cours ── */
const navLinks=[...document.querySelectorAll('.nlinks a[href^="#"]')];
function setActiveNav(id){
  navLinks.forEach(a=>{
    const on=a.getAttribute('href')==='#'+id;
    a.classList.toggle('is-active',on);
    if(on)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');
  });
}
navLinks.forEach(a=>a.addEventListener('click',()=>setActiveNav(a.getAttribute('href').slice(1))));
const navSections=navLinks.map(a=>document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
if('IntersectionObserver' in window&&navSections.length){
  const spy=new IntersectionObserver(es=>{
    es.forEach(e=>{if(e.isIntersecting)setActiveNav(e.target.id);});
  },{rootMargin:'-45% 0px -50% 0px'});
  navSections.forEach(s=>spy.observe(s));
  window.addEventListener('scroll',()=>{if(window.scrollY<window.innerHeight*.5)setActiveNav('');},{passive:true});
}

/* ── BURGER MENU ── */
const burgerBtn=document.getElementById('burgerBtn');
let navMobile=null;

function createMobileMenu(){
  if(document.getElementById('navMobile'))return;
  const div=document.createElement('div');
  div.className='nav-mobile';
  div.id='navMobile';
  div.setAttribute('role','dialog');
  div.setAttribute('aria-modal','true');
  div.setAttribute('aria-label','Menu');
  div.innerHTML=`<ul>
    <li><a href="#philosophie">Notre histoire</a></li>
    <li><a href="#vins">Les vins</a></li>
    <li><a href="#bodega">La Bodega</a></li>
    <li><a href="#degustations">Dégustations</a></li>
    <li><a href="#chroniques">Chroniques</a></li>
    <li><a href="/commande" class="nav-mobile-cta">Commander</a></li>
  </ul>`;
  document.body.appendChild(div);
  navMobile=div;
  burgerBtn.setAttribute('aria-controls','navMobile');
  // Le défilement vers l'ancre est fait à la main : le navigateur l'ignore quand le menu se ferme
  // pendant le clic.
  div.querySelectorAll('a').forEach(a=>a.addEventListener('click',e=>{
    closeMobileMenu(false);
    const id=a.getAttribute('href');
    if(!id.startsWith('#'))return;
    const target=document.querySelector(id);if(!target)return;
    e.preventDefault();
    history.pushState(null,'',id);
    // Une frame plus tard : Lenis redémarre à la fermeture du menu et annulerait un glissé lancé avant
    if(window.lenis)requestAnimationFrame(()=>window.lenis.scrollTo(target));
    else target.scrollIntoView({behavior:'smooth',block:'start'});
  }));
}

function isMobileMenuOpen(){return !!navMobile&&navMobile.classList.contains('open');}

// La feuille de style masque le menu en !important : seule la classe .open l'affiche.
function closeMobileMenu(returnFocus){
  if(!isMobileMenuOpen())return;
  navMobile.classList.remove('open');
  burgerBtn.classList.remove('open');
  burgerBtn.setAttribute('aria-expanded','false');
  burgerBtn.setAttribute('aria-label','Menu');
  document.body.style.overflow='';
  if(returnFocus)burgerBtn.focus();
}

function openMobileMenu(){
  if(!navMobile)createMobileMenu();
  navMobile.classList.add('open');
  burgerBtn.classList.add('open');
  burgerBtn.setAttribute('aria-expanded','true');
  burgerBtn.setAttribute('aria-label','Fermer le menu');
  document.body.style.overflow='hidden';
  navMobile.querySelector('a').focus();
}

if(burgerBtn){
  burgerBtn.addEventListener('click',()=>{isMobileMenuOpen()?closeMobileMenu(false):openMobileMenu();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMobileMenu(true);});
  window.addEventListener('resize',()=>{if(window.innerWidth>600)closeMobileMenu(false);});
}

/* ── INIT ── */
renderWines();
initDeg();
observeFade();

/* ── MORE LISTENERS ── */
document.getElementById('cartBtn').addEventListener('click',function(e){
  e.preventDefault();
  window.location.href='/commande';
});
