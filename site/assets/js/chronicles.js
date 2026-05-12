const STORE='andivino_v1';
const DEF_CHRON=[
  {id:'c1',titre:'Mendoza vue de l\'intérieur : comprendre le terroir andin',categorie:'Terroir',date:'2025-01-10',resume:'À 900 mètres d\'altitude, entre sol sablo-argileux et sous-sol de graviers, la Bodega Poesía produit des vins d\'une minéralité rare. Voyage géologique au cœur de la Primera Zona.',contenu:'<p>Le terroir de Mendoza est singulier. À l\'ouest, la Cordillère des Andes agit comme un mur climatique naturel. L\'air y est rare, le ciel intense, et les contrastes thermiques entre jour et nuit atteignent parfois 20°C d\'écart. C\'est dans ce contexte extrême que la Bodega Poesía cultive ses vignes depuis 1935.</p><p>Le sol sablo-argileux de Luján de Cuyo est l\'un des plus singuliers de Mendoza. Les particules argileuses retiennent l\'humidité comme une éponge, tandis que le sous-sol de graviers grossiers assure un drainage naturel optimal. Résultat : les racines plongent profondément, puisant minéralité et complexité dans les profondeurs.</p><p><strong>La Primera Zona</strong> est la première appellation d\'origine officiellement reconnue en Amérique du Sud. Elle regroupe les domaines autour de Luján de Cuyo, à des altitudes comprises entre 800 et 1 050 mètres. L\'Aconcagua, point culminant des Andes, veille sur ces vignes depuis des décennies.</p><p>Les vignes de la Bodega Poesía, plantées en 1935 en <em>franc de pied</em>, n\'ont jamais été greffées sur porte-greffe américain — un privilège rare que peu de vignobles au monde peuvent encore revendiquer. Leur système racinaire, profond et mature, produit naturellement des rendements faibles et des raisins d\'une concentration exceptionnelle.</p>'},
  {id:'c2',titre:'Malbec & Cabernet : le grand assemblage argentin',categorie:'Éducation',date:'2025-02-14',resume:'Pourquoi associer le Malbec local au Cabernet bordelais ? La Bodega Poesía révèle sa philosophie d\'assemblage, héritée directement des Grands Crus de Bordeaux.',contenu:'<p>L\'assemblage Malbec-Cabernet Sauvignon est au cœur de l\'identité de Bodega Poesía. Le <strong>Malbec</strong> apporte la profondeur de couleur, la rondeur du fruit, les tanins soyeux caractéristiques de Mendoza. Le <strong>Cabernet Sauvignon</strong>, lui, structure la finale et lui confère une longueur inégalée.</p><p>Cette philosophie est directement héritée de l\'expérience bordelaise des fondateurs. Mais à Mendoza, à 900 mètres d\'altitude, ces cépages européens trouvent une expression radicalement différente — plus lumineuse, plus concentrée, avec une fraîcheur inattendue à cette latitude.</p><h3>Le rôle du Malbec</h3><p>Cépage emblématique de l\'Argentine, le Malbec a trouvé à Mendoza un terroir d\'adoption qui l\'exprime mieux que nulle part ailleurs, y compris dans son Cahors natal. Le sol sablo-argileux de Luján de Cuyo lui confère rondeur et profondeur, tandis que l\'altitude préserve sa fraîcheur aromatique.</p><h3>La contribution du Cabernet Sauvignon</h3><p>Dans l\'assemblage de la Bodega Poesía, le Cabernet Sauvignon représente 40% de la cuvée Poésía. Il apporte structure, tannins fins et longueur en bouche. Son élevage en fûts de chêne (18 à 24 mois) lui permet de s\'intégrer harmonieusement au Malbec, sans jamais le dominer.</p>'},
  {id:'c3',titre:'Trois Français aux vendanges : le récit de Gaspard',categorie:'Reportage',date:'2025-03-01',resume:'Gaspard, Esteban et Hadrien racontent leurs premières vendanges à Luján de Cuyo. Une expérience fondatrice, sous le soleil de mars austral.',contenu:'<p>C\'était en été austral, sous un soleil de mars brûlant. Nous avions rejoint l\'équipe de la Bodega Poesía pour les vendanges manuelles — un travail précis, exigeant, et profondément humain.</p><p>Chaque grappe est sélectionnée à la main, parcelle par parcelle. Les vendangeurs, souvent les mêmes d\'une année sur l\'autre, connaissent les vignes mieux que personne. Il y a quelque chose de profondément juste dans cette façon de faire — lente, attentive, respectueuse du temps.</p><p>Ce séjour a changé notre rapport au vin. Il est devenu évident que ces bouteilles portaient quelque chose d\'irréductible : la mémoire d\'un terroir, le savoir-faire de mains précises, et l\'intensité d\'une lumière qu\'on ne trouve nulle part ailleurs. C\'est ce quelque chose que nous voulons transmettre avec Andivino.</p><p><em>Gaspard Cordeau, co-fondateur d\'Andivino</em></p>'}
];

function getData(){
  try{const r=localStorage.getItem(STORE);if(!r)return{chroniques:DEF_CHRON};
  const d=JSON.parse(r);return{chroniques:d.chroniques||DEF_CHRON};}
  catch(e){return{chroniques:DEF_CHRON};}
}
function fmtDate(s){return new Date(s).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});}

let currentCat='all';
const syms=['◈','△','∾','◇','⋄','⊕'];

function renderChron(){
  const {chroniques}=getData();
  const g=document.getElementById('chronGrid');if(!g)return;
  const filtered=currentCat==='all'?chroniques:chroniques.filter(c=>c.categorie===currentCat);
  if(!filtered.length){g.innerHTML='<div class="empty-chron">Aucune chronique dans cette catégorie.</div>';return;}
  g.innerHTML=filtered.map((c,i)=>`
    <div class="ccard" data-article-id="${c.id}">
      <div class="cimg${i===0?' feature':''}">
        <div class="cimg-ph">${syms[i%syms.length]}</div>
      </div>
      <div class="ccat">${c.categorie}</div>
      <div class="ctit${i===0&&currentCat==='all'?' cfeat':''}">${c.titre}</div>
      <p class="cres">${c.resume}</p>
      <div class="cdat">${fmtDate(c.date)}</div>
      <span class="clire">Lire l'article →</span>
    </div>`).join('');
  
  g.querySelectorAll('[data-article-id]').forEach(card=>{
    card.addEventListener('click',()=>openArticle(card.dataset.articleId));
  });

  // highlight if hash
  const hash=location.hash.replace('#','');
  if(hash){const el=filtered.find(c=>c.id===hash);if(el)setTimeout(()=>openArticle(hash),200);}
}

function openArticle(id){
  const {chroniques}=getData();
  const c=chroniques.find(x=>x.id===id);if(!c)return;
  document.getElementById('aCat').textContent=c.categorie;
  document.getElementById('aTitle').textContent=c.titre;
  document.getElementById('aMeta').textContent=fmtDate(c.date)+' · Andivino';
  document.getElementById('aBody').innerHTML=c.contenu;
  document.getElementById('artModal').classList.add('open');
  document.body.style.overflow='hidden';
  history.replaceState(null,'','#'+id);
}
function closeArticle(){
  document.getElementById('artModal').classList.remove('open');
  document.body.style.overflow='';
  history.replaceState(null,'',location.pathname);
}
document.getElementById('artCl').addEventListener('click', closeArticle);
document.getElementById('artModal').addEventListener('click', e=>{if(e.target===e.currentTarget)closeArticle();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeArticle();});

document.querySelectorAll('.cat-btn').forEach(b=>{
  b.addEventListener('click', function(){
    document.querySelectorAll('.cat-btn').forEach(x=>x.classList.remove('active'));
    this.classList.add('active');currentCat=this.dataset.cat;renderChron();
  });
});

document.addEventListener('DOMContentLoaded',renderChron);
