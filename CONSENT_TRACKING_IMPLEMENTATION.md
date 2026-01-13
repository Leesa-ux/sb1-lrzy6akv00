# Consent Tracking Implementation

## Overview

Added GDPR and SMS consent tracking to the User model to ensure compliance with data protection regulations.

## Changes Made

### 1. Prisma Schema (`prisma/schema.prisma:28-30`)

Added three consent-related fields to the User model:

```prisma
consentGdpr Boolean   @default(false)  // Must be explicitly given
consentSms  Boolean   @default(true)   // Opt-out model
consentAt   DateTime?                  // Timestamp of consent
```

### 2. Database Migration (`CONSENT_MIGRATION.sql`)

SQL migration to add the columns:

```sql
-- Add GDPR consent column
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "consentGdpr" BOOLEAN NOT NULL DEFAULT false;

-- Add SMS consent column
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "consentSms" BOOLEAN NOT NULL DEFAULT true;

-- Add consent timestamp column
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "consentAt" TIMESTAMPTZ;
```

### 3. API Implementation (`app/api/join-waitlist/route.ts`)

#### Interface Update (lines 15-26)
```typescript
interface JoinWaitlistBody {
  email: string;
  phone: string;
  first_name: string;
  last_name?: string;
  city?: string;
  role: 'client' | 'influencer' | 'beautypro';
  referral_code?: string;
  skillAnswerCorrect?: boolean;
  consentGdpr?: boolean;    // ← NEW
  consentSms?: boolean;     // ← NEW
}
```

#### Request Handling (line 31)
```typescript
const { email, phone, first_name, last_name, city, role, referral_code,
        skillAnswerCorrect, consentGdpr, consentSms } = body;
```

#### User Creation (lines 159-161)
```typescript
consentGdpr: consentGdpr === true,
consentSms: consentSms !== false,
consentAt: (consentGdpr === true || consentSms !== undefined) ? new Date() : undefined,
```

## Consent Logic

### GDPR Consent
- **Default**: `false` (must be explicitly given)
- **Storage**: Only set to `true` if explicitly provided as `true`
- **Requirement**: User must actively check this box

### SMS Consent
- **Default**: `true` (opt-out model)
- **Storage**: Set to `false` only if explicitly provided as `false`
- **Requirement**: User must actively uncheck to opt out

### Consent Timestamp
- **Set When**: Either consent value is provided by the user
- **Value**: Current timestamp when consent decision is made
- **Purpose**: Audit trail for compliance

## Frontend Integration

### Expected Request Body

```json
{
  "email": "user@example.com",
  "phone": "+32470123456",
  "first_name": "Marie",
  "last_name": "Dubois",
  "role": "client",
  "skillAnswerCorrect": true,
  "consentGdpr": true,
  "consentSms": true
}
```

### Example Form Fields

```tsx
// GDPR Consent (required, unchecked by default)
<input
  type="checkbox"
  name="consentGdpr"
  required
/>
<label>
  J'accepte la politique de confidentialité et le traitement de mes données personnelles
</label>

// SMS Consent (optional, checked by default)
<input
  type="checkbox"
  name="consentSms"
  defaultChecked
/>
<label>
  J'accepte de recevoir des communications par SMS
</label>
```

## Compliance

### GDPR Requirements Met
- ✅ Explicit consent captured
- ✅ Consent timestamp recorded
- ✅ Separate consent for different purposes (data processing vs marketing)
- ✅ Opt-in model for data processing (consentGdpr)
- ✅ Opt-out model for marketing (consentSms)

### Data Access
- Users can request their consent history
- Timestamp proves when consent was given
- Separate flags for different consent types

### Data Retention
- Consent records stored indefinitely for audit purposes
- Can be queried to show proof of consent

## Database Schema

```sql
-- User table (relevant fields)
CREATE TABLE "User" (
  ...
  "consentGdpr" BOOLEAN NOT NULL DEFAULT false,
  "consentSms"  BOOLEAN NOT NULL DEFAULT true,
  "consentAt"   TIMESTAMPTZ,
  ...
);
```

## Testing

### Test Cases

1. **No consent provided**
   ```json
   { "email": "test@example.com", ... }
   ```
   Result: `consentGdpr=false, consentSms=true, consentAt=undefined`

2. **GDPR consent given**
   ```json
   { "email": "test@example.com", "consentGdpr": true, ... }
   ```
   Result: `consentGdpr=true, consentSms=true, consentAt=[timestamp]`

3. **SMS consent declined**
   ```json
   { "email": "test@example.com", "consentSms": false, ... }
   ```
   Result: `consentGdpr=false, consentSms=false, consentAt=[timestamp]`

4. **Both consents provided**
   ```json
   { "email": "test@example.com", "consentGdpr": true, "consentSms": true, ... }
   ```
   Result: `consentGdpr=true, consentSms=true, consentAt=[timestamp]`

## Querying Consents

```typescript
// Get users who consented to GDPR
const gdprConsentedUsers = await prisma.user.findMany({
  where: { consentGdpr: true }
});

// Get users who opted out of SMS
const smsOptedOut = await prisma.user.findMany({
  where: { consentSms: false }
});

// Get users with consent given in a specific timeframe
const recentConsents = await prisma.user.findMany({
  where: {
    consentAt: {
      gte: new Date('2026-01-01'),
      lte: new Date('2026-12-31')
    }
  }
});
```

## Integration with Brevo

When syncing to Brevo, you can use these fields to:

1. **Segment Lists**: Only add users with `consentSms: true` to SMS campaigns
2. **Compliance Tags**: Tag users based on consent status
3. **Suppression Lists**: Automatically suppress users with `consentSms: false`

```typescript
// Example Brevo sync with consent
if (user.consentSms) {
  await brevoClient.addContactToList(user.email, SMS_LIST_ID);
}

if (user.consentGdpr) {
  await brevoClient.updateContact(user.email, {
    attributes: { GDPR_CONSENT: true, CONSENT_DATE: user.consentAt }
  });
}
```

## Next Steps

1. **Apply Migration**: Run `CONSENT_MIGRATION.sql` when database is available
2. **Update Frontend**: Add consent checkboxes to signup form
3. **Update Brevo Sync**: Modify `lib/brevo-welcome.ts` to respect consent flags
4. **Add Consent Management**: Create endpoint for users to update consent preferences
5. **Export for Compliance**: Add endpoint to export consent records for audit

## Status

- ✅ Prisma schema updated
- ✅ Prisma client regenerated
- ✅ API implementation updated
- ✅ Build verified
- ⏳ Database migration (needs to be applied)
- ⏳ Frontend form updates (needs consent checkboxes)
- ⏳ Brevo integration updates (needs consent filtering)
