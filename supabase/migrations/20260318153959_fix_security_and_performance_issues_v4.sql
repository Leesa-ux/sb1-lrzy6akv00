/*
  # Fix Security and Performance Issues V4

  ## Changes

  ### 1. Add Missing Indexes
    - Add index on `ContestWinners.winner_id` to improve foreign key performance

  ### 2. Remove Unused Indexes
    - Drop `idx_sms_verification_expires` (unused)
    - Drop `idx_referralevent_actorl1id` (unused)
    - Drop `idx_ip_activity_user_id` (unused)
    - Drop `idx_referral_tracking_referrer_user_id` (unused)
    - Drop `idx_referral_tracking_user_id` (unused)
    - Drop `idx_signup_metadata_user_id` (unused)
    - Drop `idx_phone_verification_phone` (unused)
    - Drop `idx_phone_verification_cleanup` (unused)

  ### 3. Add RLS Policies
    - Add restrictive policies for `phone_verification_codes` table

  ## Security Notes
    - All policies check authentication status
    - Foreign key indexes improve query performance
    - Unused indexes are removed to reduce maintenance overhead
*/

-- =====================================================
-- 1. ADD MISSING INDEXES FOR FOREIGN KEYS
-- =====================================================

-- Add index for ContestWinners.winner_id foreign key
CREATE INDEX IF NOT EXISTS idx_contestwinners_winner_id
ON "ContestWinners"(winner_id);

-- =====================================================
-- 2. REMOVE UNUSED INDEXES
-- =====================================================

-- Drop unused indexes to reduce maintenance overhead
DROP INDEX IF EXISTS idx_sms_verification_expires;
DROP INDEX IF EXISTS idx_referralevent_actorl1id;
DROP INDEX IF EXISTS idx_ip_activity_user_id;
DROP INDEX IF EXISTS idx_referral_tracking_referrer_user_id;
DROP INDEX IF EXISTS idx_referral_tracking_user_id;
DROP INDEX IF EXISTS idx_signup_metadata_user_id;
DROP INDEX IF EXISTS idx_phone_verification_phone;
DROP INDEX IF EXISTS idx_phone_verification_cleanup;

-- =====================================================
-- 3. ADD RLS POLICIES FOR phone_verification_codes
-- =====================================================

-- Policy: Service role can insert verification codes
CREATE POLICY "Service role can insert phone verification codes"
ON phone_verification_codes
FOR INSERT
TO service_role
WITH CHECK (true);

-- Policy: Service role can select verification codes
CREATE POLICY "Service role can select phone verification codes"
ON phone_verification_codes
FOR SELECT
TO service_role
USING (true);

-- Policy: Service role can update verification codes
CREATE POLICY "Service role can update phone verification codes"
ON phone_verification_codes
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Service role can delete expired verification codes
CREATE POLICY "Service role can delete phone verification codes"
ON phone_verification_codes
FOR DELETE
TO service_role
USING (true);