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

/**
 * The signed-in user, or null. Checks the database on every call so a user who
 * was deleted or un-approved loses access immediately, not when their cookie
 * expires.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

  await connectDB();
  const user = await User.findById(session.userId).lean();
  if (!user || user.status !== "approved") return null;

  return toSessionUser(user);
}
