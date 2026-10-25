// Dégustations : source unique pour l'accueil, le retrait en dégustation de la commande et le serveur
// (data/catalog.js). La date de la prochaine dégustation s'affiche sur l'option de retrait.
(function (root) {
  var DEGUSTATIONS = [
    {id:'d1',titre:'Dégustation Poesía — VINO SAPIENS',date:'2026-05-19',heure:'19h00',lieu:'Paris 7e',adresse:'Adresse sur inscription',description:'Dégustation verticale des trois cuvées Bodega Poesía avec Gaspard, Esteban et Hadrien.',passee:true,url:null},
    {id:'d4',titre:'Dégustation Poesía — Marseille',date:'2026-02-09',heure:'19h00',lieu:'Marseille',adresse:'Adresse sur inscription',description:'Dégustation des cuvées Bodega Poesía à Marseille.',passee:true,url:null},
    {id:'d5',titre:'Asado Argentine — HEC Paris',date:'2026-04-21',heure:'19h00',lieu:'HEC Paris',adresse:'Adresse sur inscription',description:'Soirée asado argentin avec dégustation Andivino.',passee:true,url:null},
    {id:'d6',titre:'Dégustation HEC',date:'2026-04-28',heure:'19h00',lieu:'HEC Paris',adresse:'Adresse sur inscription',description:'Dégustation des cuvées Bodega Poesía à HEC Paris.',passee:true,url:null}
  ];

  function upcomingDegustations(now) {
    now = now || new Date();
    return DEGUSTATIONS
      .filter(function (d) { return !d.passee && new Date(d.date) >= now; })
      .sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
  }

  function fmtDateLong(s) {
    return new Date(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  // Conditions de livraison réelles, affichées partout où l'on peut commander. L'expédition par
  // transporteur est suspendue (voir SUSPENDED_SHIPPING_MODES dans data/catalog.js).
  function deliveryNoteHtml() {
    var next = upcomingDegustations()[0];
    var contact = '<a href="mailto:contact@andivino.fr">écrivez-nous</a>';
    if (next) {
      return 'Retrait gratuit à notre dégustation du ' + fmtDateLong(next.date) + ' (' + next.lieu + ') ou remise en main propre à Paris et petite couronne. Pas d\'expédition ailleurs pour l\'instant : ' + contact + '.';
    }
    return 'Retrait gratuit lors de notre prochaine dégustation ou remise en main propre à Paris et petite couronne. Pas d\'expédition ailleurs pour l\'instant : ' + contact + '.';
  }

  if (typeof module === 'object' && module.exports) {
    module.exports = { DEGUSTATIONS: DEGUSTATIONS, upcomingDegustations: upcomingDegustations };
    return;
  }

  root.ANDIVINO_DEGUSTATIONS = DEGUSTATIONS;
  root.andivinoUpcomingDegustations = upcomingDegustations;
  root.andivinoFmtDateLong = fmtDateLong;
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-delivery-note]').forEach(function (el) { el.innerHTML = deliveryNoteHtml(); });
  });
})(this);
