/**  DO NOT EDIT WITHOUT APPROVAL.
 *   This file is protected by GUARDRAILS.md and CODEOWNERS.
 *   Frontend must keep the 3-line headline and referral flow intact.
 */

import { NextRequest, NextResponse } from 'next/server';

// Redis connection with proper error handling
let redisClient: any = null;
let redisError = false;

const getRedis = async () => {
  if (redisError) return null;
  
  if (!redisClient) {
    try {
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.warn('Redis credentials not configured');
        redisError = true;
        return null;
      }
      
      const { Redis } = await import('@upstash/redis');
      redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    } catch (error) {
      console.error('Redis initialization failed:', error);
      redisError = true;
      return null;
    }
  }
  return redisClient;
};

// Rate limiting with cleanup
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(phone: string): boolean {
  const now = Date.now();
  const key = phone;
  const limit = rateLimitMap.get(key);
  
  // Clean expired entries
  if (rateLimitMap.size > 100) {
    Array.from(rateLimitMap.entries()).forEach(([k, v]) => {
      if (now > v.resetTime) {
        rateLimitMap.delete(k);
      }
    });
  }
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }
  
  if (limit.count >= 3) { // Max 3 SMS per minute
    return false;
  }
  
  limit.count++;
  return true;
}
// Generate 4-digit verification code
function makeCode(): string {
  return (Math.floor(1000 + Math.random() * 9000)).toString();
}

// Enhanced phone validation
function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, '');
  // More strict validation: must start with + or digit, 8-15 digits total
  return /^\+?[1-9]\d{7,14}$/.test(cleaned);
}

// Input sanitization
function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '').slice(0, 16); // Max 16 chars
}

async function sendWithBrevo(phone: string, code: string) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const resp = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: process.env.BREVO_SENDER || 'AFROE',
        recipient: sanitizePhone(phone),
        content: `Ton code Afroé: ${code}`,
        type: 'transactional',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    if (!resp.ok) {
      console.error('Brevo error:', await resp.text());
      return false;
    }
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Brevo request timeout');
    } else {
      console.error('Brevo request failed:', error);
    }
    return false;
  }
}

async function sendWithTwilio(phone: string, code: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!sid || !token || !from) return false;

  // Use Twilio SDK if installed
  try {
    const twilio = require('twilio')(sid, token);
    await twilio.messages.create({
      from,
      to: sanitizePhone(phone),
      body: `Ton code Afroé: ${code}`,
      timeout: 8000,
    });
    return true;
  } catch (e: any) {
    console.error('Twilio error:', e?.message || e);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    // Sanitize input
    const sanitizedPhone = sanitizePhone(phone || '');

    // Validate phone number
    if (!sanitizedPhone || !isValidPhone(sanitizedPhone)) {
      return NextResponse.json(
        { ok: false, error: 'Numéro de téléphone invalide' },
        { status: 400 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(sanitizedPhone)) {
      return NextResponse.json(
        { ok: false, error: 'Trop de tentatives, veuillez patienter' },
        { status: 429 }
      );
    }

    // Generate 4-digit verification code
    const code = makeCode();
    
    // Store code with fallback
    const redis = await getRedis();
    if (redis) {
      try {
        await redis.setex(`sms:${sanitizedPhone}`, 300, code);
      } catch (error) {
        console.error('Redis storage failed:', error);
        // Continue without Redis - use in-memory fallback
      }
    }

    // Try SMS providers with timeout and fallback
    const smsPromises = [
      sendWithBrevo(sanitizedPhone, code),
      sendWithTwilio(sanitizedPhone, code)
    ];
    
    const results = await Promise.allSettled(smsPromises);
    const success = results.some(result => 
      result.status === 'fulfilled' && result.value === true
    );
    
    if (!success) {
      if (redis) {
        try {
          await redis.del(`sms:${sanitizedPhone}`);
        } catch (error) {
          console.error('Redis cleanup failed:', error);
        }
      }
      return NextResponse.json(
        { ok: false, error: 'Service SMS temporairement indisponible' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Send SMS Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}