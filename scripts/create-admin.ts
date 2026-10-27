// Creates the first admin, or promotes an existing account to admin.
//
//   npm run create-admin -- --email you@example.com
//       promotes an account that already signed up and approves it
//
//   ADMIN_PASSWORD=... npm run create-admin -- --email you@example.com \
//     --first Abhay --last Sharma --username abhaysharma --mobile 9876543210
//       creates a new approved admin
//
// Run with Node's built-in TypeScript support, so imports use .ts extensions
// and the shared modules avoid path aliases.
import { parseArgs } from "node:util";
import mongoose from "mongoose";
import { User } from "../src/models/User.ts";
import { hashPassword } from "../src/lib/auth/password.ts";
import { signupSchema, fieldErrors } from "../src/lib/auth/validation.ts";

const { values } = parseArgs({
  options: {
    email: { type: "string" },
    first: { type: "string" },
    last: { type: "string" },
    username: { type: "string" },
    mobile: { type: "string" },
    password: { type: "string" },
  },
});

function fail(message: string): never {
  console.error(`\n${message}\n`);
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) fail("MONGODB_URI is not set. Add it to .env (see .env.example).");
if (!values.email) fail("--email is required.");

// Prefer the env var: command-line arguments end up in shell history.
const password = process.env.ADMIN_PASSWORD ?? values.password;

await mongoose.connect(uri);
try {
  await User.init();
  const email = values.email.trim().toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = "admin";
    existing.status = "approved";
    if (password) existing.password = await hashPassword(password);
    await existing.save();
    console.log(`\n${email} is now an approved admin.\n`);
  } else {
    if (!password) {
      fail(
        "No account has that email. To create one, also pass --first, --last, --username, --mobile and set ADMIN_PASSWORD."
      );
    }
    const parsed = signupSchema.safeParse({
      firstName: values.first,
      lastName: values.last,
      username: values.username,
      email,
      mobile: values.mobile,
      password,
    });
    if (!parsed.success) {
      const problems = Object.entries(fieldErrors(parsed.error))
        .map(([field, message]) => `  - ${field}: ${message}`)
        .join("\n");
      fail(`Invalid details:\n${problems}`);
    }

    const { password: plain, batch, ...profile } = parsed.data;
    await User.create({
      ...profile,
      ...(batch != null ? { batch } : {}),
      password: await hashPassword(plain),
      role: "admin",
      status: "approved",
    });
    console.log(`\nCreated approved admin ${email}.\n`);
  }
} finally {
  await mongoose.disconnect();
}
