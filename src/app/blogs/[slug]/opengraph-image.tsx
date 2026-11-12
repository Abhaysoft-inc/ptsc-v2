import { ImageResponse } from "next/og";
import { getPublicBlog } from "@/lib/server/public-blogs";
import { SITE_SHORT_NAME } from "@/lib/site";

export const alt = "PTSC blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The share card for a post: its title, category and author on the site's dark background.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getPublicBlog(slug);
  const post = result.kind === "post" ? result.post : null;
  const title = post?.title ?? "PTSC blog";
  const size1 = title.length > 90 ? 48 : title.length > 55 ? 58 : 70;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#080809",
          color: "#ffffff",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, color: "#34d399", letterSpacing: 2 }}>
          {`~/${SITE_SHORT_NAME.toLowerCase()}/blog${post ? ` · ${post.category.toLowerCase()}` : ""}`}
        </div>
        <div style={{ display: "flex", fontSize: size1, fontWeight: 700, lineHeight: 1.12, letterSpacing: -1.5 }}>
          {title}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "#a3a3a3" }}>
          <span>{post ? `${post.author.name} · ${post.readMinutes} min read` : "Programming and Tech Skills Club"}</span>
          <span style={{ color: "#ffffff", fontWeight: 700 }}>{SITE_SHORT_NAME}</span>
        </div>
      </div>
    ),
    size
  );
}
