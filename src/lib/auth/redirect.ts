/**
 * Where to go after signing in. Only same-site paths are allowed, so a crafted
 * `?next=https://evil.example` or `?next=//evil.example` can't bounce people
 * to another site.
 */
export function safeNext(raw: string | null, fallback = "/dashboard") {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return fallback;
  }
  return raw;
}
