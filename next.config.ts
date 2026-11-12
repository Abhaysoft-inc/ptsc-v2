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
