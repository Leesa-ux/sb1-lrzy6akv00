/*
  # Complete User Schema Migration

  1. Updates to User Table
    - Add missing columns for complete referral system
    - Add lastName field
    - Add all waitlist counters
    - Add post-launch conversion counters
    - Add early-bird tracking fields
    - Add dual-phase points system (provisionalPoints, finalPoints)
    - Add prize eligibility flags
    - Add email tracking fields

  2. Updates to ReferralEvent Table
    - Add roleAtSignup field to track referred user's role
    - Add pointsAwarded field for audit trail

  3. Security
    - Maintain existing RLS policies
    - Add new indexes for performance

  4. Notes
    - Migration is safe and preserves existing data
    - Uses IF NOT EXISTS and ALTER TABLE ADD COLUMN IF NOT EXISTS
    - All new fields have sensible defaults
*/

-- Add missing columns to User table
DO $$
BEGIN
  -- Add lastName if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'lastName'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "lastName" TEXT;
  END IF;

  -- Add refCount if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'refCount'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "refCount" INTEGER NOT NULL DEFAULT 0;
  END IF;

  -- Add phoneVerified if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'phoneVerified'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "phoneVerified" BOOLEAN NOT NULL DEFAULT false;
  END IF;

  -- Add referralValidated if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'referralValidated'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "referralValidated" BOOLEAN NOT NULL DEFAULT false;
  END IF;

  -- Add fraudScore if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'fraudScore'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "fraudScore" INTEGER NOT NULL DEFAULT 0;
  END IF;

  -- Add waitlist counters
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'waitlistClients'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "waitlistClients" INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'waitlistInfluencers'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "waitlistInfluencers" INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'waitlistPros'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "waitlistPros" INTEGER NOT NULL DEFAULT 0;
  END IF;

  -- Add post-launch conversion counters
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'appDownloads'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "appDownloads" INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'validatedInfluencers'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "validatedInfluencers" INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'validatedPros'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "validatedPros" INTEGER NOT NULL DEFAULT 0;
  END IF;

  -- Add early-bird tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'earlyBird'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "earlyBird" BOOLEAN NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'earlyBirdBonus'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "earlyBirdBonus" INTEGER NOT NULL DEFAULT 0;
  END IF;

  -- Add dual-phase points system
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'provisionalPoints'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "provisionalPoints" INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'finalPoints'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "finalPoints" INTEGER NOT NULL DEFAULT 0;
  END IF;

  -- Add rank if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'rank'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "rank" INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'nextMilestone'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "nextMilestone" INTEGER NOT NULL DEFAULT 10;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'lastReferralAt'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "lastReferralAt" TIMESTAMPTZ;
  END IF;

  -- Add prize eligibility flags
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'eligibleForJackpot'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "eligibleForJackpot" BOOLEAN NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'isTopRank'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "isTopRank" BOOLEAN NOT NULL DEFAULT false;
  END IF;

  -- Add email tracking fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'emailSentAt'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "emailSentAt" TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'emailOpenedAt'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "emailOpenedAt" TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'lastMilestoneSent'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "lastMilestoneSent" INTEGER;
  END IF;

  -- Add firstName if not exists (for completeness)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'firstName'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "firstName" TEXT;
  END IF;

END $$;

-- Add missing columns to ReferralEvent table
DO $$
BEGIN
  -- Add roleAtSignup field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ReferralEvent' AND column_name = 'roleAtSignup'
  ) THEN
    ALTER TABLE "ReferralEvent" ADD COLUMN "roleAtSignup" TEXT;
  END IF;

  -- Add pointsAwarded field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ReferralEvent' AND column_name = 'pointsAwarded'
  ) THEN
    ALTER TABLE "ReferralEvent" ADD COLUMN "pointsAwarded" INTEGER NOT NULL DEFAULT 0;
  END IF;

END $$;

-- Create additional indexes for performance
CREATE INDEX IF NOT EXISTS "User_provisionalPoints_idx" ON "User"("provisionalPoints");
CREATE INDEX IF NOT EXISTS "User_finalPoints_idx" ON "User"("finalPoints");
CREATE INDEX IF NOT EXISTS "User_rank_idx" ON "User"("rank");
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_referralCode_idx" ON "User"("referralCode");

CREATE INDEX IF NOT EXISTS "ReferralEvent_type_idx" ON "ReferralEvent"("type");
CREATE INDEX IF NOT EXISTS "ReferralEvent_createdAt_idx" ON "ReferralEvent"("createdAt");

-- Migrate existing points data to provisionalPoints if needed
UPDATE "User"
SET "provisionalPoints" = "points"
WHERE "provisionalPoints" = 0 AND "points" > 0;

-- Comment on tables for documentation
COMMENT ON TABLE "User" IS 'Waitlist participants with complete referral tracking and dual-phase points system';
COMMENT ON TABLE "ReferralEvent" IS 'Audit trail for all referral-related events with points awarded';

COMMENT ON COLUMN "User"."provisionalPoints" IS 'Points earned during waitlist phase (pre-launch)';
COMMENT ON COLUMN "User"."finalPoints" IS 'Points calculated at launch including post-launch conversions';
COMMENT ON COLUMN "User"."earlyBird" IS 'True if user was in first 100 signups';
COMMENT ON COLUMN "User"."earlyBirdBonus" IS 'Bonus points for early-bird (typically 50)';
COMMENT ON COLUMN "User"."eligibleForJackpot" IS 'True if finalPoints >= 100 (eligible for €3,500)';
COMMENT ON COLUMN "User"."isTopRank" IS 'True if rank == 1 (eligible for iPhone 17 Pro)';
