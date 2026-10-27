import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/redirect";

const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

// Optimistic check only: it verifies the cookie's signature and expiry, not
// the database. The dashboard layout and API routes re-check the user against
// the database, which is what actually enforces access. A cookie that passes
// here but belongs to a deleted or un-approved user is cleared by
// /api/auth/session-expired, which stops /login <-> /dashboard bouncing.
export async function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const signedIn = token ? await verifySessionToken(token) : null;

  if (AUTH_PAGES.includes(pathname)) {
    // Already signed in: no reason to see sign in / sign up again.
    if (signedIn) {
      const target = safeNext(searchParams.get("next"));
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  // /dashboard/*
  if (signedIn) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname + search);
  const response = NextResponse.redirect(loginUrl);
  if (token) response.cookies.delete(SESSION_COOKIE); // expired or forged
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/forgot-password"],
};
