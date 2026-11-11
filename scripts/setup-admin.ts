// Creates the site's first admin from environment variables, so nobody has to
// run a command by hand after deploying. It runs at the end of the Vercel build
// (see the "vercel-build" script in package.json).
//
// Set these in Vercel: Project -> Settings -> Environment Variables:
//
//   ADMIN_EMAIL           required to turn this on
//   ADMIN_PASSWORD        needed when the account doesn't exist yet (min 8 characters)
//   ADMIN_MOBILE          needed when the account doesn't exist yet (10 digits)
//   ADMIN_FIRST_NAME      optional, default "PTSC"
//   ADMIN_LAST_NAME       optional, default "Admin"
//   ADMIN_USERNAME        optional, default made from the email
//   ADMIN_RESET_PASSWORD  set to "true" to replace the password of an existing account
//
// It is safe to run on every deploy:
//   - no account with that email  -> created as an approved admin
//   - account exists, not admin   -> made an approved admin (password untouched)
//   - already an admin            -> nothing happens, the password is NOT reset
//
// By default it only runs for Production deployments on Vercel, so preview
// deployments don't touch the database. To try it from your own machine:
//   node --env-file=.env scripts/setup-admin.ts --force --dry-run
//
// Run with Node's built-in TypeScript support, so imports use .ts extensions.
import { parseArgs } from "node:util";
import mongoose from "mongoose";
import { ensureAdmin, readAdminConfig } from "./lib/ensure-admin.ts";

const { values: flags } = parseArgs({
  options: {
    force: { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
  },
});

const log = (message: string) => console.log(`[setup-admin] ${message}`);
const dryRun = flags["dry-run"];

function fail(problems: string[]): never {
  console.error("[setup-admin] The admin account could not be set up:");
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error("[setup-admin] Fix the environment variables above and deploy again.");
  process.exit(1);
}

// Only production deploys, unless asked otherwise.
if (!flags.force && process.env.VERCEL && process.env.VERCEL_ENV !== "production") {
  log(`Skipped: this is a ${process.env.VERCEL_ENV ?? "non-production"} deployment.`);
  process.exit(0);
}

const parsed = readAdminConfig(process.env);
if (parsed.kind === "skip") {
  log(`Skipped: ${parsed.reason} Set ADMIN_EMAIL (and ADMIN_PASSWORD, ADMIN_MOBILE) to create the admin.`);
  process.exit(0);
}
if (parsed.kind === "error") fail(parsed.problems);

const uri = process.env.MONGODB_URI;
if (!uri) fail(["MONGODB_URI is not set."]);

await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
try {
  const { config } = parsed;
  const result = await ensureAdmin(config, dryRun);
  const prefix = dryRun ? "(dry run) Would have: " : "";

  switch (result.outcome) {
    case "created":
      log(`${prefix}Created the admin ${config.email} (username ${result.username}).`);
      if (!dryRun) {
        log("You can now sign in. ADMIN_PASSWORD is only used to create the account,");
        log("so you can remove it from Vercel's environment variables.");
      }
      break;
    case "updated":
      log(`${prefix}Updated ${config.email}: ${result.changes.join(", ")}.`);
      break;
    case "unchanged":
      log(`${config.email} is already an approved admin. Nothing to do.`);
      break;
    case "failed":
      fail(result.problems);
  }
} finally {
  await mongoose.disconnect();
}
