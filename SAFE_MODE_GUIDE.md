# 🛡️ SAFE_MODE Feature Flag System

## Vue d'ensemble

Le système **SAFE_MODE** permet d'activer/désactiver les nouveaux features sans risquer de casser la production.

- **SAFE_MODE = true** (défaut) → Comportement actuel, aucun changement visible
- **SAFE_MODE = false** → Nouveaux features activés (countdown, dashboard, etc.)

---

## 🚀 Configuration

### Fichier `.env`

```bash
# true (default) = comportement actuel uniquement
# false = active nouveaux features
NEXT_PUBLIC_SAFE_MODE=true
```

### Production
```bash
# Vercel/Netlify/etc.
NEXT_PUBLIC_SAFE_MODE=true  # Garder à true jusqu'à validation complète
```

---

## 📦 Usage

### Import
```typescript
import { isSafeMode, isFeatureEnabled, useFeature } from '@/lib/feature-flags';
```

### Dans un composant React

#### Méthode 1: Hook React (recommandé)
```tsx
import { useFeature } from '@/lib/feature-flags';

export default function HeroSection() {
  const showCountdown = useFeature('countdown');

  return (
    <section>
      <h1>Ton crew beauté Afro</h1>

      {/* ✅ Nouveau feature: Countdown */}
      {showCountdown && (
        <Countdown target="2025-12-15T12:00:00+01:00" />
      )}
    </section>
  );
}
```

#### Méthode 2: Fonction pure
```tsx
import { isFeatureEnabled } from '@/lib/feature-flags';

export default function DashboardButton() {
  // ✅ Nouveau feature: Dashboard link
  if (!isFeatureEnabled('dashboard')) {
    return null; // Mode safe: pas de bouton
  }

  return (
    <Link href="/dashboard">
      Voir mon dashboard
    </Link>
  );
}
```

### Dans les API Routes

```typescript
import { isSafeMode } from '@/lib/feature-flags';

export async function GET(request: NextRequest) {
  const safeMode = isSafeMode();

  if (safeMode) {
    // Comportement actuel
    return NextResponse.json({ referralCount: 0 });
  }

  // ✅ Nouveau comportement
  const stats = await getUserStats(userId);
  return NextResponse.json(stats);
}
```

### Pattern conditionnel inline

```tsx
import { useFeature } from '@/lib/feature-flags';

export default function SuccessPage() {
  const showStats = useFeature('stats');

  return (
    <div>
      <h2>Inscription réussie !</h2>

      {/* Affichage classique */}
      <p>Code: {referralCode}</p>

      {/* ✅ Nouveau: Stats enrichies */}
      {showStats && (
        <div>
          <p>Tu es en position #{rank}</p>
          <p>Points actuels: {points}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 Exemples d'Usage par Commit

### COMMIT 1: Countdown dans Hero

**Fichier**: `app/components/HeroSectionV2.tsx`

```tsx
import { useFeature } from '@/lib/feature-flags';

export default function HeroSectionV2() {
  const showCountdown = useFeature('countdown');

  return (
    <section>
      {/* Contenu actuel inchangé */}
      <h1>Ton crew beauté Afro...</h1>
      <p>La beauté Afro premium...</p>

      {/* ✅ NOUVEAU: Countdown conditionnel */}
      {showCountdown && (
        <div className="glassy rounded-xl p-4 mt-6">
          <p className="text-amber-300 font-bold mb-2">
            🚀 Lancement dans :
          </p>
          <Countdown target="2025-12-15T12:00:00+01:00" />
        </div>
      )}

      <button onClick={onCTAClick}>
        Je prends ma place maintenant ✨
      </button>
    </section>
  );
}
```

### COMMIT 2: Amélioration SMS avec resend

**Fichier**: `app/components/AfroeWaitlistLandingV2.tsx`

```tsx
import { useFeature } from '@/lib/feature-flags';

export default function AfroeWaitlistLandingV2() {
  const enhancedSms = useFeature('sms-resend');
  const [resendCooldown, setResendCooldown] = useState(0);

  return (
    <form>
      {/* Logique SMS actuelle */}
      {smsState === "sent" && (
        <div>
          <p>Code envoyé (expire dans 2 min)</p>

          {/* ✅ NOUVEAU: Bouton resend avec cooldown */}
          {enhancedSms && (
            <button
              disabled={resendCooldown > 0}
              onClick={handleResend}
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

### COMMIT 3: Stats enrichies sur Success

**Fichier**: `app/success/page.tsx`

```tsx
import { useFeature } from '@/lib/feature-flags';

export default function SuccessPage() {
  const showEnhancedStats = useFeature('success-stats');

  return (
    <div>
      {/* Affichage actuel */}
      <h2>Inscription validée !</h2>
      <p>Code: {referralCode}</p>

      {/* ✅ NOUVEAU: Stats enrichies */}
      {showEnhancedStats && (
        <div className="glassy rounded-xl p-6 mt-6">
          <h3>Ta position sur la Glow List</h3>
          <div className="text-4xl font-bold text-amber-300">
            #{rank}
          </div>
          <p className="text-slate-300">
            Tu as {points} points provisoires
          </p>

          <div className="mt-4 space-y-2">
            <p className="font-semibold">Comment gagner plus ?</p>
            <ul className="text-sm text-slate-300">
              <li>+2 pts par client invité</li>
              <li>+10 pts par influenceur invité</li>
              <li>+20 pts par beauty pro invité</li>
            </ul>
          </div>
        </div>
      )}

      {/* Share buttons existants */}
      <ShareButtons referralLink={shareUrl} />
    </div>
  );
}
```

### COMMIT 5: Dashboard Link

**Fichier**: `app/success/page.tsx`

```tsx
import { useFeature } from '@/lib/feature-flags';
import Link from 'next/link';

export default function SuccessPage() {
  const showDashboard = useFeature('dashboard');

  return (
    <div>
      <h2>Inscription validée !</h2>

      {/* Contenu actuel... */}

      {/* ✅ NOUVEAU: Lien vers dashboard */}
      {showDashboard && (
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600"
        >
          📊 Voir mon dashboard
        </Link>
      )}
    </div>
  );
}
```

---

## 🧪 Tests

### Mode Safe (comportement actuel)
```bash
# .env
NEXT_PUBLIC_SAFE_MODE=true

npm run dev
# ✅ Aucun nouveau feature visible
# ✅ Landing page identique
# ✅ Pas de countdown
# ✅ Pas de dashboard link
# ✅ Page success classique
```

### Mode Features Activés
```bash
# .env
NEXT_PUBLIC_SAFE_MODE=false

npm run dev
# ✅ Countdown visible dans hero
# ✅ SMS resend avec cooldown
# ✅ Stats enrichies sur success
# ✅ Dashboard link visible
# ✅ Page /dashboard accessible
```

---

## 🔄 Migration Progressive

### Phase 1: Développement (SAFE_MODE=false)
- Développer les nouveaux features
- Tester en local avec SAFE_MODE=false
- Valider que tout fonctionne

### Phase 2: Staging (SAFE_MODE=false)
- Déployer sur environnement de staging
- Tests complets avec SAFE_MODE=false
- QA équipe + beta testeurs

### Phase 3: Production Soft Launch (SAFE_MODE=true)
- Déployer en prod avec SAFE_MODE=true
- Code nouveau présent mais désactivé
- Rollback instantané possible

### Phase 4: Production Full Launch (SAFE_MODE=false)
- Activer SAFE_MODE=false en production
- Monitoring intensif 24-48h
- Si problème → basculer SAFE_MODE=true (rollback instant)

### Phase 5: Cleanup (optionnel)
- Après 1-2 semaines de stabilité
- Retirer les conditions `if (!isSafeMode())`
- Garder le système pour futurs features

---

## 🚨 Rollback Instantané

Si un problème survient en production:

```bash
# Sur Vercel/Netlify/etc.
NEXT_PUBLIC_SAFE_MODE=true  # Changer de false à true

# Redéployer (ou redémarrer si env var changeable à chaud)
```

**Résultat**: Retour au comportement actuel en moins de 2 minutes, sans redéployer le code.

---

## 📊 Debug & Monitoring

### Logs en dev
```typescript
import { logFeatureState } from '@/lib/feature-flags';

// Dans un useEffect ou au mount de l'app
useEffect(() => {
  logFeatureState();
  // Console output:
  // [FeatureFlags] { safeMode: true, featuresEnabled: false, env: 'true' }
}, []);
```

### Vérifier l'état actuel
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Safe Mode:', isSafeMode());
  console.log('Features:', isFeatureEnabled());
}
```

---

## 🎯 Avantages

1. **Zero Downtime**: Déployer du code inactif, l'activer plus tard
2. **Rollback Instant**: Variable d'env → pas besoin de redéployer le code
3. **Testing en Prod**: A/B testing, canary releases possibles
4. **Confiance**: Équipe sereine, clients non impactés si bug
5. **Itération Rapide**: Tester, rollback, fix, retry sans friction

---

## 🔒 Sécurité

- ✅ Variable `NEXT_PUBLIC_*` → safe pour le client
- ✅ Pas de logique métier exposée
- ✅ Juste un boolean on/off
- ✅ Pas de données sensibles

---

## 📝 Checklist avant Activation

Avant de passer `SAFE_MODE=false` en production:

- [ ] Tous les commits testés en local avec SAFE_MODE=false
- [ ] Build passe sans erreur
- [ ] Tests manuels complets (signup → SMS → success → dashboard)
- [ ] Staging validé avec SAFE_MODE=false pendant 48h
- [ ] Monitoring en place (Sentry, analytics)
- [ ] Plan de rollback documenté et communiqué à l'équipe
- [ ] Équipe disponible pour surveiller post-activation
- [ ] Backup DB récent (< 24h)

---

## 🎓 Bonnes Pratiques

### ✅ DO
- Utiliser `useFeature()` dans les composants React
- Utiliser `isFeatureEnabled()` dans les API routes
- Garder les features indépendantes (un feature = un flag logique)
- Tester avec SAFE_MODE=true ET false avant chaque commit
- Documenter quel feature est ajouté dans chaque commit

### ❌ DON'T
- Ne pas modifier le comportement actuel dans les blocs `if (safeMode)`
- Ne pas ajouter de logique complexe dans les conditions
- Ne pas oublier de tester avec SAFE_MODE=true (mode par défaut)
- Ne pas déployer en prod sans avoir testé le rollback
- Ne pas retirer le système SAFE_MODE trop tôt (attendre 2-4 semaines)

---

## 📞 Support

Questions ou problèmes avec le système SAFE_MODE ?

1. Vérifier que `NEXT_PUBLIC_SAFE_MODE` est bien défini dans `.env`
2. Redémarrer le serveur de dev après changement d'env var
3. Vérifier les logs avec `logFeatureState()`
4. En cas de doute, garder `SAFE_MODE=true` (comportement sûr)

---

**Version**: 1.0.0
**Dernière mise à jour**: 2024-12-14
**Auteur**: Système de feature flags pour migration progressive
