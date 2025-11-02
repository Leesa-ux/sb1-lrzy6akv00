/*
  # Create Waitlist Tables

  1. New Tables
    - `User`
      - `id` (text, primary key) - Unique identifier using cuid
      - `email` (text, unique, not null) - User email address
      - `phone` (text, nullable) - User phone number
      - `role` (text, default 'client') - User role
      - `points` (integer, default 0) - Referral points
      - `referralCode` (text, unique, not null) - Unique referral code
      - `referredBy` (text, nullable) - Referral code of referrer
      - `createdAt` (timestamptz, default now()) - Creation timestamp
      - `updatedAt` (timestamptz, default now()) - Last update timestamp

    - `ReferralEvent`
      - `id` (text, primary key) - Unique identifier using cuid
      - `type` (text, not null) - Event type
      - `actorL1Id` (text, not null) - First level actor (foreign key to User)
      - `actorL2Id` (text, nullable) - Second level actor (foreign key to User)
      - `createdAt` (timestamptz, default now()) - Creation timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated access
*/

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client',
  points INTEGER NOT NULL DEFAULT 0,
  "referralCode" TEXT UNIQUE NOT NULL,
  "referredBy" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create ReferralEvent table
CREATE TABLE IF NOT EXISTS "ReferralEvent" (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  "actorL1Id" TEXT NOT NULL,
  "actorL2Id" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "ReferralEvent_actorL1Id_fkey" FOREIGN KEY ("actorL1Id") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT "ReferralEvent_actorL2Id_fkey" FOREIGN KEY ("actorL2Id") REFERENCES "User"(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "ReferralEvent_actorL1Id_idx" ON "ReferralEvent"("actorL1Id");
CREATE INDEX IF NOT EXISTS "ReferralEvent_actorL2Id_idx" ON "ReferralEvent"("actorL2Id");

-- Enable RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReferralEvent" ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a waitlist without authentication)
CREATE POLICY "Allow public read access to User"
  ON "User" FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to User"
  ON "User" FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to User"
  ON "User" FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to ReferralEvent"
  ON "ReferralEvent" FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to ReferralEvent"
  ON "ReferralEvent" FOR INSERT
  TO public
  WITH CHECK (true);