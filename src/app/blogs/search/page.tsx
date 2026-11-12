import { Suspense } from "react";
import type { Metadata } from "next";
import BlogList, { blogListMetadata } from "../BlogList";
import { pageNumber } from "@/lib/paging";

// /blogs?q=… or /blogs?tag=… arrives here through a rewrite in next.config.ts. Search
// text can be anything, so these are rendered on request (results are cached for a
// few minutes) and aren't indexed.

type Search = { page?: string; category?: string; tag?: string; q?: string };
type Props = { searchParams: Promise<Search> };

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

async function filterFrom(searchParams: Promise<Search>) {
  const sp = await searchParams;
  return { category: one(sp.category), tag: one(sp.tag), q: one(sp.q), page: pageNumber(one(sp.page)) ?? 1 };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return blogListMetadata(await filterFrom(searchParams));
}

async function Results({ searchParams }: Props) {
  return <BlogList {...await filterFrom(searchParams)} />;
}

export default function BlogSearchPage({ searchParams }: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#080809]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      }
    >
      <Results searchParams={searchParams} />
    </Suspense>
  );
}
