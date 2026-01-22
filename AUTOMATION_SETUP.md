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

A referral is considered **valid only when the referred person completes a waitlist signup and selects a role** (Client·e, Influenceur·euse, or Beauty Pro).

No points are granted for:
- link clicks
- partial submissions
- unverified phone numbers
  
The Afroé automation system manages the complete user journey from signup to launch, including:

- **Phase 1**: Instant activation (welcome, follow-up, 48h activation)
- **Phase 2**: Growth milestones (10, 50, 100, 200 points)
- **Phase 3**: Anti-churn (5-day inactivity reminders)
- **Phase 4**: Launch day (email + SMS with 2x bonus)

### Key Features

- ✅ Role-based point system (client, pro, influencer)
- ✅ Automated email & SMS sequences
- ✅ Milestone tracking and rewards
- ✅ Leaderboard ranking system
- ✅ Launch day 2x points multiplier
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

### Pre-Launch Points (Before January 15, 2026)

| Role | Points per Referral |
|------|---------------------|
| Client.e — +5 pts (inscription waitlist)

Influenceur.euse — +15 pts (inscription)

Pro — +25 pts (inscription)

### Post-Launch Points (After January 15, 2026)

| Role | Points per Referral |
|------|---------------------|
| Client.e — +10 pts (téléchargement app)

Influenceur.euse — +50 pts (éligible)

Pro — +100 pts (validé)

### Launch Day Bonus

**All points earned on January 15, 2026 are DOUBLED (x2)**

Example: A Pro referring another Pro on launch day earns **200 points** (100 x 2)

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

**Trigger**: API call when new user signs up with referral code

**Endpoint**: `POST /api/webhook/referral-completed`

**Request Body**:
```json
{
  "referrerId": "user_mongodb_id",
  "referralCode": "ABC123XYZ",
  "isLaunchDay": false
}
```

**Actions**:
1. Calculate points based on role and launch status
2. Update referrer's points, refCount, lastRefAt
3. Recalculate ALL user ranks (sort by points desc)
4. Sync updated data to Brevo
5. Check if points crossed any milestone (10, 50, 100, 200)
6. **IF milestone crossed** → Send milestone email + SMS

**Response**:
```json
{
  "success": true,
  "pointsAdded": 2,
  "newTotal": 12,
  "rank": 45
}
```

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

**Trigger**: Manual cron trigger on January 15, 2026

**Endpoint**: `GET /api/cron/launch-day`

**Actions**:
1. Send launch email to ALL users (Template #106)
2. Send launch SMS to ALL users with phone numbers
3. Enable 2x point multiplier for the day
4. Switch to post-launch point values

**Email**: Launch announcement + 2x bonus notification + new point values
**SMS**: "🚀 C'est le JOUR J ! Tous les points sont DOUBLÉS !"

**Schedule**: Manual trigger (one-time event)

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

### Referral Completion

```bash
POST /api/webhook/referral-completed
Content-Type: application/json

{
  "referrerId": "mongodb_user_id",
  "referralCode": "ABC123XYZ",
  "isLaunchDay": false
}

Response:
{
  "success": true,
  "pointsAdded": 2,
  "newTotal": 12,
  "rank": 45
}
```

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
# Test signup
curl -X POST https://afroe.com/api/signup-complete \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+33612345678",
    "firstName": "Test",
    "role": "client"
  }'

# Test referral
curl -X POST https://afroe.com/api/webhook/referral-completed \
  -H "Content-Type: application/json" \
  -d '{
    "referrerId": "USER_ID_FROM_MONGODB",
    "isLaunchDay": false
  }'

# Test cron (from Vercel only)
curl https://afroe.com/api/cron/inactivity-check \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

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

1. **Signup Flow**
   - Create user with all 3 roles (client, pro, influencer)
   - Verify email template shows correct points for each role
   - Verify SMS message is role-specific

2. **Referral Flow**
   - Create 2 users
   - Call referral-completed endpoint
   - Verify points added correctly
   - Verify rank updated

3. **Milestone Flow**
   - Add points to user to cross milestone
   - Verify milestone email sent
   - Verify no duplicate milestone emails

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

- [ ] MongoDB database is set up and accessible
- [ ] Brevo account configured with API key
- [ ] All 6 email templates created in Brevo (IDs: 101-106)
- [ ] Contact attributes configured in Brevo
- [ ] Environment variables set in Vercel
- [ ] Generate secure `CRON_SECRET`
- [ ] Run `npx prisma generate`
- [ ] Deploy to Vercel
- [ ] Test signup flow end-to-end
- [ ] Verify cron jobs are scheduled
- [ ] Test all 3 user roles (client, pro, influencer)
- [ ] Verify milestone emails work correctly
- [ ] Monitor Brevo dashboard for delivery rates
- [ ] Set up alerts for failed cron jobs
- [ ] Document launch day procedure for 2x bonus activation

---

**The system is production-ready! 🚀**

For template details, see `BREVO_TEMPLATES.md`
