const STORE='andivino_v1';
const IMAGE_BASE_URL = new URL('../images/', document.currentScript.src).href;
const MN=['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const SCORES={'clos-2017':[],'helene-2016':[],'poesia-2014':[{src:'Wine Advocate',pts:'94'},{src:'Vinous',pts:'91'},{src:'James Suckling',pts:'92'}]};
const DEF={wines:[
  {id:'clos-2017',nom:'Clos des Andes',millesime:2017,prix:19,reduction:0,bodega:'Bodega Poesía',appellation:'Luján de Cuyo, Mendoza',cepages:'100% Malbec — Vendanges manuelles',superficie:'2 ha plantés en 1935, franc de pied',sol:'Sablo-argileux',fermentation:'Inox et fûts de chêne',elevage:'10 à 12 mois',garde:'15 ans',dispo:true,description:"Le Clos des Andes dévoile un bouquet ample et expressif, marqué par des arômes de cerise noire mûre et de cassis, relevés d'une subtile note de chocolat noir. La bouche, mi-corsée, séduit par des tanins souples et harmonieux. Les saveurs de prune noire et de mûre s'étirent vers une finale douce et veloutée, gagnant en finesse à l'aération."},
  {id:'helene-2016',nom:'Poésía — Cuvée Hélène',millesime:2016,prix:35,reduction:0,bodega:'Bodega Poesía',appellation:'Luján de Cuyo, Mendoza',cepages:'60% Malbec — 40% Cabernet Sauvignon',superficie:'1 ha planté en 1935, franc de pied',sol:'Sablo-argileux',fermentation:'Inox et fûts de chêne',elevage:'16 à 18 mois',garde:'25 ans',dispo:true,description:"D'une robe rouge sombre et brillante, le vin offre un nez subtil et complexe de framboise noire, moka et espresso, relevé d'une délicate note florale. La finale, longue et persistante, repose sur des tanins nobles et harmonieux — un vin d'une grande élégance et profondeur."},
  {id:'poesia-2014',nom:'Poésía',millesime:2014,prix:38,reduction:0,bodega:'Bodega Poesía',appellation:'Luján de Cuyo, Mendoza',cepages:'60% Malbec — 40% Cabernet Sauvignon',superficie:'13 ha plantés en 1935, franc de pied',sol:'Sablo-argileux',fermentation:'Inox et fûts de chêne',elevage:'18 à 24 mois',garde:'25 ans',dispo:true,description:"Poésía s'exprime avec distinction et profondeur à travers une robe rouge rubis intense. Le nez mêle fruits rouges et noirs mûrs à de subtiles notes de pain grillé, café, moka et cèdre. La bouche offre une texture soyeuse et une fraîcheur élégante, avant une finale longue, nette et raffinée."}
],degustations:[
  {id:'d1',titre:'Dégustation Poesía — Paris VIIème',date:'2026-05-20',heure:'19h00',lieu:'Paris 7e',adresse:'Adresse sur inscription',description:'Dégustation verticale des trois cuvées Bodega Poesía avec Gaspard, Esteban et Hadrien.',passee:false,url:'https://pay.qonto.com/payment-links/019e27c9-ee0f-70fb-80b1-1fb3e799447e?resource_id=019e27c9-ee0f-7ef9-97f8-1109ec6d888d'},
  {id:'d2',titre:'Salon des Vins d\'Argentine — Lyon',date:'2026-07-12',heure:'14h – 19h',lieu:'Lyon 7e',adresse:'Halle Girard',description:'Andivino participe au salon des vins d\'importation. Entrée libre.',passee:false,url:null},
  {id:'d3',titre:'Soirée privée — Bordeaux',date:'2025-11-08',heure:'18h30',lieu:'Bordeaux',adresse:'Privé',description:'Première dégustation Andivino.',passee:true,url:null}
],chroniques:[
  {id:'c1',titre:'Mendoza vue de l\'intérieur : comprendre le terroir andin',categorie:'Terroir',date:'2025-01-10',resume:'À 900 mètres d\'altitude, entre sol sablo-argileux et sous-sol de graviers, la Bodega Poesía produit des vins d\'une minéralité rare.',contenu:'<p>Le terroir de Mendoza est singulier. À l\'ouest, la Cordillère des Andes agit comme un mur climatique naturel. L\'air y est rare, le ciel intense.</p>'},
  {id:'c2',titre:'Malbec &amp; Cabernet : le grand assemblage argentin',categorie:'Éducation',date:'2025-02-14',resume:'Pourquoi associer le Malbec local au Cabernet bordelais ? La Bodega Poesía révèle sa philosophie d\'assemblage.',contenu:'<p>L\'assemblage Malbec-Cabernet Sauvignon est au cœur de l\'identité de Bodega Poesía.</p>'},
  {id:'c3',titre:'Trois Français aux vendanges : le récit de Gaspard',categorie:'Reportage',date:'2025-03-01',resume:'Gaspard, Esteban et Hadrien racontent leurs premières vendanges à Luján de Cuyo. Une expérience fondatrice.',contenu:'<p>C\'était en été austral, sous un soleil de mars brûlant.</p>'}
],cart:[]};

function getData(){try{const r=localStorage.getItem(STORE);const d=r?JSON.parse(r):{};return{wines:DEF.wines,degustations:DEF.degustations,chroniques:DEF.chroniques,cart:d.cart||[]};}catch(e){return JSON.parse(JSON.stringify(DEF));}}
function saveData(d){try{localStorage.setItem(STORE,JSON.stringify(d));}catch(e){}}
if(!localStorage.getItem(STORE))saveData(JSON.parse(JSON.stringify(DEF)));
function calcPrix(w){if(!w.reduction)return w.prix;return parseFloat((w.prix*(1-w.reduction/100)).toFixed(2));}
function fmtDate(s){return new Date(s).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});}
function getCart(){return getData().cart||[];}
function saveCart(c){const d=getData();d.cart=c;saveData(d);}
function cartCount(){return getCart().reduce((s,i)=>s+i.qty,0);}
function addToCart(id,qty=1){const c=getCart();const i=c.findIndex(x=>x.id===id);if(i>-1)c[i].qty+=qty;else c.push({id,qty});saveCart(c);updateBadge();showToast();}
function updateBadge(){const b=document.getElementById('cartBadge');if(!b)return;const n=cartCount();b.textContent=n;b.classList.toggle('on',n>0);}
function showToast(msg='✓ Ajouté au panier'){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.style.opacity='1';setTimeout(()=>t.style.opacity='0',2400);}

function bottleSVG(id,h){
  if(!h)h=175;
  // ── Images réelles ──
  var imgs={
    'clos-2017': IMAGE_BASE_URL + 'bout-cda.png',
    'helene-2016': IMAGE_BASE_URL + 'cuvee-h.png',
    'poesia-2014': IMAGE_BASE_URL + 'bout-poesia.png'
  };
  if(imgs[id]){
    return '<img src="'+imgs[id]+'" alt="'+id+'" height="'+h+'" class="bottle-img">';
  }
  var caps={clos2017:'#2A2016',helene2016:'#6E1828',poesia2014:'#C4A44A'};
  var labs={clos2017:'#B89A55',helene2016:'#D4BC7A',poesia2014:'#C4A44A'};
  var ki=id.replace(/-/g,'');
  var cap=caps[ki]||'#2A2016';var lab=labs[ki]||'#C4A44A';
  var sw=Math.round(h*0.29);
  return '<svg viewBox="0 0 56 200" width="'+sw+'" height="'+h+'" xmlns="http://www.w3.org/2000/svg">'
    +'<path d="M19 68 Q15 82 14 102 L14 172 Q14 184 23 184 L33 184 Q42 184 42 172 L42 102 Q41 82 37 68 Z" fill="#14100C"/>'
    +'<path d="M22 54 Q20 62 19 68 L37 68 Q36 62 34 54 Z" fill="#1E1610"/>'
    +'<rect x="24" y="19" width="8" height="35" rx="1" fill="#14100C"/>'
    +'<rect x="23" y="11" width="10" height="14" rx="1.5" fill="'+cap+'"/>'
    +'<rect x="15.5" y="100" width="25" height="56" rx="1" fill="'+lab+'" opacity=".93"/>'
    +'<rect x="17" y="101.5" width="22" height="53" rx=".5" fill="none" stroke="rgba(255,255,255,.3)" stroke-width=".6"/>'
    +'<text x="28" y="119" text-anchor="middle" fill="rgba(255,255,255,.7)" font-size="4.5" font-family="Georgia,serif" font-style="italic">Poesía</text>'
    +'<line x1="20" y1="124" x2="36" y2="124" stroke="rgba(255,255,255,.35)" stroke-width=".7"/>'
    +'<ellipse cx="28" cy="183" rx="14" ry="3" fill="rgba(0,0,0,.28)"/>'
    +'</svg>';
}

function observeFade(){
  const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');obs.unobserve(e.target);}});},{threshold:.1});
  document.querySelectorAll('.fi:not(.show)').forEach(el=>obs.observe(el));
}

/* ── WINES ── */
function renderWines(){
  const {wines}=getData();const g=document.getElementById('vinsGrid');if(!g)return;
  let h='';
  wines.forEach((w,i)=>{
    const p=calcPrix(w);const hr=w.reduction>0;
    h+=`<div class="wcard fi${i?' d'+i:''}" data-wine-id="${w.id}">
      <div class="wc-vin">${w.millesime}</div>
      <div class="wc-nm">${w.nom}</div>
      <div class="wc-bod">${w.bodega}</div>
      <div class="wc-bot">${bottleSVG(w.id)}</div>
      <p class="wc-desc">${w.description}</p>
      <div class="wc-ft">
        <div class="wc-px">
          ${hr?`<span class="wc-px-old">${w.prix} €</span>`:''}${p} €
          <span class="wc-px-lbl">TTC / bouteille</span>
        </div>
        <button class="btn-add" data-add-id="${w.id}">+ Ajouter</button>
      </div>
    </div>`;
  });
  h+=`<div class="wsoon fi d3">
    <span class="soon-b">Prochainement</span>
    <h3>Gualtallary Wines</h3>
    <div class="sr">Gualtallary, Valle de Uco</div>
    <svg viewBox="0 0 80 50" width="55" height="35" fill="none" class="soon-icon">
      <path d="M40 5 L10 43 L70 43 Z" stroke="var(--charbon)" stroke-width="1.5"/>
    </svg>
    <p>Notre prochaine sélection, depuis les hauteurs de Gualtallary. Altitude, expression minérale unique.</p>
  </div>`;
  g.innerHTML=h;
  g.querySelectorAll('[data-wine-id]').forEach(card=>{
    card.addEventListener('click',()=>openModal(card.dataset.wineId));
  });
  g.querySelectorAll('[data-add-id]').forEach(btn=>{
    btn.addEventListener('click',(event)=>{
      event.stopPropagation();
      addToCart(btn.dataset.addId);
    });
  });
  observeFade();
}

/* ── MODAL ── */
let curW=null;
function openModal(id){
  const w=getData().wines.find(x=>x.id===id);if(!w)return;curW=w;
  document.getElementById('mVin').textContent=`${w.millesime} · ${w.appellation}`;
  document.getElementById('mNm').textContent=w.nom;
  document.getElementById('mDesc').textContent=w.description;
  const p=calcPrix(w);const hr=w.reduction>0;
  document.getElementById('mPx').innerHTML=`${hr?`<span class="m-px-old">${w.prix} €</span>`:''}${p} €`;
  document.getElementById('mBot').innerHTML=bottleSVG(w.id,220);
  const specs=[{l:'Cépages',v:w.cepages},{l:'Superficie',v:w.superficie},{l:'Sol',v:w.sol},{l:'Fermentation',v:w.fermentation},{l:'Élevage',v:w.elevage},{l:'Garde',v:w.garde}];
  document.getElementById('mSpecs').innerHTML=specs.map(s=>`<div class="msp"><div class="msl">${s.l}</div><div class="msv">${s.v}</div></div>`).join('');
  const sc=SCORES[id]||[];
  document.getElementById('mScores').innerHTML=sc.map(s=>`<div class="score-it"><div class="score-pts">${s.pts}<sup>pts</sup></div><div class="score-src">${s.src}</div></div>`).join('');
  document.getElementById('wineModal').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeModal(){document.getElementById('wineModal').classList.remove('open');document.body.style.overflow='';}
document.getElementById('modalCl').addEventListener('click', closeModal);
document.getElementById('wineModal').addEventListener('click', e=>{if(e.target===e.currentTarget)closeModal();});
document.getElementById('mAdd').addEventListener('click', ()=>{if(curW)addToCart(curW.id);});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

/* ── DÉGUSTATIONS ── */
function renderDeg(tab='upcoming'){
  const {degustations}=getData();const now=new Date();
  const list=document.getElementById('degList');if(!list)return;
  const items=degustations.filter(d=>{
    const dt=new Date(d.date);
    return tab==='upcoming'?(dt>=now&&!d.passee):(dt<now||d.passee);
  }).sort((a,b)=>new Date(a.date)-new Date(b.date));
  if(!items.length){list.innerHTML=`<div class="deg-empty">Aucun événement ${tab==='upcoming'?'à venir':'passé'}.</div>`;return;}
  list.innerHTML=items.map(d=>{
    const dt=new Date(d.date);
    return `<div class="ditem">
      <div class="ddate"><div class="dday">${dt.getDate()}</div><div class="dmon">${MN[dt.getMonth()]} ${dt.getFullYear()}</div></div>
      <div class="dinfo"><h3>${d.titre}</h3><div class="dmeta"><span>⏱ ${d.heure}</span><span>📍 ${d.lieu}</span></div></div>
      ${tab==='upcoming'?(d.url?`<a href="${d.url}" class="btn-or">S'inscrire</a>`:`<span class="btn-or disabled">Sur invitation</span>`):''}
    </div>`;
  }).join('');
}
document.querySelectorAll('.dtab').forEach(b=>{
  b.addEventListener('click', function(){
    document.querySelectorAll('.dtab').forEach(x=>x.classList.remove('active'));
    this.classList.add('active');renderDeg(this.dataset.tab);
  });
});

/* ── CHRONIQUES ── */
function renderChron(){
  const {chroniques}=getData();const g=document.getElementById('chronGrid');if(!g)return;
  const syms=['◈','△','∾'];
  g.innerHTML=chroniques.slice(0,3).map((c,i)=>`
    <a href="/chroniques#${c.id}" class="ccard fi${i?' d'+i:''}">
      <div class="cimg"><div class="cimg-ph">${syms[i]||'◈'}</div></div>
      <div class="ccat">${c.categorie}</div>
      <div class="ctit">${c.titre}</div>
      <p class="cres">${c.resume}</p>
      <div class="cdat">${fmtDate(c.date)}</div>
    </a>`).join('');
  observeFade();
}
function fmtDate(s){return new Date(s).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});}

/* ── NAV + CART ── */
const navEl=document.getElementById('nav');
window.addEventListener('scroll',()=>{navEl.classList.toggle('scrolled',window.scrollY>50);});
updateBadge();

/* ── INIT ── */
renderWines();
renderDeg('upcoming');
renderChron();
observeFade();

/* ── MORE LISTENERS ── */
document.getElementById('cartBtn').addEventListener('click',function(e){
  e.preventDefault();
  window.location.href='/commande';
});
