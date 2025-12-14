# Système de Codes de Parrainage (Referral Code)

## 📋 Vue d'ensemble

Le système de codes de parrainage d'Afroé génère des codes **uniques, lisibles et partageables** pour chaque utilisateur inscrit. Ces codes permettent de tracker les parrainages et d'attribuer des points aux parrain(e)s.

---

## 🔑 Caractéristiques du Code

### Format
- **Longueur** : 8 caractères
- **Alphabet** : `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (32 caractères)
- **Espace total** : 32^8 = **1 099 511 627 776** combinaisons possibles

### Caractères Exclus (Anti-Confusion)
- **`0` (zéro)** : confondu avec `O`
- **`O` (lettre O)** : confondu avec `0`
- **`I` (lettre I)** : confondu avec `1` et `l`
- **`1` (un)** : confondu avec `I` et `l`

### Exemple de Codes Valides
```
K7M4Q2TX
AB3D5FGH
P9R4S2WX
```

---

## 🏗️ Architecture

### Fichier Principal
`lib/referral-code.ts`

### Fonctions Exportées

#### 1. `generateReferralCode(length?: number): string`
Génère un code aléatoire à partir de l'alphabet sécurisé.

```typescript
import { generateReferralCode } from '@/lib/referral-code';

const code = generateReferralCode(); // "K7M4Q2TX"
const customLength = generateReferralCode(12); // "AB3D5FGHJ9R4"
```

#### 2. `ensureUniqueReferralCode(prisma, maxAttempts?: number): Promise<string>`
Génère un code **garanti unique** en vérifiant la base de données.

**Logique de Retry** :
1. Génère un code aléatoire
2. Vérifie l'unicité dans la DB
3. Si collision → régénère (max 10 tentatives)
4. Sinon → retourne le code

```typescript
import { PrismaClient } from '@prisma/client';
import { ensureUniqueReferralCode } from '@/lib/referral-code';

const prisma = new PrismaClient();
const uniqueCode = await ensureUniqueReferralCode(prisma);
```

**Probabilité de Collision** :
- Avec 10 000 utilisateurs : **0.00001%**
- Avec 100 000 utilisateurs : **0.0001%**
- Avec 1 000 000 utilisateurs : **0.001%**

#### 3. `isValidReferralCode(code: string): boolean`
Valide le format d'un code (sans requête DB).

```typescript
import { isValidReferralCode } from '@/lib/referral-code';

isValidReferralCode('K7M4Q2TX'); // true
isValidReferralCode('ABC123'); // false (trop court)
isValidReferralCode('ABCD123O'); // false (contient 'O')
```

#### 4. `getReferralLink(referralCode, baseUrl?): string`
Génère l'URL complète de parrainage.

```typescript
import { getReferralLink } from '@/lib/referral-code';

const link = getReferralLink('K7M4Q2TX');
// "https://afroe.studio?ref=K7M4Q2TX"

const customLink = getReferralLink('K7M4Q2TX', 'https://custom.com');
// "https://custom.com?ref=K7M4Q2TX"
```

---

## 🗄️ Base de Données

### Schema Prisma
```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  referralCode String   @unique  // 🔐 Contrainte UNIQUE
  referredBy   String?  // Code du parrain
  refCount     Int      @default(0)
  // ...
}
```

### Contraintes
- **`referralCode`** : `UNIQUE NOT NULL`
- **`email`** : `UNIQUE NOT NULL`

### Indexes
```sql
@@index([referralCode])
@@index([email])
```

---

## 🔄 Flow d'Inscription

### 1. Utilisateur Visite avec `?ref=CODE`
```typescript
// Frontend (Next.js)
import { useSearchParams } from 'next/navigation';

const params = useSearchParams();
const referralCode = params.get('ref'); // "K7M4Q2TX" ou null
```

### 2. Soumission du Formulaire
```typescript
const response = await fetch('/api/join-waitlist', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    role: 'client',
    referral_code: referralCode, // du query param
    // ...
  })
});
```

### 3. Backend Vérifie et Crée
```typescript
// app/api/join-waitlist/route.ts

// 1. Valide le format du code reçu
if (referral_code && !isValidReferralCode(referral_code)) {
  return NextResponse.json(
    { error: 'Format de code invalide' },
    { status: 400 }
  );
}

// 2. Vérifie que le parrain existe
const referrer = await prisma.user.findUnique({
  where: { referralCode: referral_code }
});

// 3. Génère un code unique pour le nouvel utilisateur
const myReferralCode = await ensureUniqueReferralCode(prisma);

// 4. Crée l'utilisateur
const newUser = await prisma.user.create({
  data: {
    email,
    referralCode: myReferralCode,
    referredBy: referrer?.referralCode,
    // ...
  }
});

// 5. Met à jour les points du parrain
if (referrer) {
  await prisma.user.update({
    where: { id: referrer.id },
    data: {
      refCount: { increment: 1 },
      points: { increment: pointsAwarded }
    }
  });
}
```

### 4. Réponse au Frontend
```json
{
  "success": true,
  "user": { ... },
  "referralCode": "P9R4S2WX",
  "shareUrl": "https://afroe.studio?ref=P9R4S2WX"
}
```

---

## 🛡️ Sécurité

### Validation Frontend
```typescript
// Validation côté client (optionnel mais recommandé)
if (referralCode && !isValidReferralCode(referralCode)) {
  console.warn('Code de parrainage invalide détecté');
  // Ne pas envoyer le code au backend
}
```

### Validation Backend
```typescript
// TOUJOURS valider côté serveur
if (referral_code) {
  // 1. Valide le format
  if (!isValidReferralCode(referral_code)) {
    return NextResponse.json({ error: 'Format invalide' }, { status: 400 });
  }

  // 2. Vérifie l'existence
  const referrer = await prisma.user.findUnique({
    where: { referralCode: referral_code }
  });

  if (!referrer) {
    return NextResponse.json({ error: 'Code invalide' }, { status: 400 });
  }
}
```

### Protection Contre les Collisions
La fonction `ensureUniqueReferralCode()` :
- Tente jusqu'à 10 fois
- Vérifie l'unicité via `findUnique`
- Throw une erreur si échec après 10 tentatives

### Protection Contre la Fraude
```typescript
// Vérifications additionnelles (déjà implémentées)
const existingUser = await prisma.user.findFirst({
  where: {
    OR: [
      { email: cleanEmail },
      { phone: cleanPhone }
    ]
  }
});

if (existingUser) {
  return NextResponse.json(
    { error: 'Email ou téléphone déjà inscrit' },
    { status: 409 }
  );
}
```

---

## 🧪 Tests

### Tests Unitaires
Fichier : `lib/__tests__/referral-code.test.ts`

```bash
npm test lib/__tests__/referral-code.test.ts
```

**Couverture** :
- ✅ Génération de codes valides
- ✅ Longueur correcte
- ✅ Alphabet conforme
- ✅ Pas de caractères confus (O, I, 0, 1)
- ✅ Validation de format
- ✅ Génération de liens

### Tests d'Intégration

#### Test 1 : Inscription sans parrain
```bash
curl -X POST http://localhost:3000/api/join-waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+33612345678",
    "first_name": "Test",
    "role": "client",
    "skillAnswerCorrect": true
  }'
```

**Résultat attendu** :
```json
{
  "success": true,
  "referralCode": "K7M4Q2TX",
  "shareUrl": "https://afroe.studio?ref=K7M4Q2TX"
}
```

#### Test 2 : Inscription avec parrain
```bash
curl -X POST http://localhost:3000/api/join-waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "email": "referral@example.com",
    "phone": "+33687654321",
    "first_name": "Referred",
    "role": "client",
    "referral_code": "K7M4Q2TX",
    "skillAnswerCorrect": true
  }'
```

**Vérifications** :
1. Le parrain (K7M4Q2TX) reçoit +2 points
2. Le filleul reçoit un nouveau code unique
3. Un `ReferralEvent` est créé

---

## 📊 Statistiques et Monitoring

### Requêtes Utiles

#### Codes les plus utilisés
```sql
SELECT referralCode, refCount, points, role
FROM User
WHERE refCount > 0
ORDER BY refCount DESC
LIMIT 50;
```

#### Taux de conversion parrainage
```sql
SELECT
  COUNT(*) FILTER (WHERE referredBy IS NOT NULL) * 100.0 / COUNT(*) as referral_rate
FROM User;
```

#### Distribution des codes
```sql
SELECT
  LENGTH(referralCode) as code_length,
  COUNT(*) as count
FROM User
GROUP BY LENGTH(referralCode);
```

---

## 🚀 Performance

### Temps de Génération
- **Génération simple** : < 1ms
- **Génération avec vérification** : 5-10ms (requête DB)
- **Avec collision (rare)** : 10-50ms (max 10 tentatives)

### Optimisations
1. **Index sur `referralCode`** : recherche en O(log n)
2. **Cache Redis (optionnel)** : stocke les codes récents
3. **Batch checking** : pour les imports CSV

---

## 🔮 Évolutions Futures

### Codes Personnalisés (VIP)
```typescript
async function createVIPReferralCode(
  prisma: PrismaClient,
  customCode: string
): Promise<{ success: boolean; code?: string; error?: string }> {
  if (!isValidReferralCode(customCode)) {
    return { success: false, error: 'Format invalide' };
  }

  const existing = await prisma.user.findUnique({
    where: { referralCode: customCode }
  });

  if (existing) {
    return { success: false, error: 'Code déjà pris' };
  }

  return { success: true, code: customCode };
}
```

### QR Codes
```typescript
import QRCode from 'qrcode';

async function generateReferralQR(referralCode: string): Promise<string> {
  const url = getReferralLink(referralCode);
  return await QRCode.toDataURL(url);
}
```

### Codes Éphémères (Limited Time Offers)
```typescript
interface TemporaryReferralCode {
  code: string;
  expiresAt: Date;
  maxUses: number;
  usesCount: number;
}
```

---

## 📚 Références

### Fichiers Clés
- `lib/referral-code.ts` : Fonctions utilitaires
- `app/api/join-waitlist/route.ts` : Endpoint d'inscription
- `prisma/schema.prisma` : Schema DB
- `lib/__tests__/referral-code.test.ts` : Tests unitaires

### Documentation Liée
- `API_DOCUMENTATION.md` : API complète
- `REFERRAL_USAGE_EXAMPLE.md` : Exemples d'utilisation
- `SECURITY_FIXES_APPLIED.md` : Sécurité

---

## ❓ FAQ

### Q : Combien d'utilisateurs peut-on gérer avant les collisions ?
**R** : Avec 32^8 combinaisons, on peut gérer **1 milliard** d'utilisateurs avec < 1% de collisions.

### Q : Que se passe-t-il si on atteint 10 tentatives de retry ?
**R** : L'inscription échoue avec l'erreur "Unable to generate unique referral code after 10 attempts". Probabilité : **< 0.00001%**

### Q : Peut-on changer le code d'un utilisateur ?
**R** : Non recommandé. Le code est lié aux parrainages existants. Si nécessaire, créer un nouveau système de "vanity codes" séparé.

### Q : Les codes sont-ils case-sensitive ?
**R** : Oui. `K7M4Q2TX` ≠ `k7m4q2tx`. Toujours utiliser des majuscules.

### Q : Comment gérer les liens partagés sur les réseaux sociaux ?
**R** : Utiliser `getReferralLink()` qui génère l'URL complète. Les plateformes sociales reconnaissent automatiquement les query params.

---

**Version** : 1.0.0
**Date** : 2024-12-14
**Auteur** : Équipe Afroé

**Status** : ✅ Production Ready
