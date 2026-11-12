/**
 * The site's public address with no trailing slash, e.g. "https://ptsc.app".
 * Used for canonical links, share images, the sitemap and the RSS feed.
 * Set APP_URL in production; Vercel's own production URL is the fallback.
 */
export function siteUrl() {
  const configured = process.env.APP_URL?.trim().replace(/\/+$/, "");
  if (configured) return configured;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const SITE_NAME = "Programming and Tech Skills Club";
export const SITE_SHORT_NAME = "PTSC";
