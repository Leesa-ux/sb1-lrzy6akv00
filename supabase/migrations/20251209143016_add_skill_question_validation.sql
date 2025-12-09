/*
  # Add Skill Question Validation for Belgian Legal Compliance

  1. Changes
    - Add `skillAnswerCorrect` column to User table to store whether the skill question was answered correctly
    - Default to false for data integrity
    - Required for Belgian contest compliance (Question d'Habileté Légale)

  2. Security
    - No RLS changes needed - uses existing User table policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'User'
    AND column_name = 'skillAnswerCorrect'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "skillAnswerCorrect" boolean DEFAULT false;
  END IF;
END $$;