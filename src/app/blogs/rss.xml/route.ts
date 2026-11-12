import { getBlogIndex } from "@/lib/server/public-blogs";
import { SITE_NAME, siteUrl } from "@/lib/site";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// GET /blogs/rss.xml — the latest posts as an RSS feed.
export async function GET() {
  const base = siteUrl();
  const posts = (await getBlogIndex(50)).slice(0, 50);

  const items = posts
    .map(
      (p) => `    <item>
      <title>${escape(p.title)}</title>
      <link>${base}/blogs/${p.slug}</link>
      <guid isPermaLink="true">${base}/blogs/${p.slug}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <category>${escape(p.category)}</category>
      <dc:creator>${escape(p.authorName)}</dc:creator>
      <description>${escape(p.excerpt)}</description>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escape(SITE_NAME)} blog</title>
    <link>${base}/blogs</link>
    <description>Tutorials, engineering write-ups and campus stories from the students of ${escape(SITE_NAME)}.</description>
    <language>en</language>
    <atom:link href="${base}/blogs/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=600, stale-while-revalidate=3600",
    },
  });
}
