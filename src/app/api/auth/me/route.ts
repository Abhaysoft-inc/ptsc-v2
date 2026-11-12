import { NextResponse, connection } from "next/server";
import { getCurrentUser } from "@/lib/auth/user";
import { HINT_MAX_AGE, SIGNED_IN_HINT, hintCookieOptions } from "@/lib/auth/session";

export async function GET() {
  // The answer depends on the request's cookies, so never prerender this.
  // Doing it before the try/catch matters: Next ends a prerender by rejecting
  // cookies(), and the catch below must not mistake that for a real failure.
  await connection();

  try {
    const user = await getCurrentUser();
    if (!user) {
      const response = NextResponse.json(
        { success: false, message: "Not signed in." },
        { status: 401 }
      );
      // The navbar only asks when the hint says "signed in"; a wrong hint is dropped.
      response.cookies.set(SIGNED_IN_HINT, "", hintCookieOptions(0));
      return response;
    }
    const response = NextResponse.json(
      { success: true, user },
      { headers: { "Cache-Control": "no-store" } }
    );
    // Also sets the hint for sessions started before the hint existed.
    response.cookies.set(SIGNED_IN_HINT, "1", hintCookieOptions(HINT_MAX_AGE));
    return response;
  } catch (error) {
    console.error("Session lookup failed:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
