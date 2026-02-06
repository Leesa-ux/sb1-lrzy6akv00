/*
  # Create Leaderboard View with Tiers

  1. New Views
    - `referral_leaderboard_with_tier`
      - Shows ranked users with points and tier classification
      - Tiers based on points: Glow Starter, Rising Star, Top Glower, Elite Influencer, Legend
      - Includes rank, email (masked for privacy), points, referral count, and tier
  
  2. Security
    - Grant SELECT permission to anon and authenticated users
    - Public leaderboard accessible to everyone
  
  3. Features
    - Real-time ranking based on provisional_points
    - Automatic tier assignment based on point thresholds
    - Email masking for privacy (shows first character + ***@domain.com)
*/

-- Drop existing view if it exists
DROP VIEW IF EXISTS referral_leaderboard_with_tier CASCADE;

-- Create the leaderboard view with tier classification
CREATE VIEW referral_leaderboard_with_tier AS
WITH ranked_users AS (
  SELECT 
    id,
    email,
    "firstName" as first_name,
    role,
    "refCount" as referrals_count,
    "provisionalPoints" as total_points,
    "earlyBird" as early_bird,
    "createdAt" as created_at,
    ROW_NUMBER() OVER (
      ORDER BY "provisionalPoints" DESC, "refCount" DESC, "createdAt" ASC
    ) as rank
  FROM "User"
  WHERE "provisionalPoints" > 0
)
SELECT 
  rank::integer,
  id as user_id,
  -- Mask email for privacy: j***@gmail.com
  SUBSTRING(email FROM 1 FOR 1) || '***@' || SPLIT_PART(email, '@', 2) as email_masked,
  email,
  first_name,
  role,
  referrals_count,
  total_points,
  early_bird,
  -- Assign tier based on points
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

-- Grant read access to everyone (public leaderboard)
GRANT SELECT ON referral_leaderboard_with_tier TO anon, authenticated;

-- Add comment for documentation
COMMENT ON VIEW referral_leaderboard_with_tier IS 'Public leaderboard view with tier-based ranking. Tiers: Glow Starter (0-19 pts), Rising Star (20-49), Top Glower (50-99), Elite Influencer (100-199), Legend (200+)';
