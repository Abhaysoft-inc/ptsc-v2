import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogList, { blogListMetadata } from "../../../BlogList";
import { getPublicBlogCategories, getPublicBlogs } from "@/lib/server/public-blogs";
import { pageNumber } from "@/lib/paging";

// /blogs?category=…&page=… arrives here through a rewrite in next.config.ts. Every
// category and page that exists at build time is built ahead of time and served from
// the CDN; new ones are built on their first visit. A post change rebuilds them.
export const instant = false;

type Props = { params: Promise<{ category: string; page: string }> };

export async function generateStaticParams() {
  try {
    const categories = await getPublicBlogCategories();
    const params: { category: string; page: string }[] = [];
    for (const key of ["all", ...categories.map((c) => c.key)]) {
      const { totalPages } = await getPublicBlogs({ category: key === "all" ? "" : key });
      for (let p = 1; p <= Math.min(totalPages, 20); p++) params.push({ category: key, page: String(p) });
    }
    return params;
  } catch (error) {
    // No database during the build: these get built on their first visit instead.
    console.error("Blog list: couldn't read the pages to prebuild:", error);
    return [{ category: "all", page: "1" }];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, page } = await params;
  return blogListMetadata({ category, page: pageNumber(page) ?? 1 });
}

export default async function BlogListPage({ params }: Props) {
  const { category, page } = await params;
  const n = pageNumber(page);
  if (!n) notFound();
  if (category !== "all" && !(await getPublicBlogCategories()).some((c) => c.key === category)) notFound();
  // A page past the end is missing, not a copy of the last page.
  if (n > (await getPublicBlogs({ category: category === "all" ? "" : category })).totalPages) notFound();
  return <BlogList category={category} page={n} />;
}
