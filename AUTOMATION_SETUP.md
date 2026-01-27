# Afroé Waitlist Automation System - Complete Setup Guide

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Point System](#point-system)
5. [Automation Flows](#automation-flows)
6. [API Endpoints](#api-endpoints)
7. [Environment Configuration](#environment-configuration)
8. [Deployment Guide](#deployment-guide)
9. [Testing](#testing)
10. [Monitoring](#monitoring)

---

## 🎯 System Overview

The Afroé Waitlist Automation System manages a role-based referral contest with SMS verification, point attribution, and automated email/SMS journeys.

### Campaign Timeline
- **Start Date**: January 15, 2026
- **End Date**: March 1, 2026 (00:00 Brussels time)
- **Duration**: ~6 weeks

### Referral Validation Rules

A referral counts **ONLY** when the referred person completes ALL of these steps:
1. ✅ Completes waitlist signup
2. ✅ Selects a role (Client·e, Influenceur·euse, or Beauty Pro)
3. ✅ Verifies their phone number via OTP

**No points are awarded for**:
- Partial submissions (email only, no role selected)
- Unverified phone numbers
- Invalid or duplicate phone numbers

### User Journey Phases

The automation system manages the complete journey from signup to launch:

- **Phase 1**: Instant activation (welcome, follow-up, 48h activation)
- **Phase 2**: Growth milestones (10, 50, 100, 200 points)
- **Phase 3**: Anti-churn (5-day inactivity reminders)
- **Phase 4**: Launch day (email + SMS with post-launch point values)

### Key Features

- ✅ Role-based point system (client, influencer, beauty pro)
- ✅ OTP-based phone verification for referral validation
- ✅ Atomic transaction-based point crediting (no partial failures)
- ✅ Automated email & SMS sequences
- ✅ Milestone tracking and rewards
- ✅ Leaderboard ranking system
- ✅ Pre-launch to post-launch point transition
- ✅ Smart anti-duplicate messaging
- ✅ Brevo integration for email/SMS

---

## 🏗 Architecture

### Technology Stack

- **Backend**: Next.js API Routes
- **Database**: MongoDB (Prisma ORM)
- **Email/SMS**: Brevo API
- **Cron Jobs**: Vercel Cron
- **Hosting**: Vercel

### File Structure

```
lib/
├── brevo-types.ts          # TypeScript types and constants
├── brevo-client.ts         # Brevo API integration
└── automation-service.ts   # Core automation logic

app/api/
├── signup-complete/
│   └── route.ts            # User signup handler
├── webhook/
│   └── referral-completed/
│       └── route.ts        # Referral processing
└── cron/
    ├── followup-1h/        # 1-hour follow-up check
    ├── activation-48h/     # 48-hour activation check
    ├── inactivity-check/   # 5-day inactivity check
    └── launch-day/         # Launch day broadcast
```

---

## 💾 Database Schema

### User Model (MongoDB/Prisma)

```prisma
model User {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  email        String   @unique
  phone        String?
  firstName    String?
  role         String   @default("client")
  points       Int      @default(0)
  rank         Int      @default(0)
  referralCode String   @unique
  referredBy   String?
  refCount     Int      @default(0)
  lastRefAt    DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  emailSentAt       DateTime?
  emailOpenedAt     DateTime?
  lastMilestoneSent Int?

  referralEventsL1 ReferralEvent[] @relation("ActorL1")
  referralEventsL2 ReferralEvent[] @relation("ActorL2")
}
```

### Field Descriptions

| Field | Type | Purpose |
|-------|------|---------|
| `firstName` | String? | User's first name for personalization |
| `rank` | Int | Current leaderboard position |
| `refCount` | Int | Total successful referrals |
| `lastRefAt` | DateTime? | Last referral timestamp (for inactivity) |
| `emailSentAt` | DateTime? | Welcome email sent timestamp |
| `emailOpenedAt` | DateTime? | Email open tracking |
| `lastMilestoneSent` | Int? | Last milestone email sent (prevents duplicates) |

---

## 💰 Point System

### Pre-Launch Points (Before March 1, 2026 00:00 Brussels)

Points are awarded when a referred person completes waitlist signup, selects their role, and verifies their phone via OTP:

| Role | Points per Successful Referral |
|------|-------------------------------|
| **Client·e** | +5 pts |
| **Influenceur·euse** | +15 pts |
| **Beauty Pro** | +25 pts |

### Post-Launch Points (After March 1, 2026 00:00 Brussels)

After the app launches, point values increase significantly:

| Role | Points per Successful Referral |
|------|-------------------------------|
| **Client·e** | +10 pts (app download confirmed) |
| **Influenceur·euse** | +50 pts (eligible) |
| **Beauty Pro** | +100 pts (validated) |

**Note**: The transition from pre-launch to post-launch points happens automatically at midnight Brussels time on March 1, 2026.

### Milestone Rewards

| Points | Badge | Benefits |
|--------|-------|----------|
| **10** | Glow Starter | Badge + Featured spot + -20% discount |
| **50** | Glow Circle Insider | VIP access Afroé Beta + Beauty e-book1 + -20% discount |
| **100** | Glow Icon | Glow Kit + Beauty e-book2 + -20% discount |
| **200** | Glow Elite | IRL event invite + Press feature + Co-creation + -50% discount |

---

## 🤖 Automation Flows

### 1. Signup Confirmed

**Trigger**: User completes OTP verification

**Endpoint**: `POST /api/signup-complete`

**Actions**:
1. Create user in MongoDB with unique referral code
2. Sync to Brevo with all attributes (ROLE, POINTS, RANK, etc.)
3. Send welcome email (Template #101)
4. Send role-specific welcome SMS
5. Mark `emailSentAt` timestamp

**Email**: Welcome + referral link + point rules by role
**SMS**: Role-specific welcome message with referral link

---

### 2. Follow-up 1 Hour

**Trigger**: Cron job every 30 minutes

**Endpoint**: `GET /api/cron/followup-1h`

**Conditions**:
- User created 1-2 hours ago
- Welcome email was sent (`emailSentAt` not null)

**Actions**:
1. Send follow-up email (Template #102)
2. Check if welcome email was opened via Brevo API
3. **IF email NOT opened** → Send follow-up SMS

**Email**: Reminder to share referral link
**SMS** (conditional): Engagement reminder

**Schedule**: `*/30 * * * *` (Every 30 minutes)

---

### 3. Activation 48 Hours

**Trigger**: Cron job every 6 hours

**Endpoint**: `GET /api/cron/activation-48h`

**Conditions**:
- User created 48-50 hours ago
- `refCount` = 0 (no referrals yet)
- `points` < 10

**Actions**:
1. Send activation email (Template #103)
2. Send activation SMS

**Email**: Encouragement to get first referral
**SMS**: Call-to-action to start sharing

**Schedule**: `0 */6 * * *` (Every 6 hours)

---

### 4. Referral Completed

**Trigger**: Automatic when a referred user completes OTP verification

**Endpoint**: Internal processing in `/api/verify-otp/route.ts`

**Validation**: Points awarded ONLY when:
- Referred user completes waitlist signup
- Referred user selects a role (client, influencer, or beautypro)
- Referred user verifies phone via OTP

**Actions** (within atomic transaction):
1. Create ReferralEvent record (idempotency protection)
2. Calculate points based on referred user's role and pre/post-launch period
3. Atomically increment referrer's:
   - `refCount` (+1)
   - Role-specific counter (`waitlistClients`, `waitlistInfluencers`, or `waitlistPros`)
   - `provisionalPoints` (by calculated points)
   - `points` (by calculated points)
4. Update `lastRefAt` timestamp
5. Sync updated data to Brevo
6. Check if points crossed any milestone (10, 50, 100, 200)
7. **IF milestone crossed** → Send milestone email + SMS

**Transaction Safety**: All updates happen in a single database transaction. If any step fails, no partial credit is awarded.

---

### 5. Milestone Reached

**Trigger**: Automatic when `referral-completed` detects milestone crossing

**Conditions**:
- `oldPoints` < milestone AND `newPoints` >= milestone
- `lastMilestoneSent` != milestone (prevents duplicates)

**Actions**:
1. Send milestone celebration email (Template #104)
2. Send milestone SMS
3. Update `lastMilestoneSent` to prevent re-sending

**Email**: Achievement celebration + rewards list + next milestone preview
**SMS**: "🎉 Bravo ! Tu as atteint le palier X points..."

**Milestones**: 10, 50, 100, 200 points

---

### 6. Inactivity Check (5 Days)

**Trigger**: Cron job daily at 10:00 AM

**Endpoint**: `GET /api/cron/inactivity-check`

**Conditions**:
- `lastRefAt` is 5+ days ago
- `refCount` > 0 (user had at least one referral previously)

**Actions**:
1. Send re-engagement email (Template #105)
2. Send re-engagement SMS

**Email**: "Le classement bouge vite..." + current rank + points
**SMS**: "Partage ton lien pour ne pas te faire dépasser ! 🔥"

**Schedule**: `0 10 * * *` (Daily at 10:00 AM)

---

### 7. Launch Day

**Trigger**: Manual cron trigger on March 1, 2026

**Endpoint**: `GET /api/cron/launch-day`

**Actions**:
1. Send launch email to ALL users (Template #106)
2. Send launch SMS to ALL users with phone numbers
3. Switch to post-launch point values automatically at 00:00 Brussels time
4. Announce app availability

**Email**: Launch announcement + new higher point values + app download links
**SMS**: "🚀 C'est le JOUR J ! Télécharge Afroé maintenant et gagne plus de points !"

**Schedule**: Manual trigger (one-time event on March 1, 2026)

**Note**: Post-launch point values (10/50/100) activate automatically at midnight. The cron is for announcing the launch, not switching point values.

---

## 🔌 API Endpoints

### User Signup

```bash
POST /api/signup-complete
Content-Type: application/json

{
  "email": "user@example.com",
  "phone": "+33612345678",
  "firstName": "Marie",
  "role": "client"
}

Response:
{
  "success": true,
  "userId": "mongodb_id",
  "referralCode": "ABC123XYZ",
  "refLink": "https://afroe.com/waitlist?ref=ABC123XYZ"
}
```

### OTP Verification (Triggers Referral Credit)

```bash
POST /api/verify-otp
Content-Type: application/json

{
  "phone": "+32412345678",
  "code": "123456"
}

Response:
{
  "success": true,
  "message": "Phone verified successfully"
}
```

**Note**: When OTP verification succeeds, referral points are automatically credited in an atomic transaction if the user was referred by someone.

### Cron Jobs

**All cron endpoints require authentication:**

```bash
GET /api/cron/[endpoint]
Authorization: Bearer ${CRON_SECRET}

Response:
{
  "success": true,
  "checked": 42,
  "sent": 40,
  "failed": 2
}
```

**Endpoints:**
- `/api/cron/followup-1h` - Every 30 minutes
- `/api/cron/activation-48h` - Every 6 hours
- `/api/cron/inactivity-check` - Daily at 10:00 AM
- `/api/cron/launch-day` - Manual trigger

---

## ⚙️ Environment Configuration

### Required Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/afroe"

# Brevo API
BREVO_API_KEY="xkeysib-xxxxxxxxxxxxx"

# Cron Job Security
CRON_SECRET="your_random_secret_string_here"

# Application URLs
NEXT_PUBLIC_APP_URL="https://afroe.com"

# Optional: Google Sheets Integration
GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/..."
GOOGLE_SHEETS_API_KEY="your_key"
GOOGLE_SHEETS_ID="your_sheet_id"
```

### Vercel Environment Variables

In your Vercel project settings, add:

1. **DATABASE_URL** - MongoDB connection string
2. **BREVO_API_KEY** - From Brevo dashboard
3. **CRON_SECRET** - Generate with: `openssl rand -hex 32`
4. **NEXT_PUBLIC_APP_URL** - Your production URL

---

## 🚀 Deployment Guide

### Step 1: Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Ensure MongoDB is accessible
# No migrations needed - Prisma will auto-create collections
```

### Step 2: Brevo Configuration

1. Create account at https://brevo.com
2. Get API key from: Account > SMTP & API > API Keys
3. Create 6 email templates (IDs: 101-106)
4. Configure contact attributes (see BREVO_TEMPLATES.md)

### Step 3: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add BREVO_API_KEY
vercel env add CRON_SECRET
vercel env add NEXT_PUBLIC_APP_URL
```

### Step 4: Verify Cron Jobs

1. Check Vercel dashboard: Project > Cron Jobs
2. Verify all 3 cron jobs are scheduled:
   - `followup-1h`: Every 30 minutes
   - `activation-48h`: Every 6 hours
   - `inactivity-check`: Daily at 10:00 AM

### Step 5: Test End-to-End

```bash
# Test OTP send
curl -X POST https://afroe.com/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+32412345678"
  }'

# Test OTP verification (triggers referral credit automatically)
curl -X POST https://afroe.com/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+32412345678",
    "code": "123456"
  }'

# Test cron (from Vercel only)
curl https://afroe.com/api/cron/inactivity-check \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

**Note**: Referral points are credited automatically inside the `/api/verify-otp` endpoint when a user verifies their phone. No separate webhook call is needed.

---

## 🧪 Testing

### Local Development Testing

```bash
# Start development server
npm run dev

# Test signup flow
curl -X POST http://localhost:3000/api/signup-complete \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","role":"client","firstName":"Test"}'

# Check MongoDB for new user
# Check Brevo for contact sync
# Check email inbox for welcome email
```

### Test Scenarios

1. **Signup Flow with OTP**
   - Submit waitlist form with email, phone, and role (client, pro, influencer)
   - Verify OTP SMS sent to phone number
   - Submit OTP verification
   - Verify welcome email sent with correct points for role
   - Verify referral link is included

2. **Referral Flow**
   - User A signs up and gets referral code
   - User B signs up using User A's referral code
   - User B completes role selection and OTP verification
   - Verify User A's points incremented correctly (5/15/25 based on role)
   - Verify User A's `refCount` incremented
   - Verify transaction is atomic (no partial credit on failure)

3. **Milestone Flow**
   - Create referrals to cross milestone (10, 50, 100, or 200 points)
   - Verify milestone email sent automatically
   - Verify no duplicate milestone emails
   - Verify `lastMilestoneSent` updated correctly

4. **Inactivity Flow**
   - Create user with `lastRefAt` 6 days ago
   - Run inactivity cron
   - Verify re-engagement email sent

---

## 📊 Monitoring

### Key Metrics to Track

**Email Performance:**
- Open rates (target: >40%)
- Click-through rates (target: >15%)
- Unsubscribe rates (target: <1%)

**SMS Performance:**
- Delivery rates (target: >95%)
- Response/engagement rates

**User Engagement:**
- Referral conversion rate
- Average referrals per user
- Time to first referral
- Inactive user reactivation rate

**Milestone Distribution:**
- % of users at each milestone
- Average time to reach each milestone
- Drop-off points in the funnel

### Monitoring Tools

**Brevo Dashboard:**
- Email statistics
- SMS delivery reports
- Contact list growth

**MongoDB Atlas:**
- Database performance
- Query optimization
- User data analytics

**Vercel Dashboard:**
- API response times
- Cron job execution logs
- Error tracking

---

## 🔧 Troubleshooting

### Common Issues

**Issue**: Emails not sending
- Check `BREVO_API_KEY` is set correctly
- Verify template IDs match (101-106)
- Check Brevo account status and credits

**Issue**: Cron jobs not running
- Verify `CRON_SECRET` is set
- Check Vercel Cron Jobs dashboard
- Ensure routes have `export const dynamic = "force-dynamic"`

**Issue**: Points not updating
- Check MongoDB connection
- Verify `referrerId` is valid ObjectId
- Check `updateUserPoints` function logs

**Issue**: Duplicate milestone emails
- Check `lastMilestoneSent` field is updating
- Verify milestone detection logic
- Review cron job frequency

---

## 📞 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review Brevo API logs
3. Check Vercel deployment logs
4. Review MongoDB query logs

---

## ✅ Launch Checklist

### Pre-Campaign (Before January 15, 2026)
- [ ] MongoDB database is set up and accessible
- [ ] Brevo account configured with API key
- [ ] All 6 email templates created in Brevo (IDs: 101-106)
- [ ] Contact attributes configured in Brevo
- [ ] Environment variables set in Vercel
- [ ] Generate secure `CRON_SECRET`
- [ ] Run `npx prisma generate`
- [ ] Deploy to Vercel
- [ ] Test signup flow end-to-end with OTP verification
- [ ] Verify cron jobs are scheduled
- [ ] Test all 3 user roles (client, pro, influencer)
- [ ] Verify referral points awarded correctly after OTP verification
- [ ] Verify milestone emails work correctly
- [ ] Monitor Brevo dashboard for delivery rates
- [ ] Set up alerts for failed cron jobs

### Launch Day (March 1, 2026)
- [ ] Trigger launch day cron job manually at 00:00 Brussels time
- [ ] Verify post-launch point values (10/50/100) are active
- [ ] Monitor email/SMS delivery for launch announcements
- [ ] Track app download conversions
- [ ] Monitor leaderboard for sudden point changes

---

**The system is production-ready! 🚀**

For template details, see `BREVO_TEMPLATES.md`
