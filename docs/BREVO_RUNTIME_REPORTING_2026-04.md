# Brevo Runtime And Reporting Mapping 2026-04

Reference d'execution pour [REN-34](/REN/issues/REN-34).

## Etat Actuel Verifie

- Landing live: `https://rentrerdesmandats.fr`
- Webhook lead capture expose dans le runtime front: `https://n8n.rentrerdesmandats.fr/webhook/lead-capture`
- Lien de paiement live expose dans le runtime front: `https://buy.stripe.com/28E6oI3FE7vL7r5cHk5Rm00`
- Workflow repo disponible: `n8n-workflows/WORKFLOW_A_HUB_COMMERCIAL.json`
- Le workflow repo cree deja un lead Brevo sur inscription puis migre le contact en liste client sur webhook Stripe
- Le workflow repo ne contient pas encore la sequence `J0/J1/J3/J5/J7`, ni la journalisation des evenements `open`, `click`, `unsubscribe`

## Mapping Canonique Cible

### Entree de funnel

- Trigger: webhook `lead-capture`
- Source front attendue:
  - `email`
  - `source`
  - `timestamp`
  - `consent.accepted`
  - `consent.acceptedAt`
  - `consent.version`
  - `page_url`
  - `user_agent`
  - `attribution.session_id`
  - `attribution.utm_source`
  - `attribution.utm_medium`
  - `attribution.utm_campaign`
  - `attribution.utm_content`
  - `attribution.utm_term`
  - `attribution.first_touch_url`
  - `attribution.latest_touch_url`
  - `attribution.referrer_host`
- Action n8n:
  - creer ou mettre a jour le contact Brevo
  - ajouter le contact a `Leads Checklist 2026`
  - renseigner les attributs de consentement et d'attribution
  - declencher l'envoi transactionnel `J0`
  - ecrire une ligne de reporting `lead_captured`

### Sortie achat

- Trigger: webhook `stripe-webhook`
- Action n8n:
  - identifier le contact Brevo par email
  - positionner `PURCHASED_KIT=true`
  - sortir le contact de `Leads Checklist 2026`
  - ajouter le contact a `Clients Kit 2026`
  - renseigner `PURCHASED_AT`, `PURCHASE_AMOUNT`, `PURCHASE_CURRENCY`, `STRIPE_PAYMENT_ID`
  - envoyer le workflow de livraison / onboarding client
  - ecrire une ligne de reporting `purchase`

### Sortie desinscription

- Trigger: webhook Brevo desabonnement ou export quotidien des unsubscribes
- Action n8n:
  - positionner `EMAIL_UNSUBSCRIBED=true`
  - renseigner `UNSUBSCRIBED_AT`
  - retirer le contact de l'automation nurture
  - ecrire une ligne de reporting `unsubscribe`

## Attributs Brevo Recommandes

- `SOURCE`
- `CONSENT_VERSION`
- `CONSENT_ACCEPTED`
- `FIRST_OPTIN_AT`
- `LEAD_MAGNET`
- `LAST_EMAIL_STEP`
- `PURCHASED_KIT`
- `PURCHASED_AT`
- `PURCHASE_AMOUNT`
- `PURCHASE_CURRENCY`
- `STRIPE_PAYMENT_ID`
- `EMAIL_UNSUBSCRIBED`
- `UNSUBSCRIBED_AT`
- `ATTR_SESSION_ID`
- `ATTR_UTM_SOURCE`
- `ATTR_UTM_MEDIUM`
- `ATTR_UTM_CAMPAIGN`
- `ATTR_UTM_CONTENT`
- `ATTR_UTM_TERM`
- `ATTR_FIRST_TOUCH_URL`
- `ATTR_LATEST_TOUCH_URL`
- `ATTR_REFERRER_HOST`

## Sequence Brevo A Charger

### Email J0

- Trigger: entree dans `Leads Checklist 2026`
- Garde-fou: ne pas envoyer si `PURCHASED_KIT=true`
- Action:
  - envoyer le template `RDM 2026 - J0 Checklist`
  - mettre `LAST_EMAIL_STEP=J0`
  - journaliser `email_sent`

### Email J1

- Attente: `1 jour`
- Condition: `PURCHASED_KIT=false` et `EMAIL_UNSUBSCRIBED=false`
- Action:
  - envoyer `RDM 2026 - J1 Erreurs`
  - mettre `LAST_EMAIL_STEP=J1`
  - journaliser `email_sent`

### Email J3

- Attente: `2 jours` apres J1
- Condition: `PURCHASED_KIT=false` et `EMAIL_UNSUBSCRIBED=false`
- Action:
  - envoyer `RDM 2026 - J3 Conformite`
  - mettre `LAST_EMAIL_STEP=J3`
  - journaliser `email_sent`

### Email J5

- Attente: `2 jours` apres J3
- Condition: `PURCHASED_KIT=false` et `EMAIL_UNSUBSCRIBED=false`
- Action:
  - envoyer `RDM 2026 - J5 Contenu Offre`
  - mettre `LAST_EMAIL_STEP=J5`
  - journaliser `email_sent`

### Email J7

- Attente: `2 jours` apres J5
- Condition: `PURCHASED_KIT=false` et `EMAIL_UNSUBSCRIBED=false`
- Action:
  - envoyer `RDM 2026 - J7 Decision`
  - mettre `LAST_EMAIL_STEP=J7`
  - journaliser `email_sent`

## CTA Et Tracking

- Tous les CTA email restent alignes sur `docs/EMAIL_SEQUENCE_CANON_2026.md`
- UTM obligatoire dans chaque bouton email:
  - `utm_source=brevo`
  - `utm_medium=email`
  - `utm_campaign=lead_nurture_2026`
  - `utm_content=j0|j1|j3|j5|j7`
- Le runtime front doit remonter:
  - `lead_captured`
  - `buy_button_clicked`
  - les proprietes `utm_*`
  - `session_id`
  - `referrer_host`
- La conversion achat finale reste cote webhook Stripe, pas cote front

## Reporting Minimal A Tenir

Support recommande: onglet Google Sheets `launch_reporting` ou table SQL equivalente.

Colonnes minimales:

- `event_at`
- `event_name`
- `email`
- `session_id`
- `source`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `email_step`
- `purchase_amount`
- `purchase_currency`
- `payment_id`
- `notes`

Evenements attendus:

- `lead_captured`
- `email_sent`
- `email_open`
- `email_click`
- `buy_button_clicked`
- `purchase`
- `unsubscribe`

## Verification Live

- Verifier dans le navigateur que `lead_captured` et `buy_button_clicked` remontent avec `utm_*` quand l'URL contient les UTMs Brevo
- Verifier que le webhook `lead-capture` recoit bien le bloc `attribution`
- Verifier que l'inscription ajoute le contact a `Leads Checklist 2026` avec `LAST_EMAIL_STEP=J0`
- Verifier qu'un achat Stripe retire bien le contact de la sequence et l'ajoute a `Clients Kit 2026`
- Verifier qu'un clic email Brevo alimente `utm_source=brevo` et `utm_medium=email` sur la landing
- Verifier que les exports ou webhooks Brevo journalisent `open`, `click`, `unsubscribe`

## Ecart Encore Ouvert

- L'orchestration Brevo live n'est pas visible depuis ce repo ni depuis ce heartbeat
- Le webhook ou export live Brevo pour `open`, `click`, `unsubscribe` reste a brancher dans n8n
- Si l'equipe ops n'a pas acces au tenant Brevo, il faut une passe d'implementation supplementaire sur l'environnement live
