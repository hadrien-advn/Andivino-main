---
name: Andivino
description: Importateur de vins argentins de Mendoza — l'élégance d'une étiquette de grand vin, sur papier crème.
colors:
  bordeaux-malbec: "#6E1828"
  bordeaux-malbec-deep: "#521220"
  or-de-cuyo: "#C4A44A"
  or-de-cuyo-light: "#D9BC74"
  papier-creme: "#FAF6F1"
  creme: "#F2EAE0"
  creme-ombre: "#E6DDD0"
  charbon: "#3C3835"
  encre: "#14100C"
  terre-de-chai: "#2A2420"
  gris-sarment: "#655D54"
  gris-cendre: "#C0BBB5"
  vert-vigne: "#2D6A4F"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(3rem, 6vw, 5.5rem)"
    fontWeight: 300
    lineHeight: 1.04
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2rem, 3.8vw, 3.2rem)"
    fontWeight: 300
    lineHeight: 1.12
  title:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 300
    lineHeight: 1.1
  price:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.9
  label:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 400
    letterSpacing: "0.18em"
rounded:
  none: "0"
  hairline: "2px"
  full: "50%"
spacing:
  gutter-mobile: "1.2rem"
  gutter-tablet: "1.5rem"
  gutter-desktop: "4rem"
  section-mobile: "4.5rem"
  section: "7.5rem"
  container: "1160px"
components:
  button-primary:
    backgroundColor: "{colors.bordeaux-malbec}"
    textColor: "{colors.papier-creme}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.85rem 2rem"
  button-primary-hover:
    backgroundColor: "{colors.bordeaux-malbec-deep}"
  button-outline-on-dark:
    backgroundColor: "transparent"
    textColor: "{colors.papier-creme}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.85rem 2rem"
  button-gold-on-dark:
    backgroundColor: "transparent"
    textColor: "{colors.or-de-cuyo}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.55rem 1.1rem"
  button-gold-on-dark-hover:
    backgroundColor: "{colors.or-de-cuyo}"
    textColor: "{colors.charbon}"
  wine-card:
    backgroundColor: "{colors.papier-creme}"
    textColor: "{colors.charbon}"
    rounded: "{rounded.none}"
    padding: "2.5rem 2rem"
  input:
    backgroundColor: "{colors.papier-creme}"
    textColor: "{colors.charbon}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1rem"
  nav:
    backgroundColor: "{colors.papier-creme}"
    textColor: "{colors.charbon}"
    typography: "{typography.label}"
    height: "74px"
---

# Design System: Andivino

## Overview

**Creative North Star: "L'Étiquette des Andes"**

Andivino s'habille comme une belle étiquette de grand vin : un papier crème, une encre bordeaux, un filet d'or, des capitales finement espacées et un nom de cuvée en italique. Tout est posé avec la rigueur d'un imprimeur. Rien ne brille, rien ne crie. La couleur est rare et chargée de sens, la typographie fait l'essentiel du travail, et les photographies de Mendoza (vignes, Andes, finca) apportent la chaleur que l'interface s'interdit.

Le ton est raffiné et retenu. Les pages respirent : sections hautes (7.5rem), larges marges, colonnes de texte étroites. On lit un récit, celui de trois amis et d'une bodega de Luján de Cuyo, avant d'acheter une bouteille. L'interface s'efface derrière le vin, le terroir et le lien humain.

La surface alterne trois papiers (crème clair, crème, crème ombré) et une nuit (charbon pour les dégustations et l'en-tête de commande), ponctués d'aplats bordeaux pleine largeur : l'appel aux professionnels et le pied de page.

**Key Characteristics:**
- Serif italique Cormorant Garamond pour les voix nobles (titres, noms de cuvée, prix, citations) ; DM Sans pour le texte courant et les libellés.
- Libellés en capitales espacées (0.14–0.28em), comme les mentions d'une étiquette.
- Angles droits partout ; le cercle est réservé aux portraits et aux icônes sociales.
- Plat au repos ; une ombre douce n'apparaît qu'au survol.
- Bordeaux pour l'action, or pour l'ornement : jamais l'inverse.

## Colors

Une palette de cave : papiers crème chauds, encre bordeaux, filet d'or, fonds sombres de chai.

### Primary
- **Bordeaux Malbec** (#6E1828) : la couleur de l'action et de l'accent. Boutons principaux, CTA « Commander », pastilles « Bientôt Sold Out », onglet actif, mots en italique dans les titres, liens dans le texte. Aplat pleine largeur réservé au bandeau professionnels et au pied de page.
- **Bordeaux Malbec profond** (#521220) : uniquement l'état survol et appuyé des éléments bordeaux.

### Secondary
- **Or de Cuyo** (#C4A44A) : l'ornement et la lumière. Filets fins sous la navigation, traits devant les libellés, chiffres des dates de dégustation, boutons secondaires sur fond sombre, titres de colonnes du pied de page, badge « Prochainement ». Toujours sur fond sombre ou en filet ; jamais en texte courant sur crème (contraste insuffisant).
- **Or de Cuyo clair** (#D9BC74) : liens et anneau de focus sur fonds sombres.

### Tertiary
- **Vert Vigne** (#2D6A4F) : signal fonctionnel uniquement : « Gratuit », pastille « Sécurisé », message de succès de paiement. Jamais décoratif.

### Neutral
- **Papier crème** (#FAF6F1) : fond de page par défaut, cartes vins, champs de formulaire, barre de navigation.
- **Crème** (#F2EAE0) : sections alternées (fondateurs, sélection de vins), en-tête des chroniques.
- **Crème ombré** (#E6DDD0) : bandeau citation, réseaux sociaux, filets de séparation, bordures de champs, fond des visuels en attente.
- **Charbon** (#3C3835) : couleur des titres et du texte important ; fond de la section Dégustations et de l'en-tête Commande.
- **Encre** (#14100C) : couleur de base du `body` et teinte de toutes les ombres et voiles photo.
- **Terre de chai** (#2A2420) : fond du bandeau cookies.
- **Gris sarment** (#655D54) : texte courant, descriptions, libellés secondaires, dates. Calibré pour ≥ 4.5:1 sur les trois crèmes.
- **Gris cendre** (#C0BBB5) : prix barrés, bordures neutres. Jamais pour du texte qu'on doit lire.

### Named Rules
**La Règle de l'Encre et du Filet.** Le bordeaux agit, l'or orne. Un bouton, un lien ou un état actif est bordeaux ; un trait, un chiffre décoratif ou un titre de colonne est or. Sur crème, l'or ne porte jamais de texte.

**La Règle du Papier.** Pas de blanc pur ni de gris froid : chaque fond est un des trois crèmes ou une des deux nuits. Le texte sur fond sombre est un crème transparent (≥ 0.62 d'opacité), jamais un gris.

## Typography

**Display Font:** Cormorant Garamond (avec Georgia, serif)
**Body Font:** DM Sans (avec system-ui, sans-serif)

**Character:** Un Garamond de caractère, fin et souvent italique, pour la voix du vin et du récit ; un sans géométrique et calme pour l'information. Le contraste entre les deux est la signature, comme le nom calligraphié et les mentions légales d'une étiquette.

### Hierarchy
- **Display** (300, clamp(3rem, 6vw, 5.5rem), 1.04) : le titre du hero uniquement, sur photographie. Une ligne en italique, une ligne en graisse 500.
- **Headline** (300, clamp(2rem, 3.8vw, 3.2rem), 1.12) : titres de section. Un fragment en italique bordeaux (« un terroir *à transmettre* »).
- **Title** (300 italique, 1.5rem, 1.1) : noms de cuvée, noms des fondateurs, titres de chroniques (1.1–1.35rem, romain).
- **Price** (Cormorant 400, 1.5rem, 1) : prix ; 2.2rem sur la fiche produit, 1.8rem pour le total du panier, chiffres tabulaires.
- **Body** (DM Sans 300–400, 0.88–1rem, 1.85–1.9) : récits et descriptions, en gris sarment. Largeur de ligne ≤ 66ch dans les articles.
- **Label** (DM Sans 400, 0.7rem, 0.14–0.28em, CAPITALES) : navigation, boutons, millésimes, appellations, libellés de fiche technique, dates.

### Named Rules
**La Règle du Plancher de 11 px.** Aucun texte fonctionnel sous 0.7rem (11.2 px), même en capitales espacées. L'élégance vient de l'espacement, pas de la miniaturisation.

**La Règle de l'Italique Signifiant.** L'italique désigne ce qui a une âme (un vin, une personne, un lieu, une citation). Il ne sert pas à décorer une interface.

## Layout

Conteneur centré de 1160px avec gouttières de 4rem (desktop), 1.5rem (≤ 960px) et 1.2rem (≤ 600px). Les sections empilent des bandes pleine largeur de 7.5rem de hauteur de marge verticale (4.5rem sur mobile), en alternant les fonds plutôt qu'en traçant des séparateurs.

Compositions récurrentes : deux colonnes texte / image (1fr 1fr, écart 6rem) pour les récits ; grille de 4 cartes vins collées par un joint de 2px ; grille éditoriale 1.65fr 1fr 1fr pour les chroniques ; fiche produit à 760px de large avec bouteille et bloc d'achat côte à côte.

Points de rupture : 1240px (navigation resserrée), 960px (passage à une colonne, navigation masquée), 600px (menu burger, boutons pleine largeur, une carte par ligne).

La navigation est fixe (74px de haut) ; toute barre collante en dessous démarre à `top: 74px`.

## Elevation & Depth

Le système est plat au repos. La profondeur vient de l'alternance des papiers crème et des deux nuits, des voiles d'encre sur les photographies et des filets d'or. Les ombres sont toujours teintées d'encre (rgba(20,16,12,…)), décalées vers le bas et très diffuses.

### Shadow Vocabulary
- **Filet de navigation** (`box-shadow: 0 1px 0 rgba(196,164,74,.15)`) : la barre de navigation repose sur un trait d'or, pas sur une ombre ; 0.25 d'opacité une fois la page défilée.
- **Élévation au survol** (`box-shadow: 0 16px 48px rgba(20,16,12,.1)`) : carte vin survolée, avec un soulèvement de 3px.
- **Survol discret** (`box-shadow: 0 4px 20px rgba(20,16,12,.06)`) : lignes produit de la page commande.
- **Notification** (`box-shadow: 0 8px 24px rgba(20,16,12,.18)`) : toast d'ajout au panier.
- **Anneau de champ** (`box-shadow: 0 0 0 3px rgba(110,24,40,.12)`) : champ de formulaire actif.

### Named Rules
**La Règle du Plat au Repos.** Une surface ne porte d'ombre que pour répondre à un geste (survol, focus) ou pour flotter (toast, bandeau). Jamais d'ombre permanente sur une carte.

## Shapes

Angles droits par défaut, comme un papier coupé au massicot : boutons, cartes, champs, onglets, encadrés. Un arrondi de 2px seulement pour les photos encadrées et les boîtes de dialogue. Le cercle (50%) est réservé aux portraits des fondateurs, aux icônes des réseaux sociaux, aux pastilles de quantité et aux boutons radio.

Les bordures sont des filets de 1px en crème ombré ou en crème transparent sur fond sombre. Les seuls ornements graphiques sont des traits horizontaux fins (18–28px) en or ou bordeaux.

### Named Rules
**La Règle du Massicot.** Si ce n'est ni un visage ni un pictogramme, c'est un rectangle à angles vifs.

## Components

### Buttons
Nets et sobres : un aplat, des capitales espacées, aucun arrondi.
- **Shape :** angles droits (0).
- **Primary :** fond bordeaux Malbec, texte papier crème, label 0.7rem espacé 0.16–0.18em, padding 0.85rem 2rem (1rem 1.8rem sur fiche produit, 1.2rem pleine largeur pour le paiement).
- **Hover / Focus :** fond bordeaux profond en 0.3s ; anneau de focus 2px bordeaux décalé de 3px (or clair sur fond sombre).
- **Outline sur photo :** fond transparent, filet crème à 40%, texte crème ; le filet devient opaque au survol.
- **Or sur fond sombre :** texte or, filet or à 35% ; au survol, l'or remplit le bouton et le texte passe en charbon. État désactivé à 40% d'opacité (« Sur invitation »).
- **Ajouter au panier :** variante compacte du primaire (0.6rem 1.1rem), au-dessus du lien étendu de la carte.

### Chips
- **Style :** filtres de chroniques et onglets de dégustation : capitales 0.7rem, filet crème ombré, angles droits.
- **State :** actif = aplat bordeaux, texte blanc ; survol = filet et texte bordeaux.

### Cards / Containers
- **Corner Style :** angles droits (0).
- **Background :** papier crème sur section crème ; les cartes vins sont collées par un joint de 2px qui laisse voir le fond.
- **Shadow Strategy :** plates ; « Élévation au survol » au survol (voir Elevation & Depth).
- **Border :** aucune pour les cartes vins ; filet 1px crème ombré pour les lignes produit et le récapitulatif de commande.
- **Internal Padding :** 2.5rem 2rem (cartes vins), 1.8rem 2rem (lignes produit), 2rem (récapitulatif).

### Inputs / Fields
- **Style :** fond papier crème, filet 1px crème ombré, angles droits, texte DM Sans 1rem charbon, padding 0.75rem 1rem ; libellé au-dessus en capitales 0.7rem gris sarment, toujours lié au champ.
- **Focus :** filet bordeaux et anneau bordeaux à 12%.
- **Placeholder :** #736B62, jamais plus clair.
- **Error :** message sous le bloc de paiement, rouge brique (#A8261A), 0.8rem.

### Navigation
- **Style :** barre fixe papier crème à 97% d'opacité avec flou de fond, filet d'or dessous ; écusson Andivino + logotype à gauche ; liens en capitales 0.7rem charbon, espacés 0.14em, bordeaux au survol ; panier et CTA « Commander » bordeaux à droite.
- **Pages intérieures :** trois liens et un lien retour gris (« ← Les vins »).
- **Mobile :** burger à trois traits de 1.5px ; menu plein écran crème avec liens en Cormorant italique 2rem séparés par des filets, CTA bordeaux en bas.

### Wine Card
La pièce maîtresse. Millésime en capitales bordeaux, nom de cuvée en Title italique, bodega en capitales grises, bouteille détourée centrée (175px), description limitée à 3 lignes au-dessus d'un filet, puis prix Cormorant à gauche et « + Ajouter » à droite. Le nom est un lien étendu à toute la carte ; le bouton reste au-dessus. Une carte « Prochainement » en pointillés sur crème ombré ferme la grille.

### Delivery Option
Rangée cliquable en radio (rôle `radio`, utilisable au clavier) : pastille ronde, titre 0.85rem en graisse 500, description grise, prix en Cormorant aligné en haut à droite. Sélection = filet bordeaux 1.5px et fond bordeaux à 4%. Indisponible = 50% d'opacité.

### Score Row
Notes de critiques sur la fiche produit : chiffre en Cormorant 300 1.5rem avec « pts » en exposant, source en capitales 0.7rem dessous.

### Section Label (existant, à ne pas étendre)
Les sections actuelles portent un petit libellé en capitales précédé d'un trait (« — Notre histoire ») au-dessus du titre. Ce motif existe sur toutes les sections mais n'est **pas une règle du système** : une nouvelle surface laisse le titre porter seul la section.

## Do's and Don'ts

### Do:
- **Do** réserver le bordeaux Malbec (#6E1828) aux actions et aux états actifs, et l'or de Cuyo (#C4A44A) aux filets et ornements.
- **Do** composer chaque fond à partir des trois crèmes (#FAF6F1, #F2EAE0, #E6DDD0) ou des deux nuits (#3C3835, #2A2420).
- **Do** écrire noms de cuvée, personnes et citations en Cormorant Garamond italique ; le reste en DM Sans.
- **Do** garder tout texte fonctionnel à 0.7rem minimum et le texte courant à ≥ 4.5:1 (gris sarment #655D54 sur crème).
- **Do** laisser respirer : 7.5rem entre sections, colonnes de lecture ≤ 66ch.
- **Do** utiliser de vraies photographies de Mendoza (vignes, Andes, finca, dégustations) pour la chaleur et l'illustration.
- **Do** donner à chaque élément interactif un focus visible (2px bordeaux, or clair sur fond sombre).

### Don't:
- **Don't** arrondir boutons, cartes ou champs : le cercle est réservé aux visages et pictogrammes.
- **Don't** poser une ombre permanente sur une carte ; l'ombre répond au survol.
- **Don't** écrire du texte en or sur fond crème, ni du texte lisible en gris cendre (#C0BBB5).
- **Don't** utiliser d'émojis ou de glyphes Unicode comme icônes : icônes SVG au trait de 1.6px.
- **Don't** introduire une nouvelle couleur d'accent, un dégradé de texte ou du blanc pur.
- **Don't** utiliser le vert vigne (#2D6A4F) en décoration : il signale uniquement gratuit, sécurisé ou réussi.
