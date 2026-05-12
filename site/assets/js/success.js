// Vide le panier local maintenant que le paiement est confirmé
try {
  var STORE = 'andivino_v1';
  var raw = localStorage.getItem(STORE);
  if (raw) {
    var d = JSON.parse(raw);
    d.cart = [];
    localStorage.setItem(STORE, JSON.stringify(d));
  }
} catch (e) {}

// Recupere la reference PaymentIntent renvoyee par le paiement integre.
var params = new URLSearchParams(window.location.search);
var sid = params.get('payment_intent');
if (sid) {
  document.getElementById('sessionRef').textContent = 'Référence : ' + sid;
}
