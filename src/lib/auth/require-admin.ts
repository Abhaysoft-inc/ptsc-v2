import "server-only";
import { NextResponse } from "next/server";
import { getCurrentUser } from "./user";
import type { SessionUser, UserRole } from "./types";

type AuthResult = { user: SessionUser } | { response: NextResponse };

/**
 * Use at the top of every dashboard API route handler. Checks the real role
 * stored in the database, so the dashboard's "View as" preview can never grant
 * or deny access.
 *
 *   const auth = await requireRole(["admin", "member"]);
 *   if ("response" in auth) return auth.response;
 */
export async function requireRole(roles: UserRole[]): Promise<AuthResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      response: NextResponse.json(
        { success: false, message: "Not signed in." },
        { status: 401 }
      ),
    };
  }
  if (!roles.includes(user.role)) {
    return {
      response: NextResponse.json(
        {
          success: false,
          message:
            roles.length === 1 && roles[0] === "admin"
              ? "Admins only."
              : "You don't have access to this.",
        },
        { status: 403 }
      ),
    };
  }
  return { user };
}

export const requireAdmin = () => requireRole(["admin"]);
/** Admins and members (the club's core team). */
export const requireStaff = () => requireRole(["admin", "member"]);

export function serverError(context: string, error: unknown) {
  console.error(`${context}:`, error);
  return NextResponse.json(
    { success: false, message: "Something went wrong. Please try again." },
    { status: 500 }
  );
}
