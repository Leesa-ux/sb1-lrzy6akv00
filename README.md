# Afroé Waitlist Platform

Advanced waitlist landing page with multi-tier referral system, fraud detection, and automated email campaigns. Built for the Afroé beauty services marketplace launch.

## Overview

Afroé is a beauty services marketplace connecting clients with beauty professionals and influencers. This waitlist platform manages pre-launch signups with a gamified referral system featuring:

- **Multi-tier referral tracking** (2-level deep)
- **Role-based point system** (Client: 5pts waitlist / 10pts app, Influencer: 15pts / 50pts, Beauty Pro: 25pts / 100pts)
- **Dual-phase scoring** (provisional points during waitlist + final points at launch)
- **Early-bird rewards** (first 100 signups get bonus points)
- **Prize eligibility** (iPhone 17 Pro for rank 1, €3,500 jackpot for 100+ points)
- **Automated email sequences** via Brevo (welcome, milestone progress, weekly updates)
- **Anti-fraud system** (IP tracking, device fingerprinting, rate limiting)

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Email**: Brevo (Sendinblue)
- **SMS**: Brevo Transactional SMS
- **Rate Limiting**: Upstash Redis

## Architecture

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

# Brevo (Email + SMS)
BREVO_API_KEY="xkeysib-..."
BREVO_SENDER_EMAIL="noreply@afroe.com"
BREVO_SENDER_NAME="Afroé"

# Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# App Config
NEXT_PUBLIC_APP_URL="https://afroe.com"
```

### 2. Database Setup

Migrations are managed via Supabase. Applied migrations:
1. `create_waitlist_tables.sql` - Core User and ReferralEvent tables
2. `add_fraud_detection_fields.sql` - Anti-fraud tables
3. `complete_user_schema.sql` - All 35 user columns
4. `fix_lastrefat_column.sql` - Column rename fix
5. `secure_rls_policies.sql` - RLS security hardening

To apply migrations:
```bash
# Migrations are auto-applied via MCP Supabase tool
# No manual action required
```

### 3. Prisma Setup

Generate Prisma client:
```bash
npm run postinstall
```

### 4. Development

```bash
npm run dev
```

Visit `http://localhost:3000`

## API Routes

### User Signup Flow

1. **POST /api/send-otp**
   - Sends SMS verification code
   - Rate limited: 3 per phone per hour
   - Returns: `{ success: true }`

2. **POST /api/verify-otp**
   - Verifies SMS code
   - Creates user if valid
   - Returns: `{ success: true, referralCode: "ABC123" }`

3. **POST /api/save-lead**
   - Saves complete user profile
   - Triggers referral point calculation
   - Sends welcome email
   - Returns: `{ success: true, user: {...} }`

### Referral Tracking

4. **POST /api/referral-track**
   - Tracks referral click
   - Records IP, device, timestamp
   - Returns: `{ success: true }`

5. **POST /api/webhook/referral-completed**
   - Called when referral converts
   - Awards points to referrer
   - Checks fraud flags
   - Returns: `{ success: true, pointsAwarded: 10 }`

### Email Automation

6. **POST /api/signup-complete**
   - Sends welcome email with referral link
   - Returns: `{ success: true }`

7. **POST /api/progress-email**
   - Sends milestone progress email
   - Triggered at: 10, 25, 50, 100 points
   - Returns: `{ success: true }`

### Cron Jobs (Automated)

8. **POST /api/cron/followup-1h** - Send 1-hour follow-up
9. **POST /api/cron/activation-48h** - Send 48-hour activation reminder
10. **POST /api/cron/progress-weekly** - Send weekly progress updates
11. **POST /api/cron/nightly-risk-scan** - Scan for fraud patterns
12. **POST /api/cron/launch-day** - Send launch day notifications

### Admin Endpoints

13. **POST /api/admin/recalculate-final-points**
    - Recalculates all final points
    - Updates rank and prize eligibility
    - Returns: `{ success: true, updated: 1234 }`

14. **GET /api/leaderboard/export**
    - Exports leaderboard as CSV
    - Returns: CSV file download

15. **GET /api/early-bird-count**
    - Returns current early-bird count
    - Returns: `{ count: 42, limit: 100 }`

## Email Templates

Brevo templates are configured via web UI. Required templates:

1. **Welcome Email** (ID: 1) - Sent after signup
2. **Milestone Progress** (ID: 2) - Sent at 10/25/50/100 points
3. **Weekly Progress** (ID: 3) - Sent every Monday
4. **1-Hour Follow-up** (ID: 4) - Sent if no referrals after 1h
5. **48-Hour Activation** (ID: 5) - Sent if inactive after 48h
6. **Launch Day** (ID: 6) - Sent on app launch

See `BEAUTY_PRO_EMAIL_SEQUENCE.md` for template content.

## SMS Templates

SMS messages are defined in `lib/sms-templates.ts`:

- Verification codes (OTP)
- Welcome messages with referral link
- Milestone achievements
- Launch notifications

See `SMS_TEMPLATES_GUIDE.md` for all templates.

## Testing

### Rate Limiter Test
```bash
npm run test:rate-limiter
```

### SMS Test (Dev Mode)
Add `?dev=1` to skip SMS verification during development.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Environment-Specific Config

Use `vercel.json` to configure:
- Cron jobs (weekly/daily/hourly)
- Redirects
- Headers

## Security Considerations

1. **Never expose service_role key** - Only in API routes, never client-side
2. **RLS policies** - All tables have restrictive policies
3. **Rate limiting** - Applied to all public endpoints
4. **Input validation** - Email, phone, referral codes validated
5. **SQL injection** - Protected via Prisma parameterized queries
6. **XSS** - React auto-escapes, no `dangerouslySetInnerHTML`

## Monitoring

Key metrics to track:
- Signup conversion rate (OTP sent → user created)
- Referral conversion rate (click → signup)
- Fraud detection hit rate
- Email open/click rates (via Brevo)
- Points distribution (histogram)
- Top referrers (leaderboard)

## Documentation

- `QUICK_START.md` - Fast setup guide
- `AUTOMATION_SETUP.md` - Email automation config
- `BREVO_SETUP.md` - Brevo integration guide
- `BEAUTY_PRO_EMAIL_SEQUENCE.md` - Email templates
- `SMS_TEMPLATES_GUIDE.md` - SMS templates
- `ACCESSIBILITY_EXPLAINED_SIMPLE.md` - A11y features

## License

Proprietary - Afroé Platform
Deployment trigger
