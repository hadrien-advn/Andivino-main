# Securite

## Decisions prises

- Aucune cle secrete Stripe n'est stockee dans le front.
- Les cles Stripe doivent etre fournies via `.env`, ignore par Git.
- Les montants sont recalcules cote serveur depuis `data/catalog.js`.
- Les moyens de paiement avec redirection sont filtres par `automatic_payment_methods.allow_redirects = never`.
- Les pages publiques n'ont plus de CSS inline ni de handlers `onclick`.
- Le serveur applique Helmet, une CSP compatible Stripe.js, un hash dedie au JSON-LD SEO de la home et un rate limit sur la creation de PaymentIntent.
- Le webhook `/api/stripe/webhook` verifie la signature Stripe avant de journaliser une commande payee.
- Seul `payment_intent.succeeded` est journalise comme paiement confirme cote serveur.
- Les evenements webhook deja traites sont dedupliques par identifiant Stripe.
- Les pages techniques et legales non finalisees sont marquees `noindex`.

## Cles Stripe

Les cles secretes partagees dans une conversation doivent etre considerees comme compromises.

Avant d'utiliser ce projet avec Stripe :

1. Revoquer/regenerer les cles dans le Dashboard Stripe.
2. Copier `.env.example` vers `.env`.
3. Renseigner uniquement `.env`.
4. Ne jamais commiter `.env`.

## Points a ne jamais faire

- Ne jamais mettre `STRIPE_SECRET_KEY` dans `assets/js/`.
- Ne jamais envoyer un prix calcule par le navigateur a Stripe.
- Ne jamais considerer `localStorage` comme une preuve de commande.
- Ne jamais expedier une commande uniquement parce que la page success s'affiche.
- Ne jamais commiter le dossier `storage/` : il peut contenir des donnees de commande.

## Avant production

- Remplacer le journal local `storage/` par une base de donnees ou un outil interne securise.
- Ajouter une vraie authentification si une admin est reconstruite.
- Finaliser les CGV, mentions legales et politique de confidentialite.

## Partage du dossier

Ne pas partager le dossier local complet si `.env` existe.

Utiliser plutot :

```bash
npm run handoff:zip
```

L'archive exclut `.env`, `node_modules/`, `storage/`, les logs et les anciennes archives.
