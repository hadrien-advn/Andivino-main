// Dégustations : source unique pour l'accueil, le retrait en dégustation de la commande et le serveur
// (data/catalog.js). La date de la prochaine dégustation s'affiche sur l'option de retrait.
(function (root) {
  // inscription : dégustation payante ouverte sur andivino.fr/degustation (prix en centimes TTC, places
  // au total). Une seule à la fois : la première à venir qui en a une.
  var DEGUSTATIONS = [
    {id:'d7',titre:'Dégustation Poesía & Torrontés — Vino Sapiens',date:'2026-12-07',heure:'19h30',lieu:'Paris 7e',adresse:'Cave Vino Sapiens, 145 rue Saint-Dominique, 75007 Paris',description:'Les trois cuvées Bodega Poesía et un Torrontés, présentés par Gaspard, Esteban et Hadrien.',passee:false,url:'/degustation',inscription:{prix:2500,places:15}},
    {id:'d1',titre:'Dégustation Poesía — VINO SAPIENS',date:'2026-05-19',heure:'19h00',lieu:'Paris 7e',adresse:'Adresse sur inscription',description:'Dégustation verticale des trois cuvées Bodega Poesía avec Gaspard, Esteban et Hadrien.',passee:true,url:null},
    {id:'d4',titre:'Dégustation Poesía — Marseille',date:'2026-02-09',heure:'19h00',lieu:'Marseille',adresse:'Adresse sur inscription',description:'Dégustation des cuvées Bodega Poesía à Marseille.',passee:true,url:null},
    {id:'d5',titre:'Asado Argentine — HEC Paris',date:'2026-04-21',heure:'19h00',lieu:'HEC Paris',adresse:'Adresse sur inscription',description:'Soirée asado argentin avec dégustation Andivino.',passee:true,url:null},
    {id:'d6',titre:'Dégustation HEC',date:'2026-04-28',heure:'19h00',lieu:'HEC Paris',adresse:'Adresse sur inscription',description:'Dégustation des cuvées Bodega Poesía à HEC Paris.',passee:true,url:null}
  ];

  function upcomingDegustations(now) {
    now = now || new Date();
    return DEGUSTATIONS
      // À venir jusqu'à la fin de la journée (heure de Paris, à une heure près) : la date est un jour, pas un instant.
      .filter(function (d) { return !d.passee && new Date(d.date + 'T23:59:59+01:00') >= now; })
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
    var retrait = next ? ', ou retrait gratuit à notre dégustation du ' + fmtDateLong(next.date) + ' (' + next.lieu + ')' : '';
    return 'Remise en main propre sous 7 jours à <a href="/vin-argentin-paris">Paris et petite couronne</a>' + retrait + '. Retour possible sous 14 jours (bouteilles non ouvertes). Pas d\'expédition ailleurs pour l\'instant : ' + contact + '.';
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
