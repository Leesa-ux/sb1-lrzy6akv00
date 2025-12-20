# Champ téléphone Belgique - Amélioration UX

## Résumé

Le champ de numéro de téléphone a été optimisé pour l'expérience utilisateur belge avec un préfixe +32 fixe et une validation intelligente.

## Changements effectués

### 1. Préfixe fixe +32

Le préfixe **+32** (Belgique) est maintenant :
- Affiché de manière visible dans un badge au début du champ
- Non modifiable par l'utilisateur
- Automatiquement ajouté au numéro final

### 2. Format d'entrée

L'utilisateur saisit uniquement :
- **8 ou 9 chiffres** (sans le 0 initial)
- Exemple : `466141824` ou `466 14 18 24`

Le numéro final envoyé au backend : `+32466141824`

### 3. Validation intelligente

**Prévention en temps réel** :
- ❌ Impossible de saisir le `0` en première position
- ❌ Espaces automatiquement ignorés
- ❌ Caractères non-numériques bloqués
- ❌ Limitation à 9 chiffres maximum

**Validation affichée** :
- ⚠ "Ne pas inclure le 0 initial" (si 0 détecté)
- ⚠ "Le numéro doit contenir au moins 8 chiffres" (si < 8)
- ⚠ "Le numéro ne peut pas dépasser 9 chiffres" (si > 9)

### 4. Formatage visuel

Le numéro est automatiquement formaté pendant la saisie :
```
466         → 466
46614       → 466 14
4661418     → 466 14 18
466141824   → 466 14 18 24
```

### 5. Placeholder et aide

**Placeholder** : `466 14 18 24`

**Texte d'aide** :
- Version claire : "Indicatif Belgique +32 inclus automatiquement"
- Avec icône de sécurité pour rassurer l'utilisateur

**Aperçu en temps réel** :
Affichage du numéro complet pendant la saisie (ex: `+32466141824`)

### 6. Gestion du copier-coller

Le composant nettoie intelligemment le contenu collé :
- `+32466141824` → extrait `466141824`
- `0466141824` → retire le `0` → `466141824`
- `466 14 18 24` → nettoie les espaces → `466141824`

## Composants créés

### 1. PhoneInputBelgium (version claire)
**Fichier** : `components/ui/phone-input-belgium.tsx`

**Usage** :
```tsx
import { PhoneInputBelgium } from '@/components/ui/phone-input-belgium';

<PhoneInputBelgium
  value={phone}
  onChange={(value) => setPhone(value)}
  required={true}
/>
```

**Style** : Fond blanc, thème clair (pour WaitlistForm)

### 2. PhoneInputBelgiumDark (version sombre)
**Fichier** : `app/components/PhoneInputBelgiumDark.tsx`

**Usage** :
```tsx
import { PhoneInputBelgiumDark } from './PhoneInputBelgiumDark';

<PhoneInputBelgiumDark
  value={phone}
  onChange={setPhone}
  required={true}
/>
```

**Style** : Fond slate-900, thème sombre (pour AfroeWaitlistLandingV2)

## Intégration

### Pages mises à jour

1. **WaitlistForm.tsx**
   - Utilise `PhoneInputBelgium` (thème clair)
   - Ligne 205-210

2. **AfroeWaitlistLandingV2.tsx** (page principale)
   - Utilise `PhoneInputBelgiumDark` (thème sombre)
   - Ligne 331-335

## Format backend

Le numéro est envoyé au backend au format **E.164** :
```
+32466141824
```

Ce format est compatible avec :
- ✅ API Brevo SMS
- ✅ Normalisation via `normalizePhone()` dans `/lib/phone-utils.ts`
- ✅ Validation backend existante

## Compatibilité

**Aucun changement backend requis** :
- La logique backend reste identique
- Le format E.164 est déjà supporté
- Les validations existantes fonctionnent

## Avantages UX

1. **Moins d'erreurs** : L'utilisateur ne peut pas se tromper de format
2. **Plus rapide** : Saisie directe sans se soucier du format
3. **Plus clair** : Le préfixe +32 est visible et rassurant
4. **Guidage** : Le placeholder montre exactement le format attendu
5. **Feedback** : Validation en temps réel avec messages explicites
6. **Sécurité** : Texte d'aide rappelant le but du numéro

## Exemples de saisie

### Saisie correcte
```
Utilisateur tape : 4 6 6 1 4 1 8 2 4
Affichage       : 466 14 18 24
Badge           : +32
Envoyé          : +32466141824
```

### Saisie avec erreur
```
Utilisateur tape : 0 4 6 6
Badge           : +32
Affichage       : 466 (le 0 est retiré automatiquement)
Message         : (aucun, mais pas de 0 affiché)
```

### Copier-coller
```
Utilisateur colle : +32 466 14 18 24
Nettoyage        : 466141824
Affichage        : 466 14 18 24
Badge            : +32
Envoyé           : +32466141824
```

## Tests recommandés

1. Saisir un numéro de 8 chiffres → ✅ Valide
2. Saisir un numéro de 9 chiffres → ✅ Valide
3. Essayer de taper 0 en premier → ❌ Bloqué
4. Essayer de taper des lettres → ❌ Bloqué
5. Copier-coller un numéro avec +32 → ✅ Nettoyé
6. Copier-coller un numéro avec 0 initial → ✅ 0 retiré
7. Soumettre avec moins de 8 chiffres → ❌ Message d'erreur
8. Soumettre avec 8-9 chiffres → ✅ Envoyé au backend

## Fichiers modifiés

- `✨ components/ui/phone-input-belgium.tsx` (nouveau)
- `✨ app/components/PhoneInputBelgiumDark.tsx` (nouveau)
- `📝 app/components/WaitlistForm.tsx` (modifié)
- `📝 app/components/AfroeWaitlistLandingV2.tsx` (modifié)

## Build

Le projet compile sans erreur :
```bash
npm run build
```

Résultat : ✅ Build réussi
