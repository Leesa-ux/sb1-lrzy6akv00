# Idempotency Key Implementation

## Overview

Added idempotency protection to the ReferralEvent system to prevent duplicate point awards from the same referral action.

## Changes Made

### 1. Prisma Schema (`prisma/schema.prisma`)

Added `idempotencyKey` field to `ReferralEvent` model:

```prisma
model ReferralEvent {
  id             String   @id @default(cuid())
  type           String
  actorL1Id      String   @map("actorL1Id")
  actorL2Id      String?  @map("actorL2Id")
  roleAtSignup   String?
  pointsAwarded  Int      @default(0)
  idempotencyKey String   @unique  // ← NEW: Prevents duplicate events
  createdAt      DateTime @default(now())

  actor1 User  @relation("Referrer", fields: [actorL1Id], references: [id], onDelete: Cascade)
  actor2 User? @relation("Referred", fields: [actorL2Id], references: [id], onDelete: SetNull)

  @@index([actorL1Id])
  @@index([actorL2Id])
  @@index([createdAt])
  @@index([type])
}
```

### 2. Database Migration (`IDEMPOTENCY_KEY_MIGRATION.sql`)

SQL migration to add the column and unique constraint:

```sql
-- Add idempotency key column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ReferralEvent' AND column_name = 'idempotencyKey'
  ) THEN
    ALTER TABLE "ReferralEvent" ADD COLUMN "idempotencyKey" TEXT;
  END IF;
END $$;

-- Create unique index to enforce uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS "ReferralEvent_idempotencyKey_key"
  ON "ReferralEvent"("idempotencyKey");
```

### 3. API Implementation (`app/api/join-waitlist/route.ts:208-221`)

Updated referral event creation to include idempotency key:

```typescript
const idempotencyKey = `${referrer.id}_${newUser.id}_waitlist_signup`;

await prisma.referralEvent.create({
  data: {
    id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    actorL1Id: referrer.id,
    actorL2Id: newUser.id,
    type: 'waitlist_signup',
    roleAtSignup: role,
    pointsAwarded: pointsAwarded,
    idempotencyKey: idempotencyKey,  // ← NEW: Deterministic key
    createdAt: new Date()
  }
});
```

## How It Prevents Double Points

### Idempotency Key Format

```
{referrerId}_{referredUserId}_{eventType}
```

**Example:**
```
user_1234_abcdef_user_5678_ghijkl_waitlist_signup
```

### Protection Mechanism

1. **Unique Constraint**: The database enforces uniqueness on `idempotencyKey`
2. **Deterministic**: Same referral action always generates the same key
3. **Atomic**: If duplicate attempted, database will reject with constraint violation
4. **Race Condition Safe**: Works even with concurrent requests

### Scenarios Protected

#### ✅ Scenario 1: Network Retry
```
Request 1: Create referral event → Success
Request 2: Retry same referral → REJECTED (duplicate key)
```

#### ✅ Scenario 2: Concurrent Requests
```
Thread A: Create event with key "user_A_user_B_waitlist_signup"
Thread B: Create event with same key (simultaneous)
Result: One succeeds, one fails with constraint violation
```

#### ✅ Scenario 3: Manual Replay Attack
```
Attacker: Replay signup request with same referral code
Result: New user creation might succeed, but referral event fails
        (bonus: user creation would also fail due to email/phone uniqueness)
```

## Migration Steps

### For Existing Databases

1. **Apply Migration**:
   ```bash
   # Copy SQL to migrations folder
   cp IDEMPOTENCY_KEY_MIGRATION.sql supabase/migrations/20260113000000_add_idempotency_key.sql

   # Apply via Supabase CLI (if available)
   supabase db push

   # Or apply via Supabase Dashboard
   # Navigate to SQL Editor and run the migration
   ```

2. **Backfill Existing Records** (optional):
   ```sql
   -- Generate idempotency keys for existing records
   UPDATE "ReferralEvent"
   SET "idempotencyKey" = "actorL1Id" || '_' || COALESCE("actorL2Id", 'null') || '_' || type
   WHERE "idempotencyKey" IS NULL;
   ```

3. **Regenerate Prisma Client**:
   ```bash
   npx prisma generate
   ```

4. **Rebuild Application**:
   ```bash
   npm run build
   ```

## Testing

### Test Duplicate Prevention

```typescript
// Attempt 1 - Should succeed
const event1 = await prisma.referralEvent.create({
  data: {
    id: 'test_1',
    actorL1Id: 'user_A',
    actorL2Id: 'user_B',
    type: 'waitlist_signup',
    pointsAwarded: 10,
    idempotencyKey: 'user_A_user_B_waitlist_signup'
  }
});

// Attempt 2 - Should fail with unique constraint violation
try {
  const event2 = await prisma.referralEvent.create({
    data: {
      id: 'test_2',
      actorL1Id: 'user_A',
      actorL2Id: 'user_B',
      type: 'waitlist_signup',
      pointsAwarded: 10,
      idempotencyKey: 'user_A_user_B_waitlist_signup' // ← Same key
    }
  });
} catch (error) {
  console.log('✅ Duplicate prevented:', error.code === 'P2002'); // Unique constraint failed
}
```

## Future Event Types

When adding new event types (e.g., app downloads, validated influencers), use the same pattern:

```typescript
// For app download events
const idempotencyKey = `${referrerId}_${downloadUserId}_app_download`;

// For influencer validation events
const idempotencyKey = `${referrerId}_${influencerId}_validated_influencer`;

// For beauty pro validation events
const idempotencyKey = `${referrerId}_${proId}_validated_pro`;
```

## Benefits

1. **Data Integrity**: Prevents duplicate point awards
2. **Audit Trail**: Idempotency key serves as unique identifier
3. **Race Condition Safe**: Database-level enforcement
4. **Retry Friendly**: Failed requests can be safely retried
5. **Attack Prevention**: Protects against replay attacks

## Status

- ✅ Prisma schema updated
- ✅ Prisma client regenerated
- ✅ API implementation updated
- ✅ Build verified
- ⏳ Database migration (needs to be applied when database is available)
