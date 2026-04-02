# Afroé Waitlist Platform

Advanced waitlist landing page with multi-tier referral system, fraud detection, and automated email campaigns. Built for the Afroé beauty services marketplace launch.

## Overview

Afroé is a beauty services marketplace connecting clients with beauty professionals and influencers. This waitlist platform manages pre-launch signups with a gamified referral system featuring:

- **Multi-tier referral tracking** (2-level deep)
- **Role-based point system** (Client: 5pts waitlist / 10pts app, Influencer: 15pts / 50pts, Beauty Pro: 25pts / 100pts)
- **Dual-phase scoring** (provisional points during waitlist + final points at launch)
- **Early-bird rewards** (first 100 signups get bonus points)
- **Prize eligibility** (iPhone 17 Pro for rank 1, €2,000 jackpot for 100+ points)
- **Automated email sequences** via Brevo (welcome, follow-up J+7, reminder J+45)
- **Anti-fraud system** (IP tracking, device fingerprinting, rate limiting)

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes + Supabase Edge Functions
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Email/SMS**: Brevo (transactional + automation)
- **Rate Limiting**: Upstash Redis
- **Storage**: Supabase Storage (public buckets for email images)

## Architecture

### Signup Flow

All waitlist signups go through the Supabase Edge Function `join-waitlist`:

1. Phone OTP verification (`send-sms-code` + `verify-sms-code` edge functions)
2. User created in Supabase `User` table
3. Contact upserted in Brevo with role-mapped `ROLE` attribute
4. Welcome email sent directly via Brevo transactional API
5. Contact added to **Glow List #5** → triggers Brevo automation for follow-ups

### Role Mapping (Brevo)

| App role | Brevo ROLE attribute | Brevo automation branch |
|----------|---------------------|------------------------|
| `client` | `client` | Client (catch-all) |
| `influencer` | `influenceur` | Amb |
| `beautypro` | `pro` | Pro |

### Brevo Automation — "Follow Up email"

Trigger: **Ajouté à la liste Glow List #5**

- Re-entry enabled (contacts can re-enter on new signup)
- The edge function removes the contact from list 5 before re-adding to guarantee the trigger fires
- **Branch Pro**: `ROLE = pro`
- **Branch Amb**: `ROLE = influenceur` + membre de liste 5
- **Branch Client**: catch-all

Sequence per branch:
- J0: Welcome email + SMS (sent directly by edge function as primary; automation = fallback)
- J+7: Nudge email + SMS
- J+45: Final reminder email + SMS

### Email Templates (Brevo transactional)

| Template ID | Usage |
|-------------|-------|
| 101 | Client welcome |
| 107 | Beauty Pro welcome |
| 115 | Ambassador/Influencer welcome |
| 116 | Ambassador contract follow-up J+7 |
| 117 | Ambassador contract reminder J+45 |

### Database Schema

#### Core Tables
- **User**: Main user table with 35+ columns including points, rank, referral tracking
- **ReferralEvent**: Audit trail for all referral events with points awarded
- **signup_metadata**: Fraud detection data (IP, device fingerprint, form timing)
- **referral_tracking**: Per-referral fraud analysis
- **ip_activity**: Rate limiting and abuse prevention

#### Security
- Row Level Security (RLS) enabled on all tables
- Service role access for API routes
- Public read limited to leaderboard view only
- Helper function `get_user_public_profile()` for safe profile sharing

### Points System

**Referral Points (Dual-phase)**
- Pre-launch (waitlist): 5pts (client), 15pts (influencer), 25pts (beauty pro)
- Post-launch (app): 10pts (client), 50pts (influencer), 100pts (beauty pro)
- Early-bird bonus: 50pts (first 100 signups)

**Provisional vs Final Points**
- `provisionalPoints`: Earned during waitlist phase
- `finalPoints`: Calculated at launch including post-launch conversions
- Prize eligibility based on `finalPoints` only

### Anti-Fraud Features

1. **IP Tracking**: Max 3 signups per IP per day
2. **Device Fingerprinting**: Detects duplicate devices
3. **Form Timing Analysis**: Flags submissions < 3 seconds (bots)
4. **Temp Email Detection**: Blocks disposable email providers
5. **Risk Scoring**: Cumulative fraud score per user
6. **Rate Limiting**: Via Upstash Redis with sliding window

## Pages

| Route | Description |
|-------|-------------|
| `/` | Main waitlist landing page |
| `/success` | Post-signup confirmation with referral link |
| `/leaderboard` | Public referral leaderboard |
| `/ambassadors/apply` | Ambassador application form |
| `/ambassadors/contrat` | Ambassador contract info page |
| `/pro/apply` | Beauty Pro application form with portfolio upload |
| `/reglement` | Contest rules |

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Brevo (Email + SMS)
BREVO_API_KEY="xkeysib-..."
BREVO_SENDER_EMAIL="noreply@afroe.studio"
BREVO_SENDER_NAME="Afroé"

# Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# App Config
NEXT_PUBLIC_APP_URL="https://afroe.studio"
```

### 2. Database Setup

Migrations are managed via Supabase. Applied migrations:
1. `create_waitlist_tables.sql` - Core User and ReferralEvent tables
2. `add_fraud_detection_fields.sql` - Anti-fraud tables
3. `complete_user_schema.sql` - All 35 user columns
4. `fix_lastrefat_column.sql` - Column rename fix
5. `secure_rls_policies.sql` - RLS security hardening

### 3. Prisma Setup

```bash
npm run postinstall
```

### 4. Development

```bash
npm run dev
```

Visit `http://localhost:3000`

## API Routes

### Waitlist Signup (main flow)

The primary signup flow uses **Supabase Edge Functions** directly:
- `POST /functions/v1/send-sms-code` — sends OTP
- `POST /functions/v1/verify-sms-code` — verifies OTP
- `POST /functions/v1/join-waitlist` — creates user, syncs to Brevo, sends welcome email

### Ambassador Applications

- **POST /api/ambassadors/apply** — saves ambassador application, sends contract email, stores files in Supabase Storage (`ambassador-applications` bucket)

### Beauty Pro Applications

- **POST /api/pro/apply** — saves pro application, uploads portfolio to `afroe-pro-portfolios` bucket, sends welcome email

### Cron Jobs (Automated)

- **POST /api/cron/launch-day** — sends launch day notifications to all users

### Admin Endpoints

- **POST /api/admin/recalculate-final-points** — recalculates all final points and prize eligibility
- **GET /api/leaderboard/export** — exports leaderboard as CSV
- **GET /api/early-bird-count** — returns current early-bird count

## Supabase Storage Buckets

| Bucket | Public | Usage |
|--------|--------|-------|
| `Image Amb email1` | yes | Hero image for ambassador welcome email |
| `image Pro email1` | yes | Hero image for beauty pro welcome email |
| `afroe-pro-portfolios` | no | Beauty pro portfolio uploads |
| `ambassador-applications` | no | Ambassador application files |

## SMS Templates

SMS messages are defined in `lib/sms-templates.ts`:
- Welcome messages with referral link (per role)
- Milestone achievements
- Launch notifications

## Deployment

### Vercel (Recommended)

1. Push to GitHub branch `claude/fix-hero-image-m04Z3`
2. Connect to Vercel
3. Add environment variables
4. Deploy

Production domain: `afroe.studio`

## Security Considerations

1. **Never expose service_role key** — only in API routes and edge functions, never client-side
2. **RLS policies** — all tables have restrictive policies
3. **Rate limiting** — applied to all public endpoints
4. **Input validation** — email, phone, referral codes validated
5. **SQL injection** — protected via Prisma parameterized queries
6. **XSS** — React auto-escapes, no `dangerouslySetInnerHTML`

## Known Issues / Fixed Bugs

- **Double checkbox on landing page**: removed hardcoded `☑` emoji from label in `AfroeWaitlistLandingV2.tsx`
- **Beauty Pro apply 500 error**: fixed wrong storage bucket (`applications` → `afroe-pro-portfolios`)
- **Ambassador contract link**: fixed `CONTRACT_LINK` to point to `/ambassadors/contrat`
- **Beauty Pro email domain**: fixed `afroebeauty.com` and `www.afroe.studio` → `afroe.studio` in Brevo templates
- **Influencer automation branch**: fixed role mapping `influencer` → `influenceur` to match Brevo condition
- **Brevo automation trigger**: edge function now removes contact from list before re-adding to guarantee trigger fires

## License

Proprietary — Afroé Platform
