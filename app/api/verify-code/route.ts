/**  DO NOT EDIT WITHOUT APPROVAL.
 *   This file is protected by GUARDRAILS.md and CODEOWNERS.
 *   Frontend must keep the 3-line headline and referral flow intact.
 */

import { NextRequest, NextResponse } from 'next/server';
import { normalizePhone, hashPhone, maskEmail, maskPhoneForLog } from '@/lib/phone-utils';
import { getSmsRequest, markRequestVerified, incrementAttempts, getAccountByPhoneHash } from '@/lib/sms-store';

const rateLimitCache = new Map<string, { attempts: number; lastAttempt: number }>();

function cleanupRateLimit(): void {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;

  Array.from(rateLimitCache.entries()).forEach(([key, data]) => {
    if (data.lastAttempt < fiveMinutesAgo) {
      rateLimitCache.delete(key);
    }
  });
}

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();

  if (rateLimitCache.size > 100) {
    cleanupRateLimit();
  }

  const limit = rateLimitCache.get(identifier);

  if (!limit) {
    rateLimitCache.set(identifier, { attempts: 1, lastAttempt: now });
    return true;
  }

  if (now - limit.lastAttempt > 5 * 60 * 1000) {
    rateLimitCache.set(identifier, { attempts: 1, lastAttempt: now });
    return true;
  }

  if (limit.attempts >= 5) {
    return false;
  }

  limit.attempts++;
  limit.lastAttempt = now;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { phone, code, requestId } = await request.json();

    if (!phone || !code) {
      return NextResponse.json({ verified: false, error: 'missing' }, { status: 400 });
    }

    const normalized = normalizePhone(phone);
    if (!normalized) {
      return NextResponse.json(
        { verified: false, error: 'Numéro invalide' },
        { status: 400 }
      );
    }

    const phoneHash = hashPhone(normalized);

    if (!checkRateLimit(`verify:${phoneHash}`)) {
      return NextResponse.json(
        { verified: false, error: 'Trop de tentatives, réessayez plus tard' },
        { status: 429 }
      );
    }

    if (!requestId) {
      return NextResponse.json(
        { verified: false, error: 'Request ID manquant' },
        { status: 400 }
      );
    }

    const reqRec = getSmsRequest(requestId, phoneHash);
    if (!reqRec) {
      return NextResponse.json(
        { verified: false, expired: true, error: 'Code non trouvé ou expiré' },
        { status: 404 }
      );
    }

    if (reqRec.expiresAt < Date.now()) {
      return NextResponse.json(
        { verified: false, expired: true, error: 'Code expiré' },
        { status: 410 }
      );
    }

    if (reqRec.attempts >= 5) {
      return NextResponse.json(
        { verified: false, error: 'Trop de tentatives pour ce code' },
        { status: 429 }
      );
    }

    if (reqRec.code !== String(code).trim()) {
      incrementAttempts(requestId);
      console.warn(`Failed verification attempt for ${maskPhoneForLog(normalized)}`);
      return NextResponse.json(
        { verified: false, expired: false, error: 'Code incorrect' },
        { status: 401 }
      );
    }

    markRequestVerified(requestId);

    rateLimitCache.delete(`verify:${phoneHash}`);

    const existing = getAccountByPhoneHash(phoneHash);
    let ownerMatch: 'same' | 'different' | 'none' = 'none';

    if (existing) {
      if (reqRec.email && existing.email === reqRec.email) {
        ownerMatch = 'same';
      } else if (reqRec.email && existing.email !== reqRec.email) {
        ownerMatch = 'different';
        console.warn(`Phone conflict detected: ${maskPhoneForLog(normalized)} linked to different account`);
      } else {
        ownerMatch = 'same';
      }
    }

    return NextResponse.json({
      verified: true,
      ownerMatch,
      ownerHint: existing ? maskEmail(existing.email) : undefined,
    });
  } catch (error) {
    console.error('Verify Code Error (no phone logged):', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ verified: false, error: 'server-error' }, { status: 500 });
  }
}
