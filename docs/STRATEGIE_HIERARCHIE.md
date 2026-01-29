# STRATÉGIE DE HIÉRARCHIE VISUELLE - Landing Page Agent Immobilier

## OBJECTIF
Créer un tunnel visuel qui guide l'œil du visiteur vers **2 actions critiques** :
1. **Regarder la vidéo** (éducation)
2. **Cliquer sur le bouton d'achat** (conversion)

---

## ARCHITECTURE VISUELLE - NIVEAU PAR NIVEAU

### NIVEAU 1 : ⭐⭐⭐ ATTENTION MAXIMALE (3 étoiles)

**Éléments concernés :**
- Video placeholder (Hero)
- Bouton "Accéder au Kit — 47€" (Pricing + Final CTA)

**Directives visuelles :**

```css
/* VIDEO */
- Shadow: 0 20px 40px rgba(0,0,0,0.18)
- Glow: 0 0 48px rgba(59, 130, 246, 0.2) au hover
- Border: 2px solid rgba(59, 130, 246, 0.2)
- Scale hover: translateY(-4px)
- Taille: max-width 900px (70% de la largeur container)

/* BOUTON ACHAT */
- Gradient: linear-gradient(135deg, #3B82F6, #2563EB)
- Shadow: 0 12px 32px rgba(59, 130, 246, 0.3)
- Glow hover: 0 0 56px rgba(59, 130, 246, 0.5)
- Font: 1.25rem (20px) / 700 weight
- Padding: 1.25rem 2.5rem (20px 40px)
- Animation: Ripple effect au hover (cercle blanc qui s'étend)
```

**Positionnement stratégique :**
- Video : Immédiatement après le H1 (ligne 56-64 du HTML)
- Bouton achat : 3 emplacements
  1. Dans la pricing card (ligne ~340)
  2. Ancre rapide dans le header (optionnel)
  3. Final CTA (ligne 495)

---

### NIVEAU 2 : ⭐⭐ ATTENTION SECONDAIRE (2 étoiles)

**Éléments concernés :**
- Titre H1 ("Vous avez 6 mois...")
- Prix "47€" dans la pricing card
- Section "Problem" (loi du 11 août)
- ROI Box

**Directives visuelles :**

```css
/* TITRES PRINCIPAUX */
- Font-size: clamp(2.5rem, 6vw, 4.5rem)
- Font-weight: 800
- Letter-spacing: -0.03em
- Color: #0A0E27 (contrast max)
- Highlight color: #3B82F6

/* PRIX */
- Font-size: 4.5rem
- Font-weight: 800
- Text-shadow: 0 4px 12px rgba(0,0,0,0.3)
- Background gradient sur le header de la pricing card

/* CARDS IMPORTANTES */
- Shadow: 0 12px 24px rgba(0,0,0,0.15)
- Border: 2px pour la problem-card-main
- Hover: translateY(-4px)
```

---

### NIVEAU 3 : ⭐ ATTENTION STANDARD (1 étoile)

**Éléments concernés :**
- GPT cards
- Solution steps
- Bonus box
- FAQ items
- Textes descriptifs

**Directives visuelles :**

```css
/* CARDS STANDARD */
- Shadow: 0 4px 12px rgba(0,0,0,0.12)
- Border: 1px solid rgba(226, 232, 240, 0.8)
- Glassmorphism: blur(16px) saturate(120%)
- Hover subtil: translateY(-2px)

/* TEXTES */
- Font-size: 1.125rem (18px) pour les paragraphes
- Color: #475569 (Slate-600) pour les subtitles
- Line-height: 1.6 (lisibilité)
```

---

### NIVEAU 4 : BACKGROUND / SUPPORT

**Éléments concernés :**
- Background gradients
- Header glassmorphism
- Footer
- Borders et séparateurs

**Directives visuelles :**

```css
/* ÉLÉMENTS DE FOND */
- Opacity: 0.04-0.08 pour les gradients radiaux
- Blur: 20px pour le header backdrop
- Colors: rgba() avec transparence
- Aucune shadow portée
```

---

## RÈGLES D'OR DE LA HIÉRARCHIE

### 1. CONTRASTE DE TAILLE
```
Niveau 1 (Video/Bouton) = 100% scale
Niveau 2 (Titres/Prix)  = 70-80% scale
Niveau 3 (Cards)        = 50-60% scale
Niveau 4 (Support)      = 20-30% scale
```

### 2. CONTRASTE DE COULEUR
```
Niveau 1 : Gradient blue (#3B82F6 → #2563EB) + Glow
Niveau 2 : Solid colors foncées (#0A0E27)
Niveau 3 : Greys moyens (#475569)
Niveau 4 : Greys clairs / transparents (rgba)
```

### 3. CONTRASTE DE SHADOW
```
Niveau 1 : Shadow XL (20-40px blur) + Glow effect
Niveau 2 : Shadow LG (12-24px blur)
Niveau 3 : Shadow MD (4-12px blur)
Niveau 4 : Shadow SM (1-3px blur) ou aucune
```

### 4. CONTRASTE DE MOUVEMENT
```
Niveau 1 : Hover = translateY(-3px) + scale(1.1) sur play button
Niveau 2 : Hover = translateY(-4px)
Niveau 3 : Hover = translateY(-2px)
Niveau 4 : Aucun mouvement
```

---

## FLUX VISUEL IDÉAL (Eye Tracking Path)

```
ENTRÉE SUR LA PAGE
        ↓
   [Badge "6 mois"]  ← Urgence
        ↓
  [Titre H1 massif]  ← Accroche
        ↓
   [Sous-titre]      ← Bénéfice
        ↓
 [★ VIDEO 16:9 ★]    ← STAR #1 - Éducation
        ↓
[Bouton télécharger guide] ← Lead magnet
        ↓
    [Social proof]   ← Crédibilité
        ↓
        ↓
   [Scroll naturel]
        ↓
  [Section Problem]  ← Amplifier la douleur
        ↓
  [Section Solution] ← Introduire la méthode
        ↓
        ↓
 [★ PRICING CARD ★]  ← Ancre visuelle
        ↓
[★ BOUTON ACHAT 47€ ★] ← STAR #2 - Conversion
        ↓
    [ROI Calculator] ← Justification rationnelle
        ↓
    [FAQ]            ← Lever les objections
        ↓
  [Final CTA]        ← Dernière chance
        ↓
 [★ BOUTON ACHAT ★]  ← Conversion finale
```

---

## CHECKLIST DE VALIDATION HIÉRARCHIQUE

Avant de livrer le site à Antigravity, vérifier :

### ✅ CONTRASTE VISUEL
- [ ] La video a-t-elle le plus gros shadow de toute la page ?
- [ ] Le bouton achat a-t-il un glow visible au hover ?
- [ ] Les titres secondaires sont-ils 30-40% plus petits que le H1 ?

### ✅ ESPACEMENT
- [ ] Y a-t-il au moins 80px (5rem) autour de la video ?
- [ ] Y a-t-il au moins 60px (3.75rem) autour de la pricing card ?
- [ ] Les sections sont-elles espacées de 96px (6rem) minimum ?

### ✅ COULEUR
- [ ] Le bleu #3B82F6 est-il réservé aux éléments Niveau 1-2 uniquement ?
- [ ] Les greys sont-ils progressifs (dark → light) ?
- [ ] Les backgrounds ont-ils une opacité < 0.1 ?

### ✅ RESPONSIVE
- [ ] La video garde-t-elle son ratio 16:9 sur mobile ?
- [ ] Les boutons font-ils au moins 48px de hauteur sur mobile ?
- [ ] Le prix "47€" reste-t-il lisible (min 3rem sur mobile) ?

### ✅ INTERACTIONS
- [ ] Le bouton achat a-t-il 3 états (normal/hover/active) ?
- [ ] La video a-t-elle une animation hover smooth ?
- [ ] Les cards ont-elles un hover subtil (2px lift) ?

---

## DIFFÉRENCIATION MOBILE VS DESKTOP

### DESKTOP (> 768px)
- Video : 900px max-width, centré
- Bouton achat : width auto (padding généreux)
- Grids : 2-3 colonnes
- Spacing : généreux (6rem entre sections)

### MOBILE (≤ 768px)
- Video : 100% width, 16px padding latéral
- Bouton achat : width 100%, stack vertical
- Grids : 1 colonne
- Spacing : réduit (4rem entre sections)

**IMPORTANT** : Sur mobile, la video et le bouton achat doivent rester **encore plus imposants** car l'attention est fragmentée.

---

## MÉTRIQUES DE SUCCÈS

Si la hiérarchie visuelle est correcte, vous devriez observer :

1. **Heatmap** : 80%+ des regards se concentrent sur video + bouton achat
2. **Scroll depth** : 60%+ des visiteurs scroll jusqu'à la pricing card
3. **Click-through** : Video cliquée par 40%+ des visiteurs
4. **Conversion** : Bouton achat cliqué par 8-12% des visiteurs (benchmark SaaS)

---

**PROCHAINE ÉTAPE** : Implémenter les 2 fichiers d'instructions (COPYWRITING + DESIGN) sur Antigravity
