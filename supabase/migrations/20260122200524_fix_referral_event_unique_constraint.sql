/*
  # Fix ReferralEvent UNIQUE constraint for referred users

  ## Summary
  This migration ensures the UNIQUE constraint on referred users is properly applied
  and documented. The constraint should prevent one referred user from crediting 
  multiple referrers.

  ## Column Clarification
  In ReferralEvent table:
  - actorL1Id = Referrer (person who gets points)
  - actorL2Id = Referred user (person who signed up and was referred)

  ## Changes Made

  1. Drop existing UNIQUE constraint (if exists)
  2. Re-add UNIQUE constraint with clear naming
  3. Add CHECK constraint to ensure actorL2Id is NOT NULL for waitlist_signup events
  4. Ensure idempotency via code (no database changes needed)

  ## Security Impact
  - Prevents referral fraud by ensuring one referred user = one referrer
  - Check constraint ensures data integrity for signup events
  - Works with existing idempotency key constraint

  ## Notes
  - Column name confirmed: actorL2Id (not referredL2Id or referredUserId)
  - NULL values in actorL2Id are allowed for non-signup event types
  - For 'waitlist_signup' events, actorL2Id must be NOT NULL
*/

-- ============================================================================
-- 1. DROP EXISTING CONSTRAINT (if exists)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ReferralEvent_actorL2Id_unique'
    AND conrelid = '"ReferralEvent"'::regclass
  ) THEN
    ALTER TABLE "ReferralEvent" DROP CONSTRAINT "ReferralEvent_actorL2Id_unique";
    RAISE NOTICE 'Dropped existing UNIQUE constraint on actorL2Id';
  END IF;
END $$;

-- ============================================================================
-- 2. ADD UNIQUE CONSTRAINT ON REFERRED USER (actorL2Id)
-- ============================================================================

-- Add UNIQUE constraint on actorL2Id (the referred user)
-- This ensures each referred user can only validate ONE referrer
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_referred_user'
    AND conrelid = '"ReferralEvent"'::regclass
  ) THEN
    ALTER TABLE "ReferralEvent"
      ADD CONSTRAINT "unique_referred_user"
      UNIQUE ("actorL2Id");

    RAISE NOTICE 'Added UNIQUE constraint on actorL2Id (referred user)';
  END IF;
END $$;

-- ============================================================================
-- 3. ADD CHECK CONSTRAINT FOR WAITLIST SIGNUP EVENTS
-- ============================================================================

-- Ensure actorL2Id is NOT NULL for waitlist_signup events
-- (Other event types may have NULL actorL2Id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_waitlist_signup_has_referred_user'
    AND conrelid = '"ReferralEvent"'::regclass
  ) THEN
    ALTER TABLE "ReferralEvent"
      ADD CONSTRAINT "check_waitlist_signup_has_referred_user"
      CHECK (
        type != 'waitlist_signup' OR "actorL2Id" IS NOT NULL
      );

    RAISE NOTICE 'Added CHECK constraint for waitlist_signup events';
  END IF;
END $$;

-- ============================================================================
-- 4. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN "ReferralEvent"."actorL1Id" IS 'Referrer user ID (person who gets points)';
COMMENT ON COLUMN "ReferralEvent"."actorL2Id" IS 'Referred user ID (person who signed up) - must be unique for waitlist_signup events';
COMMENT ON CONSTRAINT "unique_referred_user" ON "ReferralEvent" IS 'Ensures each referred user can only credit one referrer (prevents double-counting)';
COMMENT ON CONSTRAINT "check_waitlist_signup_has_referred_user" ON "ReferralEvent" IS 'Ensures waitlist_signup events always have a referred user (actorL2Id cannot be NULL)';

-- ============================================================================
-- 5. CREATE PARTIAL INDEX FOR PERFORMANCE
-- ============================================================================

-- Create index on non-NULL actorL2Id values for faster lookups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_referral_event_referred_user_nonnull'
  ) THEN
    CREATE INDEX idx_referral_event_referred_user_nonnull
      ON "ReferralEvent"("actorL2Id")
      WHERE "actorL2Id" IS NOT NULL;

    RAISE NOTICE 'Created partial index on non-NULL actorL2Id values';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify constraints exist:
-- SELECT 
--   conname as constraint_name,
--   contype as constraint_type,
--   pg_get_constraintdef(oid) as definition
-- FROM pg_constraint
-- WHERE conrelid = '"ReferralEvent"'::regclass
-- AND (conname LIKE '%referred%' OR conname LIKE '%actorL2%')
-- ORDER BY conname;

-- Test constraint (should fail - duplicate referred user):
-- INSERT INTO "ReferralEvent" (id, "actorL1Id", "actorL2Id", type, "idempotencyKey")
-- VALUES ('test1', 'user1', 'user_referred', 'waitlist_signup', 'key1');
-- INSERT INTO "ReferralEvent" (id, "actorL1Id", "actorL2Id", type, "idempotencyKey")
-- VALUES ('test2', 'user2', 'user_referred', 'waitlist_signup', 'key2');  -- Should fail!

-- Test CHECK constraint (should fail - waitlist_signup with NULL actorL2Id):
-- INSERT INTO "ReferralEvent" (id, "actorL1Id", "actorL2Id", type, "idempotencyKey")
-- VALUES ('test3', 'user1', NULL, 'waitlist_signup', 'key3');  -- Should fail!