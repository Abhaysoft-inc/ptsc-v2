import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Signed out." });
  response.cookies.set(SESSION_COOKIE, "", sessionCookieOptions(0));
  return response;
}
