# Brevo SMS Integration Setup Guide

## Overview

This project uses Brevo (formerly Sendinblue) for SMS verification with OTP codes. The integration is fully functional and ready to use.

## Environment Variables

Add these to your `.env.local` file:

```env
# Brevo SMS Configuration
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER=Afroe
OTP_TTL_SECONDS=120

# Google Sheets (optional)
GOOGLE_SHEETS_WEBHOOK_URL=your_google_apps_script_webapp_url
```

### Getting Your Brevo API Key

1. Go to [Brevo Dashboard](https://app.brevo.com)
2. Navigate to **Settings** → **SMTP & API** → **API Keys**
3. Create a new API key or copy an existing one
4. Paste it in your `.env.local` file

### Sender Name Requirements

- **Length**: 3-11 alphanumeric characters
- **Format**: No spaces or special characters
- **Example**: `Afroe`, `AFROE`, `Afroe01`
- **Note**: Some countries require sender name approval

## How It Works

### 1. OTP Storage (`lib/otpStore.ts`)

- In-memory storage for development
- Stores OTP codes with expiration timestamps
- Automatically cleans up expired codes
- Thread-safe for concurrent requests

```typescript
putOTP(phone, code, ttlSeconds)  // Store OTP
verifyOTP(phone, code)           // Verify and consume OTP
```

### 2. Send SMS Endpoint (`/api/send-sms`)

**Request:**
```json
{
  "phone": "+32471234567",
  "email": "user@example.com",
  "role": "client",
  "ref": "optional-referral-code"
}
```

**Features:**
- Generates 6-digit random OTP code
- Rate limiting: 1 SMS per minute per phone
- Phone validation (E.164 format)
- Sends via Brevo SMS API
- Stores OTP with 2-minute TTL

**Response:**
```json
{ "ok": true }
```

### 3. Verify Code Endpoint (`/api/verify-code`)

**Request:**
```json
{
  "phone": "+32471234567",
  "code": "123456"
}
```

**Features:**
- Rate limiting: 3 attempts per 5 minutes
- Validates OTP from memory store
- Returns specific error reasons (not-found, expired, mismatch)
- Clears OTP after successful verification

**Response:**
```json
{ "ok": true }
```

## Frontend Integration

The `AfroeAlternativeLanding` component already integrates with these endpoints:

### SMS Flow

1. User enters phone number
2. Clicks "Recevoir code"
3. → Calls `/api/send-sms`
4. User receives SMS with 6-digit code
5. User enters code in UI
6. Clicks "Vérifier"
7. → Calls `/api/verify-code`
8. If verified, enables form submission

### Dev Mode

Add `?dev=1` to the URL to skip SMS verification during development:

```
http://localhost:3001?dev=1
```

## Phone Number Format

**Required format**: E.164 international format

✅ Valid:
- `+32471234567` (Belgium)
- `+33612345678` (France)
- `+14155551234` (USA)

❌ Invalid:
- `0471234567` (missing country code)
- `471234567` (missing +)
- `+32 471 23 45 67` (spaces - will be sanitized)

## Rate Limiting

### Send SMS
- **Limit**: 1 SMS per minute per phone number
- **Window**: 60 seconds
- **Status**: 429 Too Many Requests

### Verify Code
- **Limit**: 3 attempts per 5 minutes per phone
- **Window**: 5 minutes
- **Auto-cleanup**: Removes expired entries when cache > 50

## Error Handling

### Send SMS Errors
- `phone-required` (400): Missing phone number
- `Numéro de téléphone invalide` (400): Invalid format
- `Trop de tentatives` (429): Rate limit exceeded
- `SMS service not configured` (503): Missing BREVO_API_KEY
- `brevo-failed` (502): Brevo API error

### Verify Code Errors
- `missing` (400): Missing phone or code
- `not-found` (404): Code not found in store
- `expired` (410): Code expired (> 2 minutes)
- `mismatch` (401): Code doesn't match
- `Trop de tentatives` (429): Too many verification attempts

## Testing

### 1. Local Development

```bash
npm run dev
```

Visit `http://localhost:3001` and test the SMS flow.

### 2. Test with Real SMS

1. Configure `.env.local` with real Brevo credentials
2. Enter a valid phone number with country code
3. Check your phone for the SMS
4. Enter the 6-digit code within 2 minutes

### 3. Test Rate Limiting

Try sending multiple SMS requests within 1 minute - should see rate limit error.

## Production Considerations

### 1. Upgrade OTP Storage

For production, replace in-memory storage with Redis:

```typescript
// lib/otpStore.ts - Production version
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export function putOTP(phone: string, code: string, ttlSec: number) {
  return redis.setex(`otp:${phone}`, ttlSec, code);
}

export async function verifyOTP(phone: string, code: string) {
  const stored = await redis.get(`otp:${phone}`);
  if (!stored) return { ok: false, reason: 'not-found' };
  const ok = stored === code;
  if (ok) await redis.del(`otp:${phone}`);
  return { ok, reason: ok ? 'ok' : 'mismatch' };
}
```

### 2. Monitor SMS Usage

Brevo provides analytics dashboard:
- Track SMS delivery rates
- Monitor API usage
- Set up usage alerts
- Review monthly costs

### 3. Sender Name Approval

Some countries require approval for sender names. Check Brevo documentation for your target countries.

### 4. Add Logging

Consider adding structured logging for:
- SMS sent count
- Verification success/failure rates
- Rate limit hits
- API errors

## Troubleshooting

### "SMS service not configured"

**Cause**: Missing or invalid `BREVO_API_KEY`

**Fix**:
1. Check `.env.local` exists
2. Verify API key is valid
3. Restart dev server after adding env vars

### "Brevo API returns 401"

**Cause**: Invalid API key

**Fix**: Generate new API key from Brevo dashboard

### "Sender name rejected"

**Cause**: Sender name doesn't meet requirements

**Fix**:
- Use 3-11 alphanumeric characters
- No spaces or special characters
- Some countries require approval

### "Code not found or expired"

**Cause**: Code expired (> 2 minutes) or server restarted

**Fix**:
- Request new code
- In production, use Redis for persistence

## Security Notes

1. **Never log OTP codes** in production
2. **Rate limiting** is essential to prevent abuse
3. **Phone validation** prevents injection attacks
4. **TTL enforcement** limits exposure window
5. **One-time use** codes are consumed after verification

## API Reference

### POST /api/send-sms

Sends SMS with OTP code to phone number.

**Request Body:**
```typescript
{
  phone: string;      // E.164 format required
  email?: string;     // Optional
  role?: string;      // Optional
  ref?: string;       // Optional referral code
}
```

**Success Response (200):**
```json
{ "ok": true }
```

**Error Responses:**
- 400: Invalid phone format
- 429: Rate limit exceeded
- 502: Brevo API error
- 503: Service not configured

### POST /api/verify-code

Verifies OTP code for phone number.

**Request Body:**
```typescript
{
  phone: string;  // Same format used in send-sms
  code: string;   // 6-digit code from SMS
}
```

**Success Response (200):**
```json
{ "ok": true }
```

**Error Responses:**
- 400: Missing parameters
- 401: Code mismatch
- 404: Code not found
- 410: Code expired
- 429: Too many attempts

## Support

For Brevo-specific issues:
- Documentation: https://developers.brevo.com/docs/transactional-sms-api
- Support: https://help.brevo.com

For integration issues:
- Check server logs for error details
- Verify environment variables
- Test with `?dev=1` to isolate SMS issues
