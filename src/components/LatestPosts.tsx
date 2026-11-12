import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BlogCard from "@/components/blog/BlogCard";
import Reveal from "@/components/motion/Reveal";
import type { PublicBlogCard } from "@/lib/types/blog";

/** A short strip of the newest blog posts for the home page. Renders nothing when there are none. */
export default function LatestPosts({ posts }: { posts: PublicBlogCard[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="relative border-t border-white/8 px-6 py-20 sm:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs text-neutral-500">{"// from the blog"}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Latest from the blog</h2>
            <p className="mt-2 max-w-xl text-sm text-neutral-400">
              Tutorials, project write-ups and campus stories, written by members.
            </p>
          </div>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-neutral-300"
          >
            All posts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.id} className="h-full" delay={i * 0.08}>
              <BlogCard post={post} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
