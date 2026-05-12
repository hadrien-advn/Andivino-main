# Architecture

## Principe

Le projet utilise maintenant un petit serveur Node/Express. Cela permet de garder des routes propres pour le SEO, des fichiers HTML nommes clairement, et une integration Stripe securisee sans exposer la cle secrete.

## Pages

Les pages sont regroupees dans `pages/` :

- `home.html` : route `/`.
- `commande.html` : route `/commande`.
- `chroniques.html` : route `/chroniques`.
- `payment-success.html` : route `/paiement/success`, `noindex`.
- `payment-cancel.html` : route `/paiement/cancel`, `noindex`.
- `legal-cgv.html` : route `/legal/cgv`, `noindex`.
- `legal-mentions-legales.html` : route `/legal/mentions-legales`, `noindex`.
- `404.html` : page introuvable.

## Assets

- `assets/css/` : styles publics.
- `assets/js/` : scripts front.
- `assets/images/` : medias publics avec noms ASCII stables.

## Paiement

Le paiement passe par Stripe Payment Element :

1. Le front charge Stripe.js.
2. Le front recupere la cle publique via `/api/stripe-config`.
3. Le front envoie panier, livraison et coordonnees a `/api/create-payment-intent`.
4. Le serveur valide les donnees, recalcule le total depuis `data/catalog.js`, puis cree un PaymentIntent.
5. Le front affiche le Payment Element et confirme le paiement sur le site.
6. Stripe notifie le serveur via `/api/stripe/webhook`.

Les prix envoyes par le navigateur ne sont jamais acceptes comme source de verite.

## Donnees

- `data/catalog.js` contient les prix serveur et les regles de livraison.
- `storage/` contient uniquement les journaux locaux de webhooks valides. Ce dossier est ignore par Git.
- Les contenus editoriaux/vins restent encore partiellement dupliques dans les scripts front.

Prochaine etape : centraliser les contenus publics pour eviter les divergences entre front et serveur.
