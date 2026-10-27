import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "ptsc_session";

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

/** Returns the user id, or null if the token is missing, forged or expired. */
export async function verifySessionToken(token: string) {
  // Read the key outside the try so a missing AUTH_SECRET fails loudly instead
  // of looking like every visitor is signed out.
  const key = secretKey();
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload.sub ? { userId: payload.sub } : null;
  } catch {
    return null;
  }
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
