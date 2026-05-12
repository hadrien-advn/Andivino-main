# Guide de reprise Andivino

Ce document est destine a la personne qui va reprendre, tester ou exploiter le site.

## Ce que fait le site

Le projet contient :

- une landing page Andivino,
- une page de commande,
- une page chroniques,
- des pages legales de base,
- une integration Stripe Payment Element,
- un webhook Stripe pour confirmer les paiements cote serveur.

Le site n'est pas une simple page statique : il doit etre lance avec Node.js, car la creation des paiements Stripe se fait cote serveur.

## Installation

Pre-requis :

- Node.js installe,
- un compte Stripe,
- des cles Stripe de test ou de production.

Commandes :

```bash
npm install
copy .env.example .env
npm run dev
```

Le site sera disponible sur :

```text
http://localhost:4242
```

## Variables d'environnement

Le fichier `.env` doit rester local et ne doit jamais etre partage publiquement.

```text
PORT=4242
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

Role des variables :

- `STRIPE_PUBLISHABLE_KEY` : cle publique Stripe, exposee au navigateur.
- `STRIPE_SECRET_KEY` : cle secrete Stripe, utilisee seulement par `server.js`.
- `STRIPE_WEBHOOK_SECRET` : secret de signature du webhook Stripe.

## Fonctionnement du paiement

1. Le client choisit des bouteilles sur le site.
2. Le panier est stocke dans le navigateur pour l'experience utilisateur.
3. Au paiement, le navigateur envoie panier, livraison et coordonnees au serveur.
4. Le serveur valide les donnees et recalcule le total depuis `data/catalog.js`.
5. Le serveur cree un PaymentIntent Stripe.
6. Le navigateur affiche le Payment Element Stripe.
7. Le client paie sur le site.
8. Stripe envoie un webhook signe a `/api/stripe/webhook`.
9. Le serveur verifie la signature Stripe.
10. Seul l'evenement `payment_intent.succeeded` est considere comme paiement confirme.

Important : la page `/paiement/success` n'est pas une preuve de paiement. La preuve fiable vient du webhook Stripe.

## Tester Stripe en local

Terminal 1 :

```bash
npm run dev
```

Terminal 2 :

```bash
npm run stripe:listen
```

Stripe affiche un secret :

```text
whsec_xxx
```

Le mettre dans `.env`, puis redemarrer `npm run dev`.

Cartes de test :

```text
4242 4242 4242 4242  -> paiement accepte
4000 0000 0000 0002  -> paiement refuse
4000 0000 0000 9995  -> fonds insuffisants
4000 0000 0000 3220  -> 3D Secure
```

Date : une date future. CVC : 3 chiffres quelconques.

## Ou sont les commandes ?

En local, les paiements confirmes sont journalises dans :

```text
storage/stripe-order-events.jsonl
```

Ce dossier est ignore par Git, car il peut contenir des donnees client.

Avant production, il faut remplacer ce journal local par :

- une base de donnees,
- un outil interne securise,
- ou un back-office.

## Modifier les produits et prix

Les prix de reference sont dans :

```text
data/catalog.js
```

C'est le serveur qui fait foi. Ne jamais se baser uniquement sur les prix affiches par le navigateur.

Les contenus visibles cote front sont encore dupliques dans :

```text
assets/js/home.js
assets/js/checkout.js
```

Prochaine amelioration recommandee : centraliser les produits dans une seule source partagee.

## Points de securite

A respecter absolument :

- ne jamais partager `.env`,
- ne jamais mettre `STRIPE_SECRET_KEY` dans `assets/js/`,
- regenerer les cles Stripe exposees pendant les tests,
- garder HTTPS obligatoire en production,
- utiliser le webhook Stripe pour valider les commandes,
- ne pas expedier une commande juste parce que la page success s'affiche,
- finaliser les CGV, mentions legales et politique de confidentialite avant mise en ligne.

## Mise en production

Avant production, il faudra :

1. regenerer les cles Stripe,
2. passer de `pk_test_` / `sk_test_` a `pk_live_` / `sk_live_`,
3. creer un webhook Stripe production vers l'URL publique,
4. renseigner `STRIPE_WEBHOOK_SECRET` production,
5. remplacer `storage/` par une vraie persistance,
6. activer HTTPS,
7. verifier les pages legales,
8. refaire un test de paiement complet.

## Partager le projet proprement

Le dossier `node_modules/` ne doit pas etre partage. Il se regenere avec :

```bash
npm install
```

Pour creer une archive propre :

```bash
npm run handoff:zip
```

Cette archive exclut `.env`, `node_modules/`, `storage/`, les logs et les anciennes archives.
