# Mission : Remplacer l'automation Brevo par des crons fiables

## Contexte du projet

**Projet** : Afroé Waitlist Platform  
**Repo** : `Leesa-ux/sb1-lrzy6akv00` (branch `claude/fix-hero-image-m04Z3`)  
**Stack** : Next.js 14, Supabase (PostgreSQL), Brevo (email/SMS)  
**Domaine** : `afroe.studio`

---

## Problème à résoudre

L'automation Brevo "Follow Up email" est censée envoyer des emails de relance à J+7 et J+45 après l'inscription. Elle est déclenchée par "Ajouté à la liste Glow List #5".

**Problème** : ce trigger Brevo est peu fiable :
- Ne se déclenche pas pour les contacts déjà connus de Brevo
- Condition de re-entrée fragile
- Pas de logs d'erreur clairs quand ça échoue

**Ce qui est déjà en place (ne pas toucher) :**
- L'email welcome J0 est envoyé **directement** depuis la Supabase Edge Function `join-waitlist` via l'API transactionnelle Brevo → ça fonctionne
- L'automation Brevo reste comme **fallback** pour le welcome

**Ce qu'il faut créer :**  
Des routes cron Next.js qui envoient les emails J+7 et J+45 **directement** via l'API transactionnelle Brevo, sans dépendre de l'automation.

---

## Architecture cible

```
Inscription utilisateur
        ↓
join-waitlist (edge function)
        ↓
✅ Welcome email → envoyé directement (déjà fait)
✅ Contact ajouté à Brevo liste 5 (déjà fait)
        ↓
[Vercel Cron — quotidien]
        ↓
✅ J+7  → POST /api/cron/followup-j7
✅ J+45 → POST /api/cron/followup-j45
```

---

## Templates Brevo (IDs transactionnels)

| Template ID | Rôle | Usage |
|-------------|------|-------|
| 101 | client | Welcome J0 |
| 107 | beautypro | Welcome J0 |
| 115 | influencer | Welcome J0 |

**Pour J+7 et J+45 : les templates n'existent pas encore en transactionnel.**  
Il faudra soit :
- Créer de nouveaux templates dans Brevo (Transactionnel → Templates) et noter les IDs
- Ou réutiliser les templates existants de l'automation (#70, #71 pour Amb ; #74, #75 pour Client ; visible dans l'automation Brevo "Follow Up email")

**Templates de l'automation (déjà créés dans Brevo) :**
- Ambassador J+7 : Design Automation #1_step_#89 - #70
- Ambassador J+45 : Design Automation #1_step_#90 - #71
- Client J+7 : Design Automation #1_step_#93 - #74
- Client J+45 : Design Automation #1_step_#98 - #75
- Pro J+7 : voir automation Brevo

---

## Base de données Supabase

**Table principale** : `User`

Colonnes pertinentes :
```sql
id              TEXT PRIMARY KEY
email           TEXT
firstName       TEXT
phone           TEXT
role            TEXT  -- 'client' | 'influencer' | 'beautypro'
referral_code   TEXT
createdAt       TIMESTAMP  -- date d'inscription
```

**Requête pour J+7** (users inscrits entre 7j et 8j) :
```sql
SELECT id, email, firstName, role, referral_code
FROM "User"
WHERE createdAt >= NOW() - INTERVAL '8 days'
  AND createdAt < NOW() - INTERVAL '7 days'
```

**Requête pour J+45** (users inscrits entre 45j et 46j) :
```sql
SELECT id, email, firstName, role, referral_code
FROM "User"
WHERE createdAt >= NOW() - INTERVAL '46 days'
  AND createdAt < NOW() - INTERVAL '45 days'
```

---

## Variables d'environnement disponibles

```env
BREVO_API_KEY               # clé API Brevo
NEXT_PUBLIC_APP_URL         # https://afroe.studio
SUPABASE_SERVICE_ROLE_KEY   # clé Supabase service role
NEXT_PUBLIC_SUPABASE_URL    # URL Supabase
```

---

## Fichiers de référence à lire avant de coder

1. **`lib/brevo-client.ts`** — fonction `sendBrevoEmail()` existante à réutiliser
2. **`lib/brevo-types.ts`** — `EMAIL_TEMPLATE_IDS` et `mapRoleForBrevo()`
3. **`app/api/cron/launch-day/route.ts`** — exemple de cron existant à copier comme pattern
4. **`vercel.json`** — configuration des crons Vercel (à mettre à jour)

---

## Ce qu'il faut créer

### 1. Route cron J+7

**Fichier** : `app/api/cron/followup-j7/route.ts`

```typescript
// Pattern à suivre :
export async function POST(req: Request) {
  // 1. Vérifier le secret cron (header Authorization)
  // 2. Requêter Supabase : users où createdAt entre J-8 et J-7
  // 3. Pour chaque user : sendBrevoEmail avec le bon templateId selon son role
  // 4. Logger les succès/erreurs
  // 5. Return { sent: N, errors: M }
}
```

**Template IDs à utiliser pour J+7** (à créer dans Brevo ou utiliser ceux de l'automation) :
- client → à définir
- influencer → à définir  
- beautypro → à définir

### 2. Route cron J+45

**Fichier** : `app/api/cron/followup-j45/route.ts`

Même pattern que J+7 mais avec l'intervalle 45-46 jours.

### 3. Mise à jour `vercel.json`

Ajouter les deux crons :
```json
{
  "crons": [
    {
      "path": "/api/cron/followup-j7",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/followup-j45",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### 4. Sécuriser les routes cron

Utiliser la variable `CRON_SECRET` pour protéger les endpoints :
```typescript
if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
  return new Response('Unauthorized', { status: 401 });
}
```

---

## Mapping rôles → templates

La fonction `mapRoleForBrevo()` dans `lib/brevo-types.ts` :
```typescript
beautypro / beauty_pro / pro → 'pro'
influencer → 'amb'  (attention: dans l'edge function on envoie 'influenceur' à Brevo)
autres → 'client'
```

Pour les crons, utiliser directement le champ `role` de la table `User` :
- `'client'` → template client
- `'influencer'` → template influencer/ambassador
- `'beautypro'` → template beauty pro

---

## Variables Brevo dans les emails

Les templates Brevo utilisent ces variables Liquid :
- `{{ contact.FIRSTNAME }}` — prénom
- `{{ contact.REF_LINK }}` — lien de parrainage
- `{{ contact.REF_CODE }}` — code de parrainage

Dans l'API transactionnelle, les passer via `params` :
```json
{
  "templateId": 70,
  "to": [{ "email": "...", "name": "..." }],
  "params": {
    "FIRSTNAME": "Lisa",
    "REF_LINK": "https://afroe.studio/?ref=AF45WXXN",
    "REF_CODE": "AF45WXXN"
  }
}
```

---

## Résultat attendu

Après implémentation :
- Les emails J+7 et J+45 partent **à coup sûr** chaque jour à 9h
- Aucune dépendance à l'automation Brevo pour les relances
- L'automation Brevo reste active comme **double filet** (welcome J0 uniquement)
- Les logs Vercel montrent combien d'emails ont été envoyés chaque jour

---

## Notes importantes

- **Ne pas modifier** la Supabase Edge Function `join-waitlist` — elle est déjà en v23 et fonctionne
- **Ne pas modifier** `app/page.tsx` — fichier protégé par GUARDRAILS.md
- **Branch cible** : `claude/fix-hero-image-m04Z3`
- Commit et push sur cette branch après chaque modification
