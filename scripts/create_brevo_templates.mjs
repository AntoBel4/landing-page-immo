/**
 * create_brevo_templates.mjs
 * Crée les 6 templates email dans Brevo via API v3
 * Usage : BREVO_API_KEY=xkeysib-... node scripts/create_brevo_templates.mjs
 *
 * Templates créés (IDs 11-16, évite 8/9/10 déjà en production) :
 *   11 — Lead Magnet Checklist (Standard)
 *   12 — Onboarding Kit 67€ (Premium)
 *   13 — Onboarding Kit 297€ (Ultra-Premium)
 *   14 — Onboarding Kit 497€ (Luxe)
 *   15 — Nurturing J+2
 *   16 — Nurturing J+5
 *
 * n8n Variables alignées :
 *   {{params.prenom}}         — prénom du contact (split depuis Stripe name ou champ form)
 *   {{params.download_url}}   — URL ZIP du kit
 *   {{params.calendly_url}}   — URL Calendly (offres 297€ et 497€ uniquement)
 *   {{params.unsubscribe_url}} — lien de désinscription (géré par Brevo automatiquement)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, '..', 'email-templates');

const API_KEY = process.env.BREVO_API_KEY;
if (!API_KEY) {
  console.error('❌ BREVO_API_KEY manquante. Exécutez : BREVO_API_KEY=xkeysib-... node scripts/create_brevo_templates.mjs');
  process.exit(1);
}

// Expéditeurs vérifiés dans le compte Brevo
const SENDER_COMMANDE = { name: 'Antoine — RentrerDesMandats', email: 'commande@rentrerdesmandats.fr' };
const SENDER_ANTOINE  = { name: 'Antoine Estarellas',          email: 'antoine@rentrerdesmandats.com' };

const TEMPLATES = [
  {
    localFile: 'email-01-lead-magnet.html',
    name:      '[RDM] 01 — Lead Magnet Checklist',
    subject:   'Votre checklist "Pret le 11 aout" est la, {{params.prenom}}',
    sender:    SENDER_ANTOINE,
    tag:       'lead-magnet',
    note:      'Trigger: webhook lead-capture (n8n WORKFLOW_A). Remplace templateId 10.',
  },
  {
    localFile: 'email-02-onboarding-67.html',
    name:      '[RDM] 02 — Onboarding Kit 67EUR',
    subject:   'Vos 16 fichiers sont prets, {{params.prenom}}',
    sender:    SENDER_COMMANDE,
    tag:       'onboarding-kit',
    note:      'Trigger: Stripe checkout.session.completed + montant 67EUR (n8n WORKFLOW_A). Remplace templateId 8.',
  },
  {
    localFile: 'email-03-onboarding-297.html',
    name:      '[RDM] 03 — Onboarding Deploiement 297EUR',
    subject:   'Kit + session reservee - votre deploiement commence, {{params.prenom}}',
    sender:    SENDER_COMMANDE,
    tag:       'onboarding-deploiement',
    note:      'Trigger: Stripe checkout.session.completed + montant 297EUR (n8n WORKFLOW_A). Nouveau template.',
  },
  {
    localFile: 'email-04-onboarding-497.html',
    name:      '[RDM] 04 — Onboarding Premium 497EUR',
    subject:   'Votre accompagnement Premium commence maintenant, {{params.prenom}}',
    sender:    SENDER_COMMANDE,
    tag:       'onboarding-premium',
    note:      'Trigger: Stripe checkout.session.completed + montant 497EUR (n8n WORKFLOW_A). Nouveau template.',
  },
  {
    localFile: 'email-05-nurturing-j2.html',
    name:      '[RDM] 05 — Nurturing J+2',
    subject:   'Une question concrete, {{params.prenom}}',
    sender:    SENDER_ANTOINE,
    tag:       'nurturing',
    note:      'Trigger: automation Brevo J+2 apres inscription liste 3 (leads non-clients).',
  },
  {
    localFile: 'email-06-nurturing-j5.html',
    name:      '[RDM] 06 — Nurturing J+5',
    subject:   'Dernier message de ma part, {{params.prenom}}',
    sender:    SENDER_ANTOINE,
    tag:       'nurturing',
    note:      'Trigger: automation Brevo J+5 apres inscription liste 3. Sequence se termine ici.',
  },
];

async function createTemplate(tpl) {
  const htmlContent = fs.readFileSync(path.join(TEMPLATES_DIR, tpl.localFile), 'utf8');

  const body = {
    templateName: tpl.name,
    subject:      tpl.subject,
    htmlContent:  htmlContent,
    sender:       tpl.sender,
    replyTo:      'antoine@rentrerdesmandats.com',
    toField:      '{{contact.FIRSTNAME}} {{contact.LASTNAME}}',
    tag:          tpl.tag,
    isActive:     true,
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/templates', {
    method:  'POST',
    headers: {
      'accept':       'application/json',
      'content-type': 'application/json',
      'api-key':      API_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(`❌ ${tpl.name} — Erreur ${response.status}:`, JSON.stringify(data));
    return null;
  }

  console.log(`✅ ${tpl.name}`);
  console.log(`   → ID Brevo : ${data.id}`);
  console.log(`   → Note n8n : ${tpl.note}`);
  return { name: tpl.name, id: data.id, note: tpl.note };
}

async function main() {
  console.log('🚀 Création des 6 templates Brevo — RentrerDesMandats 2026\n');
  const results = [];

  for (const tpl of TEMPLATES) {
    const result = await createTemplate(tpl);
    if (result) results.push(result);
    // Petit délai pour respecter le rate limit Brevo
    await new Promise(r => setTimeout(r, 400));
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 RÉCAPITULATIF — Mettre à jour n8n avec ces IDs :');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  results.forEach(r => console.log(`  templateId ${r.id} — ${r.name}`));
  console.log('\n🔧 ACTIONS n8n REQUISES :');
  console.log('  1. WORKFLOW_A > "Brevo - Envoyer PDF Gratuit" → templateId =', results[0]?.id ?? 'XX (email-01)');
  console.log('  2. WORKFLOW_A > "Brevo - Livrer Kit ZIP"      → templateId =', results[1]?.id ?? 'XX (email-02)');
  console.log('  3. WORKFLOW_A > Créer nœud "Livrer Kit 297€"  → templateId =', results[2]?.id ?? 'XX (email-03)');
  console.log('  4. WORKFLOW_A > Créer nœud "Livrer Kit 497€"  → templateId =', results[3]?.id ?? 'XX (email-04)');
  console.log('  5. Brevo Automation > J+2 lead magnet         → templateId =', results[4]?.id ?? 'XX (email-05)');
  console.log('  6. Brevo Automation > J+5 lead magnet         → templateId =', results[5]?.id ?? 'XX (email-06)');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
