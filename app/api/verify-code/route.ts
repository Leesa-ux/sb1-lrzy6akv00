/**  DO NOT EDIT WITHOUT APPROVAL.
 *   This file is protected by GUARDRAILS.md and CODEOWNERS.
 *   Frontend must keep the 3-line headline and referral flow intact.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otpStore';

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

function checkRateLimit(phone: string): boolean {
  const now = Date.now();
  const key = phone;

  if (rateLimitCache.size > 50) {
    cleanupRateLimit();
  }

  const limit = rateLimitCache.get(key);

  if (!limit) {
    rateLimitCache.set(key, { attempts: 1, lastAttempt: now });
    return true;
  }

  if (now - limit.lastAttempt > 5 * 60 * 1000) {
    rateLimitCache.set(key, { attempts: 1, lastAttempt: now });
    return true;
  }

  if (limit.attempts >= 3) {
    return false;
  }

  limit.attempts++;
  limit.lastAttempt = now;
  return true;
}

function sanitizeInput(input: string): string {
  return input.replace(/[^\d+]/g, '').slice(0, 16);
}

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json({ ok: false, error: 'missing' }, { status: 400 });
    }

    const sanitizedPhone = sanitizeInput(phone);
    const sanitizedCode = String(code).trim();

    if (!sanitizedPhone || !sanitizedCode) {
      return NextResponse.json(
        { ok: false, error: 'Téléphone et code requis' },
        { status: 400 }
      );
    }

    if (!checkRateLimit(sanitizedPhone)) {
      return NextResponse.json(
        { ok: false, error: 'Trop de tentatives, réessayez plus tard' },
        { status: 429 }
      );
    }

    const res = verifyOTP(sanitizedPhone, sanitizedCode);
    if (!res.ok) {
      const map: Record<string, number> = { "not-found": 404, "expired": 410, "mismatch": 401 };
      return NextResponse.json(
        { ok: false, error: res.reason },
        { status: map[res.reason] || 400 }
      );
    }

    rateLimitCache.delete(sanitizedPhone);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Verify Code Error:', error);
    return NextResponse.json({ ok: false, error: 'server-error' }, { status: 500 });
  }
}