# 🔍 Analyse Complète du Repo — Système Referral

> **Contexte**: Analyse demandée pour identifier précisément où se trouvent les éléments clés du système de referral et préparer un plan en 6 commits atomiques.

---

## 📂 1. Formulaire d'Inscription (email/phone/role)

### Fichier principal
**`app/components/AfroeWaitlistLandingV2.tsx`** (lignes 78-483)

### Localisation exacte

#### État du formulaire (lignes 79-89)
```tsx
const [firstName, setFirstName] = useState<string>("");
const [lastName, setLastName] = useState<string>("");
const [email, setEmail] = useState<string>("");
const [phone, setPhone] = useState<string>("");
const [role, setRole] = useState<RoleType>(null);
const [consentSMS, setConsentSMS] = useState<boolean>(true);
const [skillAnswer, setSkillAnswer] = useState<string>("");
const [consentGDPR, setConsentGDPR] = useState<boolean>(false);
```

#### Sélection du rôle (lignes 414-437)
```tsx
<p className="text-sm text-slate-300 mb-2">Je suis :</p>
<div className="flex flex-wrap gap-2">
  {[
    { key: "client" as const, label: "Client.e", emoji: "✨" },
    { key: "influencer" as const, label: "Influenceur.euse", emoji: "📸" },
    { key: "pro" as const, label: "Beauty Pro", emoji: "💅" },
  ].map((opt) => (
    <button type="button" onClick={() => setRole(opt.key)}>
      {opt.emoji} {opt.label}
    </button>
  ))}
</div>
```

#### Soumission du formulaire (lignes 146-178)
```tsx
async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
  e.preventDefault();

  // Validation skill question
  if (parseInt(skillAnswer) !== 32) {
    alert('La réponse à la question d\'habileté est incorrecte. (8 × 4 = ?)');
    return;
  }

  // Validation GDPR
  if (!consentGDPR) {
    alert('Vous devez accepter la politique de confidentialité pour continuer.');
    return;
  }

  // Appel API
  const res = await fetch("/api/join-waitlist", {
    method: "POST",
    body: JSON.stringify({
      email, phone, first_name: firstName.trim(), last_name: lastName.trim(),
      role: role === "client" ? "client" : role === "influencer" ? "influencer" : "beautypro",
      skillAnswerCorrect: true
    })
  });

  // Redirection vers success avec referralCode
  if (data.success && data.referralCode) {
    window.location.href = `/success?ref=${data.referralCode}`;
  }
}
```

### Composant alternatif (non utilisé actuellement)
**`app/components/WaitlistForm.tsx`** — Forme standalone, non importée dans la landing actuelle

---

## 📱 2. Logique OTP/SMS (envoi + vérif)

### Envoi du code SMS

#### Fichier: `app/api/send-sms/route.ts`
**Fonction principale**: `POST` (lignes 38-120)

```typescript
export async function POST(request: NextRequest) {
  const { phone, email, role, ref } = await request.json();

  // Normalisation du numéro
  const normalized = normalizePhone(phone);

  // Rate limiting (2 SMS max par minute)
  if (!checkRateLimit(phoneHash)) {
    return NextResponse.json({ ok: false, error: 'rate_limit' }, { status: 429 });
  }

  // Génération du code
  const code = generateSmsCode(); // 6 chiffres

  // Stockage Redis
  await createSmsRequest({
    phoneHash,
    code,
    email,
    role,
    referral: ref || null,
    expiresAt: Date.now() + 2 * 60 * 1000 // 2 minutes
  });

  // Envoi SMS via Brevo
  const template = getSMSTemplate('verification', { code });
  // ... logique d'envoi Brevo
}
```

**Dépendances**:
- `lib/phone-utils.ts` → `normalizePhone()`, `generateSmsCode()`
- `lib/sms-store.ts` → `createSmsRequest()`, stockage Redis
- `lib/sms-templates.ts` → templates SMS

### Vérification du code SMS

#### Fichier: `app/api/verify-code/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const { phone, code } = await request.json();

  // Récupération depuis Redis
  const stored = await getSmsRequest(phoneHash);

  // Vérification expiration
  if (Date.now() > stored.expiresAt) {
    return NextResponse.json({ ok: false, error: 'expired' });
  }

  // Vérification code
  if (stored.code !== code) {
    return NextResponse.json({ ok: false, error: 'invalid_code' });
  }

  return NextResponse.json({ ok: true, verified: true });
}
```

### Intégration dans le formulaire

#### Fichier: `app/components/AfroeWaitlistLandingV2.tsx`

**État SMS** (lignes 91-96):
```tsx
const [smsState, setSmsState] = useState<SmsState>("idle");
const [smsCode, setSmsCode] = useState<string>("");
const [smsExpiresAt, setSmsExpiresAt] = useState<number | null>(null);
```

**Envoi SMS** (lignes 117-126):
```tsx
async function sendSmsCode(): Promise<void> {
  setSmsState("sending");
  const r = await fetch("/api/send-sms", {
    method: "POST",
    body: JSON.stringify({ phone, email, role, ref: null })
  });
  setSmsState("sent");
  setSmsExpiresAt(Date.now() + 2 * 60 * 1000); // Countdown 2 min
}
```

**Vérification SMS** (lignes 128-136):
```tsx
async function verifySmsCode(): Promise<void> {
  setSmsState("verifying");
  const r = await fetch("/api/verify-code", {
    method: "POST",
    body: JSON.stringify({ phone, code: smsCode })
  });
  setSmsState("verified");
}
```

**Affichage countdown** (lignes 402-408):
```tsx
{smsState === "sent" && (
  <span className="text-amber-300 font-mono">
    ⏱ {String(smsMin).padStart(2, "0")}:{String(smsSec).padStart(2, "0")}
  </span>
)}
{smsState === "expired" && <span>Expiré — renvoyer le code.</span>}
{smsState === "verified" && <span>Numéro vérifié ✅</span>}
```

---

## 🎯 3. Génération du refCode/refLink

### Backend: Génération du referralCode

#### Fichier: `app/api/join-waitlist/route.ts`

**Fonction de génération** (lignes 14-20):
```typescript
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Pas de O, I, 0, 1
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

**Vérification d'unicité** (lignes 23-40):
```typescript
async function ensureUniqueReferralCode(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = generateReferralCode();
    const existing = await prisma.user.findFirst({
      where: { referralCode: code }
    });

    if (!existing) {
      return code;
    }
    attempts++;
  }

  throw new Error('Unable to generate unique referral code');
}
```

**Stockage lors de l'inscription** (ligne ~120):
```typescript
const newUser = await prisma.user.create({
  data: {
    referralCode: await ensureUniqueReferralCode(),
    referredBy: referrer?.referralCode || null,
    // ... autres champs
  }
});
```

**Retour du referralCode** (ligne ~240):
```typescript
return NextResponse.json({
  success: true,
  referralCode: newUser.referralCode,
  // ...
});
```

### Frontend: Construction du refLink

#### Fichier: `app/success/page.tsx` (lignes 12-19)
```tsx
useEffect(() => {
  const code = searchParams.get("ref");
  if (code) {
    setReferralCode(code);
    const url = `${window.location.origin}?ref=${code}`;
    setShareUrl(url);
  }
}, [searchParams]);
```

**Format du refLink**: `https://afroe.studio?ref=K3PL7MR9`

---

## 🚀 4. Section "Invite tes amis / Share Buttons"

### Page Success

#### Fichier: `app/success/page.tsx` (lignes 53-96)

**Affichage du referralCode** (lignes 53-77):
```tsx
{referralCode && (
  <>
    <div className="bg-slate-900/60 border border-white/10 rounded-xl p-6">
      <p className="text-sm text-slate-300 font-medium">Ton code de parrainage</p>
      <div className="text-3xl font-bold text-amber-300 tracking-wider">
        {referralCode}
      </div>

      {shareUrl && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="..."
          />
          <button onClick={copyToClipboard}>
            {copied ? "✓ Copié" : "Copier"}
          </button>
        </div>
      )}
    </div>
  </>
)}
```

**Boutons de partage** (lignes 79-95):
```tsx
<div className="space-y-3">
  <p className="text-sm text-slate-300 font-medium">Partage sur les réseaux</p>
  <div className="flex flex-wrap gap-3 justify-center">
    <button onClick={shareOnWhatsApp}>
      📱 WhatsApp
    </button>
    <button onClick={shareOnTwitter}>
      🐦 Twitter
    </button>
  </div>
</div>
```

### Composant ShareButtons (réutilisable)

#### Fichier: `app/components/ShareButtons.tsx` (lignes 11-109)

**Usage**:
```tsx
<ShareButtons
  referralLink={refLink}
  message="Rejoins Afroé, la plateforme beauté afro qui change le game ! 🔥"
/>
```

**Réseaux supportés** (lignes 54-62):
- WhatsApp
- TikTok (copie + alert)
- Instagram (copie + alert)
- Snapchat (copie + alert)
- Facebook
- LinkedIn
- SMS

---

## ⏱️ 5. Countdown LAUNCH_TARGET

### Fichiers avec countdown (non utilisés dans landing V2)

#### `app/components/AfroeUnifiedLanding.tsx` (ligne 203)
```tsx
const LAUNCH_TARGET = new Date("2025-12-15T12:00:00+01:00").toISOString();
```

#### `app/components/AfroeAlternativeLanding.tsx` (ligne 501)
```tsx
const LAUNCH_TARGET = new Date("2025-12-15T12:00:00+01:00").toISOString();
```

**Composant Countdown** (lignes 209-227 dans AfroeUnifiedLanding):
```tsx
function Countdown({ target = LAUNCH_TARGET }: CountdownProps): JSX.Element {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diff = Math.max(0, new Date(target).getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  return (
    <div className="flex gap-4">
      <TimeUnit value={days} label="jours" />
      <TimeUnit value={hrs} label="heures" />
      <TimeUnit value={mins} label="min" />
      <TimeUnit value={secs} label="sec" />
    </div>
  );
}
```

**⚠️ Note**: Le countdown n'est PAS présent dans `AfroeWaitlistLandingV2.tsx` (landing page actuelle).

---

## 🎭 6. Hero (H1 + sous-texte)

### Fichier: `app/components/HeroSectionV2.tsx`

**H1 Principal** (lignes 26-32):
```tsx
<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4">
  Ton crew beauté Afro.{" "}
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-violet-400 to-amber-300">
    Pro, stylé,
  </span>{" "}
  chez toi.
</h1>
```

**Sous-titre** (lignes 35-38):
```tsx
<p className="text-base sm:text-lg md:text-xl text-slate-200/90 max-w-3xl mx-auto mb-6 leading-relaxed">
  La beauté Afro premium, livrée à domicile ou en salon — par les meilleur·es.
  Une app pensée pour les client·es, les beauty pros et la culture Afro européenne.
</p>
```

**Badge de lancement** (lignes 41-53):
```tsx
<div className="inline-flex flex-col items-center gap-2 mb-6 glassy neon-gold rounded-2xl px-6 py-4">
  <p className="text-amber-300 font-bold text-base sm:text-lg">
    🏆 iPhone 17 Pro pour le rang #1 + 3 500 € (tirage ≥ 100 pts)
  </p>
  <p className="text-rose-200/90 text-sm sm:text-base">
    Les <span className="font-semibold">100 premiers inscrits</span> : +50 pts offerts.
    {earlyBirdSpotsLeft > 0 && (
      <span className="ml-2 text-amber-300 font-bold">
        {earlyBirdSpotsLeft} places restantes 🔥
      </span>
    )}
  </p>
</div>
```

**CTA Principal** (lignes 56-63):
```tsx
<button
  type="button"
  onClick={onCTAClick}
  className="inline-flex items-center justify-center px-8 py-4 rounded-full text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-fuchsia-500 via-violet-500 to-amber-400 shadow-[0_0_30px_rgba(217,70,239,0.5)] hover:brightness-110 hover:scale-105 transition-all duration-300"
>
  Je prends ma place maintenant ✨
</button>
```

**Image Hero** (lignes 80-89):
```tsx
<div className="mt-10 max-w-3xl mx-auto px-4">
  <div className="relative rounded-xl overflow-hidden shadow-xl">
    <img
      src="/images/lucid_origin_hero_crew_beaut_afro__domicile_ultradetailed_edit_2.jpg"
      alt="Professionnels de la beauté Afro au travail - Afroé"
      className="w-full h-auto max-h-[400px] object-cover"
    />
  </div>
</div>
```

---

## 📊 Résumé de la Structure Actuelle

### Page active
**`app/page.tsx`** → importe `<AfroeWaitlistLandingV2 />`

### Composants utilisés
1. **`HeroSectionV2.tsx`** → Hero avec H1 + CTA
2. **`AfroeWaitlistLandingV2.tsx`** → Landing complète avec:
   - Formulaire d'inscription (email, phone, role)
   - Logique SMS (envoi + vérif avec countdown)
   - Soumission vers `/api/join-waitlist`
   - Redirection vers `/success?ref=CODE`

3. **`app/success/page.tsx`** → Page de confirmation avec:
   - Affichage du referralCode
   - Construction du refLink
   - Boutons de partage (WhatsApp, Twitter)

4. **`ShareButtons.tsx`** → Composant standalone réutilisable (7 réseaux sociaux)

### APIs Backend
- **`/api/send-sms`** → Envoi code SMS via Brevo (2 min expiration)
- **`/api/verify-code`** → Vérification du code SMS
- **`/api/join-waitlist`** → Création user + génération referralCode + email bienvenue
- **`/api/save-lead`** → Log secondaire (optionnel)

### Composants non utilisés (legacy)
- `AfroeUnifiedLanding.tsx` (avec countdown)
- `AfroeAlternativeLanding.tsx` (avec countdown)
- `WaitlistForm.tsx` (form standalone)
- `WaitlistLandingPage.tsx` (ancienne version)

---

## 🔧 Points Techniques Importants

### Referral Flow
1. User 1 s'inscrit → reçoit `referralCode: "ABC12345"`
2. Email envoyé avec `refLink: "https://afroe.studio?ref=ABC12345"`
3. User 2 clique → arrive sur `/?ref=ABC12345`
4. User 2 s'inscrit → backend détecte `?ref=` et stocke dans `referredBy`
5. Points attribués automatiquement au parrain

### SMS Flow
1. User remplit email/phone → clique "Envoyer code"
2. Backend génère code 6 chiffres → stocke Redis 2 min
3. SMS envoyé via Brevo
4. User entre le code → frontend appelle `/api/verify-code`
5. Si OK → `smsState = "verified"` → bouton submit activé

### Protection et Sécurité
- Rate limiting: 2 SMS max/minute par numéro
- Code SMS expire après 2 min (countdown visible)
- Skill question: `8 × 4 = 32` (obligatoire Belgique)
- RGPD: checkbox consent obligatoire
- ReferralCode unique (retry 10x si collision)

---

## 🚨 Fichiers Protégés (GUARDRAILS)

**`app/page.tsx`** et **`app/api/send-sms/route.ts`** contiennent:
```
/**  DO NOT EDIT WITHOUT APPROVAL.
 *   This file is protected by GUARDRAILS.md and CODEOWNERS.
 *   Frontend must keep the 3-line headline and referral flow intact.
 */
```

⚠️ **Tout changement doit être atomic et testé sans casser le flow existant.**

---

## ✅ Ce qui fonctionne déjà

| Fonctionnalité | Status | Fichier |
|----------------|--------|---------|
| Formulaire inscription (email/phone/role) | ✅ | `AfroeWaitlistLandingV2.tsx:240-483` |
| Envoi SMS avec countdown 2 min | ✅ | `/api/send-sms` + frontend state |
| Vérification code SMS | ✅ | `/api/verify-code` |
| Génération referralCode (8 chars) | ✅ | `/api/join-waitlist:14-40` |
| Détection `?ref=` dans URL | ✅ | `join-waitlist:60` |
| Attribution points au parrain | ✅ | `join-waitlist:177-234` |
| Email de bienvenue avec refLink | ✅ | `brevo-welcome.ts` |
| Page success avec share buttons | ✅ | `app/success/page.tsx` |
| Hero H1 + CTA | ✅ | `HeroSectionV2.tsx:26-63` |

---

## ❌ Ce qui manque

| Fonctionnalité | Status | Notes |
|----------------|--------|-------|
| Countdown LAUNCH_TARGET dans V2 | ❌ | Existe dans AfroeUnifiedLanding mais pas dans V2 |
| Dashboard utilisateur (stats referral) | ❌ | Pas de page `/dashboard` |
| Leaderboard public | ⚠️ | Existe dans `/leaderboard` mais non intégré dans landing |
| Notifications en temps réel | ❌ | Pas de polling/websocket pour nouveaux referrals |

---

# 📋 PLAN EN 6 COMMITS ATOMIQUES

## Objectif Global
Améliorer le système de referral sans casser la prod actuelle.

---

### COMMIT 1: Ajouter le Countdown dans HeroSectionV2
**Fichiers modifiés**:
- `app/components/HeroSectionV2.tsx`

**Changements**:
- Ajouter la constante `LAUNCH_TARGET = "2025-12-15T12:00:00+01:00"`
- Créer un composant `Countdown` interne (jours/heures/min/sec)
- Intégrer le countdown sous le badge early bird
- Garder le H1 et sous-titre intacts (GUARDRAIL)

**Tests**:
- Vérifier que le countdown s'affiche correctement
- Vérifier que le CTA principal reste fonctionnel
- Build sans erreur

---

### COMMIT 2: Améliorer le flow SMS (UX)
**Fichiers modifiés**:
- `app/components/AfroeWaitlistLandingV2.tsx`

**Changements**:
- Ajouter un état `resendAvailable` (réactivé après 30s)
- Bouton "Renvoyer le code" avec cooldown visible
- Améliorer les messages d'erreur (expired, invalid, rate_limit)
- Ajouter un loader pendant l'envoi SMS

**Tests**:
- Tester l'envoi d'un code
- Attendre expiration → vérifier message "Expiré"
- Cliquer "Renvoyer" → vérifier cooldown
- Entrer mauvais code → vérifier message erreur

---

### COMMIT 3: Enrichir la page Success avec statistiques
**Fichiers modifiés**:
- `app/success/page.tsx`

**Changements**:
- Afficher "Tu as rejoint la Glow List en position #XXX"
- Afficher le nombre de points actuels
- Ajouter section "Comment gagner plus de points ?" (breakdown par rôle)
- Garder les share buttons intacts

**Tests**:
- S'inscrire → vérifier affichage du rang
- Vérifier que le refLink est correct
- Cliquer sur les boutons de partage

---

### COMMIT 4: Créer une API `/api/user-stats`
**Fichiers créés**:
- `app/api/user-stats/route.ts`

**Changements**:
- Endpoint `GET /api/user-stats?userId=XXX`
- Retourne: `{ referralCode, refCount, waitlistClients, waitlistInfluencers, waitlistPros, provisionalPoints, rank, nextMilestone }`
- RLS: vérifier que l'user peut seulement voir ses propres stats

**Tests**:
- Appeler l'API avec un userId valide
- Vérifier les données retournées
- Tenter d'accéder aux stats d'un autre user (doit échouer)

---

### COMMIT 5: Ajouter un Dashboard simple `/dashboard`
**Fichiers créés**:
- `app/dashboard/page.tsx`

**Changements**:
- Page protégée (récupère userId depuis session/cookie)
- Appelle `/api/user-stats`
- Affiche:
  - Carte stats (Total referrals, Points, Classement)
  - Breakdown par rôle (clients/influencers/pros)
  - Barre de progression vers prochain milestone
  - Section "Partage ton lien" avec `<ShareButtons />`

**Tests**:
- Accéder à `/dashboard` après inscription
- Vérifier affichage des stats
- Partager le lien → vérifier qu'il contient le bon refCode

---

### COMMIT 6: Intégrer le Dashboard dans le flow principal
**Fichiers modifiés**:
- `app/success/page.tsx`
- `app/components/HeroSectionV2.tsx` (optionnel)

**Changements**:
- Ajouter un bouton "Voir mon dashboard" sur la page success
- Ajouter un lien "Dashboard" dans le hero (si l'user est déjà inscrit)
- Détecter si l'user a un `?ref=` dans localStorage → afficher badge "Tu as été invité par XXX"

**Tests**:
- S'inscrire → voir le bouton "Dashboard" sur success
- Cliquer → arriver sur `/dashboard`
- Revenir sur `/` → vérifier que le badge invite s'affiche
- Build final sans erreur

---

## 🔐 Principes de Sécurité

### Pour chaque commit
1. **Aucun breaking change** sur les API existantes
2. **Tests manuels** de bout en bout (inscription → SMS → success → dashboard)
3. **Build** doit passer (`npm run build`)
4. **Garder les GUARDRAILS** intacts (H1, referral flow)
5. **RLS** vérifié pour toutes nouvelles queries

### Rollback plan
- Chaque commit est indépendant
- Si un commit casse la prod → `git revert` immédiat
- La V1 (landing V2 actuelle) reste fonctionnelle à tout moment

---

## 📦 Dépendances Système

### Déjà en place
- ✅ Prisma ORM + Supabase DB
- ✅ Redis (via Upstash) pour SMS store
- ✅ Brevo API (emails + SMS)
- ✅ Next.js 14 App Router
- ✅ TailwindCSS + shadcn/ui

### À ajouter (aucune)
Tous les commits utilisent l'infra existante.

---

## 🎯 Résultat Final Attendu

Après les 6 commits:
1. ✅ Hero avec countdown visible
2. ✅ SMS flow plus fluide (resend, meilleurs messages d'erreur)
3. ✅ Page success enrichie (rang, points, breakdown)
4. ✅ API `/api/user-stats` pour récupérer les stats user
5. ✅ Dashboard fonctionnel (`/dashboard`)
6. ✅ Intégration complète du dashboard dans le flow

**Sans casser**:
- Le formulaire d'inscription
- Le système de referral
- Les emails de bienvenue
- La page success existante
- Les guardrails (H1 + referral flow)

---

# 📝 Checklist Avant Chaque Commit

- [ ] Le code compile (`npm run build`)
- [ ] Les tests manuels passent (inscription → success)
- [ ] Aucun warning de sécurité (RLS, validation input)
- [ ] Les GUARDRAILS sont respectés
- [ ] Le commit message est clair (format: `feat: add countdown to hero section`)
- [ ] Les fichiers modifiés sont listés
- [ ] Un rollback est possible (`git revert`)

---

**Statut**: Prêt pour implémentation. Attente validation avant de commencer les commits.
