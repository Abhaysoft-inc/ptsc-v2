// Seeds a few real sample blog posts, so the blog isn't empty.
//
//   npm run db:seed-blog                      add or refresh the samples (database in MONGODB_URI)
//   npm run db:seed-blog -- --remove          delete the sample posts again
//   npm run db:seed-blog -- --author a@b.com  attribute them to that account (default: an approved admin)
//   npm run db:seed-blog -- --uri-env MONGODB_PROD_URI --yes
//                                             use another connection string from .env. Writing to anything
//                                             other than MONGODB_URI needs --yes.
//
// Safe to run again: each sample has a seedKey, so it updates the post instead of duplicating it.
// An already published sample keeps its address and publish date. Only samples are touched.
//
// Run with Node's built-in TypeScript support, so imports use .ts extensions.
import { parseArgs } from "node:util";
import mongoose from "mongoose";
import { User } from "../src/models/User.ts";
import { Blog } from "../src/models/Blog.ts";
import { BlogCategory } from "../src/models/BlogCategory.ts";
import { DEFAULT_BLOG_CATEGORIES } from "../src/lib/types/blog.ts";
import { categoryKey, makeExcerpt, readMinutes } from "../src/lib/blog-text.ts";
import { SAMPLE_BLOGS } from "./lib/sample-blogs.ts";

const { values } = parseArgs({
  options: {
    remove: { type: "boolean", default: false },
    author: { type: "string" },
    "uri-env": { type: "string", default: "MONGODB_URI" },
    yes: { type: "boolean", default: false },
  },
});

function fail(message: string): never {
  console.error(`\n${message}\n`);
  process.exit(1);
}

const uriEnv = values["uri-env"] ?? "MONGODB_URI";
const uri = process.env[uriEnv];
if (!uri) fail(`${uriEnv} is not set. Add it to .env.`);
if (uriEnv !== "MONGODB_URI" && !values.yes) {
  fail(`This would write to the database in ${uriEnv}. Run it again with --yes if that is what you want.`);
}

await mongoose.connect(uri);
try {
  const keys = SAMPLE_BLOGS.map((b) => b.seedKey);

  if (values.remove) {
    const result = await Blog.deleteMany({ seedKey: { $in: keys } });
    console.log(`\nRemoved ${result.deletedCount} sample post(s).\n`);
  } else {
    const authorFilter = values.author
      ? { email: values.author.trim().toLowerCase() }
      : { role: "admin" as const, status: "approved" as const };
    const author = await User.findOne(authorFilter, { _id: 1, firstName: 1, lastName: 1 }).sort({ createdAt: 1 });
    if (!author) {
      fail(
        values.author
          ? `No account has the email ${values.author}.`
          : "There is no approved admin to attribute the posts to. Create one first (npm run create-admin) or pass --author."
      );
    }

    // The default categories, so the samples have somewhere to belong.
    await BlogCategory.init();
    for (const name of DEFAULT_BLOG_CATEGORIES) {
      await BlogCategory.updateOne({ key: categoryKey(name) }, { $setOnInsert: { name, key: categoryKey(name) } }, { upsert: true });
    }

    let created = 0;
    let updated = 0;
    for (const sample of SAMPLE_BLOGS) {
      const existing = await Blog.findOne({ seedKey: sample.seedKey });
      const clash = await Blog.exists({ slug: sample.slug, seedKey: { $ne: sample.seedKey } });
      if (clash) fail(`The address "${sample.slug}" is already used by a post that isn't a sample.`);

      const fields = {
        title: sample.title,
        excerpt: sample.excerpt || makeExcerpt(sample.content),
        content: sample.content,
        category: sample.category,
        categoryKey: categoryKey(sample.category),
        tags: sample.tags,
        seoTitle: sample.seoTitle ?? "",
        seoDescription: sample.seoDescription ?? "",
        readMinutes: readMinutes(sample.content),
        featured: Boolean(sample.featured),
      };

      if (existing) {
        // Refresh the content; keep the address, the dates and the author.
        await Blog.updateOne({ _id: existing._id }, { $set: { ...fields, status: "published" } });
        updated += 1;
      } else {
        const publishedAt = new Date(Date.now() - sample.daysAgo * 24 * 60 * 60 * 1000);
        await Blog.create({
          ...fields,
          seedKey: sample.seedKey,
          slug: sample.slug,
          authorId: author._id,
          status: "published",
          submittedAt: publishedAt,
          publishedAt,
          publishedUpdatedAt: publishedAt,
          reviewedBy: author._id,
          reviewedAt: publishedAt,
        });
        created += 1;
      }
    }
    console.log(
      `\nSample posts: ${created} added, ${updated} refreshed. Author: ${author.firstName} ${author.lastName}.\n`
    );
  }
} finally {
  await mongoose.disconnect();
}
