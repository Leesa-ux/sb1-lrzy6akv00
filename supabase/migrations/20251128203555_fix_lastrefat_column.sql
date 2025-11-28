/*
  # Fix Column Name: lastReferralAt -> lastRefAt

  This migration renames lastReferralAt to lastRefAt to match the code expectations.
*/

-- Rename column if it exists (from previous migration)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'lastReferralAt'
  ) THEN
    ALTER TABLE "User" RENAME COLUMN "lastReferralAt" TO "lastRefAt";
  END IF;

  -- Add lastRefAt if neither exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'lastRefAt'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "lastRefAt" TIMESTAMPTZ;
  END IF;
END $$;