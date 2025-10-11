/**  DO NOT EDIT WITHOUT APPROVAL.
 *   This file is protected by GUARDRAILS.md and CODEOWNERS.
 *   Frontend must keep the 3-line headline and referral flow intact.
 */

import { NextRequest, NextResponse } from 'next/server';
import { putOTP } from '@/lib/otpStore';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(phone: string): boolean {
  const now = Date.now();
  const key = phone;
  const limit = rateLimitMap.get(key);

  if (rateLimitMap.size > 100) {
    Array.from(rateLimitMap.entries()).forEach(([k, v]) => {
      if (now > v.resetTime) {
        rateLimitMap.delete(k);
      }
    });
  }

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (limit.count >= 1) {
    return false;
  }

  limit.count++;
  return true;
}

function randCode(n = 6): string {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");
}

function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, '');
  return /^\+?[1-9]\d{7,14}$/.test(cleaned);
}

function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '').slice(0, 16);
}

export async function POST(request: NextRequest) {
  try {
    const { phone, email, role, ref } = await request.json();

    if (!phone) {
      return NextResponse.json({ ok: false, error: 'phone-required' }, { status: 400 });
    }

    const sanitizedPhone = sanitizePhone(phone);

    if (!isValidPhone(sanitizedPhone)) {
      return NextResponse.json(
        { ok: false, error: 'Numéro de téléphone invalide' },
        { status: 400 }
      );
    }

    if (!checkRateLimit(sanitizedPhone)) {
      return NextResponse.json(
        { ok: false, error: 'Trop de tentatives, veuillez patienter' },
        { status: 429 }
      );
    }

    const code = randCode(6);
    const ttl = parseInt(process.env.OTP_TTL_SECONDS || "120", 10);
    putOTP(sanitizedPhone, code, ttl);

    const content = `Afroe: ton code de vérification est ${code}. Valable ${Math.floor(ttl / 60)} min.`;

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: 'SMS service not configured' },
        { status: 503 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch("https://api.brevo.com/v3/transactionalSMS/sms", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "transactional",
        sender: process.env.BREVO_SENDER || "Afroe",
        recipient: sanitizedPhone,
        content,
        tag: "afroe-otp",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error('Brevo error:', t);
      return NextResponse.json({ ok: false, error: "brevo-failed", detail: t }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Send SMS Error:', e);
    return NextResponse.json({ ok: false, error: "server-error" }, { status: 500 });
  }
}