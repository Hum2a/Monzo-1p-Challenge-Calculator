/**
 * Simple in-memory rate limiter for API routes.
 * For production at scale, use Upstash Redis or Cloudflare rate limiting.
 * Limits: 10 requests per 60 seconds per IP for /api/save and /api/saved.
 */

const store = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

function getClientId(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function rateLimit(request: Request): { ok: boolean; remaining: number } {
  const id = getClientId(request);
  const now = Date.now();
  const entry = store.get(id);

  if (!entry) {
    store.set(id, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: MAX_REQUESTS - 1 };
  }

  if (now > entry.resetAt) {
    store.set(id, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: MAX_REQUESTS - 1 };
  }

  entry.count++;
  const remaining = Math.max(0, MAX_REQUESTS - entry.count);
  return { ok: entry.count <= MAX_REQUESTS, remaining };
}

// Cleanup stale entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store.entries()) {
      if (now > v.resetAt) store.delete(k);
    }
  }, 60_000);
}
