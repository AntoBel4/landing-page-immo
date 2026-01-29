# 🚀 LANDING PAGE - GUIDE D'INSTALLATION

## Structure des fichiers

```
landing-page/
├── index.html              ← Page principale
├── css/
│   └── style.css           ← Styles
├── js/
│   └── main.js             ← JavaScript (webhooks, interactions)
├── legal/
│   ├── mentions-legales.html
│   └── cgv.html
├── assets/                 ← À créer : tes images
│   ├── logo.svg
│   └── mockup-kit.png
└── downloads/              ← À créer : fichiers téléchargeables
    ├── a7x9k2m4/           ← Dossier avec nom aléatoire (sécurité)
    │   └── lead-magnet-v3.pdf
    └── b8y2l5n6/
        └── Kit_Mandataire_2026_PRO.zip
```

---

## 🔧 ÉTAPE 1 : Configuration Caddy (VPS)

Ajoute cette configuration dans ton Caddyfile :

```caddy
rentrerdesmandats.fr {
    root * /var/www/rentrerdesmandats.fr
    file_server
    
    # Compression
    encode gzip
    
    # Cache pour assets statiques
    @static {
        path *.css *.js *.png *.jpg *.svg *.woff2
    }
    header @static Cache-Control "public, max-age=31536000"
    
    # Sécurité headers
    header {
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
}
```

Puis redémarre Caddy :
```bash
sudo systemctl reload caddy
```

---

## 🔧 ÉTAPE 2 : Déploiement des fichiers

```bash
# Créer le dossier
sudo mkdir -p /var/www/rentrerdesmandats.fr

# Copier les fichiers (depuis ton local)
scp -r landing-page/* user@ton-vps:/var/www/rentrerdesmandats.fr/

# Permissions
sudo chown -R www-data:www-data /var/www/rentrerdesmandats.fr
sudo chmod -R 755 /var/www/rentrerdesmandats.fr
```

---

## 🔧 ÉTAPE 3 : Configuration JavaScript

Édite `/var/www/rentrerdesmandats.fr/js/main.js` et remplace les placeholders :

```javascript
const CONFIG = {
    // TON webhook n8n réel
    webhookLeadUrl: 'https://n8n.rentrerdesmandats.fr/webhook/lead',
    
    // TON Payment Link Stripe réel
    stripePaymentLink: 'https://buy.stripe.com/XXXXXXXXXXXXXXX'
};
```

---

## 🔧 ÉTAPE 4 : Créer le Payment Link Stripe

1. Va sur https://dashboard.stripe.com/payment-links
2. Clique "Nouveau lien de paiement"
3. Configure :
   - Nom : "Kit Mandataire 2026"
   - Prix : 47€ (paiement unique)
   - Collecter : Email
4. Copie le lien généré et colle-le dans main.js

---

## 🔧 ÉTAPE 5 : URLs des fichiers téléchargeables

### PDF Gratuit (Lead Magnet)
URL : `https://rentrerdesmandats.fr/downloads/a7x9k2m4/lead-magnet-v3.pdf`

### ZIP Payant (Kit)
URL : `https://rentrerdesmandats.fr/downloads/b8y2l5n6/Kit_Mandataire_2026_PRO.zip`

> 💡 Change les noms de dossiers (`a7x9k2m4`, `b8y2l5n6`) par des chaînes aléatoires 
> de ton choix pour éviter les accès non autorisés.

---

## 🔧 ÉTAPE 6 : Workflow n8n "Lead"

Crée un nouveau workflow dans n8n avec :

### Trigger : Webhook
- Méthode : POST
- Path : `/lead`
- Response : Immediately

### Nœud 1 : Google Sheets (Append)
- Spreadsheet : Ta feuille "Prospects"
- Colonnes : Email, Source, Timestamp, Status="LEAD"

### Nœud 2 : Brevo (Add Contact)
- Email : `{{ $json.email }}`
- List : "Leads Landing Page"
- Attributes : source, timestamp

### Nœud 3 : Brevo (Send Email)
- To : `{{ $json.email }}`
- Template ID : [Ton template "Voici votre PDF"]
- Params : 
  - download_url : "https://rentrerdesmandats.fr/downloads/a7x9k2m4/lead-magnet-v3.pdf"

---

## 🔧 ÉTAPE 7 : Workflow n8n "Stripe Success"

### Trigger : Webhook
- Méthode : POST
- Path : `/stripe-success`

### Nœud 1 : IF (vérifier event type)
- Condition : `{{ $json.type }}` = "checkout.session.completed"

### Nœud 2 : Google Sheets (Update)
- Chercher par email
- Mettre Status = "VENDU"

### Nœud 3 : Brevo (Update Contact)
- Ajouter à liste "Acheteurs"
- Retirer de liste "Leads" (stop séquence)

### Nœud 4 : Brevo (Send Email)
- Template : "Merci pour votre achat"
- Params :
  - download_url : "https://rentrerdesmandats.fr/downloads/b8y2l5n6/Kit_Mandataire_2026_PRO.zip"

---

## 🔧 ÉTAPE 8 : Configurer Stripe Webhook

1. Va sur https://dashboard.stripe.com/webhooks
2. Ajoute un endpoint :
   - URL : `https://n8n.rentrerdesmandats.fr/webhook/stripe-success`
   - Events : `checkout.session.completed`
3. Copie le "Signing secret" pour vérification (optionnel mais recommandé)

---

## ✅ CHECKLIST AVANT LANCEMENT

- [ ] Landing page accessible sur https://rentrerdesmandats.fr
- [ ] Formulaire email fonctionne (test avec ton email)
- [ ] Email avec PDF reçu automatiquement
- [ ] Bouton "Acheter" redirige vers Stripe
- [ ] Paiement test fonctionne
- [ ] Email avec ZIP reçu après paiement
- [ ] Mentions légales complétées (nom, SIRET, adresse)
- [ ] CGV vérifiées

---

## 🔥 COMMANDES UTILES

```bash
# Voir les logs Caddy
sudo journalctl -u caddy -f

# Tester la config Caddy
caddy validate --config /etc/caddy/Caddyfile

# Vérifier que le site est up
curl -I https://rentrerdesmandats.fr
```

---

## 📞 SUPPORT

Si tu bloques sur une étape, n'hésite pas à me demander !
