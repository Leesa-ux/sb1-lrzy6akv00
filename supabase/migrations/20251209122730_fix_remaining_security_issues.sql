/*
  # Fix Remaining Security and Performance Issues

  ## Summary
  This migration addresses additional security issues identified after the previous fix:
  - Add missing foreign key indexes on referral_events, referral_tracking, and signup_metadata
  - Fix the security definer view issue
  - Re-enable RLS on users_import table with proper policies
  - Keep essential indexes even if not yet used (they will be used in production)

  ## Changes Made

  ### 1. Add Missing Foreign Key Indexes
  - referral_events.actor1id
  - referral_events.actor2id  
  - referral_tracking.user_id
  - signup_metadata.user_id

  ### 2. Fix Security Definer View
  - Drop and recreate public_leaderboard without SECURITY DEFINER

  ### 3. Enable RLS on users_import
  - Enable RLS on users_import table
  - Add policy for authenticated admin users

  ### 4. Keep Essential Indexes
  - Indexes marked as "unused" are kept because they're essential for production queries
  - They appear unused because the database hasn't had production traffic yet

  ## Security Impact
  - All foreign keys now have covering indexes
  - Views use proper security settings
  - All public tables have RLS enabled with appropriate policies
*/

-- ============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

-- Index on referral_events.actor1id foreign key
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'referral_events') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'referral_events' AND indexname = 'idx_referral_events_actor1id'
    ) THEN
      CREATE INDEX idx_referral_events_actor1id ON referral_events(actor1id);
    END IF;
  END IF;
END $$;

-- Index on referral_events.actor2id foreign key
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'referral_events') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'referral_events' AND indexname = 'idx_referral_events_actor2id'
    ) THEN
      CREATE INDEX idx_referral_events_actor2id ON referral_events(actor2id);
    END IF;
  END IF;
END $$;

-- Index on referral_tracking.user_id foreign key
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'referral_tracking') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'referral_tracking' AND indexname = 'idx_referral_tracking_user_id_fk'
    ) THEN
      CREATE INDEX idx_referral_tracking_user_id_fk ON referral_tracking(user_id);
    END IF;
  END IF;
END $$;

-- Index on signup_metadata.user_id foreign key
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'signup_metadata') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'signup_metadata' AND indexname = 'idx_signup_metadata_user_id_fk'
    ) THEN
      CREATE INDEX idx_signup_metadata_user_id_fk ON signup_metadata(user_id);
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 2. FIX SECURITY DEFINER VIEW (AGAIN)
-- ============================================================================

-- Drop and recreate public_leaderboard view without SECURITY DEFINER
-- This time we'll be more explicit
DO $$
BEGIN
  -- Drop the view completely
  DROP VIEW IF EXISTS public_leaderboard CASCADE;
  
  -- Recreate view WITHOUT security definer (SECURITY INVOKER is default)
  EXECUTE '
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
      ROW_NUMBER() OVER (ORDER BY "provisionalPoints" DESC, "refCount" DESC, "createdAt" ASC) as rank
    FROM "User"
    WHERE "phoneVerified" = true
    ORDER BY "provisionalPoints" DESC, "refCount" DESC, "createdAt" ASC
    LIMIT 100;
  ';
  
  -- Grant public access to the view
  GRANT SELECT ON public_leaderboard TO anon, authenticated;
END $$;

-- ============================================================================
-- 3. ENABLE RLS ON users_import WITH POLICIES
-- ============================================================================

-- Enable RLS on users_import table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users_import') THEN
    -- Enable RLS
    ALTER TABLE users_import ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if any
    DROP POLICY IF EXISTS "Service role can manage imports" ON users_import;
    DROP POLICY IF EXISTS "Admins can manage imports" ON users_import;
    
    -- Create restrictive policy: only service role can access
    -- This is appropriate for an import table
    CREATE POLICY "Service role can manage imports"
      ON users_import FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
    
    -- Optional: If you want authenticated admins to access (uncomment if needed)
    -- CREATE POLICY "Admins can view imports"
    --   ON users_import FOR SELECT
    --   TO authenticated
    --   USING (
    --     (SELECT auth.jwt() ->> 'role') = 'admin' OR
    --     (SELECT auth.jwt() ->> 'email') = 'admin@afroe.com'
    --   );
  END IF;
END $$;

-- ============================================================================
-- 4. VERIFY ESSENTIAL INDEXES EXIST
-- ============================================================================

-- These indexes appear "unused" because they haven't been used yet in queries
-- However, they are ESSENTIAL for production performance
-- Keep them all - they will be used when the app goes live

-- Verify User table indexes exist
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"(email);
CREATE INDEX IF NOT EXISTS "User_referralCode_idx" ON "User"("referralCode");
CREATE INDEX IF NOT EXISTS "User_provisionalPoints_idx" ON "User"("provisionalPoints");
CREATE INDEX IF NOT EXISTS "User_leaderboard_idx" 
  ON "User"("provisionalPoints" DESC, "refCount" DESC, "createdAt" ASC)
  WHERE "phoneVerified" = true;

-- Verify ReferralEvent table indexes exist
CREATE INDEX IF NOT EXISTS "ReferralEvent_actorL1Id_idx" ON "ReferralEvent"("actorL1Id");
CREATE INDEX IF NOT EXISTS "ReferralEvent_actorL2Id_idx" ON "ReferralEvent"("actorL2Id");

-- Verify new foreign key indexes exist
CREATE INDEX IF NOT EXISTS idx_ip_activity_user_id ON ip_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_referrer_user_id ON referral_tracking(referrer_user_id);

-- ============================================================================
-- 5. ADD COMMENTS TO EXPLAIN INDEX USAGE
-- ============================================================================

-- Add comments to explain why these indexes are kept
COMMENT ON INDEX "User_email_idx" IS 'Used for login and user lookup by email';
COMMENT ON INDEX "User_referralCode_idx" IS 'Used for referral tracking and link validation';
COMMENT ON INDEX "User_leaderboard_idx" IS 'Optimized composite index for leaderboard queries';
COMMENT ON INDEX "ReferralEvent_actorL1Id_idx" IS 'Foreign key index for L1 referral lookups';
COMMENT ON INDEX "ReferralEvent_actorL2Id_idx" IS 'Foreign key index for L2 referral lookups';
COMMENT ON INDEX idx_ip_activity_user_id IS 'Foreign key index for user activity tracking';
COMMENT ON INDEX idx_referral_tracking_referrer_user_id IS 'Foreign key index for referrer lookups';

-- ============================================================================
-- 6. ANALYZE TABLES FOR QUERY PLANNER
-- ============================================================================

-- Update statistics for the query planner to make optimal decisions
ANALYZE "User";
ANALYZE "ReferralEvent";
ANALYZE referral_events;
ANALYZE referral_tracking;
ANALYZE signup_metadata;
ANALYZE ip_activity;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all foreign key indexes exist:
-- SELECT 
--   tc.table_name, 
--   kcu.column_name,
--   CASE 
--     WHEN EXISTS (
--       SELECT 1 FROM pg_indexes 
--       WHERE tablename = tc.table_name 
--       AND indexdef LIKE '%' || kcu.column_name || '%'
--     ) THEN 'INDEXED ✓'
--     ELSE 'MISSING ✗'
--   END as index_status
-- FROM information_schema.table_constraints tc
-- JOIN information_schema.key_column_usage kcu 
--   ON tc.constraint_name = kcu.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND tc.table_schema = 'public'
-- ORDER BY tc.table_name, kcu.column_name;

-- Verify RLS is enabled:
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename;

-- Verify view security:
-- SELECT 
--   viewname,
--   CASE 
--     WHEN definition LIKE '%security_definer%' THEN 'SECURITY DEFINER ✗'
--     WHEN definition LIKE '%security_invoker%' THEN 'SECURITY INVOKER ✓'
--     ELSE 'DEFAULT (INVOKER) ✓'
--   END as security_mode
-- FROM pg_views 
-- WHERE schemaname = 'public';
