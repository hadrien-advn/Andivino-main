// Domaines importés : pages /vins/<domaine> (lib/product-page.js, renderDomainPage) et rattachement des cuvées.
// Faits repris du catalogue Andivino 2026 et de la page d'accueil ; ne rien ajouter qui n'y figure pas.
// Champs « html » : HTML de confiance, inséré tel quel. aVenir : cuvées annoncées dont la fiche n'existe pas encore.

const DOMAINES = {
  'bodega-poesia': {
    slug: 'bodega-poesia',
    nom: 'Bodega Poesía',
    appellation: 'Luján de Cuyo',
    region: 'Mendoza',
    pays: 'AR',
    lieu: 'Luján de Cuyo, Mendoza',
    schemaId: 'https://andivino.fr/#bodega-poesia',
    page: '/vins/bodega-poesia',
    maj: '2026-11-14',
    degustationHtml: 'servi avec les deux autres cuvées de la Bodega Poesía lors de notre <a href="/degustation">dégustation de vins argentins à Paris</a>',
    seo: {
      title: 'Bodega Poesía, vins de Luján de Cuyo (Mendoza) | Andivino',
      description: 'La Bodega Poesía, à Luján de Cuyo : 13 ha de Malbec et Cabernet Sauvignon plantés en 1935 en franc de pied, à 900 m. Clos des Andes, Cuvée Hélène, Poesía.'
    },
    accroche: 'Vignes de 1935 en franc de pied, à 900 mètres',
    leadHtml: "La <strong>Bodega Poesía</strong> est un domaine de Luján de Cuyo, dans la province de Mendoza (Argentine)&nbsp;: 13 hectares de Malbec et de Cabernet Sauvignon plantés en 1935 en franc de pied, à 900 mètres d'altitude. Andivino importe trois de ses vins en France&nbsp;: Clos des Andes 2017, la Cuvée Hélène 2016 et Poesía 2014.",
    image: { src: '/assets/images/poarg3.webp', width: 1800, height: 1200, alt: 'Vignes de Malbec de la Bodega Poesía, à Luján de Cuyo (Mendoza)' },
    galerie: [
      { src: '/assets/images/poarg1.webp', width: 1800, height: 1200, alt: 'Chai et installations de la Bodega Poesía, Mendoza' }
    ],
    faits: [
      ['Appellation', 'Luján de Cuyo (Primera Zona)'],
      ['Altitude', '900 m'],
      ['Superficie', '13 ha'],
      ['Vignes', 'Plantées en 1935, franc de pied'],
      ['Sol', 'Sablo-argileux sur graves'],
      ['Culture', 'Biocontrôle'],
      ['Vendanges', 'Manuelles'],
      ['Production', 'Environ 13 000 bouteilles par an']
    ],
    sections: [
      {
        titre: 'Le domaine',
        html: [
          "Née en 2000 d'une rencontre entre passion bordelaise et terroir argentin, la Bodega Poesía est établie dans la Primera Zona de Luján de Cuyo, première appellation d'origine officiellement reconnue en Amérique latine. Ses vieilles vignes, parmi les plus anciennes de la région, donnent un vin confidentiel&nbsp;: à peine 13&nbsp;000 bouteilles par an, saluées par Wine Advocate et James Suckling."
        ]
      },
      {
        titre: 'Le terroir',
        html: [
          "Le Malbec et le Cabernet Sauvignon poussent sur un sol sablo-argileux posé sur un sous-sol de graves, qui assure un drainage optimal et donne de la profondeur au vin. Les vignes, plantées en 1935 en franc de pied, s'épanouissent face à l'Aconcagua et à ses neiges éternelles, entre des oliviers bicentenaires, avec les contrastes thermiques du piedmont andin."
        ]
      },
      {
        titre: 'À la vigne et au chai',
        html: [
          "La vigne est conduite en biocontrôle et vendangée entièrement à la main, avec une sélection parcelle par parcelle. Les barriques, foudres et cuves en inox ont été importés d'Europe par les fondateurs, avec la même exigence qu'à Bordeaux. La philosophie est simple&nbsp;: laisser le terroir parler."
        ]
      }
    ],
    aVenir: []
  },

  'carmelo-patti': {
    slug: 'carmelo-patti',
    nom: 'Carmelo Patti',
    appellation: 'Luján de Cuyo',
    region: 'Mendoza',
    pays: 'AR',
    lieu: 'Perdriel, Luján de Cuyo, Mendoza',
    schemaId: 'https://andivino.fr/#carmelo-patti',
    page: '/vins/carmelo-patti',
    maj: '2026-11-14',
    seo: {
      title: 'Carmelo Patti, vins de garde de Luján de Cuyo | Andivino',
      description: 'Carmelo Patti, bodega de Perdriel (Luján de Cuyo) fondée en 1989 : levures indigènes, sans collage ni filtration. Malbec, Cabernet Sauvignon et Cabernet Franc.'
    },
    accroche: 'Un vigneron de garde, en exclusivité en France',
    leadHtml: "<strong>Carmelo Patti</strong> est une bodega de Perdriel, à Luján de Cuyo (Mendoza), fondée en 1989 par le vigneron du même nom. Ses vins, longuement élevés et libérés seulement lorsqu'il les juge prêts, comptent parmi les plus reconnus d'Argentine. Andivino les importe en exclusivité en France&nbsp;: Malbec 2019, Cabernet Sauvignon 2018 et Cabernet Franc 2021.",
    logo: { src: '/assets/images/logo-carmelo-patti.webp', width: 273, height: 320, alt: 'Blason de la bodega Carmelo Patti' },
    faits: [
      ['Lieu', 'Perdriel, Luján de Cuyo'],
      ['Fondation', '1989'],
      ['Altitude', '960 m'],
      ['Sol', 'Sablo-argileux'],
      ['Fermentation', 'Levures indigènes'],
      ['Élevage', 'Cuve béton, puis barriques majoritairement usées'],
      ['Mise en bouteille', 'Sans collage ni filtration'],
      ['Distinction', 'Élu meilleur Malbec du monde en 2007']
    ],
    sections: [
      {
        titre: 'Le vigneron',
        html: [
          "Né en Sicile et arrivé en Argentine enfant, Carmelo Patti est une figure majeure du vin de Mendoza. Il a été l'un des artisans du renouveau du vin de garde argentin avant de lancer sa propre bodega en 1989. Son Malbec a été élu meilleur Malbec du monde en 2007."
        ]
      },
      {
        titre: 'Une méthode qui n\'a pas changé',
        html: [
          "Levures indigènes, élevage en cuve béton puis en barriques majoritairement usées, mise en bouteille sans collage ni filtration&nbsp;: la méthode de Carmelo Patti n'a pas bougé depuis ses débuts. Il ne libère ses vins que lorsqu'il les juge prêts, souvent cinq ans après la récolte."
        ]
      },
      {
        titre: 'Le terroir',
        html: [
          "Les vignes poussent à 960 mètres d'altitude à Perdriel, au cœur de Luján de Cuyo, sur un sol sablo-argileux. Les vins qui en naissent sont faits pour durer&nbsp;: de 30 à 35 ans de garde selon les cuvées."
        ]
      }
    ],
    aVenir: [
      { nom: 'Carmelo Patti Malbec', millesime: 2019, cepages: '100 % Malbec', prix: 3200 },
      { nom: 'Carmelo Patti Cabernet Sauvignon', millesime: 2018, cepages: '100 % Cabernet Sauvignon', prix: 3400 },
      { nom: 'Carmelo Patti Cabernet Franc', millesime: 2021, cepages: '100 % Cabernet Franc', prix: 3200 }
    ]
  },

  'gualtallary-wines': {
    slug: 'gualtallary-wines',
    nom: 'Gualtallary Wines',
    appellation: 'Valle de Uco',
    region: 'Mendoza',
    pays: 'AR',
    lieu: 'Tupungato, Valle de Uco, Mendoza',
    schemaId: 'https://andivino.fr/#gualtallary-wines',
    page: '/vins/gualtallary-wines',
    maj: '2026-11-14',
    seo: {
      title: 'Gualtallary Wines, vins d\'altitude de la Valle de Uco | Andivino',
      description: 'Gualtallary Wines, à Tupungato (Valle de Uco, Mendoza) : vignes de 1250 à 1600 m sur sols alluviaux calcaires, conseil Alberto Antonini. Torrontés, Malbec, Chardonnay.'
    },
    accroche: 'Vins d\'altitude, tendus et salins',
    leadHtml: "<strong>Gualtallary Wines</strong> est un domaine de Tupungato, dans la Valle de Uco (Mendoza), dont les vignes s'étagent entre 1250 et 1600 mètres d'altitude. Ses vins, tendus et salins, sont vinifiés par Macarena Giménez avec les conseils d'Alberto Antonini. Andivino importe trois de ses vins en France&nbsp;: Altus Torrontés 2026, Altus Malbec 2026 et Gran Chardonnay 2024.",
    image: { src: '/assets/images/banque/entree-gualtallary-wines-volcan-tupungato.webp', width: 2000, height: 1333, alt: "Panneau Gualtallary Wines à l'entrée du domaine, sommet enneigé des Andes au fond" },
    logo: { src: '/assets/images/logo-gualtallary.webp', width: 363, height: 320, alt: 'Logo de Gualtallary Wines' },
    galerie: [
      { src: '/assets/images/banque/poteaux-vigne-sommet-enneige-aube.webp', width: 2000, height: 1178, alt: "Poteaux de palissage dans les vignes de Gualtallary, sommet enneigé rosi par l'aube" },
      { src: '/assets/images/banque/alberto-antonini-degustation-cuverie.webp', width: 2000, height: 1333, alt: 'Alberto Antonini, conseil de Gualtallary Wines, en dégustation dans la cuverie' }
    ],
    faits: [
      ['Lieu', 'Gualtallary, Tupungato, Valle de Uco'],
      ['Altitude', '1250 à 1600 m'],
      ['Sols', 'Alluviaux, riches en carbonate de calcium'],
      ['Vignoble', 'Plus de 100 ha en propriété'],
      ['Conduite', 'En espalier'],
      ['Culture', 'En conversion biologique'],
      ['Vinification', 'Macarena Giménez'],
      ['Conseil', 'Alberto Antonini']
    ],
    sections: [
      {
        titre: 'Le terroir de Gualtallary',
        html: [
          "Gualtallary incarne le front pionnier de la viticulture argentine, sur l'un des secteurs les plus prisés de Mendoza, juste en face des parcelles de Catena Zapata. L'altitude et les sols alluviaux, à forte teneur en carbonate de calcium, y donnent des vins tendus, salins, à l'acidité franche&nbsp;: un profil qui tranche avec le Malbec solaire auquel l'Argentine est souvent réduite."
        ]
      },
      {
        titre: 'Le domaine',
        html: [
          "Le domaine compte plus de 100 hectares de vignoble en propriété, conduits en espalier, et s'est engagé dans la conversion en viticulture biologique."
        ]
      },
      {
        titre: 'Au chai',
        html: [
          "La vinification est signée Macarena Giménez, épaulée par les conseils du vigneron italien Alberto Antonini, référence internationale de la viticulture d'altitude."
        ]
      }
    ],
    aVenir: [
      { nom: 'Altus Torrontés', millesime: 2026, cepages: '100 % Torrontés', prix: 1500 },
      { nom: 'Altus Malbec', millesime: 2026, cepages: '100 % Malbec', prix: 1500 },
      { nom: 'Gran Chardonnay', millesime: 2024, cepages: '100 % Chardonnay', prix: 2400 }
    ]
  }
};

module.exports = { DOMAINES };
