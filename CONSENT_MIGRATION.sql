/*
  # Add Consent Tracking Fields to User

  1. Changes
    - Add `consentGdpr` column (default: false)
    - Add `consentSms` column (default: true)
    - Add `consentAt` timestamp column

  2. Purpose
    - Store user consent for GDPR compliance
    - Track SMS marketing consent
    - Record when consent was given

  3. Security
    - No RLS changes needed (inherits existing policies)

  4. Notes
    - Uses IF NOT EXISTS for safe re-application
    - consentGdpr defaults to false (must be explicitly given)
    - consentSms defaults to true (opt-out model)
    - consentAt stores timestamp of consent action
*/

-- Add GDPR consent column
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "consentGdpr" BOOLEAN NOT NULL DEFAULT false;

-- Add SMS consent column
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "consentSms" BOOLEAN NOT NULL DEFAULT true;

-- Add consent timestamp column
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "consentAt" TIMESTAMPTZ;
