import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { getBlogIndex } from "@/lib/server/public-blogs";
import { getEventSitemapEntries } from "@/lib/server/public-events";

const STATIC_PAGES = [
  { path: "", priority: 1 },
  { path: "/what-we-do", priority: 0.8 },
  { path: "/events", priority: 0.8 },
  { path: "/blogs", priority: 0.8 },
  { path: "/projects", priority: 0.7 },
  { path: "/team", priority: 0.6 },
  { path: "/community", priority: 0.6 },
  { path: "/privacy", priority: 0.2 },
  { path: "/terms", priority: 0.2 },
];

// Lists the pages worth indexing. A database failure still returns the static pages.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [blogs, events] = await Promise.all([
    getBlogIndex().catch((error) => {
      console.error("Sitemap: loading blog posts failed:", error);
      return [];
    }),
    getEventSitemapEntries().catch((error) => {
      console.error("Sitemap: loading events failed:", error);
      return [];
    }),
  ]);

  return [
    ...STATIC_PAGES.map((p) => ({ url: `${base}${p.path}`, priority: p.priority })),
    ...blogs.map((b) => ({
      url: `${base}/blogs/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...events.map((e) => ({
      url: `${base}/events/${e.id}`,
      lastModified: e.date,
      priority: 0.6,
    })),
  ];
}
