/**
 * Simple in-memory rate limiter for edge functions
 * Uses a sliding window approach with TTL cleanup
 * 
 * Note: This resets on cold starts but provides protection against abuse
 * For production at scale, consider using Redis/Upstash
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// In-memory store (persists across requests in warm instances)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries(windowMs: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  
  lastCleanup = now;
  const cutoff = now - windowMs;
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.windowStart < cutoff) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Identifier prefix (e.g., function name) */
  keyPrefix: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

/**
 * Get client identifier from request headers
 * Uses X-Forwarded-For, X-Real-IP, or falls back to 'unknown'
 */
export function getClientIdentifier(req: Request): string {
  // Try various headers that might contain the real IP
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }
  
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  // Fallback - not ideal but prevents crashes
  return "unknown-client";
}

/**
 * Check if a request should be rate limited
 */
export function checkRateLimit(
  clientId: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = `${config.keyPrefix}:${clientId}`;
  
  // Periodic cleanup
  cleanupExpiredEntries(config.windowMs);
  
  const entry = rateLimitStore.get(key);
  
  // No entry or window expired - create new entry
  if (!entry || now - entry.windowStart >= config.windowMs) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
      retryAfterSeconds: 0,
    };
  }
  
  // Within window - check count
  if (entry.count >= config.maxRequests) {
    const resetAt = entry.windowStart + config.windowMs;
    const retryAfterSeconds = Math.ceil((resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfterSeconds,
    };
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.windowStart + config.windowMs,
    retryAfterSeconds: 0,
  };
}

/**
 * Create rate limit exceeded response
 */
export function rateLimitResponse(
  result: RateLimitResult,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfterSeconds: result.retryAfterSeconds,
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": String(result.retryAfterSeconds),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.floor(result.resetAt / 1000)),
      },
    }
  );
}

/**
 * Add rate limit headers to a response
 */
export function addRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult,
  maxRequests: number
): void {
  headers.set("X-RateLimit-Limit", String(maxRequests));
  headers.set("X-RateLimit-Remaining", String(result.remaining));
  headers.set("X-RateLimit-Reset", String(Math.floor(result.resetAt / 1000)));
}
