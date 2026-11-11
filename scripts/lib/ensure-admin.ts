// The logic behind scripts/setup-admin.ts: turn environment variables into an
// approved admin account. Kept apart from the script so it can be tested.
//
// Run with Node's built-in TypeScript support, so imports use .ts extensions
// and the shared modules avoid path aliases.
import { User } from "../../src/models/User.ts";
import { hashPassword } from "../../src/lib/auth/password.ts";
import { signupSchema, fieldErrors } from "../../src/lib/auth/validation.ts";

export interface AdminConfig {
  email: string;
  password?: string;
  /** Replace the password of an account that already exists. */
  resetPassword: boolean;
  firstName: string;
  lastName: string;
  username?: string;
  mobile?: string;
}

export type ConfigResult =
  | { kind: "skip"; reason: string }
  | { kind: "error"; problems: string[] }
  | { kind: "ok"; config: AdminConfig };

const clean = (value: string | undefined) => value?.trim() || undefined;

/**
 * Reads ADMIN_EMAIL and friends. Without ADMIN_EMAIL the setup is simply not
 * configured, which isn't an error. Anything wrong with what *is* set is.
 */
export function readAdminConfig(env: Record<string, string | undefined>): ConfigResult {
  const email = clean(env.ADMIN_EMAIL)?.toLowerCase();
  if (!email) return { kind: "skip", reason: "ADMIN_EMAIL is not set." };

  const problems: string[] = [];
  if (!signupSchema.shape.email.safeParse(email).success) {
    problems.push("ADMIN_EMAIL is not a valid email address.");
  }

  const password = env.ADMIN_PASSWORD ? env.ADMIN_PASSWORD : undefined; // not trimmed: spaces count
  if (password !== undefined) {
    const result = signupSchema.shape.password.safeParse(password);
    if (!result.success) problems.push(`ADMIN_PASSWORD: ${result.error.issues[0]?.message}.`);
  }

  const resetPassword = clean(env.ADMIN_RESET_PASSWORD)?.toLowerCase() === "true";
  if (resetPassword && password === undefined) {
    problems.push("ADMIN_RESET_PASSWORD is true, but ADMIN_PASSWORD is not set.");
  }

  const mobile = clean(env.ADMIN_MOBILE);
  if (mobile !== undefined && !signupSchema.shape.mobile.safeParse(mobile).success) {
    problems.push("ADMIN_MOBILE must be a 10-digit mobile number.");
  }

  const username = clean(env.ADMIN_USERNAME);
  if (username !== undefined && !signupSchema.shape.username.safeParse(username).success) {
    problems.push(
      "ADMIN_USERNAME must be 6-30 characters: letters, numbers, dots and underscores."
    );
  }

  if (problems.length) return { kind: "error", problems };

  return {
    kind: "ok",
    config: {
      email,
      password,
      resetPassword,
      firstName: clean(env.ADMIN_FIRST_NAME) ?? "PTSC",
      lastName: clean(env.ADMIN_LAST_NAME) ?? "Admin",
      username,
      mobile,
    },
  };
}

/** A username from the email's first half, e.g. "abhay.sharma@x.com" -> "abhay.sharma". */
export function usernameFromEmail(email: string) {
  let name = email.split("@")[0].replace(/[^A-Za-z0-9_.]/g, "");
  if (name.length < 6) name = `${name}_admin`;
  return name.slice(0, 30);
}

export type EnsureResult =
  | { outcome: "created"; username: string }
  | { outcome: "updated"; changes: string[] }
  | { outcome: "unchanged" }
  | { outcome: "failed"; problems: string[] };

/**
 * Makes sure an approved admin with this email exists. Safe to run on every
 * deploy: an account that's already set up is left alone, and its password is
 * only replaced when `resetPassword` is on. Needs an open mongoose connection.
 * With `dryRun`, reports what it would do without writing anything.
 */
export async function ensureAdmin(config: AdminConfig, dryRun = false): Promise<EnsureResult> {
  // Makes sure the unique indexes exist before an account is created.
  if (!dryRun) await User.init();

  const existing = await User.findOne({ email: config.email }, "role status").lean();

  if (existing) {
    const changes: string[] = [];
    const set: Record<string, unknown> = {};
    if (existing.role !== "admin") {
      set.role = "admin";
      changes.push("made an admin");
    }
    if (existing.status !== "approved") {
      set.status = "approved";
      changes.push("approved");
    }
    if (config.resetPassword && config.password) {
      set.password = await hashPassword(config.password);
      // Signs out every session started before now.
      set.passwordChangedAt = new Date();
      changes.push("password reset");
    }
    if (changes.length === 0) return { outcome: "unchanged" };

    if (!dryRun) await User.updateOne({ _id: existing._id }, { $set: set });
    return { outcome: "updated", changes };
  }

  // A new account needs a password and a mobile number (there's no safe default).
  const missing: string[] = [];
  if (!config.password) missing.push("ADMIN_PASSWORD");
  if (!config.mobile) missing.push("ADMIN_MOBILE");
  if (missing.length) {
    return {
      outcome: "failed",
      problems: [
        `No account exists for ${config.email}, so one has to be created, which needs ${missing.join(" and ")}.`,
      ],
    };
  }

  const username = config.username ?? usernameFromEmail(config.email);
  const parsed = signupSchema.safeParse({
    firstName: config.firstName,
    lastName: config.lastName,
    username,
    email: config.email,
    mobile: config.mobile,
    password: config.password,
  });
  if (!parsed.success) {
    return {
      outcome: "failed",
      problems: Object.entries(fieldErrors(parsed.error)).map(([field, msg]) => `${field}: ${msg}`),
    };
  }

  // Usernames are unique ignoring case, though the index itself is case-sensitive.
  const taken = await User.exists({ username: parsed.data.username }).collation({
    locale: "en",
    strength: 2,
  });
  if (taken) {
    return {
      outcome: "failed",
      problems: [`The username "${username}" is taken. Set ADMIN_USERNAME to a different one.`],
    };
  }

  if (!dryRun) {
    const { firstName, lastName, username: name, email, mobile, password } = parsed.data;
    await User.create({
      firstName,
      lastName,
      username: name,
      email,
      mobile,
      password: await hashPassword(password),
      role: "admin",
      status: "approved",
    });
  }
  return { outcome: "created", username: parsed.data.username };
}
