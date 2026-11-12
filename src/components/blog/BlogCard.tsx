import Link from "next/link";
import Image from "@/components/ui/cloud-image";
import type { PublicBlogCard } from "@/lib/types/blog";

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export default function BlogCard({ post, priority = false }: { post: PublicBlogCard; priority?: boolean }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/60 transition-colors hover:border-white/25">
      <Link href={`/blogs/${post.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/9] overflow-hidden bg-neutral-900">
          {post.coverImageUrl ? (
            <Image
              src={post.coverImageUrl}
              alt={post.coverAlt || post.title}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-sm text-neutral-700">{"</>"}</div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-emerald-400">{post.category}</p>
          <h3 className="mt-2 text-lg font-semibold leading-snug text-white">{post.title}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-400">{post.excerpt}</p>
          <p className="mt-auto pt-5 text-xs text-neutral-500">
            {post.author.name} · <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> ·{" "}
            {post.readMinutes} min read
          </p>
        </div>
      </Link>
    </article>
  );
}
