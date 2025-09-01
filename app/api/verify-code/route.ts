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

// Enhanced rate limiting with automatic cleanup
const rateLimitCache = new Map<string, { attempts: number; lastAttempt: number }>();

// Cleanup function to prevent memory leaks
function cleanupRateLimit() {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  
  for (const [key, data] of rateLimitCache.entries()) {
    if (data.lastAttempt < fiveMinutesAgo) {
      rateLimitCache.delete(key);
    }
  }
}

function checkRateLimit(phone: string): boolean {
  const now = Date.now();
  const key = phone;
  
  // Periodic cleanup
  if (rateLimitCache.size > 50) {
    cleanupRateLimit();
  }
  
  const limit = rateLimitCache.get(key);
  
  if (!limit) {
    rateLimitCache.set(key, { attempts: 1, lastAttempt: now });
    return true;
  }
  
  // Reset if more than 5 minutes passed
  if (now - limit.lastAttempt > 5 * 60 * 1000) {
    rateLimitCache.set(key, { attempts: 1, lastAttempt: now });
    return true;
  }
  
  // Allow max 3 attempts per 5 minutes (more strict)
  if (limit.attempts >= 3) {
    return false;
  }
  
  limit.attempts++;
  limit.lastAttempt = now;
  return true;
}

// Input sanitization
function sanitizeInput(input: string): string {
  return input.replace(/[^\d+]/g, '').slice(0, 16);
}

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    // Sanitize inputs
    const sanitizedPhone = sanitizeInput(phone || '');
    const sanitizedCode = (code || '').replace(/\D/g, '').slice(0, 4);

    // Validate inputs
    if (!sanitizedPhone || !sanitizedCode || sanitizedCode.length !== 4) {
      return NextResponse.json(
        { ok: false, error: 'Téléphone et code à 4 chiffres requis' },
        { status: 400 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(sanitizedPhone)) {
      return NextResponse.json(
        { ok: false, error: 'Trop de tentatives, réessayez plus tard' },
        { status: 429 }
      );
    }

    // Check verification code with fallback
    const redis = await getRedis();
    let storedCode = null;
    
    if (redis) {
      try {
        storedCode = await Promise.race([
          redis.get(`sms:${sanitizedPhone}`),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Redis timeout')), 2000)
          )
        ]);
      } catch (error) {
        console.error('Redis get failed:', error);
        // Continue without Redis verification in development
        if (process.env.NODE_ENV === 'development') {
          storedCode = sanitizedCode; // Allow any code in dev
        }
      }
    } else if (process.env.NODE_ENV === 'development') {
      // Development fallback
      storedCode = sanitizedCode;
    }
    
    if (!storedCode) {
      return NextResponse.json(
        { ok: false, error: 'Code non trouvé ou expiré' },
        { status: 400 }
      );
    }

    // Verify code
    if (storedCode !== sanitizedCode) {
      return NextResponse.json(
        { ok: false, error: 'Code incorrect' },
        { status: 400 }
      );
    }

    // Code is valid, remove it from storage
    if (redis) {
      try {
        await redis.del(`sms:${sanitizedPhone}`);
      } catch (error) {
        console.error('Redis cleanup failed:', error);
      }
    }
    
    // Clear rate limit on successful verification
    rateLimitCache.delete(sanitizedPhone);

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Verify Code Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}