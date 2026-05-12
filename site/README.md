# Andivino

Site vitrine, tunnel de commande et paiement Stripe integre pour Andivino.

La base garde l'esthetique existante, avec une architecture plus lisible : pages HTML nommees, assets separes, routes propres, SEO de base et paiement securise cote serveur.

## Pour la personne qui recoit le ZIP

Le ZIP ne doit pas contenir de `.env` avec des cles Stripe. Chaque personne qui utilise le site doit creer son propre `.env` avec les donnees de son compte Stripe.

Etapes :

1. Dezipper le projet.
2. Installer les dependances.
3. Creer le fichier `.env`.
4. Renseigner les cles Stripe du compte concerne.
5. Lancer le site.
6. Configurer le webhook Stripe.
7. Tester un paiement.

Commandes :

```bash
npm install
copy .env.example .env
npm run dev
```

Puis ouvrir :

```text
http://localhost:4242
```

Les cles Stripe doivent etre renseignees dans `.env`. Ne jamais partager `.env`.

Sur macOS/Linux, remplacer `copy` par :

```bash
cp .env.example .env
```

## Fichier .env a remplir

Exemple :

```text
PORT=4242
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

Ou trouver les valeurs :

- `STRIPE_PUBLISHABLE_KEY` : Stripe Dashboard > Developers > API keys > Publishable key.
- `STRIPE_SECRET_KEY` : Stripe Dashboard > Developers > API keys > Secret key.
- `STRIPE_WEBHOOK_SECRET` : donne par `npm run stripe:listen` en local, ou par le Dashboard Stripe pour la production.

Important :

- en test, les cles commencent par `pk_test_` et `sk_test_`,
- en production, elles commencent par `pk_live_` et `sk_live_`,
- le webhook secret commence par `whsec_`,
- `.env` est dans `.gitignore` et ne doit pas etre versionne.

## Demarrage local

```bash
npm install
copy .env.example .env
npm run dev
```

Puis ouvrir :

```text
http://localhost:4242
```

## Structure

```text
.
|-- server.js
|-- package.json
|-- package-lock.json
|-- pages/
|   |-- home.html
|   |-- commande.html
|   |-- chroniques.html
|   |-- payment-success.html
|   |-- payment-cancel.html
|   |-- legal-cgv.html
|   |-- legal-mentions-legales.html
|   `-- 404.html
|-- data/
|   `-- catalog.js
|-- assets/
|   |-- css/
|   |-- images/
|   `-- js/
|-- scripts/
|   |-- stripe-listen.ps1
|   `-- create-handoff.ps1
|-- docs/
|   |-- ARCHITECTURE.md
|   |-- SECURITY.md
|   `-- HANDOFF.md
|-- robots.txt
`-- sitemap.xml
```

## Routes principales

- `/` : landing page.
- `/commande` : tunnel de commande et Payment Element Stripe.
- `/chroniques` : chroniques editoriales.
- `/paiement/success` : retour paiement.
- `/paiement/cancel` : paiement annule.
- `/legal/cgv` et `/legal/mentions-legales` : pages legales a finaliser.

## Paiement Stripe

Le paiement est integre sur le site avec Stripe Payment Element :

- le navigateur charge Stripe.js depuis `https://js.stripe.com/v3/`,
- le front demande la cle publique via `/api/stripe-config`,
- le backend recalcule le montant depuis `data/catalog.js`,
- le backend cree un PaymentIntent via `/api/create-payment-intent`,
- Stripe confirme les paiements au backend via `/api/stripe/webhook`,
- la cle secrete Stripe reste uniquement dans `.env`,
- seuls les paiements confirmes `payment_intent.succeeded` sont journalises.

## Webhook Stripe local

Terminal 1 :

```bash
npm run dev
```

Terminal 2 :

```bash
npm run stripe:listen
```

Copier le secret affiche par Stripe dans `.env` :

```text
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

Relancer ensuite `npm run dev`. Garder `npm run stripe:listen` ouvert pendant les tests.

## Verification

```bash
npm run check
npm audit --audit-level=moderate
```

## Partage du projet

Pour creer une archive propre sans secrets ni dependances generees :

```bash
npm run handoff:zip
```

Partager l'archive generee, pas le dossier local complet si `.env` existe.

## Documentation utile

- [docs/HANDOFF.md](docs/HANDOFF.md) : guide de reprise pour la personne qui utilisera le site.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) : architecture technique.
- [docs/SECURITY.md](docs/SECURITY.md) : securite et points de vigilance.
