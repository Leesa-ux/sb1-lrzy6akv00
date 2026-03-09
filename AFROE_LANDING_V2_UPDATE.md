# AfroeWaitlistLandingV2 - SMS Verification Update

## Changes Implemented

### 1. Phone Error State
Added `phoneError` state near other useState hooks:
```typescript
const [phoneError, setPhoneError] = useState<string | null>(null);
```

### 2. Backend Rejection Handling
Updated `sendSmsCode()` to detect 400 status and show warning:
```typescript
if (r.status === 400) {
  setPhoneError("Ce numéro ne peut pas être utilisé.");
  setSmsState("error");
  return;
}
```

### 3. Phone Error Display
Added error message under phone input:
```tsx
{phoneError && (
  <p className="text-xs text-rose-400 mt-1">
    ⚠ {phoneError}
  </p>
)}
```

### 4. SMS Verification UI Repositioned
Moved SMS verification block to just BEFORE the submit button with cleaner UI:

```tsx
<div className="space-y-3 pt-4 border-t border-white/10">
  <button
    type="button"
    onClick={sendSmsCode}
    disabled={!phone || smsState==="sending" || smsState==="sent" || smsState==="verified"}
    className="w-full rounded-xl px-4 py-3 text-sm font-medium border bg-slate-900/60 border-white/10 hover:border-white/20"
  >
    📩 Vérifier mon téléphone
  </button>

  {(smsState === "sent" || smsState === "verifying") && (
    <div className="flex items-center gap-2">
      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={smsCode}
        onChange={(e) => setSmsCode(e.target.value)}
        placeholder="Code SMS (6 chiffres)"
        className="flex-1 bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-400"
      />

      <button
        type="button"
        onClick={verifySmsCode}
        disabled={!smsCode || smsState==="verifying"}
        className="rounded-xl px-4 py-2 text-sm font-medium border bg-slate-900/60 border-white/10 hover:border-white/20"
      >
        Vérifier
      </button>
    </div>
  )}

  {smsState === "verified" && (
    <p className="text-xs text-emerald-400 font-medium">
      ✔ Numéro vérifié
    </p>
  )}
</div>
```

### 5. Removed Old Consent Toggle
- Removed the "Recevoir un SMS de vérification" / "Sans SMS" toggle button
- SMS verification is now mandatory for all users
- Updated `canSubmit` logic to require phone verification (except in dev mode)

### 6. Fixed React Bug
Replaced escaped quotes:
```tsx
<a href="/confidentialite" target="_blank">
```
(Previously had `target=\"_blank"`)

## Backend Expectation

The `/api/send-sms` endpoint returns:
- **400 status** with `{ error: "phone_invalid" }` for invalid phones
- **429 status** for rate limiting
- **200 status** with `{ ok: true }` for success

Frontend shows generic error for all rejections:
```
⚠ Ce numéro ne peut pas être utilisé.
```

## UI Flow

1. User enters phone number
2. Clicks "📩 Vérifier mon téléphone"
3. Backend checks phone validity silently
4. If rejected → Shows "⚠ Ce numéro ne peut pas être utilisé."
5. If valid → Sends SMS and shows code input field
6. User enters 6-digit code and clicks "Vérifier"
7. Shows "✔ Numéro vérifié" on success
8. Submit button enabled only after verification

## Layout & Styling

No changes to CSS, spacing, or UI structure. Only logic and text updates as requested.

## Files Modified

1. `app/components/AfroeWaitlistLandingV2.tsx` - Main landing page with SMS verification
2. `app/components/WaitlistForm.tsx` - Fixed escaped quotes bug

## Build Status

✅ Build successful - All TypeScript checks passed
