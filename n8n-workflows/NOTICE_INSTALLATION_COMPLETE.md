# 📖 NOTICES D'INSTALLATION - WORKFLOWS RENTRER DES MANDATS

**Version :** Production 1.0  
**Date :** 30 Janvier 2026  
**Auteur :** Architecture Senior n8n & Business Operations

---

## 🏢 WORKFLOW A - HUB COMMERCIAL

### 📋 Vue d'ensemble
Workflow dual-trigger qui gère :
1. **Inscription Landing Page** → Ajout GSheet + Brevo + Email PDF gratuit
2. **Paiement Stripe réussi** → Update statut CLIENT + Livraison Kit ZIP

### 🔧 Credentials à créer

#### 1. Google Sheets OAuth2
- **Type :** `Google Sheets OAuth2 API`
- **Nom :** `Google Sheets Account`
- **Configuration :**
  1. Aller sur https://console.cloud.google.com
  2. Créer un projet ou sélectionner un existant
  3. Activer l'API Google Sheets
  4. Créer des identifiants OAuth 2.0
  5. Ajouter l'URL de callback n8n : `https://votre-n8n.com/rest/oauth2-credential/callback`
  6. Copier Client ID et Client Secret dans n8n

#### 2. Brevo API
- **Type :** `Brevo API`
- **Nom :** `Brevo API`
- **Configuration :**
  1. Aller sur https://app.brevo.com
  2. Settings → SMTP & API → API Keys
  3. Générer une nouvelle API Key
  4. Copier la clé dans n8n

### 📊 Structure Google Sheets

**Nom du fichier :** `RentrerDesMandats - CRM`  
**Onglet requis :** `Chasse`

**Colonnes (dans l'ordre exact) :**
```
A: Email
B: Source
C: Date_Inscription
D: Statut
E: Tags
F: Date_Achat
G: Montant
H: Payment_ID
```

**Exemple de ligne :**
```
john.doe@example.com | landing-page | 2026-01-30 09:15:00 | LEAD | pdf-telecharge | | | |
```

### 🔗 Configuration Webhooks

#### Webhook 1 : Landing Page
- **Chemin :** `/lead-capture`
- **Méthode :** POST
- **URL complète :** `https://votre-n8n.com/webhook/lead-capture`
- **Format attendu (JSON) :**
```json
{
  "email": "prospect@example.com",
  "source": "landing-page"
}
```

#### Webhook 2 : Stripe
- **Chemin :** `/stripe-webhook`
- **Méthode :** POST
- **URL complète :** `https://votre-n8n.com/webhook/stripe-webhook`
- **Configuration Stripe :**
  1. Dashboard Stripe → Developers → Webhooks
  2. Add endpoint : `https://votre-n8n.com/webhook/stripe-webhook`
  3. Events to send : `checkout.session.completed`

### 📧 Templates Brevo à créer

#### Template 1 : Email PDF Gratuit
- **Nom :** `Lead Magnet - Guide IA 2026`
- **Variables :**
  - `{{ params.download_url }}` → Lien de téléchargement du PDF

**Exemple de contenu :**
```html
<h1>🎁 Votre Guide est prêt !</h1>
<p>Téléchargez votre guide "5 Stratégies IA pour Mandataires 2026" :</p>
<a href="{{ params.download_url }}">📥 Télécharger le PDF</a>
```

#### Template 2 : Email Livraison Kit
- **Nom :** `Livraison Kit RentrerDesMandats 2026`
- **Variables :**
  - `{{ params.download_url }}` → Lien vers le ZIP
  - `{{ params.prenom }}` → Prénom du client

**Exemple de contenu :**
```html
<h1>🎉 Bienvenue {{ params.prenom }} !</h1>
<p>Votre Kit RentrerDesMandats 2026 est prêt à télécharger :</p>
<a href="{{ params.download_url }}">📦 Télécharger le Kit (ZIP)</a>
```

### ✅ Checklist d'installation

- [ ] Créer le Google Sheet avec les colonnes exactes
- [ ] Créer les credentials Google Sheets dans n8n
- [ ] Créer les credentials Brevo dans n8n
- [ ] Créer les 2 templates email dans Brevo
- [ ] Noter les IDs des templates Brevo
- [ ] Noter les IDs des listes Brevo ("Leads Landing Page" et "Clients")
- [ ] Importer le JSON dans n8n
- [ ] Remplacer TOUS les placeholders `=== ... ===`
- [ ] Tester le webhook Landing Page avec curl ou Postman
- [ ] Configurer le webhook dans Stripe
- [ ] Tester un paiement Stripe en mode test
- [ ] Activer le workflow

---

## 🎯 WORKFLOW B - LE CHASSEUR DE LEADS V2

### 📋 Vue d'ensemble
Workflow de scraping Google Maps via Apify avec :
- Configuration FREE TIER optimisée (≤5$/mois)
- Enrichissement automatique des leads (détection réseau, génération email)
- Filtrage par qualité (A/B/C/D)
- Export vers Google Sheets

### 🔧 Credentials à créer

#### 1. Apify API Key (HTTP Header Auth)
- **Type :** `HTTP Header Auth`
- **Nom :** `Apify API Key`
- **Configuration :**
  - **Header Name :** (laisser vide, géré par le query param)
  - Aller sur https://console.apify.com
  - Settings → Integrations → Personal API Token
  - Copier le token

#### 2. Google Sheets OAuth2
- **Type :** `Google Sheets OAuth2 API`
- **Nom :** `Google Sheets Account`
- (Voir configuration détaillée dans Workflow A)

### 📊 Structure Google Sheets

**Nom du fichier :** `RentrerDesMandats - Base Leads`  
**Onglet requis :** `Chasse`

**Colonnes (dans l'ordre exact) :**
```
A: Prénom
B: Nom
C: Email
D: Téléphone
E: Réseau
F: Ville
G: Département
H: Code Postal
I: Note Google
J: Nb Avis
K: Site Web
L: Score
M: Niveau
N: URL Google
O: Date Scraping
P: Statut
```

**Ajoutez une colonne optionnelle pour le Cold Email :**
```
Q: Date_Contact
```

### ⚙️ Configuration Apify FREE TIER

**Paramètres par défaut (dans le node "Config Apify") :**
```json
{
  "searchStringsArray": [
    "agent immobilier Lyon",
    "mandataire immobilier Lyon"
  ],
  "maxCrawledPlacesPerSearch": 50,
  "language": "fr",
  "skipClosedPlaces": true,
  "maxImages": 0,
  "maxReviews": 0,
  "oneReviewPerPlace": false,
  "scrapeContactInfo": true,
  "additionalInfo": true,
  "proxyConfiguration": {
    "useApifyProxy": true
  }
}
```

**⚠️ IMPORTANT - Limites Free Tier :**
- **Budget mensuel gratuit :** 5 USD
- **Coût moyen par run (50 places) :** ~0.50-1 USD
- **Max runs/mois conseillé :** 5-10 runs
- **Pour augmenter le volume :** Passer `maxCrawledPlacesPerSearch` à 200-500 (coût ~2-5$/run)

### 🎯 Niveaux de Qualité

Le script d'enrichissement attribue automatiquement un score :

| Niveau | Score | Critères |
|--------|-------|----------|
| **A** | ≥70% | Email généré + Réseau détecté + Téléphone |
| **B** | ≥50% | Email généré + (Réseau OU Téléphone) |
| **C** | ≥30% | Réseau détecté |
| **D** | <30% | Données incomplètes (filtré par défaut) |

### 📝 Exemple de résultat

**Input Apify :**
```
Titre: "John Doe - Mandataire IAD France Lyon"
Téléphone: 06 12 34 56 78
```

**Output après enrichissement :**
```json
{
  "prenom": "John",
  "nom": "Doe",
  "email": "john.doe@iad-france.fr",
  "telephone": "06 12 34 56 78",
  "reseau_nom": "IAD France",
  "ville": "Lyon",
  "score_qualite": 85,
  "niveau_qualite": "A",
  "statut": "NOUVEAU"
}
```

### ✅ Checklist d'installation

- [ ] Créer un compte Apify (gratuit)
- [ ] Récupérer l'API Token Apify
- [ ] Créer le credential HTTP Header Auth dans n8n
- [ ] Créer le Google Sheet avec les colonnes exactes
- [ ] Créer le credential Google Sheets dans n8n
- [ ] Importer le JSON dans n8n
- [ ] Remplacer les placeholders `=== ... ===`
- [ ] Modifier les mots-clés de recherche (ville, réseau cible)
- [ ] Tester avec `maxCrawledPlacesPerSearch: 10` d'abord
- [ ] Vérifier le coût sur https://console.apify.com/billing
- [ ] Lancer un scraping complet
- [ ] Vérifier les résultats dans Google Sheets

### 💡 Conseils d'utilisation

**Pour vendre ce workflow en Upsell :**
1. Exporter le JSON
2. Créer un tutoriel vidéo Loom (5-10min)
3. Fournir un CSV de 50 leads "starter"
4. Documenter les limites Free Tier
5. Prix conseillé : 97€ (One Time Offer)

---

## 📧 WORKFLOW C - COLD EMAIL INTELLIGENT

### 📋 Vue d'ensemble
Workflow de prospection automatisée avec :
- Trigger automatique (Schedule : Lun-Ven 9h00)
- Lecture Google Sheets (statut "A_CONTACTER")
- Envoi par paquets de 10 avec délais aléatoires
- Update automatique du statut → "CONTACTÉ"

### 🔧 Credentials à créer

#### 1. Brevo API
- **Type :** `Brevo API`
- **Nom :** `Brevo API`
- (Voir configuration détaillée dans Workflow A)

#### 2. Google Sheets OAuth2
- **Type :** `Google Sheets OAuth2 API`
- **Nom :** `Google Sheets Account`
- (Voir configuration détaillée dans Workflow A)

### 📊 Google Sheets (utilise le même que Workflow B)

**Onglet :** `Chasse`  
**Colonnes requises :** (Voir Workflow B)

**Workflow de statuts :**
```
NOUVEAU → (manuel) → A_CONTACTER → (auto) → CONTACTÉ → (manuel) → EN_DISCUSSION → (manuel) → CONVERTI
```

### 📧 Template Brevo Cold Email

**Nom du template :** `Cold Email - Solution IA Mandataires`

**Variables disponibles :**
- `{{ params.prenom }}` → Prénom du lead
- `{{ params.nom }}` → Nom du lead
- `{{ params.reseau }}` → Réseau (IAD, Safti, etc.)
- `{{ params.ville }}` → Ville du lead

**Exemple de template :**
```html
<p>Bonjour {{ params.prenom }},</p>

<p>Je m'adresse spécifiquement aux conseillers {{ params.reseau }} de {{ params.ville }}.</p>

<p>Avec la nouvelle loi du 11 août 2026 qui interdit le démarchage téléphonique, 
beaucoup d'agents se demandent comment continuer à générer des mandats...</p>

<p>J'ai créé une solution complète (Prompts IA + Scripts + Formation) spécialement 
pour les mandataires qui veulent adapter leur prospection.</p>

<p><a href="https://rentrerdesmandats.fr">Découvrir la solution →</a></p>

<p>Cordialement,<br>
Antoine<br>
RentrerDesMandats.fr</p>
```

### ⏰ Configuration Schedule

**Expression Cron par défaut :** `0 9 * * 1-5`  
**Signification :** Tous les jours à 9h00, du lundi au vendredi

**Modifier l'heure d'envoi :**
- 8h00 : `0 8 * * 1-5`
- 10h30 : `30 10 * * 1-5`
- 14h00 : `0 14 * * 1-5`

**Désactiver temporairement :**
Utilisez le toggle "Active" en haut du workflow

### 🔐 Système Anti-Spam

**Protection intégrée :**
- ✅ Max 10 emails par paquet
- ✅ Délai aléatoire 2-5 minutes entre chaque email
- ✅ Pause de 10 minutes entre les paquets
- ✅ Envoi uniquement aux leads "A_CONTACTER"
- ✅ Update automatique → "CONTACTÉ" pour éviter les doublons

**Limites recommandées :**
- **Maximum par jour :** 50-100 emails
- **Maximum par domaine d'envoi :** 200 emails/semaine
- **Domaine conseillé :** Utiliser .com pour la prospection (pas le .fr principal)

### 📊 Exemple de flux complet

**Matin 9h00 - Exécution automatique :**
```
1. Lecture GSheet → 35 leads "A_CONTACTER" trouvés
2. Split en 4 paquets (10+10+10+5)
3. Paquet 1 (10 emails) :
   - Email 1 envoyé → attente 3min12s
   - Email 2 envoyé → attente 4min55s
   - ... (suite)
   - Email 10 envoyé
4. Pause 10 minutes
5. Paquet 2 (10 emails) : (idem)
6. Pause 10 minutes
7. Paquet 3 (10 emails) : (idem)
8. Pause 10 minutes
9. Paquet 4 (5 emails) : (idem)
10. Fin → Tous passés en "CONTACTÉ"
```

**Durée totale estimée :** ~1h30 pour 35 emails

### ✅ Checklist d'installation

- [ ] Créer le credential Brevo dans n8n
- [ ] Créer le credential Google Sheets dans n8n
- [ ] Créer le template email dans Brevo
- [ ] Noter l'ID du template Brevo
- [ ] Vérifier que le Google Sheet a bien la colonne "Statut"
- [ ] Importer le JSON dans n8n
- [ ] Remplacer les placeholders `=== ... ===`
- [ ] **TEST IMPORTANT :** Mettre UN SEUL lead en "A_CONTACTER" avec VOTRE email
- [ ] Désactiver le Schedule et tester manuellement
- [ ] Vérifier réception de l'email
- [ ] Vérifier que le statut est passé à "CONTACTÉ" dans GSheet
- [ ] Configurer l'heure d'envoi souhaitée (Schedule)
- [ ] Activer le workflow

### ⚠️ Domaine d'envoi

**Configuration Brevo :**
1. Aller dans Settings → Senders & IP
2. Ajouter et vérifier `contact@rentrerdesmandats.com`
3. **Important :** Utiliser un sous-domaine ou domaine secondaire pour la prospection
4. Exemple : `prospection@rentrerdesmandats.com` ou utiliser le `.com` si votre site est en `.fr`

---

## 🚀 ORDRE D'INSTALLATION RECOMMANDÉ

1. **WORKFLOW A - HUB COMMERCIAL** (1-2h)
   - Commencer par celui-ci car il gère vos ventes
   - Tester d'abord le webhook Landing Page
   - Puis configurer Stripe en mode test
   
2. **WORKFLOW B - LE CHASSEUR** (30min-1h)
   - Lancer un premier scraping avec 10 résultats
   - Vérifier la qualité de l'enrichissement
   - Ajuster les mots-clés de recherche
   
3. **WORKFLOW C - COLD EMAIL** (30min)
   - Faire un test avec 1 seul lead (votre email)
   - Vérifier la personnalisation du template
   - Activer le schedule quand tout fonctionne

**Temps total d'installation :** 2-4 heures

---

## 📞 SUPPORT

**En cas de problème :**
1. Vérifier les logs d'exécution dans n8n
2. Tester chaque node individuellement
3. Vérifier que tous les placeholders `=== ... ===` sont remplacés
4. Vérifier les permissions API (Google Sheets, Brevo, Apify)

**Ressources utiles :**
- Documentation n8n : https://docs.n8n.io
- Documentation Brevo : https://developers.brevo.com
- Documentation Apify : https://docs.apify.com
- Google Sheets API : https://developers.google.com/sheets

---

**Version :** 1.0 Production  
**Dernière mise à jour :** 30 Janvier 2026  
**Compatibility n8n :** v1.0+
