import "server-only";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { RateLimit } from "@/models/RateLimit";

/** Best-effort client IP behind a proxy. */
export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

interface Options {
  /** Bucket name, e.g. "login". */
  name: string;
  /** Allowed requests per window. */
  limit: number;
  windowSeconds: number;
  /** What to count by. Defaults to the client IP. */
  by?: string;
}

/**
 * Counts this request against a bucket. Returns a 429 response when the limit
 * is exceeded, otherwise null.
 *
 *   const limited = await rateLimit(request, { name: "login", limit: 10, windowSeconds: 900 });
 *   if (limited) return limited;
 *
 * If the database can't be reached the request is let through: a counter outage
 * shouldn't lock everyone out of the site.
 */
export async function rateLimit(request: Request, options: Options) {
  const key = `${options.name}:${options.by ?? clientIp(request)}`;
  const now = new Date();
  const windowEnd = new Date(now.getTime() + options.windowSeconds * 1000);

  try {
    await connectDB();
    // One atomic update: start a new window if the old one has ended, otherwise
    // add one. Two requests at the same instant can't both read the old count.
    const update = [
      {
        $set: {
          count: {
            $cond: [{ $gt: ["$resetAt", now] }, { $add: ["$count", 1] }, 1],
          },
          resetAt: { $cond: [{ $gt: ["$resetAt", now] }, "$resetAt", windowEnd] },
        },
      },
    ];
    const run = () =>
      RateLimit.findOneAndUpdate({ key }, update, {
        upsert: true,
        returnDocument: "after",
        // Mongoose refuses an array (pipeline) update unless this is set.
        updatePipeline: true,
      }).lean();

    let bucket;
    try {
      bucket = await run();
    } catch (error) {
      // Two first-ever requests can both try to create the bucket; the loser
      // hits the unique index and simply retries.
      if ((error as { code?: number }).code !== 11000) throw error;
      bucket = await run();
    }

    if (bucket && bucket.count > options.limit) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt.getTime() - now.getTime()) / 1000));
      return NextResponse.json(
        { success: false, message: "Too many attempts. Please wait a bit and try again." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }
  } catch (error) {
    console.error("Rate limit check failed:", error);
  }
  return null;
}
