# API Documentation - Afroé Waitlist

This document provides comprehensive documentation for the new unified API endpoints added to the Afroé waitlist platform.

## Table of Contents

1. [POST /api/join-waitlist](#post-apijoin-waitlist)
2. [GET /api/leaderboard](#get-apileaderboard)
3. [CSV Import Script](#csv-import-script)

---

## POST /api/join-waitlist

Complete user registration endpoint that handles signup, referral tracking, and points calculation in a single request.

### Endpoint

```
POST /api/join-waitlist
```

### Request Body

```typescript
{
  email: string;              // Required - User's email address
  phone: string;              // Required - Phone number (format: +33612345678)
  first_name: string;         // Required - First name
  last_name?: string;         // Optional - Last name
  city?: string;              // Optional - City
  role: 'client' | 'influencer' | 'beautypro';  // Required
  referral_code?: string;     // Optional - Referrer's code
}
```

### Role-Based Points

When a user signs up with a referral code, the referrer earns points based on the new user's role:

- **client**: +2 points
- **influencer**: +15 points
- **beautypro**: +25 points

### Response (Success - 200)

```json
{
  "success": true,
  "user": {
    "id": "user_1234567890_abc123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "client",
    "referralCode": "ABC12345",
    "points": 50,
    "earlyBird": true,
    "createdAt": "2025-12-08T12:00:00.000Z"
  },
  "referralCode": "ABC12345",
  "shareUrl": "https://afroe.com?ref=ABC12345"
}
```

### Response (Error - 400/409/500)

```json
{
  "success": false,
  "error": "Cet email est déjà inscrit"
}
```

### Error Codes

- **400 Bad Request**: Invalid input (email format, phone format, missing fields, invalid role)
- **409 Conflict**: Email or phone already registered
- **500 Internal Server Error**: Server error

### Example Usage (JavaScript)

```javascript
const response = await fetch('/api/join-waitlist', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john.doe@example.com',
    phone: '+33612345678',
    first_name: 'John',
    last_name: 'Doe',
    city: 'Paris',
    role: 'client',
    referral_code: 'ABC12345' // Optional
  }),
});

const data = await response.json();

if (data.success) {
  console.log('User registered!');
  console.log('Share this link:', data.shareUrl);
} else {
  console.error('Error:', data.error);
}
```

### Features

1. **Email Validation**: RFC-compliant email validation
2. **Phone Validation**: International format with 8-16 digits
3. **Duplicate Detection**: Checks both email and phone
4. **Unique Referral Code**: 8-character alphanumeric code
5. **Early Bird Bonus**: First 100 users get +50 points
6. **Fraud Tracking**: IP address and user agent logged
7. **Automatic Points**: Referrer points updated automatically

---

## GET /api/leaderboard

Retrieve the top users sorted by points, with optional role filtering.

### Endpoint

```
GET /api/leaderboard
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `role` | string | No | all | Filter by role: `client`, `influencer`, `beautypro` |
| `limit` | number | No | 50 | Number of results (1-100) |

### Response (Success - 200)

```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "firstName": "Marie",
      "city": "Paris",
      "role": "influencer",
      "referralsCount": 25,
      "points": 180,
      "earlyBird": true
    },
    {
      "rank": 2,
      "firstName": "Lucas",
      "role": "beautypro",
      "referralsCount": 18,
      "points": 150,
      "earlyBird": false
    }
  ],
  "total": 50,
  "filter": "all"
}
```

### Response (Error - 400/500)

```json
{
  "success": false,
  "error": "Filtre de rôle invalide"
}
```

### Sorting Logic

Users are sorted by:
1. **Points** (descending)
2. **Referrals Count** (descending) - tiebreaker
3. **Created At** (ascending) - early signups win ties

### Example Usage (JavaScript)

```javascript
// Get all users
const response = await fetch('/api/leaderboard');
const data = await response.json();

console.log(`Top ${data.total} users:`);
data.leaderboard.forEach(user => {
  console.log(`${user.rank}. ${user.firstName} - ${user.points} pts`);
});

// Get only influencers
const influencers = await fetch('/api/leaderboard?role=influencer');
const influencerData = await influencers.json();

// Get top 10
const top10 = await fetch('/api/leaderboard?limit=10');
const top10Data = await top10.json();
```

### Example Usage (React Component)

```tsx
import { useState, useEffect } from 'react';

function Leaderboard() {
  const [data, setData] = useState(null);
  const [role, setRole] = useState('all');

  useEffect(() => {
    const url = role === 'all'
      ? '/api/leaderboard'
      : `/api/leaderboard?role=${role}`;

    fetch(url)
      .then(res => res.json())
      .then(data => setData(data));
  }, [role]);

  return (
    <div>
      <select onChange={(e) => setRole(e.target.value)}>
        <option value="all">Tous</option>
        <option value="client">Clients</option>
        <option value="influencer">Influenceurs</option>
        <option value="beautypro">Beauty Pros</option>
      </select>

      {data?.leaderboard.map(user => (
        <div key={user.rank}>
          {user.rank}. {user.firstName} - {user.points} pts
        </div>
      ))}
    </div>
  );
}
```

---

## CSV Import Script

Import or update users from a CSV file. Useful for migrating existing leaderboard data.

### CSV Format

Create a `leaderboard.csv` file with these columns (header row required):

```csv
email,referrals_count,points,first_name,last_name,role,city
john.doe@example.com,15,45,John,Doe,client,Paris
marie.dupont@example.com,8,120,Marie,Dupont,influencer,Lyon
```

### Required Columns

- `email` - User's email (unique identifier)
- `referrals_count` - Number of referrals
- `points` - Total points

### Optional Columns

- `first_name` - Defaults to email username
- `last_name` - Defaults to empty
- `role` - Defaults to 'client'
- `city` - Defaults to empty

### Running the Script

```bash
# Import from default location (./leaderboard.csv)
npm run import:leaderboard

# Import from custom path
npm run import:leaderboard path/to/your/file.csv
```

### Script Behavior

- **Existing Users**: Updates `refCount` and `points`
- **New Users**: Creates user with default values
- **Empty Email**: Skips row with warning
- **Invalid Data**: Logs error and continues

### Output Example

```
🚀 Starting leaderboard import...

📋 Found 5 rows in CSV

✅ Updated: john.doe@example.com (45 points, 15 referrals)
✨ Created: marie.dupont@example.com (120 points, 8 referrals)
✅ Updated: alex.martin@example.com (75 points, 3 referrals)
✨ Created: sarah.cohen@example.com (66 points, 22 referrals)
✅ Updated: lucas.bernard@example.com (180 points, 12 referrals)

📊 Import Summary:
   ✨ Created: 2
   ✅ Updated: 3
   ⚠️  Skipped: 0
   ❌ Errors: 0
   📋 Total processed: 5/5

✅ Import completed successfully!
```

### Error Handling

The script:
- Continues on individual row errors
- Logs detailed error messages
- Provides final summary of results
- Exits with code 0 (success) or 1 (failure)

---

## Frontend Components

### WaitlistForm Component

Located at `app/components/WaitlistForm.tsx`

**Features:**
- Auto-detects referral code from URL (`?ref=ABC123`)
- Real-time form validation
- Loading states
- Success screen with shareable link
- Copy-to-clipboard functionality

**Usage:**

```tsx
import WaitlistForm from '@/app/components/WaitlistForm';

function MyPage() {
  return (
    <WaitlistForm
      onSuccess={(data) => {
        console.log('User registered:', data.referralCode);
        console.log('Share URL:', data.shareUrl);
      }}
    />
  );
}
```

### Leaderboard Page

Located at `app/leaderboard/page.tsx`

**Features:**
- Top 50 users by default
- Role filtering (All, Clients, Influencers, Beauty Pros)
- Rank badges for top 3
- Early bird indicators
- Responsive design
- Loading and error states

**Access:**

```
https://your-domain.com/leaderboard
```

---

## Security Considerations

1. **Rate Limiting**: Consider adding rate limiting to prevent abuse
2. **CORS**: Configure CORS policies for production
3. **Input Sanitization**: All inputs are sanitized before database insertion
4. **SQL Injection**: Protected by Prisma's parameterized queries
5. **Email Validation**: RFC-compliant validation prevents invalid emails
6. **Phone Validation**: International format validation

---

## Testing

### Manual Testing

1. **Join Waitlist**:
   ```bash
   curl -X POST http://localhost:3000/api/join-waitlist \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "phone": "+33612345678",
       "first_name": "Test",
       "role": "client"
     }'
   ```

2. **Get Leaderboard**:
   ```bash
   curl http://localhost:3000/api/leaderboard
   ```

3. **Filter by Role**:
   ```bash
   curl http://localhost:3000/api/leaderboard?role=influencer
   ```

### Integration Testing

See existing test files in `/scripts/test-rate-limiter.ts` for reference on writing integration tests.

---

## Migration Notes

If migrating from an existing system:

1. Export existing users to CSV
2. Map columns to required format
3. Run import script: `npm run import:leaderboard`
4. Verify data in leaderboard page
5. Test referral flow with new signups

---

## Support

For questions or issues:
- Check the main README.md
- Review code comments in route files
- Contact the development team

---

**Last Updated**: December 8, 2025
**Version**: 1.0.0
