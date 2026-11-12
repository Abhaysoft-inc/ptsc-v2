import { NextResponse } from "next/server";
import { clearSessionCookies } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Signed out." });
  clearSessionCookies(response);
  return response;
}
