# Amélioration du texte de consentement - CGU et Politique de Confidentialité

## Résumé

Le texte de la checkbox de consentement a été mis à jour pour inclure des liens cliquables vers les CGU et la Politique de Confidentialité.

## Modifications effectuées

### 1. Nouveau texte de consentement

**Texte actuel** :
```
J'accepte les Conditions Générales d'Utilisation et la Politique de Confidentialité d'Afroé,
et je confirme que les informations fournies sont exactes. *
```

### 2. Liens cliquables

Deux liens ont été ajoutés :

1. **Conditions Générales d'Utilisation**
   - URL : `/cgu`
   - Style : Souligné avec couleur du thème
   - Comportement : Ouvre dans un nouvel onglet

2. **Politique de Confidentialité**
   - URL : `/confidentialite`
   - Style : Souligné avec couleur du thème
   - Comportement : Ouvre dans un nouvel onglet

### 3. Attributs de sécurité

Tous les liens incluent :
```tsx
target="_blank"
rel="noopener noreferrer"
```

**Sécurité** : Empêche les vulnérabilités de type reverse tabnabbing.

**Comportement** : `onClick={(e) => e.stopPropagation()}` empêche le clic sur le lien de cocher/décocher la checkbox.

### 4. Message d'erreur mis à jour

**Ancien** : "Vous devez accepter la politique de confidentialité pour continuer."

**Nouveau** : "Veuillez accepter les CGU et la Politique de Confidentialité pour continuer."

### 5. Validation maintenue

- La checkbox reste obligatoire (attribut `required`)
- L'astérisque (*) est toujours affiché
- Impossible de soumettre le formulaire si décoché
- Message d'erreur clair si l'utilisateur tente de soumettre sans cocher

## Fichiers modifiés

### 1. WaitlistForm.tsx
**Chemin** : `app/components/WaitlistForm.tsx`

**Modifications** :
- Ligne 63 : Message d'erreur mis à jour
- Lignes 299-321 : Label de la checkbox avec liens

**Thème** : Clair (fond blanc)
- Couleur des liens : `text-purple-600 hover:text-purple-700`

### 2. AfroeWaitlistLandingV2.tsx
**Chemin** : `app/components/AfroeWaitlistLandingV2.tsx`

**Modifications** :
- Ligne 157 : Message d'alerte mis à jour
- Lignes 458-480 : Label de la checkbox avec liens

**Thème** : Sombre (fond slate-950)
- Couleur des liens : `text-fuchsia-400 hover:text-fuchsia-300`

## Comportement

### Clic sur le lien
1. Le lien s'ouvre dans un nouvel onglet
2. La checkbox ne se coche/décoche pas
3. L'utilisateur reste sur le formulaire

### Clic sur le label (en dehors des liens)
1. La checkbox se coche/décoche normalement
2. Comportement standard d'une checkbox HTML

### Soumission du formulaire
1. Si checkbox non cochée → Message d'erreur affiché
2. Si checkbox cochée → Formulaire validé et soumis

## Routes à créer

Pour compléter l'intégration, créer les pages suivantes :

1. **Page CGU** : `app/cgu/page.tsx`
2. **Page Politique de Confidentialité** : `app/confidentialite/page.tsx`

## Conformité légale

Cette modification améliore la conformité RGPD en :
- Rendant les CGU et la Politique facilement accessibles
- Séparant clairement les deux documents
- Permettant à l'utilisateur de les consulter avant de consentir
- Exigeant un consentement explicite et éclairé
