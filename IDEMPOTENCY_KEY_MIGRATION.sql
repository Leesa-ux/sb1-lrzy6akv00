/*
  # Add Idempotency Key to ReferralEvent

  1. Changes
    - Add `idempotencyKey` column to `ReferralEvent` table
    - Create unique index on `idempotencyKey`

  2. Purpose
    - Prevents duplicate point awards for the same referral action
    - Ensures referral events are processed exactly once
    - Guards against race conditions and retry scenarios

  3. Security
    - No RLS changes needed (inherits existing policies)

  4. Notes
    - Uses IF NOT EXISTS for safe re-application
    - Existing records will need backfill (handled separately if needed)

  5. Usage
    - Copy this file to: supabase/migrations/20260113000000_add_idempotency_key.sql
    - Or apply directly using: mcp__supabase__apply_migration tool
*/

-- Add idempotency key column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ReferralEvent' AND column_name = 'idempotencyKey'
  ) THEN
    ALTER TABLE "ReferralEvent" ADD COLUMN "idempotencyKey" TEXT;
  END IF;
END $$;

-- Create unique index to enforce uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS "ReferralEvent_idempotencyKey_key"
  ON "ReferralEvent"("idempotencyKey");
