import "server-only";
import { NextResponse } from "next/server";
import { getCurrentUser } from "./user";
import type { SessionUser } from "./types";

/**
 * Use at the top of every admin route handler. Checks the real role stored in
 * the database, so the dashboard's "View as" preview can never grant or deny
 * access.
 *
 *   const auth = await requireAdmin();
 *   if ("response" in auth) return auth.response;
 */
export async function requireAdmin(): Promise<
  { user: SessionUser } | { response: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      response: NextResponse.json(
        { success: false, message: "Not signed in." },
        { status: 401 }
      ),
    };
  }
  if (user.role !== "admin") {
    return {
      response: NextResponse.json(
        { success: false, message: "Admins only." },
        { status: 403 }
      ),
    };
  }
  return { user };
}

export function serverError(context: string, error: unknown) {
  console.error(`${context}:`, error);
  return NextResponse.json(
    { success: false, message: "Something went wrong. Please try again." },
    { status: 500 }
  );
}
