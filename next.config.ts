import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  cacheLife: {
    // Public blog reads. Posts only change when a reviewer approves, edits, unpublishes
    // or deletes one, and each of those expires the "blogs" tag straight away, so the
    // cached copy can safely live long: the database is asked at most once an hour
    // per page (in the background), however many people visit.
    blogs: {
      stale: 300, // browsers reuse a page for 5 minutes
      revalidate: 3600, // refreshed in the background at most once an hour
      expire: 604800, // dropped after a week with no visits
    },
  },
  images: {
    // Our own files (/public) are resized by Next's optimizer: smaller formats, and the
    // optimized copy is kept for 31 days instead of the default few hours. Cloudinary
    // images skip it and come from Cloudinary's CDN (see src/components/ui/cloud-image.tsx).
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
  // List pages keep their public addresses (/blogs?category=tutorial&page=2 and so on),
  // but anything with a query string would otherwise have to run a server function on
  // every visit. These rewrites, applied by the CDN's router before any function runs,
  // send each address to a route that can be built ahead of time. Only free-text
  // searches (?q, ?tag) still go to routes rendered on request.
  async rewrites() {
    const page = { type: "query" as const, key: "page", value: "(?<page>[1-9][0-9]{0,3})" };
    const category = { type: "query" as const, key: "category", value: "(?<category>[a-z0-9-]{1,40})" };
    const search = [
      { type: "query" as const, key: "q" },
      { type: "query" as const, key: "tag" },
    ];
    return {
      beforeFiles: [
        // Blog: searches first, then category + page, category, page.
        ...search.map((has) => ({ source: "/blogs", has: [has], destination: "/blogs/search" })),
        { source: "/blogs", has: [category, page], destination: "/blogs/list/:category/:page" },
        { source: "/blogs", has: [category], destination: "/blogs/list/:category/1" },
        { source: "/blogs", has: [page], destination: "/blogs/list/all/:page" },
        // Events: pages.
        { source: "/events", has: [page], destination: "/events/list/:page" },
        // Projects: a technology filter, then pages.
        { source: "/projects", has: [{ type: "query" as const, key: "tag" }], destination: "/projects/search" },
        { source: "/projects", has: [page], destination: "/projects/list/:page" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
