// Centralized rate limiting with automatic cleanup

interface RateLimitEntry {
  attempts: number;
  resetTime: number;
  lastAttempt: number;
}

class RateLimiter {
  private cache = new Map<string, RateLimitEntry>();
  private maxCacheSize: number;
  private windowMs: number;
  private maxAttempts: number;

  constructor(maxAttempts: number, windowMs: number, maxCacheSize = 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.maxCacheSize = maxCacheSize;
  }

  check(identifier: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    
    // Cleanup if cache is getting too large
    if (this.cache.size > this.maxCacheSize) {
      this.cleanup(now);
    }
    
    const entry = this.cache.get(identifier);
    
    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      this.cache.set(identifier, {
        attempts: 1,
        resetTime: now + this.windowMs,
        lastAttempt: now,
      });
      return { allowed: true };
    }
    
    if (entry.attempts >= this.maxAttempts) {
      return { allowed: false, resetTime: entry.resetTime };
    }
    
    entry.attempts++;
    entry.lastAttempt = now;
    return { allowed: true };
  }

  reset(identifier: string): void {
    this.cache.delete(identifier);
  }

  private cleanup(now: number): void {
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.resetTime) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): { cacheSize: number; maxCacheSize: number } {
    return {
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize,
    };
  }
}

// Pre-configured rate limiters
export const smsRateLimiter = new RateLimiter(3, 60 * 1000); // 3 attempts per minute
export const verificationRateLimiter = new RateLimiter(5, 5 * 60 * 1000); // 5 attempts per 5 minutes
export const submissionRateLimiter = new RateLimiter(3, 60 * 60 * 1000); // 3 submissions per hour