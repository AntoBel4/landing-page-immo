# Kit Mandataire Immo 2026 - Landing Page High Conversion

**Version :** 1.0 (Tech Premium 2026 Release)  
**Dernière mise à jour :** Janvier 2026

---

## 🎯 Objectif
Cette landing page a pour but unique de **vendre un kit d'outils IA à 47€** pour les agents immobiliers et mandataires.
L'angle marketing principal est la conformité à la **Loi du 11 août 2026** (interdiction du démarchage téléphonique) pour créer un sentiment d'urgence.

---

## 🛠️ Stack Technique
Le projet est construit sur des bases saines et performantes, sans dépendances lourdes :
*   **HTML5** : Structure sémantique et "Mobile-First".
*   **CSS3** : Design System moderne (Variables CSS, Flexbox/Grid).
    *   *Esthétique* : "Tech Premium 2026" (Glassmorphism, Dégradés Blue-500/Slate-900, Ombres douces).
*   **JS Vanilla** : Scripts légers pour les interactions critiques (Modales, FAQ accordéon).

---

## 📂 Structure des fichiers

Le projet est organisé pour être facile à maintenir :

```bash
/landing-page-immo
├── index.html          # La Landing Page principale (Conversion)
├── css/
│   └── style.css       # Tout le design (Variables, Responsive, Animations)
├── js/
│   └── main.js         # Scripts optionnels (peut être vide si tout est inline)
├── sources/            # [IMPORTANT] Code source du Lead Magnet
│   └── guide-immo.html # Template HTML du PDF gratuit "5 Stratégies IA"
├── assets/             # Images, icônes, logos
└── legal/              # Pages légales (CGV, Mentions Légales)
```

---

## 📄 Procédure de mise à jour du PDF (Lead Magnet)

Le guide gratuit ("5 Stratégies IA pour rentrer des mandats") est généré à partir d'une page HTML standard, pour faciliter les mises à jour sans logiciel de design complexe.

**Pour modifier le contenu du PDF :**
1.  Ouvrez le fichier `landing-page-immo/sources/guide-immo.html` dans votre éditeur de code.
2.  Modifiez le texte ou les styles directement en HTML/CSS.
3.  Ouvrez ce fichier dans votre navigateur Chrome ou Edge.
4.  Faites **CTRL + P** (Imprimer) > "Enregistrer au format PDF".
    *   *Astuce* : Cochez "Graphiques d'arrière-plan" dans les options d'impression pour garder les couleurs.
5.  Le PDF généré est prêt à être envoyé aux prospects.

---

## ✅ To-Do List (Prochaines étapes)

La V1 est prête visuellement et structurellement. Voici les actions pour le lancement :

*   [ ] **Paiement Stripe** : Remplacer les liens `%%STRIPE_PAYMENT_LINK%%` dans `index.html` par vos vrais liens de paiement Stripe Pro (Mode Live).
*   [ ] **Capture Email (Auto-répondeur)** : Connecter le formulaire `#leadForm` à votre outil (Systeme.io, Mailchimp, ConvertKit) ou via un Webhook n8n.
*   [ ] **Hébergement** : Mettre le dossier `landing-page-immo` en ligne.
    *   *Recommandé* : Vercel ou Netlify (Gratuit et rapide pour du statique).
    *   *Alternative* : Hostinger ou tout hébergeur PHP/HTML classique (via FTP).
*   [ ] **Analytics** : Ajouter le script Google Analytics ou Plausible dans le `<head>`.

---

**Note** : Le design a été optimisé pour le mobile (375px) et vérifié pour respecter la hiérarchie visuelle de conversion. Ne modifiez les variables CSS (`:root`) qu'en connaissance de cause.
