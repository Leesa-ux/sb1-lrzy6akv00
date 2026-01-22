/*
  # Add UNIQUE constraint on referred user in referral_events

  ## Summary
  This migration ensures that each referred user can only validate ONE referrer.
  This prevents double-counting if a user somehow gets referred by multiple people.

  ## Changes Made

  1. Add UNIQUE constraint on ReferralEvent.actorL2Id (referred_user_id)
     - Ensures one referred user = one referral event
     - Prevents fraud scenarios where user tries to credit multiple referrers

  ## Security Impact
  - Prevents referral fraud
  - Ensures referral system integrity
  - First referrer wins (based on creation order)

  ## Notes
  - This constraint works together with the idempotencyKey unique constraint
  - If a user is already in referral_events, attempting to add them again will fail
  - The idempotency key format is: `${referrer_id}_${referred_user_id}_waitlist_signup`
*/

-- ============================================================================
-- ADD UNIQUE CONSTRAINT ON REFERRED USER
-- ============================================================================

-- Add UNIQUE constraint on actorL2Id (referred user ID)
-- This ensures each referred user can only validate ONE referrer
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ReferralEvent') THEN
    -- Check if constraint already exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'ReferralEvent_actorL2Id_unique'
      AND conrelid = '"ReferralEvent"'::regclass
    ) THEN
      -- Add unique constraint
      ALTER TABLE "ReferralEvent"
        ADD CONSTRAINT "ReferralEvent_actorL2Id_unique"
        UNIQUE ("actorL2Id");

      RAISE NOTICE 'Added UNIQUE constraint on ReferralEvent.actorL2Id';
    ELSE
      RAISE NOTICE 'UNIQUE constraint on ReferralEvent.actorL2Id already exists';
    END IF;
  END IF;
END $$;