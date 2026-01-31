/*
  # Create PRO Applications Table

  1. New Tables
    - `pro_applications`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - Personal info: first_name, last_name, email, phone, city, postal_code, address, date_of_birth
      - Emergency contact: emergency_contact_name, emergency_contact_phone
      - Professional: work_authorized, certifications, portfolio_url, portfolio_paths, media_projects, heard_about
      - Device: smartphone_os
      - Consents: consent_missions, consent_messages, consent_phone
      - Admin: status, next_action, admin_notes

  2. Security
    - Enable RLS on `pro_applications` table
    - No public access (admin only via service role)
*/

CREATE TABLE IF NOT EXISTS pro_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Personal Information
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  city text NOT NULL,
  postal_code text NOT NULL,
  address text NOT NULL,
  date_of_birth date NOT NULL,

  -- Emergency Contact
  emergency_contact_name text NOT NULL,
  emergency_contact_phone text NOT NULL,

  -- Professional Information
  work_authorized boolean DEFAULT false,
  certifications text[] DEFAULT '{}',
  portfolio_url text NOT NULL,
  portfolio_paths text[] DEFAULT '{}',
  media_projects text,
  heard_about text,

  -- Device
  smartphone_os text NOT NULL,

  -- Consents
  consent_missions boolean DEFAULT false,
  consent_messages boolean DEFAULT false,
  consent_phone boolean DEFAULT false,

  -- Admin fields
  status text DEFAULT 'pending',
  next_action text,
  admin_notes text
);

ALTER TABLE pro_applications ENABLE ROW LEVEL SECURITY;

-- No public policies - admin only via service role

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_pro_applications_status ON pro_applications(status);
CREATE INDEX IF NOT EXISTS idx_pro_applications_city ON pro_applications(city);
CREATE INDEX IF NOT EXISTS idx_pro_applications_created_at ON pro_applications(created_at DESC);
