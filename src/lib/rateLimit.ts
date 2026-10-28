// ============================================================================
// OPPORTUNITY RADAR & PITCH ENGINE — API RATE LIMITER
// Document Reference: docs/04-TRD.md & Security Guardrails
// ============================================================================

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipCache = new Map<string, RateLimitRecord>();

// Clean up stale IP records every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of ipCache.entries()) {
      if (now > value.resetAt) {
        ipCache.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

/**
 * Checks and increments rate limit for an identifier (e.g. client IP).
 * Returns { success: true } if allowed, or { success: false, retryAfterSeconds: number } if blocked.
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 15, windowMs: 60 * 1000 }
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const existing = ipCache.get(identifier);

  if (!existing || now > existing.resetAt) {
    ipCache.set(identifier, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return {
      allowed: true,
      remaining: options.limit - 1,
      retryAfterSeconds: 0,
    };
  }

  if (existing.count >= options.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: options.limit - existing.count,
    retryAfterSeconds: 0,
  };
}
