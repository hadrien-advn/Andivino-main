# Banque d'images

Objectif : chaque photo n'illustre qu'un seul endroit du site. Pas de doublon d'une page à l'autre.

## Où sont les fichiers

- `assets/images/banque/<id>.jpg` : original, 2000 px sur le grand côté. Sert aussi pour `og:image` et le JSON-LD.
- `assets/images/banque/<id>.webp` : même image, plus légère, pour les `<img>` des pages.
- `data/image-bank.json` : le catalogue. Pour chaque image : dimensions, alt en français, tags, marque visible, série, usage conseillé, page réservée.

## Poser une image sur une page

1. Choisir une image dont `reservee` vaut `null` (`node scripts/check-images.mjs` liste les images libres).
2. Remplir son champ `reservee` avec la page visée (ex. `chronique-vendanges-bodega-poesia-recit`).
3. Mettre l'image dans la page, en reprenant ou en adaptant l'alt du catalogue :
   ```html
   <img src="/assets/images/banque/vendangeur-cagette-raisins.webp"
        alt="Vendangeur de dos portant sur l'épaule une cagette verte remplie de raisins noirs"
        width="1258" height="2000" loading="lazy">
   ```
4. Lancer `node scripts/check-images.mjs` : le script sort en erreur s'il trouve un doublon ou une image utilisée sans réservation.

Le script ne compte pas les doublons suivants :
- les `<meta og:image>`, `twitter:image` et le champ `"image"` du JSON-LD (ils reprennent l'image d'en-tête de la page) ;
- les vignettes de cartes (`.cimg-inner`), qui reprennent normalement l'image d'en-tête de l'article vers lequel elles pointent ;
- le logo, les favicons et les visuels de bouteilles.

## Règles éditoriales

- **Ne jamais mentir dans l'alt.** Le lot du 20/10/2026 vient de Gualtallary Wines / Altus (Tupungato, Valle de Uco), pas de la Bodega Poesía. Ne pas écrire « Poesía » ni « Luján de Cuyo » dans l'alt d'une de ces photos.
- **Marques visibles** (`marque` non nul) : à réserver aux contenus qui parlent de ce domaine ou de ces vins. Elles ne servent pas d'illustration générique.
- **Séries** (`serie`) : les photos d'une même série se ressemblent beaucoup. N'en mettre qu'une par page :
  - `andes-roses` : vignes-andes-roses-crepuscule, poteaux-vigne-sommet-enneige-aube
  - `allee-vignes` : allee-vignes-aube-claire, allee-vignes-panoramique-peupliers
  - `bouteilles-altus` : gamme, trio, cosecha tardía
- Pour ajouter des photos : nom de fichier en minuscules ASCII qui décrit l'image, `.jpg` d'origine plus `cwebp -q 78 -metadata none in.jpg -o <id>.webp`, puis une entrée dans le catalogue.
