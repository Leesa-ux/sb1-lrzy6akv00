# 🎯 Exemple d'Implémentation SAFE_MODE

## Exemple Concret: Ajouter le Countdown (COMMIT 1)

### ❌ AVANT (sans SAFE_MODE)
```tsx
// app/components/HeroSectionV2.tsx
import Countdown from './Countdown';

export default function HeroSectionV2() {
  return (
    <section>
      <h1>Ton crew beauté Afro. Pro, stylé, chez toi.</h1>

      {/* ⚠️ Ajout direct → visible immédiatement en prod */}
      <Countdown target="2025-12-15T12:00:00+01:00" />

      <button>Je prends ma place maintenant ✨</button>
    </section>
  );
}
```
**Problème**: Le countdown apparaît immédiatement en prod. Si bug → rollback git nécessaire.

---

### ✅ APRÈS (avec SAFE_MODE)
```tsx
// app/components/HeroSectionV2.tsx
import { useFeature } from '@/lib/feature-flags';
import Countdown from './Countdown';

export default function HeroSectionV2() {
  const showCountdown = useFeature('countdown');

  return (
    <section>
      <h1>Ton crew beauté Afro. Pro, stylé, chez toi.</h1>

      {/* ✅ Conditionnel → contrôlé par SAFE_MODE */}
      {showCountdown && (
        <Countdown target="2025-12-15T12:00:00+01:00" />
      )}

      <button>Je prends ma place maintenant ✨</button>
    </section>
  );
}
```

**Avantages**:
- En prod avec `SAFE_MODE=true` → countdown invisible
- En dev avec `SAFE_MODE=false` → countdown visible pour tests
- Rollback instantané via env var si problème

---

## Exemple: SMS Resend avec Cooldown (COMMIT 2)

### Structure du code
```tsx
// app/components/AfroeWaitlistLandingV2.tsx
import { useFeature } from '@/lib/feature-flags';

export default function AfroeWaitlistLandingV2() {
  const enhancedSms = useFeature('sms-resend');
  const [resendCooldown, setResendCooldown] = useState(0);

  async function handleResend() {
    if (!enhancedSms) return; // Guard clause
    if (resendCooldown > 0) return;

    setResendCooldown(30); // 30 secondes
    await sendSmsCode();

    // Countdown
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  return (
    <form>
      {/* SMS flow actuel... */}

      {smsState === "sent" && (
        <div>
          <p>Code envoyé</p>
          <input value={smsCode} onChange={e => setSmsCode(e.target.value)} />

          {/* ✅ NOUVEAU: Bouton resend conditionnel */}
          {enhancedSms && (
            <button
              type="button"
              disabled={resendCooldown > 0}
              onClick={handleResend}
              className="text-xs text-amber-300 hover:underline"
            >
              {resendCooldown > 0
                ? `Renvoyer dans ${resendCooldown}s`
                : "Renvoyer le code"
              }
            </button>
          )}
        </div>
      )}
    </form>
  );
}
```

---

## Exemple: Stats Enrichies (COMMIT 3)

### Page Success avec stats conditionnelles
```tsx
// app/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFeature } from '@/lib/feature-flags';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref');

  const showEnhancedStats = useFeature('success-stats');

  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!showEnhancedStats || !referralCode) return;

    // ✅ Fetch stats uniquement si feature activé
    fetch(`/api/user-stats?code=${referralCode}`)
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, [showEnhancedStats, referralCode]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* ✅ Affichage classique (toujours visible) */}
        <h2 className="text-3xl font-bold mb-4">
          Inscription validée ! 🎉
        </h2>

        <div className="glassy rounded-xl p-6 mb-6">
          <p className="text-sm text-slate-300">Ton code de parrainage</p>
          <div className="text-3xl font-bold text-amber-300">
            {referralCode}
          </div>
        </div>

        {/* ✅ NOUVEAU: Stats enrichies (conditionnel) */}
        {showEnhancedStats && stats && (
          <div className="glassy rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">
              Ta position sur la Glow List
            </h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-fuchsia-400">
                  #{stats.rank}
                </div>
                <p className="text-xs text-slate-400">Classement</p>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-amber-300">
                  {stats.provisionalPoints}
                </div>
                <p className="text-xs text-slate-400">Points</p>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {stats.referralCount}
                </div>
                <p className="text-xs text-slate-400">Invitations</p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-sm font-semibold mb-2">
                Comment gagner plus de points ?
              </p>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>✨ +2 pts par client invité</li>
                <li>📸 +10 pts par influenceur invité</li>
                <li>💅 +20 pts par beauty pro invité</li>
              </ul>
            </div>
          </div>
        )}

        {/* Share buttons (toujours visibles) */}
        <div className="glassy rounded-xl p-6">
          <p className="text-sm font-semibold mb-3">
            Partage ton lien unique
          </p>
          {/* ... boutons de partage ... */}
        </div>
      </div>
    </div>
  );
}
```

---

## Exemple: Dashboard Link (COMMIT 6)

### Ajouter un lien conditionnel
```tsx
// app/success/page.tsx
import Link from 'next/link';
import { useFeature } from '@/lib/feature-flags';

export default function SuccessPage() {
  const showDashboard = useFeature('dashboard');

  return (
    <div>
      <h2>Inscription validée !</h2>

      {/* Contenu existant... */}

      {/* ✅ NOUVEAU: Lien vers dashboard */}
      {showDashboard && (
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:brightness-110 transition-all"
          >
            <span>📊</span>
            <span className="font-bold">Voir mon dashboard</span>
          </Link>
        </div>
      )}
    </div>
  );
}
```

---

## Pattern: API Route avec SAFE_MODE

### Créer l'API `/api/user-stats` (COMMIT 4)
```typescript
// app/api/user-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { isSafeMode } from '@/lib/feature-flags';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const referralCode = searchParams.get('code');

  // ✅ Guard: Si SAFE_MODE=true, retourner minimum data
  if (isSafeMode()) {
    return NextResponse.json({
      enabled: false,
      message: 'Stats endpoint not enabled in safe mode'
    }, { status: 200 });
  }

  // ✅ Nouveau comportement (quand SAFE_MODE=false)
  if (!referralCode) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { referralCode },
      select: {
        id: true,
        referralCode: true,
        provisionalPoints: true,
        rank: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Compter les referrals
    const referralCount = await prisma.user.count({
      where: { referredBy: user.referralCode }
    });

    // Breakdown par rôle
    const clientCount = await prisma.user.count({
      where: { referredBy: user.referralCode, role: 'client' }
    });

    const influencerCount = await prisma.user.count({
      where: { referredBy: user.referralCode, role: 'influencer' }
    });

    const beautyproCount = await prisma.user.count({
      where: { referredBy: user.referralCode, role: 'beautypro' }
    });

    return NextResponse.json({
      referralCode: user.referralCode,
      provisionalPoints: user.provisionalPoints,
      rank: user.rank,
      referralCount,
      breakdown: {
        clients: clientCount,
        influencers: influencerCount,
        beautypros: beautyproCount,
      },
      nextMilestone: computeNextMilestone(user.provisionalPoints),
    });

  } catch (error) {
    console.error('[user-stats] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function computeNextMilestone(points: number): number {
  if (points < 50) return 50;
  if (points < 100) return 100;
  return Math.ceil(points / 50) * 50 + 50;
}
```

**Comportement**:
- `SAFE_MODE=true` → retourne `{ enabled: false }` (pas de données)
- `SAFE_MODE=false` → retourne les stats complètes

---

## Testing Workflow

### Étape 1: Développement local (SAFE_MODE=false)
```bash
# .env
NEXT_PUBLIC_SAFE_MODE=false

npm run dev
```

**Vérifications**:
- ✅ Countdown visible dans hero
- ✅ Bouton "Renvoyer SMS" visible avec cooldown
- ✅ Stats enrichies sur `/success`
- ✅ Dashboard link visible

### Étape 2: Test en mode Safe (SAFE_MODE=true)
```bash
# .env
NEXT_PUBLIC_SAFE_MODE=true

npm run dev
```

**Vérifications**:
- ✅ Landing identique à la version actuelle
- ✅ Pas de countdown
- ✅ Pas de bouton resend SMS
- ✅ Page success classique (sans stats)
- ✅ Pas de dashboard link

### Étape 3: Build prod
```bash
npm run build
```

**Vérifications**:
- ✅ Build passe sans erreur
- ✅ Pas de warning TypeScript
- ✅ Bundle size acceptable

---

## Migration Checklist

### Pour chaque commit

- [ ] Écrire le code avec `useFeature()` ou `isFeatureEnabled()`
- [ ] Tester avec `SAFE_MODE=false` (feature visible)
- [ ] Tester avec `SAFE_MODE=true` (comportement actuel)
- [ ] Vérifier que le build passe
- [ ] Commiter avec message clair: `feat: add countdown (SAFE_MODE controlled)`
- [ ] Déployer en staging avec `SAFE_MODE=false`
- [ ] QA complet
- [ ] Déployer en prod avec `SAFE_MODE=true` (inactif)

### Activation en production

- [ ] Tous les commits déployés en prod (avec SAFE_MODE=true)
- [ ] Monitoring en place (Sentry, analytics)
- [ ] Équipe disponible pour surveiller
- [ ] Changer `SAFE_MODE=false` en production
- [ ] Surveiller les 2 premières heures
- [ ] Valider que tout fonctionne
- [ ] Si problème → rollback: `SAFE_MODE=true`

---

## FAQ

### Q: Dois-je créer un feature flag pour chaque nouveau comportement ?
**R**: Non. Pour l'instant, tous les nouveaux features partagent le même flag `SAFE_MODE`. Si besoin de granularité plus fine, on pourra ajouter `NEXT_PUBLIC_FEATURE_COUNTDOWN`, `NEXT_PUBLIC_FEATURE_DASHBOARD`, etc.

### Q: Que se passe-t-il si j'oublie de mettre `useFeature()` ?
**R**: Le nouveau code s'exécutera toujours, même en SAFE_MODE=true. C'est pourquoi il faut TOUJOURS entourer les nouveaux comportements avec `useFeature()`.

### Q: Puis-je utiliser SAFE_MODE dans les styles CSS ?
**R**: Non, SAFE_MODE fonctionne uniquement en JS/TS. Pour les styles conditionnels, utilisez des classes conditionnelles:
```tsx
<div className={showCountdown ? 'with-countdown' : 'without-countdown'}>
```

### Q: Comment tester le rollback ?
**R**:
1. Déployer avec SAFE_MODE=false
2. Vérifier que les features sont visibles
3. Changer SAFE_MODE=true
4. Recharger la page
5. Vérifier que les features disparaissent

### Q: Combien de temps garder le système SAFE_MODE ?
**R**: Au minimum 2-4 semaines après l'activation en prod. Une fois stable, vous pouvez soit:
- Garder le système pour futurs features
- Retirer les conditions et fusionner le code

---

**Version**: 1.0.0
**Date**: 2024-12-14
