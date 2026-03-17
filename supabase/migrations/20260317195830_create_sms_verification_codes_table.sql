/*
  # Create SMS Verification Codes Table

  1. New Tables
    - `sms_verification_codes`
      - `id` (uuid, primary key)
      - `phone` (text, normalized phone number)
      - `code` (text, 6-digit verification code)
      - `expires_at` (timestamptz, expiration time - 30 minutes from creation)
      - `attempts` (integer, number of verification attempts)
      - `verified` (boolean, whether code was successfully verified)
      - `created_at` (timestamptz, creation timestamp)

  2. Security
    - Enable RLS on `sms_verification_codes` table
    - No public access - only service role can manage codes
    - Codes expire after 30 minutes
    - Maximum 5 verification attempts per code

  3. Indexes
    - Index on phone and verified for fast lookups
    - Index on expires_at for cleanup queries
*/

CREATE TABLE IF NOT EXISTS sms_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer DEFAULT 0,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sms_verification_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only access"
  ON sms_verification_codes
  FOR ALL
  USING (false);

CREATE INDEX IF NOT EXISTS idx_sms_verification_phone_verified 
  ON sms_verification_codes(phone, verified);

CREATE INDEX IF NOT EXISTS idx_sms_verification_expires 
  ON sms_verification_codes(expires_at);
