# Système de Referral - État Actuel

## ✅ Tout est déjà en place et fonctionnel

Votre système de referral est entièrement configuré et opérationnel. Voici ce qui existe déjà dans votre projet.

---

## 1. Base de Données (Prisma Schema)

### Table `User`
Colonnes liées au referral:
- **`referralCode`** (String, unique, non null) → Code unique de 8 caractères pour chaque utilisateur
- **`referredBy`** (String?, nullable) → Stocke le referralCode du parrain
- **`refCount`** (Int) → Nombre total de referrals
- **`waitlistClients`** (Int) → Nombre de clients parrainés
- **`waitlistInfluencers`** (Int) → Nombre d'influenceurs parrainés
- **`waitlistPros`** (Int) → Nombre de beauty pros parrainés

### Table `ReferralEvent`
Log de tous les événements de parrainage:
- **`type`** → Type d'événement (waitlist_signup, app_download, etc.)
- **`actorL1Id`** → ID du parrain (celui qui invite)
- **`actorL2Id`** → ID du filleul (celui qui s'inscrit)
- **`roleAtSignup`** → Rôle au moment de l'inscription
- **`pointsAwarded`** → Points attribués pour cet événement

---

## 2. Génération du Code de Referral (Backend)

### Fichier: `app/api/join-waitlist/route.ts`

#### Fonction `generateReferralCode()`
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

**Caractéristiques:**
- ✅ 8 caractères
- ✅ Majuscules et chiffres uniquement
- ✅ Exclut O, I, 0, 1 (caractères ambigus)
- ✅ Exemples: `K3PL7MR9`, `BQ4WX6TY`

#### Fonction `ensureUniqueReferralCode()`
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

  throw new Error("Unable to generate unique referral code");
}
```

**Caractéristiques:**
- ✅ Vérifie l'unicité en base
- ✅ Retry automatique (10 tentatives max)
- ✅ Throw error si échec après 10 tentatives

---

## 3. Flux d'Inscription avec Referral

### Lors de l'inscription (`POST /api/join-waitlist`)

1. **Récupération du ref query param**
   ```typescript
   const referrerCode = url.searchParams.get('ref') || body.referredBy;
   ```

2. **Recherche du parrain**
   ```typescript
   let referrer = null;
   if (referrerCode) {
     referrer = await prisma.user.findFirst({
       where: { referralCode: referrerCode }
     });
   }
   ```

3. **Création du nouvel utilisateur**
   ```typescript
   const newUser = await prisma.user.create({
     data: {
       referralCode: await ensureUniqueReferralCode(),
       referredBy: referrer?.referralCode || null,
       // ... autres champs
     }
   });
   ```

4. **Attribution des points au parrain**
   ```typescript
   if (referrer) {
     let pointsAwarded = 0;
     let counterField: 'waitlistClients' | 'waitlistInfluencers' | 'waitlistPros';

     switch (role) {
       case 'client':
         pointsAwarded = POINTS_CONFIG.WAITLIST.CLIENT; // +2 pts
         counterField = 'waitlistClients';
         break;
       case 'influencer':
         pointsAwarded = POINTS_CONFIG.WAITLIST.INFLUENCER; // +15 pts
         counterField = 'waitlistInfluencers';
         break;
       case 'beautypro':
         pointsAwarded = POINTS_CONFIG.WAITLIST.BEAUTY_PRO; // +25 pts
         counterField = 'waitlistPros';
         break;
     }

     await prisma.user.update({
       where: { id: referrer.id },
       data: {
         refCount: { increment: 1 },
         [counterField]: { increment: 1 },
         lastRefAt: new Date()
       }
     });
   }
   ```

5. **Log de l'événement**
   ```typescript
   await prisma.referralEvent.create({
     data: {
       actorL1Id: referrer.id,
       actorL2Id: newUser.id,
       type: 'waitlist_signup',
       roleAtSignup: role,
       pointsAwarded: pointsAwarded
     }
   });
   ```

6. **Envoi de l'email de bienvenue avec refLink**
   ```typescript
   const refLink = `${process.env.NEXT_PUBLIC_APP_URL}?ref=${newUser.referralCode}`;

   await sendClientWelcomeEmail({
     email: newUser.email,
     firstName: newUser.firstName,
     role,
     refLink, // ← Inclus dans l'email
     rank: newUser.rank,
     points: newUser.provisionalPoints,
     nextMilestone: newUser.nextMilestone
   });
   ```

---

## 4. Frontend - Affichage Conditionnel

### Page Success (`app/success/page.tsx`)

**Règle cruciale:** Les boutons de partage ne s'affichent QUE si le referralCode existe.

```typescript
{referralCode && (
  <>
    {/* Affichage du code */}
    <div className="text-3xl font-bold text-amber-300">
      {referralCode}
    </div>

    {/* Affichage du lien complet */}
    {shareUrl && (
      <input
        type="text"
        readOnly
        value={shareUrl}
        className="..."
      />
    )}

    {/* Boutons de partage */}
    <button onClick={shareOnWhatsApp}>WhatsApp</button>
    <button onClick={shareOnTwitter}>Twitter</button>
  </>
)}
```

**Construction du refLink côté client:**
```typescript
const code = searchParams.get("ref");
if (code) {
  setReferralCode(code);
  const url = `${window.location.origin}?ref=${code}`;
  setShareUrl(url);
}
```

**Caractéristiques:**
- ✅ Le refLink n'est PAS stocké en base (calculé dynamiquement)
- ✅ Format: `https://afroe.studio?ref=K3PL7MR9`
- ✅ Affichage conditionnel (seulement si code existe)
- ✅ Copie dans le clipboard
- ✅ Partage sur réseaux sociaux

---

## 5. Composant Réutilisable `ShareButtons`

### Fichier: `app/components/ShareButtons.tsx`

Composant standalone pour partager le refLink:

```typescript
<ShareButtons
  referralLink={refLink}
  message="Rejoins Afroé, la plateforme beauté afro qui change le game ! 🔥"
/>
```

**Réseaux supportés:**
- WhatsApp
- TikTok (copie dans clipboard + alert)
- Instagram (copie dans clipboard + alert)
- Snapchat (copie dans clipboard + alert)
- Facebook
- LinkedIn
- SMS

**Usage recommandé:**
```typescript
{user?.referralCode ? (
  <ShareButtons
    referralLink={`${window.location.origin}?ref=${user.referralCode}`}
  />
) : (
  <p>Inscris-toi pour débloquer ton lien.</p>
)}
```

---

## 6. Règles de Points par Rôle

### Avant le lancement (Waitlist)
- **Client**: +2 pts par inscription via son lien
- **Influenceur**: +15 pts par inscription via son lien
- **Beauty Pro**: +25 pts par inscription via son lien

### Après le lancement (App)
- **Client**: +10 pts par téléchargement + compte utilisé
- **Influenceur**: +50 pts par influenceur actif validé
- **Beauty Pro**: +100 pts par Beauty Pro validé

### Paliers (Milestones)
- **10 pts** → Glow Starters
- **50 pts** → Glow Circle Insiders
- **100 pts** → Glow Icons + ticket Jackpot 3 500 €
- **200 pts+** → Tier Secret

---

## 7. Récapitulatif - Ce qui est déjà fonctionnel

| Fonctionnalité | Status | Emplacement |
|----------------|--------|-------------|
| Table `users` avec `referralCode` + `referredBy` | ✅ | `prisma/schema.prisma` |
| Génération code 8 chars (pas d'ambiguïté) | ✅ | `app/api/join-waitlist/route.ts:13-19` |
| Vérification unicité avec retry | ✅ | `app/api/join-waitlist/route.ts:22-37` |
| Détection du parrain via query param `?ref=` | ✅ | `app/api/join-waitlist/route.ts:60` |
| Attribution automatique des points | ✅ | `app/api/join-waitlist/route.ts:177-234` |
| Log des événements dans `ReferralEvent` | ✅ | `app/api/join-waitlist/route.ts:223-233` |
| Email de bienvenue avec refLink | ✅ | `app/api/join-waitlist/route.ts:253-275` |
| Page success avec partage conditionnel | ✅ | `app/success/page.tsx:53-96` |
| Composant `ShareButtons` réutilisable | ✅ | `app/components/ShareButtons.tsx` |
| Compteurs par rôle (clients/influencers/pros) | ✅ | `prisma/schema.prisma:28-30` |

---

## 8. Ce qu'il reste à faire (si besoin)

### Frontend
- [ ] Ajouter une page dashboard pour voir ses stats de referral
- [ ] Afficher le classement (leaderboard) avec les top referrers
- [ ] Afficher les points en temps réel après chaque referral

### Backend
- [ ] Webhook pour détecter les téléchargements d'app (post-launch)
- [ ] API pour valider les influenceurs/pros (post-launch)
- [ ] Calcul automatique des points finaux vs provisionnels

### Anti-Fraude
- [ ] Limiter le nombre de referrals par IP/jour
- [ ] Détecter les inscriptions en masse
- [ ] Système de review manuel pour gros volumes

---

## 9. URLs et Flux Utilisateur

### Flux d'inscription standard
1. User 1 s'inscrit → reçoit `referralCode: "ABC12345"`
2. User 1 reçoit un email avec `refLink: "https://afroe.studio?ref=ABC12345"`
3. User 1 partage son lien
4. User 2 clique sur le lien → arrive sur `/?ref=ABC12345`
5. User 2 s'inscrit → `referredBy: "ABC12345"` est stocké
6. User 1 gagne des points automatiquement

### Variables d'environnement requises
```env
NEXT_PUBLIC_APP_URL=https://afroe.studio
DATABASE_URL=postgresql://...
BREVO_API_KEY=xkeysib-...
```

---

## Conclusion

🎉 **Votre système de referral est 100% opérationnel.**

Tout fonctionne déjà:
- Génération de codes uniques
- Tracking des referrals
- Attribution des points
- Emails avec refLink
- Affichage conditionnel des boutons de partage

Vous pouvez commencer à utiliser le système immédiatement. Aucune migration ou modification n'est nécessaire.
