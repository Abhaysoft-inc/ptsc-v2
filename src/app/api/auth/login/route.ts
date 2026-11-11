import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DUMMY_HASH, verifyPassword } from "@/lib/auth/password";
import { serverError } from "@/lib/auth/require-admin";
import {
  SESSION_COOKIE,
  SESSION_TTL,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { toSessionUser } from "@/lib/auth/user";
import { loginSchema } from "@/lib/auth/validation";
import { parseBody } from "@/lib/server/query";
import { rateLimit } from "@/lib/server/rate-limit";
import { User } from "@/models/User";

export async function POST(request: Request) {
  const body = await parseBody(request, loginSchema, "Enter your email and password.");
  if ("response" in body) return body.response;
  const { email, password, remember } = body.data;

  // Two buckets: one per account (slows guessing a single password) and a
  // looser one per IP (slows spraying many accounts). Campus Wi-Fi shares IPs,
  // so the IP limit is generous.
  const limited = await rateLimit(request, {
    name: "login",
    limit: 10,
    windowSeconds: 15 * 60,
    by: email,
  });
  if (limited) return limited;
  const limitedByIp = await rateLimit(request, {
    name: "login-ip",
    limit: 60,
    windowSeconds: 15 * 60,
  });
  if (limitedByIp) return limitedByIp;

  try {
    await connectDB();
    const user = await User.findOne({ email }).select("+password").lean();

    // Always run one bcrypt comparison, so an unknown email and a wrong
    // password take the same time and return the same message.
    const passwordMatches = await verifyPassword(
      password,
      user?.password ?? DUMMY_HASH
    );
    if (!user || !passwordMatches) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Only reached with the right password, so this doesn't tell strangers
    // which emails have accounts.
    if (user.status !== "approved") {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is waiting for admin approval.",
        },
        { status: 403 }
      );
    }

    const ttl = remember ? SESSION_TTL.remember : SESSION_TTL.short;
    const token = await createSessionToken(user._id.toString(), ttl);

    const response = NextResponse.json({
      success: true,
      message: "Signed in.",
      user: toSessionUser(user),
    });
    response.cookies.set(
      SESSION_COOKIE,
      token,
      sessionCookieOptions(remember ? ttl : undefined)
    );
    return response;
  } catch (error) {
    return serverError("Login failed", error);
  }
}
