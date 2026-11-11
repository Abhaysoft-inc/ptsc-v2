import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { serverError } from "@/lib/auth/require-admin";
import { signupSchema } from "@/lib/auth/validation";
import { parseBody } from "@/lib/server/query";
import { rateLimit } from "@/lib/server/rate-limit";
import { Setting } from "@/models/Setting";
import { User } from "@/models/User";

export async function POST(request: Request) {
  const body = await parseBody(request, signupSchema, "Please fix the highlighted fields.");
  if ("response" in body) return body.response;
  const { password, batch, ...profile } = body.data;

  const limited = await rateLimit(request, {
    name: "signup",
    limit: 20,
    windowSeconds: 60 * 60,
  });
  if (limited) return limited;

  try {
    await connectDB();

    const setting = await Setting.findOne({ key: "allowSignup" }).lean();
    if (setting && !setting.value) {
      return NextResponse.json(
        { success: false, message: "New registrations are currently closed." },
        { status: 403 }
      );
    }

    // Unique indexes are case-sensitive and existing usernames have capitals,
    // so check case-insensitively first ("Abhay123" vs "abhay123").
    const usernameTaken = await User.exists({ username: profile.username })
      .collation({ locale: "en", strength: 2 });
    if (usernameTaken) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this username already exists.",
          errors: { username: "This username is already registered." },
        },
        { status: 409 }
      );
    }

    // role and status are never taken from the request: every signup is a
    // normal, pending account until an admin approves it.
    await User.create({
      ...profile,
      ...(batch != null ? { batch } : {}),
      password: await hashPassword(password),
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Account created. An admin will review it before you can sign in.",
      },
      { status: 201 }
    );
  } catch (error) {
    // The unique indexes are the source of truth for duplicates, so two
    // simultaneous signups can't both succeed.
    if (isDuplicateKeyError(error)) {
      const field = Object.keys(error.keyPattern ?? {})[0];
      const label = field === "username" ? "username" : "email";
      return NextResponse.json(
        {
          success: false,
          message: `An account with this ${label} already exists.`,
          errors: { [label]: `This ${label} is already registered.` },
        },
        { status: 409 }
      );
    }
    return serverError("Signup failed", error);
  }
}

function isDuplicateKeyError(
  error: unknown
): error is { code: 11000; keyPattern?: Record<string, unknown> } {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === 11000
  );
}
