type SmsRequest = {
  code: string;
  expiresAt: number;
  phoneHash: string;
  normalized: string;
  email: string | null;
  verified: boolean;
  attempts: number;
  createdAt: number;
};

const g = globalThis as unknown as { __SMS_REQUESTS?: Map<string, SmsRequest> };
if (!g.__SMS_REQUESTS) g.__SMS_REQUESTS = new Map();
const store = g.__SMS_REQUESTS;

const g2 = globalThis as unknown as { __PHONE_ACCOUNTS?: Map<string, { email: string; createdAt: number }> };
if (!g2.__PHONE_ACCOUNTS) g2.__PHONE_ACCOUNTS = new Map();
const phoneAccounts = g2.__PHONE_ACCOUNTS;

export function createSmsRequest(data: {
  phoneHash: string;
  normalized: string;
  code: string;
  expiresAt: number;
  email: string | null;
}): { requestId: string } {
  const now = Date.now();
  const requestId = `req_${now}_${Math.random().toString(36).substr(2, 9)}`;
  store.set(requestId, {
    code: data.code,
    expiresAt: data.expiresAt,
    phoneHash: data.phoneHash,
    normalized: data.normalized,
    email: data.email,
    verified: false,
    attempts: 0,
    createdAt: now,
  });
  return { requestId };
}

export function getSmsRequest(requestId: string, phoneHash: string): SmsRequest | null {
  const req = store.get(requestId);
  if (!req || req.phoneHash !== phoneHash) return null;
  return req;
}

export function markRequestVerified(requestId: string): void {
  const req = store.get(requestId);
  if (req) {
    req.verified = true;
  }
}

export function incrementAttempts(requestId: string): void {
  const req = store.get(requestId);
  if (req) {
    req.attempts += 1;
  }
}

export function getAccountByPhoneHash(phoneHash: string): { email: string } | null {
  const account = phoneAccounts.get(phoneHash);
  if (!account) return null;
  return { email: account.email };
}

export function linkPhoneToAccount(phoneHash: string, email: string): void {
  phoneAccounts.set(phoneHash, { email, createdAt: Date.now() });
}

export function cleanupExpired(): void {
  const now = Date.now();
  const maxAge = 5 * 60 * 1000;
  let deleted = 0;

  Array.from(store.entries()).forEach(([key, req]) => {
    if (req.expiresAt < now || (now - req.createdAt) > maxAge) {
      store.delete(key);
      deleted++;
    }
  });

  if (deleted > 0) {
    console.log(`Cleaned up ${deleted} expired SMS requests`);
  }
}

setInterval(cleanupExpired, 2 * 60 * 1000);
