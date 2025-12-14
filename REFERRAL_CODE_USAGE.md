# Guide d'Utilisation : Système de Parrainage

## 🎯 Objectif

Ce guide montre comment utiliser le système de parrainage Afroé côté **frontend** et **backend**.

---

## 📦 Frontend : Récupérer le Code de Parrainage

### Étape 1 : Lire le Query Param `?ref=CODE`

```tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignupForm() {
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref);
      console.log("Code de parrainage détecté:", ref);
    }
  }, [searchParams]);

  return (
    <div>
      {referralCode && (
        <div className="bg-green-100 p-4 rounded">
          ✅ Tu as été parrainé par le code : <strong>{referralCode}</strong>
        </div>
      )}
      {/* Formulaire d'inscription */}
    </div>
  );
}
```

### Étape 2 : Envoyer le Code lors de l'Inscription

```tsx
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  const response = await fetch("/api/join-waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      phone,
      first_name: firstName,
      last_name: lastName,
      role,
      referral_code: referralCode, // 👈 Envoie le code du parrain
      skillAnswerCorrect: true,
    }),
  });

  const data = await response.json();

  if (data.success) {
    // L'utilisateur a maintenant son propre code
    console.log("Ton code de parrainage:", data.referralCode);
    console.log("Ton lien de partage:", data.shareUrl);

    // Redirection vers page de succès
    window.location.href = `/success?ref=${data.referralCode}`;
  }
}
```

---

## 📤 Frontend : Afficher et Partager son Code

### Page de Succès avec Lien Partageable

```tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const code = searchParams.get("ref");
    if (code) {
      setReferralCode(code);
      const url = `${window.location.origin}?ref=${code}`;
      setShareUrl(url);
    }
  }, [searchParams]);

  const copyToClipboard = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Rejoins-moi sur Afroé ! ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent("Rejoins-moi sur Afroé !");
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  if (!referralCode) {
    return <p>Aucun code de parrainage trouvé.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">
        🎉 Bienvenue sur la Glow List !
      </h1>

      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 mb-6">
        <p className="text-sm text-slate-400 mb-2">Ton code de parrainage</p>
        <div className="text-3xl font-bold text-amber-300 mb-4">
          {referralCode}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-sm"
          />
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 rounded-lg"
          >
            {copied ? "✓ Copié" : "Copier"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Partage sur les réseaux</p>
        <div className="flex gap-3">
          <button
            onClick={shareOnWhatsApp}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl"
          >
            📱 WhatsApp
          </button>
          <button
            onClick={shareOnTwitter}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl"
          >
            🐦 Twitter
          </button>
        </div>
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        <h2 className="text-xl font-bold mb-3">Comment gagner plus de points ?</h2>
        <ul className="space-y-2">
          <li>✨ <strong>Client.e :</strong> +2 pts par inscription</li>
          <li>📸 <strong>Influenceur.euse :</strong> +15 pts par inscription</li>
          <li>💅 <strong>Beauty Pro :</strong> +25 pts par inscription</li>
        </ul>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<p>Chargement...</p>}>
      <SuccessContent />
    </Suspense>
  );
}
```

---

## 🔧 Backend : Validation et Traitement

### Validation du Code (Avant Requête DB)

```typescript
import { isValidReferralCode } from '@/lib/referral-code';

// Dans ton endpoint API
if (referral_code) {
  // Validation côté serveur (obligatoire)
  if (!isValidReferralCode(referral_code)) {
    return NextResponse.json(
      { success: false, error: 'Format de code de parrainage invalide' },
      { status: 400 }
    );
  }

  // Vérification en DB
  const referrer = await prisma.user.findUnique({
    where: { referralCode: referral_code }
  });

  if (!referrer) {
    return NextResponse.json(
      { success: false, error: 'Code de parrainage invalide' },
      { status: 400 }
    );
  }

  // Code valide → continuer l'inscription
}
```

### Génération de Code Unique

```typescript
import { ensureUniqueReferralCode } from '@/lib/referral-code';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Génère un code garanti unique
const myReferralCode = await ensureUniqueReferralCode(prisma);

// Crée l'utilisateur avec ce code
const newUser = await prisma.user.create({
  data: {
    email,
    referralCode: myReferralCode,
    referredBy: referrer?.referralCode, // Code du parrain
    // ...
  }
});
```

### Attribution des Points au Parrain

```typescript
if (referrer) {
  // Calcul des points selon le rôle
  let pointsAwarded = 0;
  let counterField: 'waitlistClients' | 'waitlistInfluencers' | 'waitlistPros';

  switch (role) {
    case 'client':
      pointsAwarded = 2;
      counterField = 'waitlistClients';
      break;
    case 'influencer':
      pointsAwarded = 15;
      counterField = 'waitlistInfluencers';
      break;
    case 'beautypro':
      pointsAwarded = 25;
      counterField = 'waitlistPros';
      break;
  }

  // Mise à jour du parrain
  await prisma.user.update({
    where: { id: referrer.id },
    data: {
      refCount: { increment: 1 },
      [counterField]: { increment: 1 },
      points: { increment: pointsAwarded },
      provisionalPoints: { increment: pointsAwarded },
      lastRefAt: new Date()
    }
  });

  // Log l'événement de parrainage
  await prisma.referralEvent.create({
    data: {
      actorL1Id: referrer.id,
      actorL2Id: newUser.id,
      type: 'waitlist_signup',
      roleAtSignup: role,
      pointsAwarded: pointsAwarded,
    }
  });
}
```

---

## 🎨 Composant Réutilisable : Badge de Parrainage

```tsx
"use client";

interface ReferralBadgeProps {
  code: string;
  className?: string;
}

export function ReferralBadge({ code, className = "" }: ReferralBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full ${className}`}>
      <span className="text-xl">🎁</span>
      <span className="text-sm font-medium">
        Parrainé par <strong>{code}</strong>
      </span>
    </div>
  );
}
```

**Usage** :
```tsx
{referralCode && <ReferralBadge code={referralCode} />}
```

---

## 🎨 Composant Réutilisable : Bloc de Partage

```tsx
"use client";

import { useState } from "react";

interface ShareBlockProps {
  referralCode: string;
  baseUrl?: string;
}

export function ShareBlock({ referralCode, baseUrl }: ShareBlockProps) {
  const shareUrl = `${baseUrl || window.location.origin}?ref=${referralCode}`;
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Rejoins-moi sur Afroé ! ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent("Rejoins-moi sur Afroé !");
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
        <p className="text-sm text-slate-400 mb-2">Ton code de parrainage</p>
        <div className="text-3xl font-bold text-amber-300 mb-4">
          {referralCode}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-sm"
          />
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 rounded-lg text-sm font-medium"
          >
            {copied ? "✓ Copié" : "Copier"}
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={shareOnWhatsApp}
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium"
        >
          📱 WhatsApp
        </button>
        <button
          onClick={shareOnTwitter}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium"
        >
          🐦 Twitter
        </button>
      </div>
    </div>
  );
}
```

**Usage** :
```tsx
import { ShareBlock } from '@/components/ShareBlock';

<ShareBlock referralCode="K7M4Q2TX" />
```

---

## 🔍 Debugging : Vérifier le Flow

### Console Logs pour Debug

```tsx
useEffect(() => {
  const ref = searchParams.get("ref");
  console.log("🔍 Query param 'ref':", ref);

  if (ref) {
    console.log("✅ Code détecté:", ref);
    setReferralCode(ref);

    // Optionnel : stocker dans localStorage
    localStorage.setItem("referralCode", ref);
  } else {
    console.log("❌ Aucun code de parrainage");

    // Optionnel : récupérer depuis localStorage
    const stored = localStorage.getItem("referralCode");
    if (stored) {
      console.log("📦 Code récupéré depuis localStorage:", stored);
      setReferralCode(stored);
    }
  }
}, [searchParams]);
```

### Tester en Local

```bash
# Sans parrain
http://localhost:3000/

# Avec parrain
http://localhost:3000/?ref=K7M4Q2TX
```

### Tester l'API avec curl

```bash
# Test 1 : Inscription sans parrain
curl -X POST http://localhost:3000/api/join-waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+33612345678",
    "first_name": "Test",
    "last_name": "User",
    "role": "client",
    "skillAnswerCorrect": true
  }'

# Test 2 : Inscription avec parrain
curl -X POST http://localhost:3000/api/join-waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "email": "referred@example.com",
    "phone": "+33687654321",
    "first_name": "Referred",
    "last_name": "User",
    "role": "client",
    "referral_code": "K7M4Q2TX",
    "skillAnswerCorrect": true
  }'
```

---

## 📊 Analytics : Tracker les Parrainages

### Ajouter Google Analytics

```tsx
import { useEffect } from "react";

useEffect(() => {
  const ref = searchParams.get("ref");
  if (ref) {
    // Track dans Google Analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "referral_visit", {
        referral_code: ref,
      });
    }

    // Track dans Posthog, Mixpanel, etc.
    // posthog.capture("referral_visit", { referral_code: ref });
  }
}, [searchParams]);
```

### Tracker le Succès d'Inscription

```tsx
async function handleSubmit(e: React.FormEvent) {
  // ... inscription

  if (data.success) {
    // Track succès
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "signup_success", {
        referral_code: referralCode,
        role: role,
        has_referrer: !!referralCode,
      });
    }
  }
}
```

---

## 🚀 Bonnes Pratiques

### ✅ À Faire
1. **Toujours valider côté serveur** : `isValidReferralCode()`
2. **Logger les événements** : créer des `ReferralEvent`
3. **Afficher clairement le code** : badge, copie facile
4. **Tester le flow complet** : inscription → partage → nouvel utilisateur
5. **Persister le code** : localStorage si besoin (optionnel)

### ❌ À Éviter
1. **Ne jamais faire confiance au frontend** : toujours vérifier en DB
2. **Ne pas exposer les codes sensibles** : seulement le code public
3. **Ne pas oublier les points** : mettre à jour le parrain à chaque inscription
4. **Ne pas ignorer les erreurs** : logger toutes les tentatives de fraude
5. **Ne pas hardcoder les URLs** : utiliser `process.env.NEXT_PUBLIC_APP_URL`

---

## 📚 Ressources

### Fichiers Clés
- `lib/referral-code.ts` : Fonctions utilitaires
- `app/api/join-waitlist/route.ts` : Endpoint d'inscription
- `app/success/page.tsx` : Page de succès avec partage
- `REFERRAL_CODE_SYSTEM.md` : Documentation technique

### Liens Utiles
- [Next.js useSearchParams](https://nextjs.org/docs/app/api-reference/functions/use-search-params)
- [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)
- [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)

---

**Version** : 1.0.0
**Date** : 2024-12-14
**Status** : ✅ Production Ready
