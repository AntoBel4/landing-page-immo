# Playwright Browser Environment 2026-04

Reference d execution pour [REN-63](/REN/issues/REN-63).

## Objectif

- fournir un chemin reproductible pour lancer Chromium dans ce workspace sans dependances systeme root
- permettre la verification live de `https://rentrerdesmandats.fr` depuis ce repo

## Contrainte Observee

- le Chromium Playwright telecharge se lance avec des bibliotheques manquantes sur le runner
- erreur initiale:
  - `error while loading shared libraries: libglib-2.0.so.0`
- apres chargement des libs, Chrome tombait encore sur Fontconfig tant que `FONTCONFIG_PATH`, `FONTCONFIG_FILE` et `FONTCONFIG_SYSROOT` n etaient pas pointes vers un sysroot local

## Chemin Retenu

- telecharger Chromium via Playwright dans un runtime local `.tools/playwright-runtime`
- extraire un sous-ensemble de paquets Debian 13 dans `.tools/browser-env/sysroot`
- exporter:
  - `LD_LIBRARY_PATH`
  - `FONTCONFIG_PATH`
  - `FONTCONFIG_FILE`
  - `FONTCONFIG_SYSROOT`

## Preparation

```bash
cd landing-page-immo
bash scripts/bootstrap_browser_env.sh
source .tools/browser-env/env.sh
```

## Verification Live

```bash
cd landing-page-immo
source .tools/browser-env/env.sh
cd .tools/playwright-runtime
node ../../scripts/verify_live_tracking.mjs
```

## Resultat Observe Le 2026-04-02

- la landing live s ouvre correctement dans Chromium headless
- le bouton achat garde le lien live Stripe `https://buy.stripe.com/28E6oI3FE7vL7r5cHk5Rm00`
- `buy_button_clicked` expose bien:
  - `utm_source`
  - `utm_medium`
  - `utm_campaign`
  - `utm_content`
  - `utm_term`
  - `session_id`
- le webhook `lead-capture` recoit bien:
  - `email`
  - `source`
  - `timestamp`
  - `consent.*`
  - `page_url`
  - `user_agent`
  - `attribution.session_id`
  - `attribution.utm_*`
  - `attribution.first_touch_url`
  - `attribution.latest_touch_url`

## Ecart Restant

- `attribution.referrer_host` n est pas present quand la session arrive avec des UTM
- la logique actuelle dans `js/main.js` ne renseigne `referrer_host` que si `utm_source` est absent
- consequence:
  - l environnement navigateur est maintenant disponible
  - la verification live revele encore un ecart runtime a corriger avant de considerer le tracking d attribution completement aligne
