import { NextResponse } from "next/server";
import { clearSessionCookies } from "@/lib/auth/session";

// The dashboard sends people here when their cookie is still validly signed but
// the account is gone or no longer approved. Clearing the cookie before
// landing on /login keeps the proxy (which redirects signed-in users away from
// /login) from sending them straight back to the dashboard.
export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  clearSessionCookies(response);
  return response;
}
