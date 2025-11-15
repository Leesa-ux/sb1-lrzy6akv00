type Entry = { code: string; expiresAt: number; attempts: number };
const g = globalThis as unknown as { __OTP?: Map<string, Entry> };
if (!g.__OTP) g.__OTP = new Map();
const store = g.__OTP;

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function putOTP(phone: string, code: string, ttlSec: number): void {
  const expiresAt = Date.now() + ttlSec * 1000;
  store.set(phone, { code, expiresAt, attempts: 0 });
}

export function verifyOTP(phone: string, code: string): { ok: boolean; reason: string } {
  const e = store.get(phone);
  if (!e) return { ok: false, reason: "not-found" };
  if (Date.now() > e.expiresAt) {
    store.delete(phone);
    return { ok: false, reason: "expired" };
  }
  if (e.attempts >= 3) {
    store.delete(phone);
    return { ok: false, reason: "too-many-attempts" };
  }
  const ok = e.code === code;
  if (ok) {
    store.delete(phone);
    return { ok: true, reason: "ok" };
  } else {
    e.attempts++;
    store.set(phone, e);
    return { ok: false, reason: "mismatch" };
  }
}
