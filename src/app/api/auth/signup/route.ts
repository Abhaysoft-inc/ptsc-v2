import { connectDB } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { fieldErrors, signupSchema } from "@/lib/auth/validation";
import { Setting } from "@/models/Setting";
import { User } from "@/models/User";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        message: "Please fix the highlighted fields.",
        errors: fieldErrors(parsed.error),
      },
      { status: 400 }
    );
  }
  const { password, batch, ...profile } = parsed.data;

  try {
    await connectDB();
    // Make sure the unique indexes exist before relying on them below.
    await User.init();

    const setting = await Setting.findOne({ key: "allowSignup" }).lean();
    if (setting && !setting.value) {
      return Response.json(
        { success: false, message: "New registrations are currently closed." },
        { status: 403 }
      );
    }

    // Unique indexes are case-sensitive and existing usernames have capitals,
    // so check case-insensitively first ("Abhay123" vs "abhay123").
    const usernameTaken = await User.exists({ username: profile.username })
      .collation({ locale: "en", strength: 2 });
    if (usernameTaken) {
      return Response.json(
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

    return Response.json(
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
      return Response.json(
        {
          success: false,
          message: `An account with this ${label} already exists.`,
          errors: { [label]: `This ${label} is already registered.` },
        },
        { status: 409 }
      );
    }
    console.error("Signup failed:", error);
    return Response.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
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
