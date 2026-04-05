# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

`rentrerdesmandats.fr` — a French-language high-conversion landing page selling a compliance kit (67 € until 2026-07-01, then 97 €) for real estate agents affected by the "Loi du 11 août 2026". No build system, no framework, no package manager. Pure static HTML/CSS/JS.

## Development

No build step. Open `index.html` directly in a browser, or serve locally with any static server:

```bash
npx serve .
# or
python -m http.server 8080
```

There are no tests and no linter configured. The verification scripts in `scripts/` are standalone Node.js / bash utilities run manually:

```bash
node scripts/verify_live_tracking.mjs   # check analytics events on the live site
bash scripts/bootstrap_browser_env.sh  # set up browser testing environment
```

## Architecture

### Runtime configuration (`window.__RDM_CONFIG`)

All non-secret runtime URLs and IDs live in the inline `<script>` block at the top of `index.html`. `js/main.js` reads this object at boot and falls back to hardcoded defaults. To switch analytics from Plausible to GA4 change only the `analytics` key in that block — no JS changes needed.

### Lead capture flow

1. User submits the email form (`#leadForm` or `#leadFormModal`).
2. `main.js` POSTs a JSON payload to `CONFIG.webhookLeadUrl` (n8n webhook).
3. On network failure the payload is queued in `localStorage` under `pending_leads` and retried automatically on the next page load.
4. On success, `#successModal` opens and a `lead_captured` analytics event fires.

### Stripe buy button

`#buyButton` href is set at runtime from `CONFIG.stripePaymentLink`. If the link is absent or fails the regex `^https://buy.stripe.com/[A-Za-z0-9]+`, the button degrades gracefully to a `mailto:` support link.

### Analytics

`initializeAnalytics()` in `main.js` reads `CONFIG.analytics.provider` and dynamically injects either the Plausible or GA4 script. UTM params and session attribution are stored in `sessionStorage` under `rdm_attribution_v1` and appended to every tracked event and lead payload.

### n8n workflows

`n8n-workflows/` contains three JSON workflow definitions:
- `WORKFLOW_A_HUB_COMMERCIAL.json` — main commercial hub
- `WORKFLOW_B_CHASSEUR_V2.json` — lead hunter
- `WORKFLOW_C_COLD_EMAIL_INTELLIGENT.json` — cold email sequence

Import them via the n8n UI at `n8n.rentrerdesmandats.fr`.

### Lead magnet PDF

Edit `sources/guide-immo.html`, open in Chrome, print → Save as PDF (enable "Background graphics").

## CSS design system

All design tokens are CSS variables in `:root` inside `css/style.css`. Fonts: `Playfair Display` (headings) + `Outfit` (body). Do not change `:root` variables without understanding cascading impact — they are used across every section.

## Key URLs

| Resource | URL |
|---|---|
| Live site | `https://rentrerdesmandats.fr/` |
| n8n instance | `https://n8n.rentrerdesmandats.fr/` |
| Lead webhook | `https://n8n.rentrerdesmandats.fr/webhook/lead-capture` |
| Stripe link | `https://buy.stripe.com/28E6oI3FE7vL7r5cHk5Rm00` |
| Support email | `contact@rentrerdesmandats.fr` |

## Agent Team Strategy (Task Force)
When executing tasks, use the following specialized personas:
1. **Orchestrator (Lead)**: Coordinates all agents.
2. **Auditor**: Scans for bugs and removes obsolete/deprecated files.
3. **UI/UX Designer**: Ensures a high-end, modern real estate aesthetic.
4. **SEO Specialist**: Optimizes Core Web Vitals and Schema.org for real estate.
5. **Front-end Dev**: Implements changes in HTML/CSS/JS (pure static).
6. **n8n Architect**: Finalizes automation workflows and Brevo SMTP integration.
7. **Data Master**: Manages Google Sheets CRM structure.
8. **Sentinel (QA)**: Validates security (API keys) and tests the full conversion funnel.

## Rules & Constraints
- **Règle 1 (PRIORITAIRE) : Les agents ne doivent pas se contenter de lister les modifications ; ils doivent utiliser leurs outils pour exécuter eux-mêmes les actions (modification de fichiers, configuration d'en-têtes, appels API) dès que possible.**
- ALWAYS check for file necessity before editing. If a file seems obsolete (old version), ask for confirmation before deletion.
- NO frameworks: Keep the stack pure HTML/CSS/JS.
- SECURITY: Never hardcode API keys. Use `window.__RDM_CONFIG` or environment variables via MCP.
- SEO: Maintain 100/100 Lighthouse performance scores.