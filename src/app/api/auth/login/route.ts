import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DUMMY_HASH, verifyPassword } from "@/lib/auth/password";
import {
  SESSION_COOKIE,
  SESSION_TTL,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { toSessionUser } from "@/lib/auth/user";
import { fieldErrors, loginSchema } from "@/lib/auth/validation";
import { User } from "@/models/User";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Enter your email and password.",
        errors: fieldErrors(parsed.error),
      },
      { status: 400 }
    );
  }
  const { email, password, remember } = parsed.data;

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
    console.error("Login failed:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
