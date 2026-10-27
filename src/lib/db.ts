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

  cache.promise ??= mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  try {
    cache.conn = await cache.promise;
  } catch (error) {
    // Let the next request retry instead of caching the failure forever.
    cache.promise = null;
    throw error;
  }
  return cache.conn;
}
