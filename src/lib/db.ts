import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Reuse one connection across hot reloads and warm serverless invocations
// instead of reconnecting on every request.
const globalForMongoose = globalThis as typeof globalThis & {
  _mongooseCache?: MongooseCache;
};
const cache: MongooseCache = (globalForMongoose._mongooseCache ??= {
  conn: null,
  promise: null,
});

export async function connectDB() {
  if (cache.conn) return cache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to .env (see .env.example).");
  }

  cache.promise ??= mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    // Each serverless instance opens its own pool, and many instances can run at
    // once. The default of 100 connections per instance can exhaust a small Atlas
    // plan, which makes everything slow. A page here never needs more than a
    // dozen queries at the same time.
    maxPoolSize: 10,
    // Give connections back when a quiet instance is idle.
    maxIdleTimeMS: 60_000,
  });
  try {
    cache.conn = await cache.promise;
  } catch (error) {
    // Let the next request retry instead of caching the failure forever.
    cache.promise = null;
    throw error;
  }
  return cache.conn;
}
