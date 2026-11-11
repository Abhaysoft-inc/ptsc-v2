// Kept free of server-only imports so proxy.ts can use it.

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * True for a state-changing request that a browser sent from another website.
 * SameSite=Lax cookies already stop most of these; this closes the rest.
 *
 * Requests with no Origin header (curl, server-to-server, cron) aren't browser
 * form posts, so they can't ride on a visitor's cookie and are let through.
 */
export function isCrossSiteWrite(request: Request) {
  if (SAFE_METHODS.has(request.method)) return false;

  const origin = request.headers.get("origin");
  if (!origin) return false;

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const allowed = new Set<string>();
  if (host) allowed.add(host);
  if (process.env.APP_URL) {
    try {
      allowed.add(new URL(process.env.APP_URL).host);
    } catch {
      // A malformed APP_URL just adds nothing.
    }
  }

  try {
    return !allowed.has(new URL(origin).host);
  } catch {
    return true; // "null" and other unparsable origins
  }
}
