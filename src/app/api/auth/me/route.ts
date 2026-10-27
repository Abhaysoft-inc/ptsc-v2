import { NextResponse, connection } from "next/server";
import { getCurrentUser } from "@/lib/auth/user";

export async function GET() {
  // The answer depends on the request's cookies, so never prerender this.
  // Doing it before the try/catch matters: Next ends a prerender by rejecting
  // cookies(), and the catch below must not mistake that for a real failure.
  await connection();

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not signed in." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: true, user },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Session lookup failed:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
