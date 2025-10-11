type Entry = { code: string; expiresAt: number };
const g = globalThis as unknown as { __OTP?: Map<string, Entry> };
if (!g.__OTP) g.__OTP = new Map();
const store = g.__OTP;

export function putOTP(phone: string, code: string, ttlSec: number): void {
  const expiresAt = Date.now() + ttlSec * 1000;
  store.set(phone, { code, expiresAt });
}

export function verifyOTP(phone: string, code: string): { ok: boolean; reason: string } {
  const e = store.get(phone);
  if (!e) return { ok: false, reason: "not-found" };
  if (Date.now() > e.expiresAt) {
    store.delete(phone);
    return { ok: false, reason: "expired" };
  }
  const ok = e.code === code;
  if (ok) store.delete(phone);
  return { ok, reason: ok ? "ok" : "mismatch" };
}
