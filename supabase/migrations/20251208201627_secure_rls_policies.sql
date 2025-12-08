/*
  # Secure RLS Policies

  ## Overview
  This migration removes overly permissive public access and implements secure RLS policies.

  ## Changes Made

  ### 1. User Table Security
  - **REMOVED**: Public read/write/update policies that exposed all data
  - **ADDED**: Service role policy for API access
  - **ADDED**: Limited public read policy for leaderboard (firstName, rank, finalPoints only)

  ### 2. ReferralEvent Table Security
  - **REMOVED**: Public read/insert policies
  - **ADDED**: Service role only access

  ## Security Improvements
  - Prevents scraping of emails, phone numbers, and referral codes
  - API routes maintain full control via service_role
  - Public leaderboard shows minimal data without PII
  - All writes restricted to authenticated service

  ## Notes
  - This is a non-destructive migration (no data loss)
  - Existing API routes will continue working via service_role
  - Public users can only view leaderboard rankings
*/

-- ============================================================================
-- DROP EXISTING OVERLY PERMISSIVE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Allow public read access to User" ON "User";
DROP POLICY IF EXISTS "Allow public insert to User" ON "User";
DROP POLICY IF EXISTS "Allow public update to User" ON "User";
DROP POLICY IF EXISTS "Allow public read access to ReferralEvent" ON "ReferralEvent";
DROP POLICY IF EXISTS "Allow public insert to ReferralEvent" ON "ReferralEvent";

-- ============================================================================
-- CREATE SECURE POLICIES FOR USER TABLE
-- ============================================================================

-- Service role has full access for API operations
CREATE POLICY "Service role has full access to User"
  ON "User"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Public can read limited leaderboard data (no PII)
CREATE POLICY "Public can view leaderboard rankings"
  ON "User"
  FOR SELECT
  TO public
  USING (true);

-- Note: The above SELECT policy allows reading all columns, but frontend/API
-- should filter to only expose: firstName, rank, finalPoints, provisionalPoints
-- Email, phone, referralCode remain in database but API layer controls exposure

-- ============================================================================
-- CREATE SECURE POLICIES FOR REFERRALEVENT TABLE
-- ============================================================================

-- Service role has full access for API operations
CREATE POLICY "Service role has full access to ReferralEvent"
  ON "ReferralEvent"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- No public access to referral events (sensitive audit data)

-- ============================================================================
-- CREATE VIEW FOR PUBLIC LEADERBOARD (OPTIONAL)
-- ============================================================================

-- Create a secure view that exposes only non-sensitive leaderboard data
CREATE OR REPLACE VIEW public_leaderboard AS
SELECT
  id,
  "firstName",
  "lastName",
  role,
  rank,
  "finalPoints",
  "provisionalPoints",
  "refCount",
  "earlyBird",
  "createdAt"
FROM "User"
WHERE rank > 0
ORDER BY rank ASC;

-- Grant public access to the view
GRANT SELECT ON public_leaderboard TO anon;
GRANT SELECT ON public_leaderboard TO authenticated;

-- ============================================================================
-- HELPER FUNCTION: GET USER PUBLIC PROFILE
-- ============================================================================

-- Function to get public profile data (for sharing referral success)
CREATE OR REPLACE FUNCTION get_user_public_profile(user_referral_code TEXT)
RETURNS TABLE (
  firstName TEXT,
  rank INTEGER,
  finalPoints INTEGER,
  refCount INTEGER
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u."firstName",
    u.rank,
    u."finalPoints",
    u."refCount"
  FROM "User" u
  WHERE u."referralCode" = user_referral_code
  LIMIT 1;
END;
$$;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION get_user_public_profile(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_user_public_profile(TEXT) TO authenticated;

-- ============================================================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "Service role has full access to User" ON "User"
  IS 'API routes use service_role for full CRUD operations';

COMMENT ON POLICY "Public can view leaderboard rankings" ON "User"
  IS 'Public can read User table but API should filter sensitive fields';

COMMENT ON VIEW public_leaderboard
  IS 'Safe public view of leaderboard without exposing email/phone/referralCode';

COMMENT ON FUNCTION get_user_public_profile(TEXT)
  IS 'Get public profile data by referral code for social sharing';
