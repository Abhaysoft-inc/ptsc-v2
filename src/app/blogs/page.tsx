import { Suspense } from "react";
import Link from "next/link";
import Image from "@/components/ui/cloud-image";
import type { Metadata } from "next";
import { ArrowRight, PenLine, Search } from "lucide-react";
import SitePage, { PageHeader } from "@/components/site/SitePage";
import BlogCard, { formatDate } from "@/components/blog/BlogCard";
import JsonLd from "@/components/seo/JsonLd";
import Reveal from "@/components/motion/Reveal";
import { getPublicBlogCategories, getPublicBlogs } from "@/lib/server/public-blogs";
import { SITE_NAME, siteUrl } from "@/lib/site";

type Search = { page?: string; category?: string; tag?: string; q?: string };

const TITLE = "Blog";
const DESCRIPTION =
  "Tutorials, engineering write-ups, career advice and campus stories from the students of the Programming and Tech Skills Club.";

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

/** The address of a list page with the given filters, leaving out empty ones. */
function listHref({ page, category, tag, q }: Search) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (tag) params.set("tag", tag);
  if (q) params.set("q", q);
  if (page && page !== "1") params.set("page", page);
  const query = params.toString();
  return query ? `/blogs?${query}` : "/blogs";
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<Search> }): Promise<Metadata> {
  const sp = await searchParams;
  const category = one(sp.category);
  const filtered = Boolean(category || one(sp.tag) || one(sp.q));
  const page = one(sp.page);
  return {
    title: TITLE,
    description: DESCRIPTION,
    // Search results and tag pages aren't worth indexing; the category and paged lists are.
    alternates: {
      canonical: listHref({ category, page }),
      types: { "application/rss+xml": "/blogs/rss.xml" },
    },
    robots: one(sp.q) || one(sp.tag) ? { index: false, follow: true } : undefined,
    openGraph: { title: `${TITLE} | ${SITE_NAME}`, description: DESCRIPTION, url: "/blogs", type: "website" },
    ...(filtered ? {} : { keywords: ["PTSC blog", "college coding club", "programming tutorials"] }),
  };
}

async function BlogsContent({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const category = one(sp.category).slice(0, 40);
  const tag = one(sp.tag).slice(0, 40);
  const q = one(sp.q).slice(0, 60);
  const requested = Number(one(sp.page));

  const [{ posts, featured, page, totalPages, total }, categories] = await Promise.all([
    getPublicBlogs({ page: Number.isInteger(requested) && requested > 0 ? requested : 1, category, tag, q }),
    getPublicBlogCategories(),
  ]);
  const filtered = Boolean(category || tag || q);
  const activeName = categories.find((c) => c.key === category)?.name;

  const pill = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
      active ? "border-white bg-white text-black" : "border-white/15 text-neutral-300 hover:border-white/40 hover:text-white"
    }`;

  return (
    <SitePage>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: `${SITE_NAME} blog`,
          description: DESCRIPTION,
          url: `${siteUrl()}/blogs`,
          publisher: { "@type": "Organization", name: SITE_NAME, url: siteUrl() },
          blogPost: posts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: `${siteUrl()}/blogs/${p.slug}`,
            datePublished: p.publishedAt,
          })),
        }}
      />

      <PageHeader path="blog" title="Things we've learned, written down." lead={DESCRIPTION}>
        <Link
          href="/dashboard/blog"
          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-neutral-200"
        >
          <PenLine className="h-4 w-4" />
          Write a post
        </Link>
      </PageHeader>

      <section className="px-6 py-14 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-6xl">
          {featured && (
            <Reveal>
              <Link
                href={`/blogs/${featured.slug}`}
                className="group grid overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/60 transition-colors hover:border-white/25 md:grid-cols-2"
              >
                <div className="relative aspect-[16/10] bg-neutral-900 md:aspect-auto md:min-h-[320px]">
                  {featured.coverImageUrl && (
                    <Image
                      src={featured.coverImageUrl}
                      alt={featured.coverAlt || featured.title}
                      fill
                      priority
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                </div>
                <div className="flex flex-col justify-center p-7 sm:p-10">
                  <p className="font-mono text-xs uppercase tracking-wider text-emerald-400">
                    Featured · {featured.category}
                  </p>
                  <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
                    {featured.title}
                  </h2>
                  <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-neutral-400 sm:text-base">
                    {featured.excerpt}
                  </p>
                  <p className="mt-5 text-xs text-neutral-500">
                    {featured.author.name} · {formatDate(featured.publishedAt)} · {featured.readMinutes} min read
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white">
                    Read the post <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          )}

          <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <nav aria-label="Categories" className="flex flex-wrap gap-2">
              <Link href="/blogs" className={pill(!category)}>
                All
              </Link>
              {categories.map((c) => (
                <Link key={c.key} href={listHref({ category: c.key })} className={pill(c.key === category)}>
                  {c.name}
                </Link>
              ))}
            </nav>
            <form action="/blogs" method="get" role="search" className="relative sm:w-64">
              {category && <input type="hidden" name="category" value={category} />}
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type="search"
                name="q"
                defaultValue={q}
                maxLength={60}
                placeholder="Search posts"
                aria-label="Search posts"
                className="w-full rounded-full border border-white/15 bg-transparent py-2 pl-10 pr-4 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-white/40"
              />
            </form>
          </div>

          {filtered && (
            <p className="mt-6 text-sm text-neutral-400">
              {total} {total === 1 ? "post" : "posts"}
              {activeName ? ` in ${activeName}` : ""}
              {tag ? ` tagged “${tag}”` : ""}
              {q ? ` matching “${q}”` : ""} ·{" "}
              <Link href="/blogs" className="text-white underline underline-offset-4">
                Clear
              </Link>
            </p>
          )}

          {posts.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <Reveal key={post.id} className="h-full" delay={(i % 3) * 0.08}>
                  <BlogCard post={post} />
                </Reveal>
              ))}
            </div>
          ) : (
            !featured && (
              <p className="mt-16 text-center text-sm text-neutral-400">
                {filtered ? "No posts match that." : "No posts yet. Be the first to write one."}
              </p>
            )
          )}

          {totalPages > 1 && (
            <nav aria-label="Pages" className="mt-14 flex items-center justify-center gap-4 text-sm">
              {page > 1 ? (
                <Link
                  href={listHref({ category, tag, q, page: String(page - 1) })}
                  rel="prev"
                  className="rounded-full border border-white/15 px-5 py-2 text-white transition-colors hover:bg-white/10"
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded-full border border-white/8 px-5 py-2 text-neutral-600">Previous</span>
              )}
              <span className="font-mono text-xs text-neutral-400">
                {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={listHref({ category, tag, q, page: String(page + 1) })}
                  rel="next"
                  className="rounded-full border border-white/15 px-5 py-2 text-white transition-colors hover:bg-white/10"
                >
                  Next
                </Link>
              ) : (
                <span className="rounded-full border border-white/8 px-5 py-2 text-neutral-600">Next</span>
              )}
            </nav>
          )}
        </div>
      </section>
    </SitePage>
  );
}

export default function BlogsPage({ searchParams }: { searchParams: Promise<Search> }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#080809]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      }
    >
      <BlogsContent searchParams={searchParams} />
    </Suspense>
  );
}
