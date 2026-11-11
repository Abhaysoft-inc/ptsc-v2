// Backs up the original (Express-era) database and seeds it into the new one.
//
//   npm run db:backup                       read ORIGINAL_DB_URI -> backups/<db>-<time>/
//   npm run db:seed                         dry run: shows what would be added to MONGODB_URI
//   npm run db:seed -- --apply              really adds it
//   npm run db:verify                       compares the backup with MONGODB_URI
//
// Another target, e.g. production (always take a snapshot of it first):
//   npm run db:backup -- --source MONGODB_PROD_URI
//   npm run db:seed   -- --target MONGODB_PROD_URI
//   npm run db:seed   -- --target MONGODB_PROD_URI --apply
//
// Options:
//   --source <ENV>     (backup) which URI to back up (default: ORIGINAL_DB_URI)
//   --target <ENV>     (seed / verify) which URI to write to (default: MONGODB_URI)
//   --from <folder>    which backup to seed from (default: the newest backup of ORIGINAL_DB_URI)
//   --only a,b         only these collections
//   --skip a,b         leave these collections out
//   --apply            (seed) write to the new database. Without it nothing is changed.
//
// Safety:
//   - ORIGINAL_DB_URI is only ever READ. Nothing is written to it.
//   - Seeding ADDS documents that are missing (matched by _id). It never replaces or
//     deletes anything, so work already in the new database is kept.
//   - It refuses to run if both URIs point at the same database.
//   - Every seed writes a log of the ids it inserted, so it can be undone.
//   - Backups contain emails, phone numbers and password hashes. backups/ is git-ignored.
//
// If Node can't resolve your Atlas address (ECONNREFUSED querySrv), set
// DNS_SERVERS=8.8.8.8,1.1.1.1 in the environment.
//
// Run with Node's built-in TypeScript support.
import { createHash } from "node:crypto";
import dns from "node:dns";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import mongoose from "mongoose";

if (process.env.DNS_SERVERS) {
  dns.setServers(process.env.DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean));
}

const { EJSON } = mongoose.mongo.BSON;
const BACKUPS = "backups";
// Never copied: counters that only make sense for the running app.
const ALWAYS_SKIP = new Set(["ratelimits"]);

const { positionals, values: opts } = parseArgs({
  allowPositionals: true,
  options: {
    source: { type: "string" },
    target: { type: "string" },
    from: { type: "string" },
    only: { type: "string" },
    skip: { type: "string" },
    apply: { type: "boolean", default: false },
  },
});
const command = positionals[0];

function fail(message: string): never {
  console.error(`\n${message}\n`);
  process.exit(1);
}

const list = (value?: string) => (value ? value.split(",").map((s) => s.trim()).filter(Boolean) : []);
const only = list(opts.only);
const skip = new Set([...ALWAYS_SKIP, ...list(opts.skip)]);
const wanted = (name: string) =>
  !name.startsWith("system.") && !skip.has(name) && (only.length === 0 || only.includes(name));

// ------------------------------------------------------------ connection ----

type Conn = Awaited<ReturnType<ReturnType<typeof mongoose.createConnection>["asPromise"]>>;

async function connect(envName: string): Promise<Conn> {
  if (!/^[A-Z][A-Z0-9_]*$/.test(envName)) fail(`"${envName}" is not a valid environment variable name.`);
  const uri = process.env[envName];
  if (!uri) fail(`${envName} is not set in .env.`);
  try {
    return await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 20000 }).asPromise();
  } catch (error) {
    fail(`Could not connect with ${envName}: ${(error as Error).message}`);
  }
}

/** "db @ host" for messages. Never includes credentials. */
function describe(conn: Conn) {
  const host = conn.getClient().options.hosts[0];
  return `${conn.db!.databaseName} @ ${host?.host ?? "?"}`;
}

const hostsOf = (conn: Conn) => conn.getClient().options.hosts.map((h) => `${h.host}:${h.port}`);

// ----------------------------------------------------------- BSON helpers ----

/** One document as a string that doesn't depend on key order, ignoring Mongoose's __v. */
function canonical(doc: Record<string, unknown>) {
  const sort = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(sort);
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => [k, sort(v)])
      );
    }
    return value;
  };
  const rest = { ...doc };
  delete rest.__v;
  return JSON.stringify(sort(EJSON.serialize(rest, { relaxed: false })));
}

const sha256 = (text: string) => createHash("sha256").update(text).digest("hex");

// ---------------------------------------------------------------- backup ----

async function backup() {
  const sourceEnv = opts.source ?? "ORIGINAL_DB_URI";
  const src = await connect(sourceEnv);
  try {
    const db = src.db!;
    const names = (await db.listCollections({}, { nameOnly: true }).toArray())
      .map((c) => c.name)
      .filter(wanted)
      .sort();

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dir = path.join(BACKUPS, `${db.databaseName}-${stamp}`);
    await mkdir(dir, { recursive: true });

    console.log(`Backing up ${describe(src)} from ${sourceEnv} (read-only) -> ${dir}\n`);
    const collections: Record<string, { count: number; sha256: string }> = {};
    for (const name of names) {
      const docs = await db.collection(name).find({}).toArray();
      const text = EJSON.stringify(docs, { relaxed: false }, 2);
      await writeFile(path.join(dir, `${name}.json`), text);
      collections[name] = { count: docs.length, sha256: sha256(text) };
      console.log(`  ${name.padEnd(22)} ${String(docs.length).padStart(6)} documents`);
    }

    await writeFile(
      path.join(dir, "manifest.json"),
      JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          sourceEnv,
          source: { database: db.databaseName, hosts: hostsOf(src) },
          collections,
        },
        null,
        2
      )
    );
    console.log(`\nDone. Backup saved in ${dir}`);
    if (sourceEnv === "ORIGINAL_DB_URI") {
      console.log(`Next: npm run db:seed        (dry run), then npm run db:seed -- --apply`);
    }
  } finally {
    await src.close();
  }
}

// ------------------------------------------------------------------ plan ----

interface Manifest {
  createdAt?: string;
  /** Which variable the backup was read from. Older backups have none; they came from ORIGINAL_DB_URI. */
  sourceEnv?: string;
  source: { database: string; hosts: string[] };
  collections: Record<string, { count: number; sha256: string }>;
}

/** The newest backup of ORIGINAL_DB_URI. Snapshots of other databases (e.g. production) are never picked. */
async function latestBackup() {
  const entries = await readdir(BACKUPS).catch(() => [] as string[]);
  const found: { dir: string; at: string }[] = [];
  for (const entry of entries) {
    try {
      const manifest: Manifest = JSON.parse(
        await readFile(path.join(BACKUPS, entry, "manifest.json"), "utf8")
      );
      if ((manifest.sourceEnv ?? "ORIGINAL_DB_URI") === "ORIGINAL_DB_URI") {
        found.push({ dir: path.join(BACKUPS, entry), at: manifest.createdAt ?? entry });
      }
    } catch {
      // Not a backup folder.
    }
  }
  found.sort((a, b) => a.at.localeCompare(b.at));
  if (found.length === 0) fail("No backup of ORIGINAL_DB_URI found. Run `npm run db:backup` first.");
  return found[found.length - 1].dir;
}

interface CollectionPlan {
  name: string;
  docs: Record<string, unknown>[];
  missing: Record<string, unknown>[];
  present: number;
  differing: number;
}

/** Reads a backup, checks it is intact, and works out what the target is missing. */
async function plan(dir: string, target: Conn) {
  const manifest: Manifest = JSON.parse(await readFile(path.join(dir, "manifest.json"), "utf8"));

  // The backup must not come from the database we are about to write to.
  const sameDb = manifest.source.database === target.db!.databaseName;
  const sameHost = hostsOf(target).some((h) => manifest.source.hosts.includes(h));
  if (sameDb && sameHost) {
    fail("The backup came from the same database as MONGODB_URI. Refusing to continue.");
  }

  const plans: CollectionPlan[] = [];
  for (const [name, info] of Object.entries(manifest.collections)) {
    if (!wanted(name)) continue;
    const text = await readFile(path.join(dir, `${name}.json`), "utf8");
    if (sha256(text) !== info.sha256) fail(`${name}.json doesn't match its checksum. The backup is damaged.`);
    const docs = EJSON.parse(text) as Record<string, unknown>[];

    const col = target.db!.collection(name);
    const existing = new Map<string, Record<string, unknown>>();
    for (let i = 0; i < docs.length; i += 1000) {
      const ids = docs.slice(i, i + 1000).map((d) => d._id);
      for (const found of await col.find({ _id: { $in: ids } } as never).toArray()) {
        existing.set(String(found._id), found as Record<string, unknown>);
      }
    }

    const missing = docs.filter((d) => !existing.has(String(d._id)));
    const differing = docs.filter((d) => {
      const there = existing.get(String(d._id));
      return there && canonical(there) !== canonical(d);
    }).length;
    plans.push({ name, docs, missing, present: docs.length - missing.length, differing });
  }
  const merged = await mergeExistingAccounts(plans, target);
  return { manifest, plans, merged };
}

// Documents that point at a user by _id.
const USER_REFERENCES: Record<string, string[]> = {
  profiles: ["userId"],
  events: ["completedBy"],
  media: ["UploadedBy"],
};

/**
 * A person can already have an account in the target with a different _id, for example
 * an admin created by hand before the migration. Adding the old copy would clash on its
 * unique email, so it is not added. Instead, anything in the backup that pointed at the
 * old account (their profile, events they completed) is pointed at the existing one.
 * Returns old _id -> existing _id for the accounts that were merged this way.
 */
async function mergeExistingAccounts(plans: CollectionPlan[], target: Conn) {
  const users = plans.find((p) => p.name === "users");
  const merged = new Map<string, { to: unknown; from: unknown }>();
  if (!users || users.missing.length === 0) return merged;

  const emails = users.missing.map((u) => u.email).filter(Boolean);
  const names = users.missing.map((u) => u.username).filter(Boolean);
  const existing = await target
    .db!.collection("users")
    .find({ $or: [{ email: { $in: emails } }, { username: { $in: names } }] } as never, {
      collation: { locale: "en", strength: 2 },
    })
    .toArray();
  if (existing.length === 0) return merged;

  const same = (a: unknown, b: unknown) => String(a ?? "").toLowerCase() === String(b ?? "").toLowerCase();
  users.missing = users.missing.filter((u) => {
    const match = existing.find((e) => same(e.email, u.email) || same(e.username, u.username));
    if (!match) return true;
    merged.set(String(u._id), { from: u._id, to: match._id });
    return false;
  });

  for (const p of plans) {
    for (const field of USER_REFERENCES[p.name] ?? []) {
      for (const doc of p.missing) {
        const hit = doc[field] != null ? merged.get(String(doc[field])) : undefined;
        if (hit) doc[field] = hit.to;
      }
    }
  }
  return merged;
}

function printPlan(plans: CollectionPlan[]) {
  console.log(
    `  ${"collection".padEnd(20)} ${"backup".padStart(7)} ${"in new db".padStart(10)} ${"missing".padStart(8)} ${"differ".padStart(7)}`
  );
  for (const p of plans) {
    console.log(
      `  ${p.name.padEnd(20)} ${String(p.docs.length).padStart(7)} ${String(p.present).padStart(10)} ${String(p.missing.length).padStart(8)} ${String(p.differing).padStart(7)}`
    );
  }
}

// ------------------------------------------------------------ seed/verify ----

async function seedOrVerify(verifyOnly: boolean) {
  const dir = opts.from ?? (await latestBackup());
  const targetEnv = opts.target ?? "MONGODB_URI";
  if (targetEnv === "ORIGINAL_DB_URI") fail("ORIGINAL_DB_URI can never be a target. It is only ever read.");
  const target = await connect(targetEnv);
  try {
    console.log(`Backup:  ${dir}`);
    const local = hostsOf(target).every((h) => /^(127\.0\.0\.1|localhost|\[?::1\]?)(:|$)/.test(h));
    console.log(`Target:  ${describe(target)}  (${targetEnv}${local ? ", local" : ", NOT local"})`);
    if (target.db!.databaseName === "test") {
      console.log('Warning: the target database is named "test". Is the database name missing from the URI?');
    }
    console.log();

    const { plans, merged } = await plan(dir, target);
    printPlan(plans);
    console.log(
      `\n  missing = in the backup but not in the new database (matched by _id)\n  differ  = in both, but with different contents (left as they are)\n`
    );
    if (merged.size > 0) {
      console.log(
        `  ${merged.size} account(s) in the backup already exist in the target under another _id (same email or username).`
      );
      console.log(
        "  They are not added again; their profile and event references are pointed at the existing account.\n"
      );
    }

    const toAdd = plans.reduce((n, p) => n + p.missing.length, 0);
    if (verifyOnly) {
      console.log(toAdd === 0 ? "Everything in the backup is already in the new database." : `${toAdd} documents from the backup are not in the new database yet.`);
      return;
    }
    if (toAdd === 0) {
      console.log("Nothing to add.");
      return;
    }
    if (!opts.apply) {
      console.log(`Dry run: ${toAdd} documents would be added. Nothing was changed.`);
      console.log("Add --apply to write them.");
      return;
    }

    // ---- Apply: insert only what is missing, in batches. Duplicate-key clashes
    // (e.g. an email already used by another account) are skipped and reported.
    const log: Record<string, string[]> = {};
    const clashes: Record<string, Record<string, string[]>> = {};
    for (const p of plans) {
      if (p.missing.length === 0) continue;
      const col = target.db!.collection(p.name);
      log[p.name] = [];

      for (let i = 0; i < p.missing.length; i += 500) {
        const batch = p.missing.slice(i, i + 500);
        try {
          await col.insertMany(batch as never[], { ordered: false });
        } catch (error) {
          const errors = (error as { writeErrors?: unknown }).writeErrors;
          const writeErrors = (Array.isArray(errors) ? errors : errors ? [errors] : []) as {
            code: number;
            index: number;
            errmsg?: string;
          }[];
          // Anything other than a duplicate-key clash is a real problem.
          if (writeErrors.length === 0 || writeErrors.some((e) => e.code !== 11000)) throw error;
          for (const e of writeErrors) {
            const index = /index: (\S+)/.exec(e.errmsg ?? "")?.[1] ?? "unique index";
            ((clashes[p.name] ??= {})[index] ??= []).push(String(batch[e.index]._id));
          }
        }
        // Record exactly which of this batch ended up in the database.
        const ids = batch.map((d) => d._id);
        const inserted = await col.find({ _id: { $in: ids } } as never, { projection: { _id: 1 } }).toArray();
        log[p.name].push(...inserted.map((d) => String(d._id)));
      }
      console.log(`  ${p.name.padEnd(20)} added ${String(log[p.name].length).padStart(5)} of ${p.missing.length}`);
    }

    const logFile = path.join(dir, `seed-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    await writeFile(
      logFile,
      JSON.stringify(
        {
          target: describe(target),
          insertedIds: log,
          skippedClashes: clashes,
          // old _id -> the existing account it was merged into
          mergedAccounts: Object.fromEntries([...merged].map(([from, v]) => [from, String(v.to)])),
        },
        null,
        2
      )
    );

    const skipped = Object.entries(clashes);
    if (skipped.length) {
      console.log("\nSkipped because of a unique-index clash with data already in the new database:");
      for (const [name, byIndex] of skipped) {
        for (const [index, ids] of Object.entries(byIndex)) {
          console.log(`  ${name}: ${ids.length} (${index}), e.g. _id ${ids.slice(0, 3).join(", ")}`);
        }
      }
    }
    console.log(`\nDone. Log of inserted ids: ${logFile}`);
  } finally {
    await target.close();
  }
}

// ------------------------------------------------------------------- main ----

if (command === "backup") await backup();
else if (command === "seed") await seedOrVerify(false);
else if (command === "verify") await seedOrVerify(true);
else fail("Usage: migrate-data.ts <backup | seed | verify> [--from <folder>] [--only a,b] [--skip a,b] [--apply]");
