import "server-only";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { User, type UserDoc } from "@/models/User";
import { SESSION_COOKIE, verifySessionToken } from "./session";
import type { SessionUser } from "./types";

type UserRecord = UserDoc & { _id: { toString(): string } };

export function toSessionUser(user: UserRecord): SessionUser {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
    role: user.role as SessionUser["role"],
    batch: user.batch ?? null,
    post: user.post ?? "",
  };
}

// Every dashboard request checks who you are in the database, which costs a
// round trip (about 80 ms to a hosted database) before any real work starts. A
// signed-in user is remembered here for a few seconds per server instance, so a
// burst of requests, like opening a dashboard tab, pays for it once.
//
// The trade-off: a user who is deleted, un-approved or demoted can keep access
// on an instance for up to CACHE_TTL_MS. Changes made through the dashboard
// forget the user right away (forgetCachedUser), so in practice the delay only
// shows up on *other* instances. Signed-out and unknown users are never cached.
const CACHE_TTL_MS = 10_000;
const CACHE_MAX = 500;

interface CachedUser {
  at: number;
  user: SessionUser;
  passwordChangedAt: number | null;
}
const cache = new Map<string, CachedUser>();

/** Drops a user from the cache, e.g. after their role, approval or password changes. */
export function forgetCachedUser(id: string) {
  cache.delete(id);
}

/** True when a password change happened after this session was issued. */
const isRevoked = (passwordChangedAt: number | null, issuedAt: number) =>
  passwordChangedAt !== null && issuedAt < passwordChangedAt;

/**
 * The signed-in user, or null. Checks the database (at most every few seconds,
 * see above) so a user who was deleted or un-approved loses access quickly, not
 * when their cookie expires.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

  const hit = cache.get(session.userId);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return isRevoked(hit.passwordChangedAt, session.issuedAt) ? null : hit.user;
  }

  await connectDB();
  const user = await User.findById(
    session.userId,
    "firstName lastName email username role status batch post passwordChangedAt"
  ).lean();
  if (!user || user.status !== "approved") {
    cache.delete(session.userId);
    return null;
  }

  const passwordChangedAt = user.passwordChangedAt ? user.passwordChangedAt.getTime() : null;
  // A password change signs out every session started before it.
  if (isRevoked(passwordChangedAt, session.issuedAt)) return null;

  const sessionUser = toSessionUser(user);
  if (cache.size >= CACHE_MAX) cache.clear(); // simple cap; entries are cheap to rebuild
  cache.set(session.userId, { at: Date.now(), user: sessionUser, passwordChangedAt });
  return sessionUser;
}
