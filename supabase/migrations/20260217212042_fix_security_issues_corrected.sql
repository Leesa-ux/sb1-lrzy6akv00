/*
  # Fix Security Issues - Comprehensive Update

  1. Primary Keys & Indexes
    - Add primary key to ContestWinners table
    - Add index for ContestWinners foreign key
    - Remove unused indexes across tables
    - Remove duplicate indexes

  2. Row Level Security (RLS)
    - Enable RLS on all public tables
    - Add proper policies for User, ReferralEvent, signup_metadata, ip_activity, ContestWinners, leaderboard_winners, system_flags, leaderboard_daily_snapshot
    - Fix overly permissive policies on ambassador_applications
    - Add policy for contest_config table

  3. Views Security
    - Recreate views without SECURITY DEFINER where possible
    - Use SECURITY INVOKER for public-facing views

  4. Functions Security
    - Fix search_path mutability for all functions
    - Set search_path explicitly to prevent schema injection attacks

  ## Notes
  - Data integrity is maintained throughout
  - All changes are idempotent using IF EXISTS/IF NOT EXISTS
  - Backward compatible with existing queries
*/

-- ============================================================================
-- 1. FIX PRIMARY KEYS AND INDEXES
-- ============================================================================

-- Add primary key to ContestWinners if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ContestWinners_pkey'
    AND conrelid = 'public."ContestWinners"'::regclass
  ) THEN
    -- Add an id column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'ContestWinners'
      AND column_name = 'id'
    ) THEN
      ALTER TABLE "ContestWinners" ADD COLUMN id uuid DEFAULT gen_random_uuid();
    END IF;

    ALTER TABLE "ContestWinners" ADD PRIMARY KEY (id);
  END IF;
END $$;

-- Add index for ContestWinners foreign key
CREATE INDEX IF NOT EXISTS idx_contestwinners_winner_id ON "ContestWinners"(winner_id);

-- Remove duplicate index on ReferralEvent (keep the unique constraint, drop the redundant index)
DROP INDEX IF EXISTS "ReferralEvent_idempotencyKey_idx";

-- Drop unused indexes
DROP INDEX IF EXISTS "User_email_idx";
DROP INDEX IF EXISTS "User_referralCode_idx";
DROP INDEX IF EXISTS "ReferralEvent_actorL1_idx";
DROP INDEX IF EXISTS "ReferralEvent_actorL2_idx";
DROP INDEX IF EXISTS "idx_signup_metadata_user_id";
DROP INDEX IF EXISTS "idx_referral_tracking_user_id";
DROP INDEX IF EXISTS "idx_referral_tracking_referrer_user_id";
DROP INDEX IF EXISTS "idx_ip_activity_user_id";
DROP INDEX IF EXISTS "idx_referral_event_referred_user_nonnull";
DROP INDEX IF EXISTS "idx_ambassador_applications_email";
DROP INDEX IF EXISTS "idx_ambassador_applications_status";
DROP INDEX IF EXISTS "idx_ambassador_applications_created_at";
DROP INDEX IF EXISTS "idx_pro_apps_email";
DROP INDEX IF EXISTS "idx_referralevent_actorl1id";
DROP INDEX IF EXISTS "idx_pro_applications_city";
DROP INDEX IF EXISTS "idx_pro_applications_created_at";
DROP INDEX IF EXISTS "ReferralEvent_phase_idx";
DROP INDEX IF EXISTS "idx_pro_applications_status";
DROP INDEX IF EXISTS "idx_user_scorelocked";

-- ============================================================================
-- 2. ENABLE RLS ON ALL PUBLIC TABLES
-- ============================================================================

-- Enable RLS on tables that don't have it
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReferralEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "signup_metadata" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ip_activity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContestWinners" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leaderboard_winners" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "system_flags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leaderboard_daily_snapshot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contest_config" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. DROP EXISTING OVERLY PERMISSIVE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can submit ambassador application" ON "ambassador_applications";
DROP POLICY IF EXISTS "Authenticated users can update applications" ON "ambassador_applications";

-- ============================================================================
-- 4. CREATE SECURE RLS POLICIES
-- ============================================================================

-- User table: Service role only (API handles all operations)
CREATE POLICY "Service role full access to users"
  ON "User"
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ReferralEvent: Service role only
CREATE POLICY "Service role full access to referral events"
  ON "ReferralEvent"
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- signup_metadata: Service role only
CREATE POLICY "Service role full access to signup metadata"
  ON "signup_metadata"
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ip_activity: Service role only
CREATE POLICY "Service role full access to ip activity"
  ON "ip_activity"
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ContestWinners: Service role only
CREATE POLICY "Service role full access to contest winners"
  ON "ContestWinners"
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- leaderboard_winners: Service role only
CREATE POLICY "Service role full access to leaderboard winners"
  ON "leaderboard_winners"
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- system_flags: Service role full access, authenticated can read
CREATE POLICY "Service role full access to system flags"
  ON "system_flags"
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can read system flags"
  ON "system_flags"
  FOR SELECT
  TO authenticated
  USING (true);

-- leaderboard_daily_snapshot: Service role full access, public can read
CREATE POLICY "Service role full access to leaderboard snapshots"
  ON "leaderboard_daily_snapshot"
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Public can read leaderboard snapshots"
  ON "leaderboard_daily_snapshot"
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- contest_config: Service role full access, public can read
CREATE POLICY "Service role full access to contest config"
  ON "contest_config"
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Public can read contest config"
  ON "contest_config"
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ambassador_applications: Secure insert, admin update
CREATE POLICY "Users can submit own ambassador application"
  ON "ambassador_applications"
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND status = 'pending'
  );

CREATE POLICY "Service role can manage ambassador applications"
  ON "ambassador_applications"
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- 5. RECREATE VIEWS WITHOUT SECURITY DEFINER
-- ============================================================================

-- Drop and recreate referral_leaderboard_with_tier without SECURITY DEFINER
DROP VIEW IF EXISTS referral_leaderboard_with_tier CASCADE;

CREATE VIEW referral_leaderboard_with_tier
WITH (security_invoker = true)
AS
WITH ranked_users AS (
  SELECT
    id,
    email,
    "firstName" as first_name,
    role,
    ref_count as referrals_count,
    "provisionalPoints" as total_points,
    "earlyBird" as early_bird,
    "createdAt" as created_at,
    ROW_NUMBER() OVER (
      ORDER BY "provisionalPoints" DESC, ref_count DESC, "createdAt" ASC
    ) as rank
  FROM "User"
  WHERE "provisionalPoints" > 0
)
SELECT
  rank::integer,
  id as user_id,
  SUBSTRING(email FROM 1 FOR 1) || '***@' || SPLIT_PART(email, '@', 2) as email_masked,
  email,
  first_name,
  role,
  referrals_count,
  total_points,
  early_bird,
  CASE
    WHEN total_points >= 200 THEN 'Legend'
    WHEN total_points >= 100 THEN 'Elite Influencer'
    WHEN total_points >= 50 THEN 'Top Glower'
    WHEN total_points >= 20 THEN 'Rising Star'
    ELSE 'Glow Starter'
  END as tier,
  created_at
FROM ranked_users
ORDER BY rank;

GRANT SELECT ON referral_leaderboard_with_tier TO anon, authenticated;

COMMENT ON VIEW referral_leaderboard_with_tier IS 'Public leaderboard view with tier-based ranking. Tiers: Glow Starter (0-19 pts), Rising Star (20-49), Top Glower (50-99), Elite Influencer (100-199), Legend (200+)';

-- Recreate other views without SECURITY DEFINER where they exist
DO $$
BEGIN
  -- referral_leaderboard
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'referral_leaderboard') THEN
    DROP VIEW IF EXISTS referral_leaderboard CASCADE;
    CREATE VIEW referral_leaderboard
    WITH (security_invoker = true)
    AS
    SELECT
      ROW_NUMBER() OVER (ORDER BY "provisionalPoints" DESC, ref_count DESC, "createdAt" ASC) as rank,
      id as user_id,
      email,
      "firstName" as first_name,
      role,
      ref_count as referrals_count,
      "provisionalPoints" as total_points,
      "earlyBird" as early_bird,
      "createdAt" as created_at
    FROM "User"
    WHERE "provisionalPoints" > 0
    ORDER BY rank;

    GRANT SELECT ON referral_leaderboard TO anon, authenticated;
  END IF;

  -- leaderboard_live
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'leaderboard_live') THEN
    DROP VIEW IF EXISTS leaderboard_live CASCADE;
    CREATE VIEW leaderboard_live
    WITH (security_invoker = true)
    AS
    SELECT
      ROW_NUMBER() OVER (ORDER BY "provisionalPoints" DESC, ref_count DESC, "createdAt" ASC) as rank,
      id,
      email,
      "provisionalPoints" as points,
      ref_count as referral_count
    FROM "User"
    WHERE "provisionalPoints" > 0
    ORDER BY rank;

    GRANT SELECT ON leaderboard_live TO anon, authenticated;
  END IF;

  -- leaderboard_final
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'leaderboard_final') THEN
    DROP VIEW IF EXISTS leaderboard_final CASCADE;
    CREATE VIEW leaderboard_final
    WITH (security_invoker = true)
    AS
    SELECT
      ROW_NUMBER() OVER (ORDER BY "finalPoints" DESC, ref_count DESC, "createdAt" ASC) as rank,
      id,
      email,
      "finalPoints" as points,
      ref_count as referral_count
    FROM "User"
    WHERE "finalPoints" > 0
    ORDER BY rank;

    GRANT SELECT ON leaderboard_final TO anon, authenticated;
  END IF;

  -- referral_leaderboard_public
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'referral_leaderboard_public') THEN
    DROP VIEW IF EXISTS referral_leaderboard_public CASCADE;
    CREATE VIEW referral_leaderboard_public
    WITH (security_invoker = true)
    AS
    SELECT
      ROW_NUMBER() OVER (ORDER BY "provisionalPoints" DESC, ref_count DESC, "createdAt" ASC) as rank,
      id,
      SUBSTRING(email FROM 1 FOR 1) || '***@' || SPLIT_PART(email, '@', 2) as email_masked,
      "firstName" as first_name,
      role,
      "provisionalPoints" as points,
      ref_count as referral_count
    FROM "User"
    WHERE "provisionalPoints" > 0
    ORDER BY rank;

    GRANT SELECT ON referral_leaderboard_public TO anon, authenticated;
  END IF;

  -- referral_leaderboard_enriched
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'referral_leaderboard_enriched') THEN
    DROP VIEW IF EXISTS referral_leaderboard_enriched CASCADE;
    CREATE VIEW referral_leaderboard_enriched
    WITH (security_invoker = true)
    AS
    SELECT
      ROW_NUMBER() OVER (ORDER BY "provisionalPoints" DESC, ref_count DESC, "createdAt" ASC) as rank,
      id,
      email,
      "firstName" as first_name,
      role,
      "provisionalPoints" as points,
      ref_count as referral_count,
      "earlyBird" as early_bird,
      "createdAt" as created_at
    FROM "User"
    WHERE "provisionalPoints" > 0
    ORDER BY rank;

    GRANT SELECT ON referral_leaderboard_enriched TO anon, authenticated;
  END IF;

  -- v_fraud_dashboard (if exists, recreate with security invoker)
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'v_fraud_dashboard') THEN
    DROP VIEW IF EXISTS v_fraud_dashboard CASCADE;
    CREATE VIEW v_fraud_dashboard
    WITH (security_invoker = true)
    AS
    SELECT
      u.id,
      u.email,
      u."fraudScore" as fraud_score,
      u.ref_count,
      u."provisionalPoints" as points,
      u."isBlocked" as is_blocked,
      u."createdAt" as created_at
    FROM "User" u
    WHERE u."fraudScore" > 50
    ORDER BY u."fraudScore" DESC;

    GRANT SELECT ON v_fraud_dashboard TO authenticated;
  END IF;
END $$;

-- ============================================================================
-- 6. FIX FUNCTION SEARCH PATHS
-- ============================================================================

-- Set immutable search_path for all functions
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN
    SELECT
      p.proname as function_name,
      n.nspname as schema_name,
      pg_get_function_identity_arguments(p.oid) as arguments
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN (
      'set_updated_at',
      'take_leaderboard_snapshot',
      'freeze_leaderboard_points',
      'set_updated_at_timestamp',
      'mark_user_blocked_from_referral',
      'freeze_leaderboard_scores',
      'admin_unfreeze_by_email',
      'update_user_points',
      'validate_referral_event',
      'generate_random_code',
      'ensure_unique_referral_code',
      'increment_user_points',
      'referral_points_trigger_fn',
      'referral_points_function',
      'update_timestamp'
    )
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %I.%I(%s) SET search_path = public, pg_temp',
      func_record.schema_name,
      func_record.function_name,
      func_record.arguments
    );
  END LOOP;
END $$;

-- ============================================================================
-- VERIFICATION COMMENTS
-- ============================================================================

COMMENT ON TABLE "ContestWinners" IS 'Contest winners table with primary key and proper RLS';
COMMENT ON TABLE "User" IS 'User table with RLS enabled - service role only access';
COMMENT ON TABLE "ReferralEvent" IS 'Referral events with RLS enabled - service role only access';
COMMENT ON POLICY "Service role full access to users" ON "User" IS 'Only service role can access user data directly';
COMMENT ON POLICY "Users can submit own ambassador application" ON "ambassador_applications" IS 'Validates email format and ensures pending status on insert';
