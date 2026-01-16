# Database Configuration Fix

## Issue
The waitlist signup is failing with a 500 error because the `DATABASE_URL` in `.env` has a placeholder password instead of the actual database credentials.

## Root Cause
The `.env` file contains `[YOUR-PASSWORD]` instead of your actual Supabase database password. This prevents Prisma from connecting to your Supabase PostgreSQL database.

## Current State
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.rdfmeaoiylvqssxkaxiz.supabase.co:5432/postgres
```

**Error message you're seeing:**
```
Authentication failed against database server at `db.rdfmeaoiylvqssxkaxiz.supabase.co`,
the provided database credentials for `postgres` are not valid.
```

## How to Fix

### Option 1: Get Password from Supabase Dashboard

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project (yubmsrvzzcrubmshflpk)
3. Go to **Settings** → **Database**
4. Under **Connection String**, you'll see:
   - **URI** format (this is what you need for DATABASE_URL)
   - Click on the eye icon to reveal the password
5. Copy the complete connection string
6. Replace the `DATABASE_URL` in your `.env` file

### Option 2: Reset Database Password

If you don't have the original password:

1. Go to Supabase Dashboard → Settings → Database
2. Click **Reset database password**
3. Copy the new password
4. Update `.env` with the new connection string

### Correct Format

Your DATABASE_URL should look like this (with actual password):
```
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD_HERE@db.rdfmeaoiylvqssxkaxiz.supabase.co:5432/postgres
```

## Quick Test

After updating the `.env` file, you can test the database connection:

```bash
npm run test:db
```

This will verify:
- DATABASE_URL is properly configured
- Connection to Supabase can be established
- Tables are accessible
- Basic queries work

## Verification

After updating the `.env` file:

1. Restart your development server (`npm run dev`)
2. Run the database test: `npm run test:db`
3. Try signing up through the waitlist form
4. Check the server logs for any database connection errors
5. Verify data is being inserted in Supabase Dashboard → Table Editor

## Changes Made

The following improvements were made to help diagnose and prevent this issue:

1. **Singleton Database Client**: Updated `join-waitlist` route to use the singleton Prisma client from `lib/db.ts` instead of creating new instances
2. **Environment Variable Validation**: Added runtime check to detect placeholder passwords
3. **Enhanced Error Logging**: Added detailed error logging to help identify database connection issues
4. **Better Error Messages**: Improved error responses to help identify the root cause

## Testing

Once the DATABASE_URL is correctly configured, test with:

```bash
# Make a test signup request
curl -X POST http://localhost:3000/api/join-waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+32470123456",
    "first_name": "Test",
    "role": "client",
    "skillAnswerCorrect": true,
    "consentGdpr": true
  }'
```

Expected response:
```json
{
  "success": true,
  "user": { ... },
  "referralCode": "...",
  "shareUrl": "..."
}
```
