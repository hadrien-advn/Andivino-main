const STORE='andivino_v1';
const IMAGE_BASE_URL = new URL('../images/', document.currentScript.src).href;
const WINE_PAGES={'clos-2017':'clos-des-andes-2017','helene-2016':'cuvee-helene-2016','poesia-2014':'poesia-2014'};
const DEF={wines:[
  {id:'clos-2017',nom:'Clos des Andes',millesime:2017,prix:19,reduction:0,bodega:'Bodega Poesía',appellation:'Luján de Cuyo, Mendoza',cepages:'100% Malbec — Vendanges manuelles',superficie:'2 ha plantés en 1935',sol:'Sablo-argileux',fermentation:'Inox et fûts de chêne',elevage:'10 à 12 mois',garde:'15 ans',dispo:true,description:"Le Clos des Andes dévoile un bouquet ample et expressif, marqué par des arômes de cerise noire mûre et de cassis, relevés d'une subtile note de chocolat noir."},
  {id:'helene-2016',nom:'Poésía — Cuvée Hélène',millesime:2016,prix:35,reduction:0,bodega:'Bodega Poesía',appellation:'Luján de Cuyo, Mendoza',cepages:'60% Malbec — 40% Cabernet Sauvignon',superficie:'1 ha planté en 1935',sol:'Sablo-argileux',fermentation:'Inox et fûts de chêne',elevage:'16 à 18 mois',garde:'25 ans',dispo:true,description:"D'une robe rouge sombre et brillante, le vin offre un nez subtil et complexe de framboise noire, moka et espresso."},
  {id:'poesia-2014',nom:'Poésía',millesime:2014,prix:38,reduction:0,bodega:'Bodega Poesía',appellation:'Luján de Cuyo, Mendoza',cepages:'60% Malbec — 40% Cabernet Sauvignon',superficie:'13 ha plantés en 1935',sol:'Sablo-argileux',fermentation:'Inox et fûts de chêne',elevage:'18 à 24 mois',garde:'25 ans',dispo:true,description:"Poésía s'exprime avec distinction et profondeur à travers une robe rouge rubis intense."}
],degustations:[],chroniques:[],cart:[]};

function getData(){try{const r=localStorage.getItem(STORE);if(!r)return JSON.parse(JSON.stringify(DEF));const d=JSON.parse(r);return{wines:d.wines||DEF.wines,degustations:d.degustations||[],chroniques:d.chroniques||[],cart:d.cart||[]};}catch(e){return JSON.parse(JSON.stringify(DEF));}}
function saveData(d){try{localStorage.setItem(STORE,JSON.stringify(d));}catch(e){}}
if(!localStorage.getItem(STORE))saveData(JSON.parse(JSON.stringify(DEF)));
function calcPrix(w){if(!w.reduction)return w.prix;return parseFloat((w.prix*(1-w.reduction/100)).toFixed(2));}
function getCart(){return getData().cart||[];}
function saveCart(c){const d=getData();d.cart=c;saveData(d);}

function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.style.opacity='1';setTimeout(()=>t.style.opacity='0',2400);}

var BOTTLE_IMGS={
  'clos-2017': IMAGE_BASE_URL + 'bout-cda.png',
  'helene-2016': IMAGE_BASE_URL + 'cuvee-h.png',
  'poesia-2014': IMAGE_BASE_URL + 'bout-poesia.png'
};
function bottleSVG(id,h){
  if(!h)h=100;
  // ── Images réelles ──
  var imgs=BOTTLE_IMGS;
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
    +'<ellipse cx="28" cy="183" rx="14" ry="3" fill="rgba(0,0,0,.28)"/>'
    +'</svg>';
}

// quantities (per-product, separate from persistent cart)
const QTY = {};

function renderProducts(){
  const {wines}=getData();
  const cart=getCart();
  // init QTY from cart
  cart.forEach(ci=>{QTY[ci.id]=ci.qty;});
  const list=document.getElementById('prodList');if(!list)return;
  list.innerHTML=wines.map(w=>{
    const p=calcPrix(w);const hr=w.reduction>0;const qty=QTY[w.id]||0;
    return `<div class="prod-item" id="pi-${w.id}">
      <div class="prod-bottle">${bottleSVG(w.id,100)}</div>
      <div class="prod-info">
        <div class="pv">${w.millesime}${hr?`<span class="badge-promo">-${w.reduction}%</span>`:''}</div>
        <div class="pn">${w.nom}</div>
        <div class="pb">${w.bodega}</div>
        <div class="pd">${w.description}</div>
        <a class="pf-link" href="/vins/${WINE_PAGES[w.id]}/" target="_blank" rel="noopener">Fiche produit détaillée →</a>
      </div>
      <div class="prod-right">
        <div class="prod-px">
          ${hr?`<span class="prod-px-old">${w.prix} €</span>`:''}
          <div class="prod-px-val">${p} €</div>
          <span class="prod-px-lbl">TTC / btl</span>
        </div>
        <div class="qty-ctrl">
          <button class="qty-btn" data-wine-id="${w.id}" data-delta="-1">−</button>
          <span class="qty-val" id="qv-${w.id}">${qty}</span>
          <button class="qty-btn" data-wine-id="${w.id}" data-delta="1">+</button>
        </div>
      </div>
    </div>`;
  }).join('');
  list.querySelectorAll('.qty-btn').forEach(btn=>{
    btn.addEventListener('click',()=>changeQty(btn.dataset.wineId, parseInt(btn.dataset.delta,10)));
  });
  updateCart();
}

function changeQty(id,delta){
  QTY[id]=(QTY[id]||0)+delta;
  if(QTY[id]<0)QTY[id]=0;
  document.getElementById('qv-'+id).textContent=QTY[id];
  // save to cart
  const c=[];
  const {wines}=getData();
  wines.forEach(w=>{if(QTY[w.id]>0)c.push({id:w.id,qty:QTY[w.id]});});
  saveCart(c);
  updateCart();
  resetPaymentElement();
}

function updateCart(){
  const {wines}=getData();const c=getCart();
  const lines=document.getElementById('cartLines');
  const totalEl=document.getElementById('cartTotal');
  if(!c.length){
    lines.innerHTML='<div class="cart-empty-msg">Votre panier est vide</div>';
    if(totalEl)totalEl.textContent='0 €';
    document.getElementById('btnCheckout').disabled=true;
    updateShippingPrices();
    updateGrandTotal();
    return;
  }
  let total=0;
  lines.innerHTML=c.map(ci=>{
    const w=wines.find(x=>x.id===ci.id);if(!w)return'';
    const p=calcPrix(w);const sub=parseFloat((p*ci.qty).toFixed(2));total+=sub;
    return `<div class="cart-line"><span>${ci.qty}× <span class="cn">${w.nom}</span></span><span class="cpx">${sub.toFixed(2)} €</span></div>`;
  }).join('');
  if(totalEl)totalEl.textContent=total.toFixed(2)+' €';
  updateShippingPrices();
  updateGrandTotal();
  document.getElementById('btnCheckout').disabled=false;
}

// ── LIVRAISON ──
var selectedLiv = null;

// Tarifs livraison selon nb bouteilles total
function shippingCost(mode, nbBottles) {
  if (mode === 'degustation') return 0;
  if (mode === 'main-propre') return 5;
  var tiers = {
    'colissimo':    [{max:3,price:9.90},{max:6,price:12.90},{max:99,price:16.90}],
    'mondial-relay':[{max:3,price:7.90},{max:6,price:10.90},{max:99,price:14.90}]
  };
  var t = tiers[mode];
  if (!t) return 0;
  for (var i = 0; i < t.length; i++) {
    if (nbBottles <= t[i].max) return t[i].price;
  }
  return t[t.length-1].price;
}

function nbBottlesInCart() {
  return getCart().reduce(function(s,i){ return s + i.qty; }, 0);
}

function updateShippingPrices() {
  var nb = nbBottlesInCart();
  ['colissimo','mondial-relay'].forEach(function(mode) {
    var cost = shippingCost(mode, nb);
    var id = mode === 'colissimo' ? 'priceColissimo' : 'priceMondialRelay';
    var el = document.getElementById(id);
    if (el) el.textContent = cost.toFixed(2).replace('.',',') + ' €';
  });
}

function selectLiv(el) {
  if (el.classList.contains('disabled')) return;
  document.querySelectorAll('.liv-opt').forEach(function(o){ o.classList.remove('selected'); });
  el.classList.add('selected');
  selectedLiv = el.getAttribute('data-mode');
  updateGrandTotal();
  resetPaymentElement();
}
document.querySelectorAll('.liv-opt').forEach(function(el){
  el.addEventListener('click', function(){ selectLiv(el); });
});

function updateGrandTotal() {
  var wines = getData().wines;
  var c = getCart();
  var sub = c.reduce(function(s, ci) {
    var w = wines.find(function(x){ return x.id === ci.id; });
    return s + (w ? calcPrix(w) * ci.qty : 0);
  }, 0);
  var nb = nbBottlesInCart();
  var ship = selectedLiv ? shippingCost(selectedLiv, nb) : null;
  var grandTotal = ship !== null ? sub + ship : sub;

  var shipEl = document.getElementById('cartShipping');
  var grandEl = document.getElementById('cartGrandTotal');
  var noteEl  = document.getElementById('cartSubNote');

  if (shipEl) shipEl.textContent = ship === null ? '—' : (ship === 0 ? 'Gratuit' : ship.toFixed(2).replace('.',',') + ' €');
  if (grandEl) grandEl.textContent = (ship !== null ? grandTotal : sub).toFixed(2).replace('.',',') + ' €';
  if (noteEl)  noteEl.textContent  = ship === null ? 'Sélectionnez un mode de livraison.' : '';
}

// IDF detection on postal code change
document.addEventListener('DOMContentLoaded', function() {
  var cpInput = document.getElementById('f-cp');
  if (cpInput) {
    cpInput.addEventListener('input', function() {
      var cp = this.value.trim();
      var idfDepts = ['75','92','93','94'];
      var isIDF = idfDepts.some(function(d){ return cp.startsWith(d); });
      var livIDF  = document.getElementById('livIDF');
      var idfNote = document.getElementById('idfNote');
      if (livIDF) livIDF.classList.toggle('disabled', !isIDF);
      if (idfNote) idfNote.classList.toggle('visible', cp.length >= 2 && !isIDF);
      // Si IDF désactivé et c'est le mode sélectionné, deselect
      if (!isIDF && selectedLiv === 'main-propre') {
        document.querySelectorAll('.liv-opt').forEach(function(o){ o.classList.remove('selected'); });
        selectedLiv = null;
        updateGrandTotal();
        checkForm();
      }
    });
  }
  updateShippingPrices();
});

// ── FORM VALIDATION ──
['f-prenom','f-nom','f-email','f-adresse','f-cp','f-ville'].forEach(id=>{
  const el=document.getElementById(id);if(!el)return;
  el.addEventListener('input',checkForm);
});
function checkForm(){
  document.getElementById('btnCheckout').disabled=!isCheckoutReady();
}
function isCheckoutReady(){
  const ok=['f-prenom','f-nom','f-email','f-adresse','f-cp','f-ville'].every(id=>{
    const el=document.getElementById(id);return el&&el.value.trim().length>0;
  });
  const hasItems=getCart().length>0;
  const hasLiv=selectedLiv!==null;
  return ok&&hasItems&&hasLiv;
}

// ── STRIPE PAYMENT ELEMENT ──
var API_BASE_URL = ((window.ANDIVINO_CONFIG || {}).apiBaseUrl || '').replace(/\/+$/, '');
var stripeInstance = null;
var stripeElements = null;
var paymentElement = null;
var clientSecret = null;
var paymentReady = false;

function apiUrl(path) {
  return API_BASE_URL + path;
}

function setCheckoutButton(label, disabled) {
  var btn = document.getElementById('btnCheckout');
  btn.disabled = !!disabled;
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> ' + label;
}

function resetPaymentElement() {
  paymentReady = false;
  clientSecret = null;
  if (paymentElement) {
    paymentElement.unmount();
    paymentElement = null;
  }
  stripeElements = null;
  var wrap = document.getElementById('paymentWrap');
  if (wrap) wrap.hidden = true;
  setCheckoutButton('Préparer le paiement sécurisé', !isCheckoutReady());
}

function collectCustomer() {
  return {
    prenom:  document.getElementById('f-prenom').value.trim(),
    nom:     document.getElementById('f-nom').value.trim(),
    email:   document.getElementById('f-email').value.trim(),
    tel:     document.getElementById('f-tel').value.trim(),
    adresse: document.getElementById('f-adresse').value.trim(),
    cp:      document.getElementById('f-cp').value.trim(),
    ville:   document.getElementById('f-ville').value.trim(),
    message: document.getElementById('f-message').value.trim()
  };
}

async function ensureStripe() {
  if (stripeInstance) return stripeInstance;
  if (!window.Stripe) throw new Error('Stripe.js est indisponible.');

  var res = await fetch(apiUrl('/api/stripe-config'));
  var data = await res.json();
  if (!res.ok || !data.publishableKey) {
    throw new Error(data.error || 'Configuration Stripe indisponible.');
  }
  stripeInstance = Stripe(data.publishableKey);
  return stripeInstance;
}

async function preparePayment() {
  var cart = getCart();
  var customer = collectCustomer();
  if (!cart.length) throw new Error('Panier vide.');
  if (!selectedLiv) throw new Error('Choisissez un mode de livraison.');
  if (!customer.prenom || !customer.nom || !customer.email || !customer.adresse || !customer.cp || !customer.ville) {
    throw new Error('Remplissez les champs obligatoires.');
  }

  var stripe = await ensureStripe();
  var res = await fetch(apiUrl('/api/create-payment-intent'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cart: cart,
      shipping: selectedLiv,
      customer: customer
    })
  });
  var data = await res.json();
  if (!res.ok || !data.clientSecret) {
    throw new Error(data.error || 'Impossible de preparer le paiement.');
  }

  clientSecret = data.clientSecret;
  stripeElements = stripe.elements({
    clientSecret: clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#6E1828',
        colorText: '#3C3835',
        colorDanger: '#C0392B',
        borderRadius: '2px',
        fontFamily: 'DM Sans, system-ui, sans-serif'
      }
    }
  });

  if (paymentElement) paymentElement.unmount();
  paymentElement = stripeElements.create('payment');
  paymentElement.mount('#payment-element');
  document.getElementById('paymentWrap').hidden = false;
  paymentReady = true;
  setCheckoutButton('Payer maintenant', false);
}

async function confirmEmbeddedPayment() {
  var stripe = await ensureStripe();
  var result = await stripe.confirmPayment({
    elements: stripeElements,
    confirmParams: {
      return_url: window.location.origin + '/paiement/success'
    },
    redirect: 'if_required'
  });

  if (result.error) {
    throw new Error(result.error.message || 'Le paiement a echoue.');
  }

  if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
    saveCart([]);
    window.location.href = '/paiement/success?payment_intent=' + encodeURIComponent(result.paymentIntent.id);
    return;
  }

  if (result.paymentIntent && result.paymentIntent.status === 'processing') {
    saveCart([]);
    window.location.href = '/paiement/success?payment_intent=' + encodeURIComponent(result.paymentIntent.id);
    return;
  }

  throw new Error('Paiement non confirme. Merci de verifier les informations saisies.');
}

document.addEventListener('DOMContentLoaded', function() {
  renderProducts();
  checkForm();
});

document.getElementById('btnCheckout').addEventListener('click', async function() {
  document.getElementById('card-errors').textContent = '';
  setCheckoutButton(paymentReady ? 'Paiement en cours…' : 'Préparation…', true);

  try {
    if (!paymentReady) {
      await preparePayment();
      return;
    }
    await confirmEmbeddedPayment();
  } catch (err) {
    document.getElementById('card-errors').textContent = err.message;
    showToast('⚠ ' + err.message);
    setCheckoutButton(paymentReady ? 'Payer maintenant' : 'Préparer le paiement sécurisé', false);
  }
});

['f-prenom','f-nom','f-email','f-tel','f-adresse','f-cp','f-ville','f-message'].forEach(id=>{
  const el=document.getElementById(id);if(!el)return;
  el.addEventListener('input', resetPaymentElement);
});
