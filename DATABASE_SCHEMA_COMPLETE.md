# Complete Database Schema - Afroé Waitlist + Referral Contest

**Generated:** 2026-01-13
**Database:** PostgreSQL (via Supabase)
**ORM:** Prisma Client

---

## A) PROPOSED RELATIONAL SCHEMA

### TABLE 1: `User`
**Purpose:** Main user/participant table for waitlist with referral tracking and dual-phase points system

| Column Name | Type | Nullable | Default | Constraints | Description |
|-------------|------|----------|---------|-------------|-------------|
| `id` | TEXT | NO | cuid() | PRIMARY KEY | Unique user identifier |
| `email` | TEXT | NO | - | UNIQUE | User email address |
| `phone` | TEXT | YES | NULL | - | Belgian phone number (+32...) |
| `firstName` | TEXT | YES | NULL | - | User first name |
| `lastName` | TEXT | YES | NULL | - | User last name |
| `role` | TEXT | NO | 'client' | - | User role: 'client', 'influencer', 'beautypro' |
| `referralCode` | TEXT | NO | generated | UNIQUE | User's unique 8-char referral code (format: ALPHABET) |
| `referredBy` | TEXT | YES | NULL | - | Referral code of the user who referred them |
| `refCount` | INTEGER | NO | 0 | - | Total count of successful referrals |
| `phoneVerified` | BOOLEAN | NO | false | - | Phone verification status |
| `referralValidated` | BOOLEAN | NO | false | - | Post-launch referral validation status |
| `fraudScore` | INTEGER | NO | 0 | - | Calculated fraud risk score (0-200+) |
| `skillAnswerCorrect` | BOOLEAN | NO | false | - | Belgian skill question answered correctly |
| `waitlistClients` | INTEGER | NO | 0 | - | Count of referred clients in waitlist phase |
| `waitlistInfluencers` | INTEGER | NO | 0 | - | Count of referred influencers in waitlist phase |
| `waitlistPros` | INTEGER | NO | 0 | - | Count of referred beauty pros in waitlist phase |
| `appDownloads` | INTEGER | NO | 0 | - | Count of referred app downloads (post-launch) |
| `validatedInfluencers` | INTEGER | NO | 0 | - | Count of validated influencers (post-launch) |
| `validatedPros` | INTEGER | NO | 0 | - | Count of validated pros (post-launch) |
| `earlyBird` | BOOLEAN | NO | false | - | True if user in first 100 signups |
| `earlyBirdBonus` | INTEGER | NO | 0 | - | Early bird bonus points (50 if earlyBird=true) |
| `points` | INTEGER | NO | 0 | - | **LEGACY**: Old points field (use provisionalPoints instead) |
| `provisionalPoints` | INTEGER | NO | 0 | - | Pre-launch phase points (waitlist referrals) |
| `finalPoints` | INTEGER | NO | 0 | - | Post-launch phase points (app conversions) |
| `rank` | INTEGER | NO | 0 | - | User's leaderboard rank (1 = highest) |
| `nextMilestone` | INTEGER | NO | 10 | - | Next milestone points target (10/50/100/200) |
| `lastRefAt` | TIMESTAMPTZ | YES | NULL | - | **ALIAS**: lastReferralAt - timestamp of last referral |
| `eligibleForJackpot` | BOOLEAN | NO | false | - | True if finalPoints >= 100 (€3,500 prize eligibility) |
| `isTopRank` | BOOLEAN | NO | false | - | True if rank == 1 (iPhone 17 Pro eligibility) |
| `createdAt` | TIMESTAMPTZ | NO | NOW() | - | Account creation timestamp |
| `updatedAt` | TIMESTAMPTZ | NO | NOW() | - | Last update timestamp (auto-updated by trigger) |
| `emailSentAt` | TIMESTAMPTZ | YES | NULL | - | Welcome email sent timestamp |
| `emailOpenedAt` | TIMESTAMPTZ | YES | NULL | - | Email opened/clicked timestamp |
| `lastMilestoneSent` | INTEGER | YES | NULL | - | Last milestone email sent (10/50/100/200) |

**Indexes:**
- `User_email_idx` ON `(email)` - User lookup by email
- `User_referralCode_idx` ON `(referralCode)` - Referral code validation
- `User_provisionalPoints_idx` ON `(provisionalPoints)` - Leaderboard sorting
- `User_leaderboard_idx` ON `(provisionalPoints DESC, refCount DESC, createdAt ASC) WHERE phoneVerified = true` - Optimized composite index for leaderboard queries

**Row Level Security:**
- RLS ENABLED
- Policy: "Service role has full access to User" - Full CRUD for service_role
- Policy: "Public can view leaderboard rankings" - Public SELECT (API filters sensitive fields)

**Triggers:**
- `update_timestamp_trigger` BEFORE UPDATE - Auto-updates `updatedAt` field

**Field Name Aliases:**
- Prisma schema uses `lastRefAt` but migration creates `lastReferralAt` (needs reconciliation)

---

### TABLE 2: `ReferralEvent`
**Purpose:** Audit trail for all referral events with points awarded

| Column Name | Type | Nullable | Default | Constraints | Description |
|-------------|------|----------|---------|-------------|-------------|
| `id` | TEXT | NO | cuid() | PRIMARY KEY | Unique event identifier |
| `type` | TEXT | NO | - | - | Event type (e.g., 'waitlist_signup') |
| `actorL1Id` | TEXT | NO | - | FK → User(id) ON DELETE CASCADE | Referrer user ID (L1 actor) |
| `actorL2Id` | TEXT | YES | NULL | FK → User(id) ON DELETE SET NULL | Referred user ID (L2 actor) |
| `roleAtSignup` | TEXT | YES | NULL | - | Role of referred user at signup |
| `pointsAwarded` | INTEGER | NO | 0 | - | Points awarded for this event (audit) |
| `createdAt` | TIMESTAMPTZ | NO | NOW() | - | Event timestamp |

**Indexes:**
- `ReferralEvent_actorL1Id_idx` ON `(actorL1Id)` - Referrer event lookup
- `ReferralEvent_actorL2Id_idx` ON `(actorL2Id)` - Referred user event lookup

**Row Level Security:**
- RLS ENABLED
- Policy: "Service role has full access to ReferralEvent" - Service role only access (no public access)

**Triggers:**
- `update_timestamp_trigger` BEFORE UPDATE (if applicable)

---

### TABLE 3: `signup_metadata`
**Purpose:** Fraud detection and anti-abuse tracking for signups

| Column Name | Type | Nullable | Default | Constraints | Description |
|-------------|------|----------|---------|-------------|-------------|
| `id` | UUID | NO | gen_random_uuid() | PRIMARY KEY | Unique metadata record ID |
| `user_id` | TEXT | YES | NULL | FK → User(id) ON DELETE CASCADE | Associated user ID |
| `ip_address` | TEXT | NO | - | - | Signup IP address |
| `user_agent` | TEXT | YES | NULL | - | Browser user agent string |
| `device_fingerprint` | TEXT | YES | NULL | - | Device fingerprint hash |
| `form_load_time` | TIMESTAMPTZ | YES | NULL | - | When form was loaded (for bot detection) |
| `form_submit_time` | TIMESTAMPTZ | NO | NOW() | - | When form was submitted |
| `time_to_submit_seconds` | INTEGER | YES | NULL | - | Duration from load to submit |
| `fraud_flags` | JSONB | NO | '[]' | - | Array of fraud indicators |
| `is_blocked` | BOOLEAN | NO | false | - | Whether signup was blocked |
| `created_at` | TIMESTAMPTZ | NO | NOW() | - | Record creation timestamp |

**Indexes:**
- `idx_signup_metadata_user_id_fk` ON `(user_id)` - Foreign key index
- (Note: Other indexes removed in recent migration to reduce overhead)

**Fraud Flags Enum Values:**
- `"temp_email"` - Disposable email domain detected
- `"fast_submit"` - Form submitted in < 3 seconds
- `"repeated_ip"` - Multiple signups from same IP
- `"repeated_user_agent"` - Multiple signups with same user agent
- `"repeated_device"` - Multiple signups with same device fingerprint

**Row Level Security:**
- RLS ENABLED
- Policy: "Service role can manage signup metadata" - Service role only access (sensitive data)

---

### TABLE 4: `referral_tracking`
**Purpose:** Fraud detection and anti-abuse tracking for referrals

| Column Name | Type | Nullable | Default | Constraints | Description |
|-------------|------|----------|---------|-------------|-------------|
| `id` | UUID | NO | gen_random_uuid() | PRIMARY KEY | Unique tracking record ID |
| `user_id` | TEXT | NO | - | FK → User(id) ON DELETE CASCADE | User who clicked referral link |
| `referrer_code` | TEXT | NO | - | - | Referral code used |
| `referrer_user_id` | TEXT | YES | NULL | FK → User(id) ON DELETE SET NULL | Referrer's user ID |
| `ip_address` | TEXT | NO | - | - | Referral click IP address |
| `user_agent` | TEXT | YES | NULL | - | Browser user agent string |
| `device_fingerprint` | TEXT | YES | NULL | - | Device fingerprint hash |
| `points_granted` | BOOLEAN | NO | false | - | Whether points were granted to referrer |
| `points_granted_at` | TIMESTAMPTZ | YES | NULL | - | When points were granted |
| `fraud_flags` | JSONB | NO | '[]' | - | Array of fraud indicators |
| `is_blocked` | BOOLEAN | NO | false | - | Whether referral was blocked |
| `created_at` | TIMESTAMPTZ | NO | NOW() | - | Record creation timestamp |

**Indexes:**
- `idx_referral_tracking_user_id_fk` ON `(user_id)` - Foreign key index
- `idx_referral_tracking_referrer_user_id` ON `(referrer_user_id)` - Referrer lookup

**Fraud Flags Enum Values:**
- `"same_ip_as_referrer"` - Same IP as referrer (blocks points)
- `"same_device_as_referrer"` - Same device as referrer (blocks points)
- `"multiple_referrals_per_hour"` - Multiple referrals in short time
- `"self_referral"` - User referred themselves

**Row Level Security:**
- RLS ENABLED
- Policy: "Service role can manage referral tracking" - Service role only access (sensitive data)

---

### TABLE 5: `ip_activity`
**Purpose:** Rate limiting and activity tracking by IP address

| Column Name | Type | Nullable | Default | Constraints | Description |
|-------------|------|----------|---------|-------------|-------------|
| `id` | UUID | NO | gen_random_uuid() | PRIMARY KEY | Unique activity record ID |
| `ip_address` | TEXT | NO | - | - | IP address performing action |
| `action_type` | TEXT | NO | - | - | Action: 'signup', 'referral', 'sms_verify' |
| `user_id` | TEXT | YES | NULL | FK → User(id) ON DELETE SET NULL | Associated user ID (if known) |
| `metadata` | JSONB | NO | '{}' | - | Additional action context |
| `created_at` | TIMESTAMPTZ | NO | NOW() | - | Activity timestamp |

**Indexes:**
- `idx_ip_activity_user_id` ON `(user_id)` - User activity lookup

**Action Type Enum Values:**
- `"signup"` - Signup attempt
- `"referral"` - Referral click/track
- `"sms_verify"` - SMS verification attempt

**Row Level Security:**
- RLS ENABLED
- Policy: "Service role can manage ip activity" - Service role only access

---

### TABLE 6: `users_import` (Optional/Admin)
**Purpose:** Temporary table for bulk user imports (referenced in migrations)

| Column Name | Type | Nullable | Default | Constraints | Description |
|-------------|------|----------|---------|-------------|-------------|
| `id` | SERIAL | NO | auto | PRIMARY KEY | Auto-incrementing ID |
| *(columns vary)* | - | - | - | - | Import-specific fields |

**Row Level Security:**
- RLS ENABLED
- Policy: "Service role can manage imports" - Service role only access

---

## B) RELATIONSHIPS & CARDINALITIES

### Foreign Key Relationships

```
User (1) ──< (N) ReferralEvent [actorL1Id]
  ↓ Cardinality: One user can have many referral events as referrer
  ↓ ON DELETE: CASCADE (delete events when user deleted)

User (1) ──< (0..N) ReferralEvent [actorL2Id]
  ↓ Cardinality: One user can be referred in many events (multi-level)
  ↓ ON DELETE: SET NULL (preserve event, nullify referred user)

User (1) ──< (0..N) signup_metadata [user_id]
  ↓ Cardinality: One user can have multiple signup attempts
  ↓ ON DELETE: CASCADE (delete metadata when user deleted)

User (1) ──< (N) referral_tracking [user_id]
  ↓ Cardinality: One user can click many referral links
  ↓ ON DELETE: CASCADE (delete tracking when user deleted)

User (1) ──< (0..N) referral_tracking [referrer_user_id]
  ↓ Cardinality: One referrer can have many referral clicks
  ↓ ON DELETE: SET NULL (preserve tracking record)

User (1) ──< (0..N) ip_activity [user_id]
  ↓ Cardinality: One user can have many activities
  ↓ ON DELETE: SET NULL (preserve activity log)
```

### Logical Relationships (No FK, managed by application)

```
User.referredBy (TEXT) → User.referralCode (TEXT)
  ↓ Lookup: Find referrer by matching referralCode
  ↓ No FK constraint (for flexibility and to avoid circular dependencies)
```

---

## C) UNIQUE CONSTRAINTS

### Table: `User`
- **UNIQUE** `email` - One account per email address
- **UNIQUE** `referralCode` - Each user has unique shareable referral code

### Table: `ReferralEvent`
- None (multiple events can exist for same actors)

### Table: `signup_metadata`
- None (user can have multiple signup attempts)

### Table: `referral_tracking`
- None (user can click same referral code multiple times)

### Table: `ip_activity`
- None (same IP can perform multiple actions)

---

## D) REQUIRED FIELDS (NOT NULL)

### Table: `User`
**Required (NOT NULL):**
- `id` - Primary key
- `email` - Required for communication
- `role` - Default 'client'
- `referralCode` - Generated on signup
- `refCount` - Default 0
- `phoneVerified` - Default false
- `referralValidated` - Default false
- `fraudScore` - Default 0
- `skillAnswerCorrect` - Default false
- All counter fields (waitlist*, app*, validated*) - Default 0
- `earlyBird` - Default false
- `earlyBirdBonus` - Default 0
- `points` - Default 0
- `provisionalPoints` - Default 0
- `finalPoints` - Default 0
- `rank` - Default 0
- `nextMilestone` - Default 10
- `eligibleForJackpot` - Default false
- `isTopRank` - Default false
- `createdAt` - Auto NOW()
- `updatedAt` - Auto NOW()

**Optional (NULLABLE):**
- `phone`, `firstName`, `lastName`, `referredBy`, `lastRefAt`, `emailSentAt`, `emailOpenedAt`, `lastMilestoneSent`

### Table: `ReferralEvent`
**Required:**
- `id`, `type`, `actorL1Id`, `pointsAwarded` (default 0), `createdAt`

**Optional:**
- `actorL2Id`, `roleAtSignup`

### Table: `signup_metadata`
**Required:**
- `id`, `ip_address`, `form_submit_time`, `fraud_flags`, `is_blocked`, `created_at`

**Optional:**
- `user_id`, `user_agent`, `device_fingerprint`, `form_load_time`, `time_to_submit_seconds`

### Table: `referral_tracking`
**Required:**
- `id`, `user_id`, `referrer_code`, `ip_address`, `points_granted`, `fraud_flags`, `is_blocked`, `created_at`

**Optional:**
- `referrer_user_id`, `user_agent`, `device_fingerprint`, `points_granted_at`

### Table: `ip_activity`
**Required:**
- `id`, `ip_address`, `action_type`, `metadata`, `created_at`

**Optional:**
- `user_id`

---

## E) ENUMS & CONSTANTS

### Role Enum (TEXT, application-enforced)
**Possible Values:**
- `"client"` - Regular user/customer (default)
- `"influencer"` - Social media influencer (≥2k followers)
- `"beautypro"` or `"pro"` - Beauty professional (stylist, barber, etc.)

**Aliases in Code:**
- `"beautypro"` → normalized to `"beauty_pro"` in some contexts

---

### ReferralEvent Type (TEXT, application-enforced)
**Possible Values:**
- `"waitlist_signup"` - Referral during waitlist phase
- *(other types may be added post-launch)*

---

### Action Type Enum (TEXT, application-enforced)
**Used in:** `ip_activity.action_type`
**Possible Values:**
- `"signup"` - User signup attempt
- `"referral"` - Referral tracking event
- `"sms_verify"` - SMS verification attempt

---

### Fraud Flags (JSONB array, application-enforced)
**Used in:** `signup_metadata.fraud_flags`, `referral_tracking.fraud_flags`

**Signup Fraud Flags:**
- `"temp_email"` - Temporary/disposable email domain
- `"fast_submit"` - Form submitted in < 3 seconds
- `"repeated_ip"` - ≥3 signups from same IP in 1 hour
- `"repeated_user_agent"` - ≥3 signups with same UA in 1 hour
- `"repeated_device"` - ≥2 signups with same device fingerprint in 1 hour

**Referral Fraud Flags:**
- `"same_ip_as_referrer"` - Referral from same IP as referrer (blocks points)
- `"same_device_as_referrer"` - Referral from same device as referrer (blocks points)
- `"multiple_referrals_per_hour"` - Multiple referrals in short time
- `"self_referral"` - User referred themselves (blocks points)

---

### Milestone Points (INTEGER, application constant)
**Used in:** `User.nextMilestone`, email notifications, rewards system

**Values:**
- `10` - Glow Starters tier
- `50` - Glow Circle Insiders tier
- `100` - Glow Icons tier (Jackpot eligibility)
- `200` - Glow Elites tier

---

### Points Calculation Constants

**Pre-Launch (Waitlist Phase):**
- Client referral: **+2 points** → `waitlistClients`
- Influencer referral: **+15 points** → `waitlistInfluencers`
- Beauty Pro referral: **+25 points** → `waitlistPros`
- Early Bird bonus: **+50 points** (first 100 signups) → `earlyBirdBonus`

**Post-Launch (App Conversion Phase):**
- App download (client): **+10 points** → `appDownloads`
- Validated influencer: **+50 points** → `validatedInfluencers`
- Validated beauty pro: **+100 points** → `validatedPros`

**Prize Thresholds:**
- Jackpot eligibility: `finalPoints >= 100` → `eligibleForJackpot = true`
- iPhone 17 Pro: `rank == 1` → `isTopRank = true`

---

## F) VIEWS & FUNCTIONS

### VIEW: `public_leaderboard`
**Purpose:** Secure public view of leaderboard without exposing PII

**Definition:**
```sql
CREATE VIEW public_leaderboard
WITH (security_invoker = true)
AS
SELECT
  "firstName",
  role,
  "refCount",
  "provisionalPoints" as points,
  "earlyBird",
  "createdAt",
  ROW_NUMBER() OVER (
    ORDER BY "provisionalPoints" DESC, "refCount" DESC, "createdAt" ASC
  ) as rank
FROM "User"
WHERE "phoneVerified" = true
ORDER BY "provisionalPoints" DESC, "refCount" DESC, "createdAt" ASC
LIMIT 100;
```

**Access:**
- GRANT SELECT TO anon, authenticated

**Fields Exposed:**
- `firstName` - User first name (can be NULL → shown as "Anonyme")
- `role` - User role
- `refCount` - Number of referrals
- `points` - Alias for provisionalPoints
- `earlyBird` - Early bird badge
- `createdAt` - Signup timestamp
- `rank` - Calculated rank (ROW_NUMBER)

**Fields Hidden (PII):**
- `email`, `phone`, `referralCode` - Not exposed in view

---

### FUNCTION: `get_user_public_profile(user_referral_code TEXT)`
**Purpose:** Get public profile data by referral code for social sharing

**Returns:**
```sql
TABLE (
  firstName TEXT,
  rank INTEGER,
  finalPoints INTEGER,
  refCount INTEGER
)
```

**Security:** SECURITY DEFINER with service_role access

**Usage:** Social sharing, referral success display

---

### FUNCTION: `update_timestamp()`
**Purpose:** Trigger function to auto-update `updatedAt` field

**Definition:**
```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$;
```

**Attached Triggers:**
- `User` table: BEFORE UPDATE
- `ReferralEvent` table: BEFORE UPDATE

---

## G) REFERENCED-ONLY FIELDS (INCONSISTENCIES)

### Field Name Mismatch: `lastRefAt` vs `lastReferralAt`

**Prisma Schema (schema.prisma:44):**
```prisma
lastRefAt DateTime?
```

**Migration SQL (20251128203420_complete_user_schema.sql:163):**
```sql
ALTER TABLE "User" ADD COLUMN "lastReferralAt" TIMESTAMPTZ;
```

**Status:** ⚠️ **INCONSISTENCY DETECTED**
- Prisma expects: `lastRefAt`
- Database has: `lastReferralAt`
- **Resolution needed:** Either rename DB column or update Prisma schema

**Used in:**
- `lib/referrals.ts` - Updates timestamp on referral
- `app/api/cron/inactivity-check/route.ts` - Checks for inactivity (≥5 days)

---

## H) DATA RETENTION & CLEANUP

**No automatic cleanup configured**

Potential cleanup tasks:
1. `ip_activity` - Consider TTL/purge for records > 30 days
2. `signup_metadata` - Consider TTL/purge for records > 90 days
3. `referral_tracking` - Keep indefinitely for audit trail

---

## I) MINIMUM VIABLE SCHEMA FOR TOMORROW EVENING

**Goal:** Run signup + referral + leaderboard + notifications with minimum fields

### ESSENTIAL TABLE: `User` (Minimum Viable)

| Column | Type | Default | Required | Purpose |
|--------|------|---------|----------|---------|
| `id` | TEXT | cuid() | ✓ | Unique identifier |
| `email` | TEXT | - | ✓ | User identity + comms |
| `phone` | TEXT | NULL | - | SMS verification |
| `firstName` | TEXT | NULL | - | Personalization |
| `role` | TEXT | 'client' | ✓ | Points calculation |
| `referralCode` | TEXT | generated | ✓ | Sharing link |
| `referredBy` | TEXT | NULL | - | Referrer tracking |
| `refCount` | INTEGER | 0 | ✓ | Referral counter |
| `phoneVerified` | BOOLEAN | false | ✓ | Leaderboard eligibility |
| `provisionalPoints` | INTEGER | 0 | ✓ | Leaderboard score |
| `rank` | INTEGER | 0 | ✓ | Leaderboard position |
| `earlyBird` | BOOLEAN | false | ✓ | Early bird badge |
| `earlyBirdBonus` | INTEGER | 0 | ✓ | Bonus points |
| `createdAt` | TIMESTAMPTZ | NOW() | ✓ | Tie-breaking |
| `updatedAt` | TIMESTAMPTZ | NOW() | ✓ | Change tracking |

**Minimum Indexes:**
```sql
CREATE UNIQUE INDEX ON "User"(email);
CREATE UNIQUE INDEX ON "User"(referralCode);
CREATE INDEX ON "User"(provisionalPoints DESC, createdAt ASC) WHERE phoneVerified = true;
```

**Minimum RLS:**
```sql
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON "User" FOR ALL TO service_role USING (true);
```

---

### ESSENTIAL TABLE: `ReferralEvent` (Minimum Viable)

| Column | Type | Default | Required | Purpose |
|--------|------|---------|----------|---------|
| `id` | TEXT | cuid() | ✓ | Event ID |
| `type` | TEXT | - | ✓ | Event type |
| `actorL1Id` | TEXT | - | ✓ | Referrer ID |
| `actorL2Id` | TEXT | NULL | - | Referred user ID |
| `pointsAwarded` | INTEGER | 0 | ✓ | Audit trail |
| `createdAt` | TIMESTAMPTZ | NOW() | ✓ | Event timestamp |

**Minimum Indexes:**
```sql
CREATE INDEX ON "ReferralEvent"(actorL1Id);
```

**Minimum RLS:**
```sql
ALTER TABLE "ReferralEvent" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON "ReferralEvent" FOR ALL TO service_role USING (true);
```

---

### OPTIONAL (Can Launch Without): Fraud Detection Tables

Tables `signup_metadata`, `referral_tracking`, `ip_activity` can be **added later** if initial launch is simple.

**Alternative:** Use in-memory rate limiting (Redis/Upstash) for first week.

---

### MINIMUM VIABLE MIGRATION SQL

```sql
-- Minimum schema for launch

CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  "firstName" TEXT,
  role TEXT NOT NULL DEFAULT 'client',
  "referralCode" TEXT UNIQUE NOT NULL,
  "referredBy" TEXT,
  "refCount" INTEGER NOT NULL DEFAULT 0,
  "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
  "provisionalPoints" INTEGER NOT NULL DEFAULT 0,
  rank INTEGER NOT NULL DEFAULT 0,
  "earlyBird" BOOLEAN NOT NULL DEFAULT false,
  "earlyBirdBonus" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ReferralEvent" (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  "actorL1Id" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "actorL2Id" TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX ON "User"("referralCode");
CREATE INDEX ON "User"("provisionalPoints" DESC, "createdAt" ASC) WHERE "phoneVerified" = true;
CREATE INDEX ON "ReferralEvent"("actorL1Id");

-- RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReferralEvent" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_full" ON "User" FOR ALL TO service_role USING (true);
CREATE POLICY "service_full" ON "ReferralEvent" FOR ALL TO service_role USING (true);
```

**Total Fields:** 15 (User) + 6 (ReferralEvent) = **21 fields minimum**

---

## J) SUMMARY STATISTICS

| Metric | Count |
|--------|-------|
| **Total Tables** | 5 core + 1 optional |
| **Total Columns** | 75+ across all tables |
| **Foreign Keys** | 7 relationships |
| **Unique Constraints** | 2 (email, referralCode) |
| **Indexes** | 10+ performance indexes |
| **Views** | 1 (public_leaderboard) |
| **Functions** | 2 (get_user_public_profile, update_timestamp) |
| **RLS Policies** | 7 policies across 5 tables |
| **Enums (app-level)** | 3 (Role, ActionType, FraudFlags) |

---

## K) SCHEMA HEALTH WARNINGS

1. ⚠️ **FIELD NAME MISMATCH**: `lastRefAt` (Prisma) vs `lastReferralAt` (DB)
2. ⚠️ **INCONSISTENT FK TARGET**: Some migrations reference `auth.users`, others reference `User` table
3. ✓ **RLS SECURE**: All tables have proper RLS with service role access
4. ✓ **INDEXES COMPLETE**: All foreign keys have covering indexes
5. ✓ **NO CASCADE DELETES ON USER DATA**: Referral events cascade appropriately

---

**End of Schema Documentation**
