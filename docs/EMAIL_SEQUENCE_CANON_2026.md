# Sequence Email Canonique 2026

Reference Brevo pour le funnel RentrerDesMandats.

## Baseline

- Offre: `Kit + formation de conformite commerciale pour agents immobiliers`
- Prix: `67 EUR` jusqu'au `1er juillet 2026`, puis `97 EUR`
- CTA lead magnet: `Recevoir la checklist gratuite`
- CTA offre: `Acceder au kit complet - 67 EUR`
- Guardrail: vendre une prospection plus conforme et tracable, jamais un contournement
- Segment principal: leads ayant telecharge la checklist gratuite sans achat
- Objectif business: transformer le lead magnet en achat du kit sous `7 jours`

## Parametrage Brevo Recommande

- Liste d'entree: `Leads Checklist 2026`
- Liste de sortie achat: `Clients Kit 2026`
- Proprietes contact minimales:
- `SOURCE`
- `CONSENT_VERSION`
- `LEAD_MAGNET`
- `FIRST_OPTIN_AT`
- `LAST_EMAIL_STEP`
- `PURCHASED_KIT`
- Evenements de sortie:
- achat Stripe confirme
- remboursement demande
- desinscription email

## Logique De Declenchement

- J0: a l'inscription `lead captured`
- J1: `+1 jour` si `PURCHASED_KIT=false`
- J3: `+3 jours` si `PURCHASED_KIT=false`
- J5: `+5 jours` si `PURCHASED_KIT=false`
- J7: `+7 jours` si `PURCHASED_KIT=false`
- Sortie immediate de la sequence si achat
- Handoff post-achat: envoyer vers workflow de livraison et onboarding client

## URLs Et UTMs

- CTA checklist: `https://rentrerdesmandats.fr/#lead-magnet?utm_source=brevo&utm_medium=email&utm_campaign=lead_nurture_2026`
- CTA offre: `https://rentrerdesmandats.fr/#achat?utm_source=brevo&utm_medium=email&utm_campaign=lead_nurture_2026`

## Email J0

- Timing: immediatement apres inscription
- Objectif: livrer la checklist et cadrer la promesse
- Sujet: `Votre checklist gratuite de transition 2026`
- Preheader: `Les premiers leviers pour remplacer le telephone a froid avant aout 2026`
- CTA principal: `Voir ce que contient le kit`

Bonjour,

Voici votre checklist gratuite de transition 2026 pour continuer a rentrer des mandats avec une prospection plus conforme avant le `11 aout 2026`.

Dans ce guide, vous trouverez:

- les changements a anticiper avant la bascule 2026
- les points de vigilance sur consentement et tracabilite
- les premiers leviers actionnables cette semaine

Point important:
le kit ne promet pas de contourner la loi. Il vous aide a mettre en place une methode plus conforme, documentee et exploitable.

Demain, je vous enverrai les 3 erreurs qui exposent le plus les agents qui attendent le dernier moment.

A bientot,
L'equipe RentrerDesMandats

P.S. Si vous voulez voir ce que contient l'offre complete:
`Acceder au kit complet - 67 EUR`

## Email J1

- Timing: J+1
- Objectif: education + urgence reglementaire
- Sujet: `Les 3 erreurs qui vont couter cher aux agents en 2026`
- Preheader: `Le probleme n'est pas l'energie. C'est le systeme d'acquisition.`
- CTA principal: `Acceder au kit complet - 67 EUR`

Bonjour,

La plupart des agents ne sont pas bloques par le manque de motivation.
Ils sont bloques par un mauvais systeme.

Voici les 3 erreurs que nous voyons le plus souvent:

- continuer a compter sur des relances telephoniques sans consentement tracable
- improviser des messages sans preuve de valeur ni process de suivi
- attendre l'ete 2026 pour reconstruire toute la prospection

L'enjeu n'est pas juste marketing.
L'enjeu est de conserver une machine a mandats defendable, claire et actionnable.

Le kit complet vous donne:

- 6 assistants IA
- des templates email, SMS et WhatsApp
- des scripts post-consentement
- une checklist de conformite
- une mini-formation pour deployer le systeme rapidement

Voir le kit complet:
`Acceder au kit complet - 67 EUR`

## Email J3

- Timing: J+3
- Objectif: objection handling
- Sujet: `Est-ce vraiment conforme ?`
- Preheader: `La bonne promesse n'est pas zero risque. C'est une meilleure methode.`
- CTA principal: `Voir ce que contient le kit`

Bonjour,

C'est la bonne question.

La bonne promesse n'est pas:
`vous serez 100% couvert quoi qu'il arrive`

La bonne promesse est:
`vous aurez une methode plus conforme, des scripts plus propres, une capture de consentement plus claire et une meilleure tracabilite`

Ce que le kit fait:

- vous aide a structurer des approches inbound et valeur d'abord
- vous donne des scripts post-consentement
- vous aide a documenter ce qui doit l'etre

Ce que le kit ne fait pas:

- remplacer un avis juridique individualise
- garantir zero risque dans tous les cas d'usage

Si vous voulez une prospection plus serieuse avant le `11 aout 2026`, le kit a ete construit pour cela.

`Acceder au kit complet - 67 EUR`

## Email J5

- Timing: J+5
- Objectif: rendre l'offre concrete
- Sujet: `Ce que vous recevez exactement apres achat`
- Preheader: `Le contenu du kit, sans flou ni bonus cosmetiques.`
- CTA principal: `Acceder au kit complet - 67 EUR`

Bonjour,

Beaucoup de pages de vente restent floues.
Voici concretement ce que vous recevez apres achat:

- 6 assistants IA preconfigurables ou prompts equivalents
- templates email, SMS, WhatsApp et relances
- scripts d'objection et de conversion apres consentement
- checklist de conformite commerciale
- mini-formation video de prise en main
- mises a jour de wording jusqu'a la bascule 2026
- bonus utiles: tableau de suivi, script post-opt-in, FAQ / objections

L'objectif est simple:
vous eviter de repartir de zero pour reconstruire votre acquisition.

Prix de lancement actuel:
`67 EUR` jusqu'au `1er juillet 2026`

`Acceder au kit complet - 67 EUR`

## Email J7

- Timing: J+7
- Objectif: decision finale
- Sujet: `Le vrai risque n'est pas le prix du kit`
- Preheader: `Le cout cache, c'est de reconstruire trop tard.`
- CTA principal: `Acceder au kit complet - 67 EUR`

Bonjour,

Le vrai risque n'est pas de payer `67 EUR`.
Le vrai risque, c'est d'arriver trop tard avec:

- une prospection a refaire
- des messages non alignes
- aucun process propre de consentement
- aucune base de scripts et de suivi

Le kit RentrerDesMandats 2026 a ete pense comme un raccourci vers une prospection plus conforme, plus lisible et plus rapide a deployer.

Si le sujet est prioritaire pour vous, ne laissez pas le chantier trainer.

Acces immediat:
`Acceder au kit complet - 67 EUR`

Rappel:

- prix standard: `97 EUR`
- prix de lancement: `67 EUR` jusqu'au `1er juillet 2026`

L'equipe RentrerDesMandats

## KPI Cibles

- J0 open rate: `55%+`
- J1 open rate: `42%+`
- J3 open rate: `38%+`
- J5 open rate: `35%+`
- J7 open rate: `32%+`
- CTR sequence global: `4%+`
- Conversion lead vers achat a 7 jours: `2% a 5%` comme seuil initial de lecture

## Dependances CTO

- mapper les templates Brevo sur les etapes `J0/J1/J3/J5/J7`
- injecter les UTMs dans chaque CTA
- sortir les acheteurs de la sequence automatiquement apres webhook Stripe
- remonter dans le reporting: `open`, `click`, `purchase`, `unsubscribe`
