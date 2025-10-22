/**  DO NOT EDIT WITHOUT APPROVAL.
 *   This file is protected by GUARDRAILS.md and CODEOWNERS.
 *   Frontend must keep the 3-line headline and referral flow intact.
 */

import { NextRequest, NextResponse } from 'next/server';
import { normalizePhone, hashPhone, maskEmail, generateSmsCode, maskPhoneForLog } from '@/lib/phone-utils';
import { createSmsRequest, getAccountByPhoneHash } from '@/lib/sms-store';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(identifier);

  if (rateLimitMap.size > 200) {
    Array.from(rateLimitMap.entries()).forEach(([k, v]) => {
      if (now > v.resetTime) {
        rateLimitMap.delete(k);
      }
    });
  }

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (limit.count >= 2) {
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { phone, email, role, ref } = await request.json();

    if (!phone) {
      return NextResponse.json({ ok: false, error: 'phone_required' }, { status: 400 });
    }

    const normalized = normalizePhone(phone);
    if (!normalized) {
      return NextResponse.json(
        { ok: false, error: 'Numéro de téléphone invalide' },
        { status: 400 }
      );
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(`ip:${ip}`)) {
      return NextResponse.json(
        { ok: false, error: 'Trop de tentatives depuis cette adresse IP' },
        { status: 429 }
      );
    }

    if (!checkRateLimit(`phone:${normalized}`)) {
      return NextResponse.json(
        { ok: false, error: 'Trop de tentatives pour ce numéro, veuillez patienter' },
        { status: 429 }
      );
    }

    const phoneHash = hashPhone(normalized);

    const existing = getAccountByPhoneHash(phoneHash);
    const linkedElsewhere = existing && email && existing.email !== email.trim();

    const code = generateSmsCode();
    const ttl = parseInt(process.env.OTP_TTL_SECONDS || '120', 10);
    const expiresAt = Date.now() + ttl * 1000;

    const { requestId } = createSmsRequest({
      phoneHash,
      normalized,
      code,
      expiresAt,
      email: email?.trim() || null,
    });

    const content = `Afroe: ton code de vérification est ${code}. Valable ${Math.floor(ttl / 60)} min.`;

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.warn(`SMS service not configured, dev mode for ${maskPhoneForLog(normalized)}`);
      return NextResponse.json({
        ok: true,
        requestId,
        expiresAt,
        linkedElsewhere: !!linkedElsewhere,
        ownerHint: linkedElsewhere && existing ? maskEmail(existing.email) : undefined,
        devMode: true,
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'transactional',
          sender: process.env.BREVO_SENDER || 'Afroe',
          recipient: normalized,
          content,
          tag: 'afroe-otp',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const t = await res.text().catch(() => '');
        console.error(`Brevo error for ${maskPhoneForLog(normalized)}:`, t);
        return NextResponse.json({ ok: false, error: 'brevo-failed' }, { status: 502 });
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if ((fetchError as Error).name === 'AbortError') {
        console.error(`SMS timeout for ${maskPhoneForLog(normalized)}`);
        return NextResponse.json({ ok: false, error: 'sms-timeout' }, { status: 504 });
      }
      throw fetchError;
    }

    return NextResponse.json({
      ok: true,
      requestId,
      expiresAt,
      linkedElsewhere: !!linkedElsewhere,
      ownerHint: linkedElsewhere && existing ? maskEmail(existing.email) : undefined,
    });
  } catch (e) {
    console.error('Send SMS Error (no phone logged):', e instanceof Error ? e.message : 'Unknown error');
    return NextResponse.json({ ok: false, error: 'server-error' }, { status: 500 });
  }
}
