/*
  # Add Fraud Detection and Anti-Abuse Fields

  1. New Tables
    - `signup_metadata`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `ip_address` (text)
      - `user_agent` (text)
      - `device_fingerprint` (text)
      - `form_load_time` (timestamptz)
      - `form_submit_time` (timestamptz)
      - `time_to_submit_seconds` (integer)
      - `fraud_flags` (jsonb) - array of fraud indicators
      - `is_blocked` (boolean)
      - `created_at` (timestamptz)

    - `referral_tracking`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `referrer_code` (text)
      - `referrer_user_id` (uuid, nullable)
      - `ip_address` (text)
      - `user_agent` (text)
      - `device_fingerprint` (text)
      - `points_granted` (boolean)
      - `points_granted_at` (timestamptz, nullable)
      - `fraud_flags` (jsonb)
      - `is_blocked` (boolean)
      - `created_at` (timestamptz)

    - `ip_activity`
      - `id` (uuid, primary key)
      - `ip_address` (text)
      - `action_type` (text) - 'signup', 'referral', 'sms_verify'
      - `user_id` (uuid, nullable)
      - `created_at` (timestamptz)
      - Index on (ip_address, created_at) for rate limiting

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated access only
    - Add indexes for performance

  3. Notes
    - fraud_flags stores array of detected issues: ['fast_submit', 'repeated_ip', 'temp_email']
    - time_to_submit_seconds helps detect bot behavior
    - ip_activity table enables rate limiting across different actions
*/

-- Create signup_metadata table
CREATE TABLE IF NOT EXISTS signup_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address text NOT NULL,
  user_agent text,
  device_fingerprint text,
  form_load_time timestamptz,
  form_submit_time timestamptz NOT NULL DEFAULT now(),
  time_to_submit_seconds integer,
  fraud_flags jsonb DEFAULT '[]'::jsonb,
  is_blocked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE signup_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage signup metadata"
  ON signup_metadata
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_signup_metadata_user_id ON signup_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_signup_metadata_ip_address ON signup_metadata(ip_address);
CREATE INDEX IF NOT EXISTS idx_signup_metadata_device_fingerprint ON signup_metadata(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_signup_metadata_created_at ON signup_metadata(created_at);

-- Create referral_tracking table
CREATE TABLE IF NOT EXISTS referral_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  referrer_code text NOT NULL,
  referrer_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address text NOT NULL,
  user_agent text,
  device_fingerprint text,
  points_granted boolean DEFAULT false,
  points_granted_at timestamptz,
  fraud_flags jsonb DEFAULT '[]'::jsonb,
  is_blocked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referral_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage referral tracking"
  ON referral_tracking
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_referral_tracking_user_id ON referral_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_referrer_code ON referral_tracking(referrer_code);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_ip_address ON referral_tracking(ip_address);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_device_fingerprint ON referral_tracking(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_created_at ON referral_tracking(created_at);

-- Create ip_activity table for rate limiting
CREATE TABLE IF NOT EXISTS ip_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  action_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ip_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage ip activity"
  ON ip_activity
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_ip_activity_ip_action ON ip_activity(ip_address, action_type, created_at);
CREATE INDEX IF NOT EXISTS idx_ip_activity_created_at ON ip_activity(created_at);

-- Add lastName field to auth.users if using Supabase Auth (optional, for completeness)
-- Note: If you're using a custom users table, add these fields there instead
