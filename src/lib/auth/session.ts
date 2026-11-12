import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "ptsc_session";
/**
 * A second, harmless cookie the browser's JavaScript can read: "this browser has
 * probably signed in". It holds no secret and grants nothing (the real session is
 * the httpOnly cookie above). It only lets the navbar skip asking the server who is
 * signed in when nobody is, which saves a server call on every page view.
 */
export const SIGNED_IN_HINT = "ptsc_signed_in";
/** The hint outlives any session; a stale one is cleared after one failed check. */
export const HINT_MAX_AGE = 30 * 24 * 60 * 60;

const DAY = 24 * 60 * 60;
/** "Remember me" keeps you signed in for 30 days; otherwise until the browser closes (1 day max). */
export const SESSION_TTL = { remember: 30 * DAY, short: DAY };

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET must be a random string of at least 32 characters (see .env.example)."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(userId: string, ttlSeconds: number) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttlSeconds)
    .sign(secretKey());
}

/**
 * Returns the user id and when the token was issued (ms), or null if the token
 * is missing, forged or expired.
 */
export async function verifySessionToken(token: string) {
  // Read the key outside the try so a missing AUTH_SECRET fails loudly instead
  // of looking like every visitor is signed out.
  const key = secretKey();
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload.sub
      ? { userId: payload.sub, issuedAt: (payload.iat ?? 0) * 1000 }
      : null;
  } catch {
    return null;
  }
}

/** Options for the readable sign-in hint (see SIGNED_IN_HINT). */
export function hintCookieOptions(maxAgeSeconds: number) {
  return { ...sessionCookieOptions(maxAgeSeconds), httpOnly: false };
}

type CookieJar = { cookies: { set(name: string, value: string, options: object): unknown } };

/** Clears the session and the sign-in hint together. */
export function clearSessionCookies(response: CookieJar) {
  response.cookies.set(SESSION_COOKIE, "", sessionCookieOptions(0));
  response.cookies.set(SIGNED_IN_HINT, "", hintCookieOptions(0));
}

export function sessionCookieOptions(maxAgeSeconds?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    // Omitted for a session cookie that ends when the browser closes; 0 deletes
    // the cookie, so check for undefined rather than truthiness.
    ...(maxAgeSeconds !== undefined ? { maxAge: maxAgeSeconds } : {}),
  };
}
