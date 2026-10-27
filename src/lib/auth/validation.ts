import { z } from "zod";

// bcrypt only uses the first 72 bytes, so reject longer passwords instead of
// silently truncating them.
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine(
    (value) => new TextEncoder().encode(value).length <= 72,
    "Password is too long (72 bytes maximum)"
  );

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));

export const signupSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  // Case is kept, matching existing accounts; uniqueness ignores case.
  username: z
    .string()
    .trim()
    .min(6, "Username must be at least 6 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[A-Za-z0-9_.]+$/,
      "Use only letters, numbers, dots and underscores"
    ),
  email,
  // Stored as a 10-digit number like the existing data, so a +91 or leading 0
  // is dropped.
  mobile: z
    .string()
    .transform((value) => value.replace(/[\s-]/g, "").replace(/^(\+?91|0)(?=\d{10}$)/, ""))
    .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"))
    .transform(Number),
  batch: z.number().int().min(2000).max(2100).nullish(),
  password,
});

export const loginSchema = z.object({
  email,
  // No length rules here: a wrong password should look the same as any other.
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

/** First error message per field, for showing next to inputs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}
