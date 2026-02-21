/*
  # Create ambassador_applications table

  1. New Tables
    - `ambassador_applications`
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `full_name` (text)
      - `email` (text)
      - `platform` (text) - instagram, tiktok, youtube, other
      - `handle` (text, optional)
      - `profile_url` (text)
      - `followers_count` (integer)
      - `city` (text, optional)
      - `niche` (text, optional) - hair, nails, skincare, lifestyle, other
      - `notes` (text, optional)
      - `media_path` (text, optional) - file path in storage
      - `consent` (boolean, default true)
      - `status` (text, default 'pending') - pending, reviewing, approved, rejected
      - `admin_notes` (text, optional) - internal notes for admin review
      - `reviewed_at` (timestamptz, optional)
      - `reviewed_by` (text, optional)
      - `referral_code` (text, unique) - unique referral code for tracking

  2. Security
    - Enable RLS on `ambassador_applications` table
    - Add policy for public insert (anyone can apply)
    - Add policy for authenticated admin users to read/update
*/

CREATE TABLE IF NOT EXISTS ambassador_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  
  full_name text NOT NULL,
  email text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'other')),
  handle text,
  profile_url text NOT NULL,
  followers_count integer NOT NULL DEFAULT 0,
  
  city text,
  niche text CHECK (niche IS NULL OR niche IN ('hair', 'nails', 'skincare', 'lifestyle', 'other')),
  notes text,
  media_path text,
  
  consent boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
  admin_notes text,
  reviewed_at timestamptz,
  reviewed_by text,
  
  referral_code text UNIQUE
);

ALTER TABLE ambassador_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit ambassador application"
  ON ambassador_applications
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all applications"
  ON ambassador_applications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update applications"
  ON ambassador_applications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_ambassador_applications_email ON ambassador_applications(email);
CREATE INDEX IF NOT EXISTS idx_ambassador_applications_status ON ambassador_applications(status);
CREATE INDEX IF NOT EXISTS idx_ambassador_applications_created_at ON ambassador_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ambassador_applications_referral_code ON ambassador_applications(referral_code);
