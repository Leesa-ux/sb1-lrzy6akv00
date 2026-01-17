# Phone Input Update - Belgian Format

## Summary

Updated the phone input field across all forms to show the full Belgian phone format "+32 471 12 34 56" as the example and enforce strict validation for Belgian mobile numbers.

## Changes Made

### 1. PhoneInputBelgium Component (`components/ui/phone-input-belgium.tsx`)

**Before:**
- Showed fixed "+32" badge
- User only typed digits after +32
- Placeholder: "466 14 18 24"
- Helper text: "Indicatif Belgique +32 inclus automatiquement"

**After:**
- User types full format including "+32"
- Placeholder: "+32 471 12 34 56"
- Label: "Ton téléphone *"
- Helper text: "Format : +32 471 12 34 56"
- Auto-formats as user types with spaces: "+32 XXX XX XX XX"
- Error message: "Numéro invalide. Exemple : +32 471 12 34 56"

**Validation Rules:**
- MUST start with "+32"
- MUST be followed by space and "4" (Belgian mobile numbers)
- Must have exactly 9 digits after "+32" (total 11 digits with prefix)
- Enforces pattern: "+32 4XX XX XX XX"
- Rejects "0471..." format
- Rejects "+32471..." format (missing spaces)

### 2. PhoneInputBelgiumDark Component (`app/components/PhoneInputBelgiumDark.tsx`)

**Before:**
- Same as light version with fixed "+32" badge
- Placeholder: "466 14 18 24"

**After:**
- Same validation and formatting as light version
- Placeholder: "+32 471 12 34 56"
- Helper text: "Format : +32 471 12 34 56"
- Dark theme styling maintained

### 3. AfroeWaitlistLandingV2 Component (`app/components/AfroeWaitlistLandingV2.tsx`)

**Added:**
- Label above phone input: "Ton téléphone *"
- Wrapped PhoneInputBelgiumDark in a div with proper label

### 4. Backend Validation (`lib/validation.ts`)

**Updated `validatePhone` function:**

**Before:**
- Accepted any phone format with 8-16 digits
- Accepted international formats

**After:**
- Strictly enforces Belgian mobile format
- MUST start with "+32"
- MUST have "4" as first digit after prefix
- MUST have exactly 9 digits after "+32"
- Regex: `/^\+324\d{8}$/`
- Error message: "Numéro invalide. Exemple : +32 471 12 34 56"

## User Experience Flow

### Typing Experience

1. **User starts typing:** "+32"
   - Input value: "+32"

2. **User types more digits:** "+32471"
   - Auto-formats to: "+32 471"

3. **User continues:** "+32471123"
   - Auto-formats to: "+32 471 12 3"

4. **User completes:** "+32471123456"
   - Auto-formats to: "+32 471 12 34 56"
   - Validation passes ✅

### Paste Experience

If user pastes:
- "0471123456" → Converted to "+32 471 12 34 56"
- "471123456" → Converted to "+32 471 12 34 56"
- "+32471123456" → Formatted to "+32 471 12 34 56"

### Validation States

**Valid formats:**
- "+32 471 12 34 56" ✅
- "+32 476 12 34 56" ✅
- "+32 488 12 34 56" ✅
- Any Belgian mobile starting with +32 4XX

**Invalid formats:**
- "0471 12 34 56" ❌ (missing +32)
- "+32471123456" ❌ (missing spaces)
- "+32 371 12 34 56" ❌ (doesn't start with 4)
- "+32 471 12 34" ❌ (too short)
- "+32 5XX XX XX XX" ❌ (not a mobile number)

## Database Integration

### Storage Format

Phone numbers are stored in the database WITHOUT spaces:
- Frontend sends: "+32 471 12 34 56"
- Backend `sanitizePhone()` strips spaces: "+32471123456"
- Stored in DB: "+32471123456"

### Compatibility

The backend validation and sanitization work seamlessly:
1. Frontend sends: "+32 471 12 34 56"
2. Backend `validatePhone()` strips spaces and validates format
3. Backend `sanitizePhone()` removes spaces: "+32471123456"
4. Database stores: "+32471123456"

## Key Features

### Auto-Formatting
- Automatically adds spaces as user types
- Maintains "+32" prefix
- Formats as: "+32 XXX XX XX XX"

### Smart Paste Handling
- Detects old format "0471..." and converts
- Detects format without +32 and adds it
- Removes extra digits beyond 11 total

### Validation Feedback
- Real-time validation as user types
- Clear error messages with example
- Red border on invalid input
- Helper text shows expected format

### Accessibility
- Proper label: "Ton téléphone"
- Required field indicator (*)
- `type="tel"` for mobile keyboards
- `inputMode="tel"` for numeric keyboard
- `autoComplete="tel"` for autofill

## Testing Checklist

✅ Input starts empty (no pre-filled value)
✅ Placeholder shows "+32 471 12 34 56"
✅ Auto-formats as user types
✅ Validates Belgian mobile format
✅ Rejects non-mobile numbers (not starting with 4)
✅ Rejects missing spaces
✅ Rejects old "0471..." format
✅ Smart paste handling
✅ Error message matches requirement
✅ Database insert works correctly
✅ Backend validation aligned with frontend
✅ Build succeeds

## Files Modified

1. `components/ui/phone-input-belgium.tsx` - Updated light theme component
2. `app/components/PhoneInputBelgiumDark.tsx` - Updated dark theme component
3. `app/components/AfroeWaitlistLandingV2.tsx` - Added label to phone input
4. `lib/validation.ts` - Updated backend validation to enforce Belgian mobile format

## No Breaking Changes

- Database schema unchanged
- API endpoints unchanged
- Existing phone numbers in DB remain valid
- Form submission flow unchanged
- Only UI and validation updated
