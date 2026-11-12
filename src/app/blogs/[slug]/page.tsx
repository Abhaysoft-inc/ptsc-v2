import Link from "next/link";
import Image from "@/components/ui/cloud-image";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SitePage from "@/components/site/SitePage";
import Markdown from "@/components/blog/Markdown";
import BlogCard, { formatDate } from "@/components/blog/BlogCard";
import JsonLd from "@/components/seo/JsonLd";
import { getBlogIndex, getPublicBlog } from "@/lib/server/public-blogs";
import { SITE_NAME, siteUrl } from "@/lib/site";
import { extractHeadings, makeExcerpt } from "@/lib/blog-text";

export const instant = false;

type Props = { params: Promise<{ slug: string }> };

// Every published post is built ahead of time and served from the CDN; a post
// published later is built on its first visit. Approving, editing or removing a post
// rebuilds it (the "blogs" cache tag).
export async function generateStaticParams() {
  try {
    const posts = await getBlogIndex();
    // At least one is required; a placeholder that 404s is fine when there are none.
    return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: "no-posts-yet" }];
  } catch (error) {
    console.error("Blog posts: couldn't read the posts to prebuild:", error);
    return [{ slug: "no-posts-yet" }];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicBlog(slug);
  if (result.kind !== "post") return { robots: { index: false } };

  const { post } = result;
  const title = post.seoTitle || post.title;
  const description =
    post.seoDescription || post.excerpt || makeExcerpt(post.content, 155);
  const url = `/blogs/${post.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    keywords: post.tags,
    authors: [{ name: post.author.name }],
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: SITE_NAME,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      section: post.category,
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  // Looked up before anything streams, so a missing post is a real 404 and a renamed one a real redirect.
  const result = await getPublicBlog(slug);
  if (result.kind === "moved") permanentRedirect(`/blogs/${result.slug}`);
  if (result.kind === "missing") notFound();

  const { post, related } = result;
  const base = siteUrl();
  const url = `${base}/blogs/${post.slug}`;
  const description =
    post.seoDescription || post.excerpt || makeExcerpt(post.content, 155);
  // A contents list beside long posts, like the policy pages have.
  const headings = extractHeadings(post.content);
  const showContents = headings.filter((h) => h.level === 2).length >= 3;
  const numbered = headings.map((h, i) => ({
    ...h,
    number: headings.slice(0, i + 1).filter((x) => x.level === 2).length,
  }));

  return (
    <SitePage>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              "@id": `${url}#post`,
              mainEntityOfPage: url,
              headline: (post.seoTitle || post.title).slice(0, 110),
              description,
              datePublished: post.publishedAt,
              dateModified: post.updatedAt,
              articleSection: post.category,
              keywords: post.tags.join(", "),
              wordCount: post.content.split(/\s+/).length,
              image: post.coverImageUrl
                ? [post.coverImageUrl]
                : [`${url}/opengraph-image`],
              author: { "@type": "Person", name: post.author.name },
              publisher: {
                "@type": "Organization",
                name: SITE_NAME,
                url: base,
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: base },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Blog",
                  item: `${base}/blogs`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: post.title,
                  item: url,
                },
              ],
            },
          ],
        }}
      />

      <article className="px-6 pb-20 pt-32 sm:px-10">
        <div className={`mx-auto ${showContents ? "max-w-6xl" : "max-w-3xl"}`}>
          <nav
            aria-label="Breadcrumb"
            className="font-mono text-xs text-neutral-500"
          >
            <Link
              href="/blogs"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> blog
            </Link>
          </nav>

          <header className="mt-8 max-w-3xl">
            <Link
              href={`/blogs?category=${post.categoryKey}`}
              className="font-mono text-xs uppercase tracking-wider text-emerald-400 hover:underline"
            >
              {post.category}
            </Link>
            <h1 className="mt-3 text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-5 text-lg leading-relaxed text-neutral-400">
                {post.excerpt}
              </p>
            )}
            <p className="mt-6 text-sm text-neutral-500">
              By <span className="text-neutral-300">{post.author.name}</span>
              {post.author.batch
                ? ` (batch of ${post.author.batch})`
                : ""} ·{" "}
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>{" "}
              · {post.readMinutes} min read
              {post.updatedAt.slice(0, 10) !==
                post.publishedAt.slice(0, 10) && (
                <>
                  {" "}
                  · Updated{" "}
                  <time dateTime={post.updatedAt}>
                    {formatDate(post.updatedAt)}
                  </time>
                </>
              )}
            </p>
          </header>

          <div
            className={
              showContents
                ? "mt-10 grid gap-12 lg:grid-cols-[14rem_1fr] lg:gap-16"
                : "contents"
            }
          >
            {showContents && (
              <nav aria-label="On this page" className="hidden lg:block">
                <div className="sticky top-8">
                  <p className="mb-3 font-mono text-xs text-neutral-500">
                    {"// contents"}
                  </p>
                  <ol className="space-y-1.5 border-l border-white/10">
                    {numbered.map((h) => {
                      return (
                        <li key={h.id}>
                          <a
                            href={`#${h.id}`}
                            className={`-ml-px flex gap-2.5 border-l border-transparent py-0.5 text-sm text-neutral-400 transition-colors hover:border-white/40 hover:text-white ${
                              h.level === 3 ? "pl-8 text-[13px]" : "pl-3"
                            }`}
                          >
                            {h.level === 2 && (
                              <span className="font-mono text-xs leading-5 text-neutral-600">
                                {String(h.number).padStart(2, "0")}
                              </span>
                            )}
                            <span>{h.text}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </nav>
            )}

            <div className="min-w-0 max-w-3xl">
              {post.coverImageUrl && (
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
                  <Image
                    src={post.coverImageUrl}
                    alt={post.coverAlt || post.title}
                    fill
                    priority
                    sizes="(min-width: 768px) 768px, 100vw"
                    className="object-cover"
                  />
                </div>
              )}

              <div
                className={`${post.coverImageUrl ? "mt-10" : ""} text-[17px]`}
              >
                <Markdown>{post.content}</Markdown>
              </div>

              {post.tags.length > 0 && (
                <ul className="mt-12 flex flex-wrap gap-2" aria-label="Tags">
                  {post.tags.map((tag) => (
                    <li key={tag}>
                      <Link
                        href={`/blogs?tag=${encodeURIComponent(tag)}`}
                        className="rounded-full border border-white/15 px-3 py-1 text-xs text-neutral-300 transition-colors hover:border-white/40 hover:text-white"
                      >
                        #{tag}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <aside
            aria-label="More posts"
            className="mx-auto mt-20 max-w-6xl border-t border-white/10 pt-12"
          >
            <h2 className="text-xl font-bold text-white">Keep reading</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          </aside>
        )}
      </article>
    </SitePage>
  );
}
