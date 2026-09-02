import { NextResponse, type NextRequest } from "next/server";

// ─── In-memory rate limiter ────────────────────────────────────────────
// Uses a sliding window per IP+route. Suitable for single-server or
// single-instance deployments. For multi-instance, replace with
// Upstash Redis (@upstash/ratelimit) or Cloudflare Workers KV.

type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds to prevent memory leaks.
let lastCleanup = Date.now();
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetTime) store.delete(key);
  }
}

type RateLimitConfig = {
  // Maximum requests allowed in the window.
  limit: number;
  // Window duration in milliseconds.
  windowMs: number;
};

// Preset configs for different route types.
export const RATE_LIMITS = {
  // Public form submissions — 5 per minute per IP.
  newsletter: { limit: 5, windowMs: 60_000 },
  // AI chat — 10 per minute per IP.
  chat: { limit: 10, windowMs: 60_000 },
  // Audit tool — 3 per minute per IP (calls external PageSpeed API).
  audit: { limit: 3, windowMs: 60_000 },
  // Contact form — 3 per minute per IP.
  contact: { limit: 3, windowMs: 60_000 },
  // Upload — 10 per minute per admin.
  upload: { limit: 10, windowMs: 60_000 },
  // Media CRUD — 20 per minute per admin.
  media: { limit: 20, windowMs: 60_000 },
} as const satisfies Record<string, RateLimitConfig>;

/**
 * Checks if the current request exceeds the rate limit.
 * Returns null if allowed, or a 429 NextResponse if rate-limited.
 *
 * Usage:
 *   const limited = checkRateLimit(request, RATE_LIMITS.chat);
 *   if (limited) return limited;
 */
export function checkRateLimit(
  request: NextRequest | Request,
  config: RateLimitConfig
): NextResponse | null {
  cleanup();

  // Get client IP — check Vercel/Cloudflare headers first, then fall back.
  const headers = request.headers;
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "unknown";

  const route = new URL(request.url).pathname;
  const key = `${ip}:${route}`;
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    // First request or window expired — start fresh.
    store.set(key, { count: 1, resetTime: now + config.windowMs });
    return null;
  }

  entry.count++;

  if (entry.count > config.limit) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "Cache-Control": "no-store",
        },
      }
    );
  }

  return null;
}
