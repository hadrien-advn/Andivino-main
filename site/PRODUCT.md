# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Principal : le particulier curieux.** Amateur de vin qui veut découvrir l'Argentine au-delà du Malbec de grande surface. Il arrive souvent par le réseau des fondateurs, une dégustation ou une recherche (« vin argentin », « Malbec Mendoza »). Il veut comprendre ce qu'il achète (terroir, cépages, histoire) avant de commander quelques bouteilles en ligne, pour lui ou pour offrir.

**Secondaire : les professionnels (CHR, cavistes).** Ils évaluent le sérieux de l'importateur et demandent les tarifs dédiés par email. Le site leur sert de vitrine crédible, pas de tunnel de commande.

## Product Purpose

Andivino importe et vend en France des vins argentins de Mendoza sélectionnés en direct auprès des domaines, en commençant par la Bodega Poesía (Luján de Cuyo). Le site raconte le terroir et l'histoire des fondateurs, présente les cuvées et permet de les commander en ligne avec paiement sécurisé.

**Succès à 12 mois :**
- des ventes en ligne régulières de particuliers (commande et paiement Stripe) ;
- de la notoriété organique : être trouvé sur les requêtes « vin argentin », « Malbec », « Mendoza ».

## Positioning

Ce qu'un autre importateur ne peut pas copier :
- **Le lien direct avec la Bodega Poesía** : vignes plantées en 1935 en franc de pied, Primera Zona de Luján de Cuyo, sélection faite sur place.
- **Des fondateurs qui ont vécu en Argentine** : Gaspard, Esteban et Hadrien, trois amis marqués par un échange universitaire à Buenos Aires. Un récit vrai, pas un négoce anonyme.
- **La rencontre physique** : des dégustations avec les fondateurs (Paris, Lyon, Marseille, écoles comme HEC) où l'on goûte avant d'acheter.

## Operating Context

- Parcours type : découverte (dégustation, réseau, recherche) → lecture du récit et des fiches vins → commande sur `/commande` → paiement Stripe intégré → confirmation par email.
- Modes de livraison : retrait lors d'une dégustation (gratuit), remise en main propre à Paris et petite couronne (75, 92, 93, 94), Colissimo, Mondial Relay.
- Les professionnels passent par email (contact@andivino.fr), hors du tunnel en ligne.
- Les dégustations sont annoncées sur Instagram ; le site liste les dates à venir et passées.
- Les chroniques (terroir, éducation, reportage) servent la compréhension et le référencement ; elles sont rédigées par les fondateurs.
- Un CRM interne séparé (andivino-crm) gère le suivi commercial ; il ne fait pas partie de ce site.

## Capabilities and Constraints

- **Site :** Node/Express (`server.js`), pages HTML statiques dans `pages/`, CSS et JS dans `assets/`, panier en `localStorage`, paiement Stripe Elements côté serveur. Une migration vers Cloudflare Pages (`scripts/build-pages.mjs`, `worker/`) est en cours et non finalisée.
- **Loi Évin :** pas d'association de l'alcool à la séduction, la performance ou la réussite sociale ; mention sanitaire obligatoire ; vérification d'âge à l'entrée ; acheteur majeur attesté à la commande.
- **Gamme évolutive :** d'autres domaines argentins vont s'ajouter (Esteban sélectionne le prochain). Le site ne doit pas être structurellement figé sur la seule Bodega Poesía.
- **Français uniquement :** aucune version anglaise ou espagnole prévue.
- **Livraison en France métropolitaine uniquement.**
- **Consentement cookies :** seuls les stockages strictement nécessaires (panier, paiement) ; toute mesure d'audience attend un consentement explicite.
- **Cuvées actuelles :** Clos des Andes 2017 (100% Malbec), Poésía Cuvée Hélène 2016 et Poésía 2014 (60% Malbec / 40% Cabernet Sauvignon). Les prix font foi dans `assets/js/home.js`, `assets/js/checkout.js` et le JSON-LD des fiches.

## Brand Commitments

- Nom : **Andivino**, signature « Vin des Andes » ; écusson et logotype dans `assets/images/` (`logo-sans-fond.png`, `ecriture-sans-fond.png`).
- Voix : française, cultivée et chaleureuse, à la première personne du pluriel (« nous avons marché dans ces vignes »). Le lien humain au service du terroir.
- Les noms propres gardent leurs accents espagnols : Poesía, Luján de Cuyo.

## Evidence on Hand

- **Notes critiques réelles** (Poésía 2014 uniquement) : Wine Advocate 94, Vinous 91, James Suckling 92. Aucune note pour Clos des Andes 2017 ni Cuvée Hélène 2016 : ne pas en inventer.
- **Photos maison** : vignes, Andes, finca, chai, drapeau, dégustations, portraits des fondateurs (`assets/images/`).
- **Fiches techniques** des trois cuvées (cépages, superficie, sol, élevage, garde).
- **Trois chroniques** publiées (`pages/chronique-*.html`).
- **Avis clients et retours de dégustation** : existent, mais ne sont pas encore sur le site. À fournir par les fondateurs ; ne jamais en rédiger.
- **Presse et partenaires** (écoles comme HEC, restaurants) : existent, mais ne sont pas encore sur le site. À fournir par les fondateurs avant toute mention.

## Product Principles

1. **Le récit avant la vente.** On comprend le terroir et les personnes avant de voir un bouton d'achat ; la commande reste à un clic dès qu'on est convaincu.
2. **Rien d'inventé.** Notes, avis, partenaires et chiffres viennent de sources réelles et vérifiables.
3. **La rencontre prolonge le site.** Chaque page peut mener à une dégustation ou au contact direct avec les fondateurs.
4. **Prêt pour plusieurs domaines.** La Bodega Poesía est le premier chapitre, pas la limite de la structure.
5. **Conforme par défaut.** Loi Évin, âge légal et consentement cookies sont respectés sur chaque nouvelle surface.

## Accessibility & Inclusion

Niveau appliqué lors du polish d'octobre 2026, pas encore confirmé comme exigence : WCAG 2.1 AA, soit contraste ≥ 4.5:1 pour le texte, focus clavier visible, formulaires étiquetés, respect de `prefers-reduced-motion`.
