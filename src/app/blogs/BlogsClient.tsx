"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  BookOpen,
  Clock,
  Calendar,
  Search,
  ArrowRight,
  ArrowDown,
  X,
  Share2,
  Sparkles,
  CheckCircle2,
  User,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { blogPosts, BlogPost } from "@/lib/blogs";
import Reveal from "@/components/motion/Reveal";

const CATEGORIES = [
  "All",
  "Engineering",
  "Startups",
  "Design",
  "Campus Life",
] as const;

export default function BlogsClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [readingPost, setReadingPost] = useState<BlogPost | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filtered posts based on category and search
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.author.name.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Featured post
  const featuredPost = useMemo(() => {
    return blogPosts.find((p) => p.featured) || blogPosts[0];
  }, []);

  const handleShare = (post: BlogPost) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080809] text-white selection:bg-white selection:text-black overflow-x-clip">
      {/* Site Navbar */}
      <Navbar />

      {/* 100% WIDTH HERO SECTION WITH CINEMATIC BACKGROUND */}
      <section className="relative w-full min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex flex-col justify-end overflow-hidden pt-32 pb-16 sm:pb-20 px-6 sm:px-10 lg:px-14 select-none">
        {/* Background Image with Dark Cinematic Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/featured-saas.jpg"
            alt="PTSC Blog Background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-105"
          />
          {/* Subtle Gradient Overlays matching Events & Team Pages */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080809] via-[#080809]/55 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/65 to-transparent" />
        </div>

        {/* Top Ambient Light Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-1 bg-gradient-to-r from-transparent via-neutral-300/30 to-transparent blur-xs z-10" />

        {/* Hero Content */}
        <Reveal onMount y={30} delay={0.1} className="relative z-10 max-w-6xl mx-auto w-full">
          {/* Page Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[68px] font-bold text-white tracking-tight leading-[1.08] max-w-4xl drop-shadow-md">
            Stories & Insights from the Builders
          </h1>

          {/* Details Strip */}
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs sm:text-sm text-neutral-300">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-neutral-400" />
              <span className="font-medium text-white">{blogPosts.length} Technical Articles</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-400" />
              <span>5 min Average Read</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neutral-400" />
              <span>Peer-Reviewed Engineering</span>
            </div>
          </div>

          {/* Subtitle */}
          <p className="mt-4 text-sm sm:text-base md:text-lg text-neutral-300 max-w-2xl leading-relaxed">
            Deep-dives into systems engineering, shipping zero-to-one startups, product teardowns,
            and unfiltered lessons learned from campus hackers.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#articles"
              className="inline-flex items-center gap-2 rounded-full bg-white hover:bg-neutral-200 text-black text-sm font-semibold px-7 py-3.5 transition-all duration-200 shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Explore Articles</span>
              <ArrowDown className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={() => setReadingPost(featuredPost)}
              className="inline-flex items-center gap-2 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md border border-white/20 text-white text-sm font-semibold px-6 py-3.5 transition-all duration-200 hover:border-white/40 cursor-pointer"
            >
              <span>Read Spotlight Story</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </Reveal>
      </section>

      {/* MAIN ARTICLES SECTION */}
      <section id="articles" className="relative z-10 w-full py-16 px-6 sm:px-10 lg:px-14">
        <div className="max-w-6xl mx-auto">
          {/* Controls Bar: Category Tabs & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/[0.08] mb-12">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-150 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-white text-black font-semibold shadow-md"
                        : "bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search topics, authors, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#141417] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* SPOTLIGHT FEATURED ARTICLE (Shown when category is "All" and no search query) */}
          {selectedCategory === "All" && !searchQuery && (
            <div className="mb-16">
              <div
                onClick={() => setReadingPost(featuredPost)}
                className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#111113] border border-white/10 hover:border-white/25 rounded-2xl overflow-hidden p-6 sm:p-8 transition-all duration-300"
              >
                {/* Image: Strictly 0 Roundness on Image */}
                <div className="relative lg:col-span-7 w-full aspect-[16/10] bg-neutral-900 overflow-hidden rounded-none">
                  <Image
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 rounded-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 text-xs font-semibold bg-white text-black rounded-full shadow-lg">
                      Spotlight Story
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-5 flex flex-col justify-center">
                  <div className="flex items-center gap-3 text-xs text-neutral-400 mb-3">
                    <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px]">
                      {featuredPost.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {featuredPost.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredPost.readTime}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug group-hover:text-neutral-200 transition-colors">
                    {featuredPost.title}
                  </h3>

                  <p className="mt-3 text-sm text-neutral-400 leading-relaxed line-clamp-3">
                    {featuredPost.excerpt}
                  </p>

                  {/* Author Strip */}
                  <div className="mt-6 flex items-center justify-between pt-5 border-t border-white/[0.08]">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden bg-neutral-800 border border-white/10 shrink-0">
                        <Image
                          src={featuredPost.author.avatar}
                          alt={featuredPost.author.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">
                          {featuredPost.author.name}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          {featuredPost.author.batch}
                        </p>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:translate-x-1 transition-transform">
                      <span>Read Story</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ALL ARTICLES GRID */}
          <div>
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/[0.08]">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {selectedCategory === "All" ? "Latest Articles" : `${selectedCategory} Articles`}
              </h2>
              <span className="text-xs text-neutral-400 font-mono">
                {filteredPosts.length} {filteredPosts.length === 1 ? "Article" : "Articles"}
              </span>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <BookOpen className="w-12 h-12 text-neutral-600 mb-4" />
                <h3 className="text-lg font-semibold text-white">No articles found</h3>
                <p className="text-sm text-neutral-400 mt-1 max-w-sm">
                  We couldn&apos;t find any posts matching &quot;{searchQuery}&quot;. Try another search term or clear the filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="mt-5 px-5 py-2 text-xs font-semibold bg-white text-black rounded-full hover:bg-neutral-200 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    onClick={() => setReadingPost(post)}
                    className="group cursor-pointer flex flex-col select-none"
                  >
                    {/* Cover Image: 0 Roundness on image as requested across platform */}
                    <div className="relative w-full aspect-[16/10] bg-neutral-900 overflow-hidden rounded-none shadow-md">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 rounded-none"
                      />
                      {/* Subtle bottom vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-black/75 backdrop-blur-md text-white border border-white/15 rounded-md">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* Metadata & Typography */}
                    <div className="mt-4 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>

                      <h3 className="text-lg font-bold text-white tracking-tight leading-snug group-hover:text-neutral-200 transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="mt-2 text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>

                      {/* Author & Read Arrow */}
                      <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-neutral-500" />
                          <span className="text-neutral-300 font-medium">{post.author.name}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-white font-medium group-hover:translate-x-1 transition-transform">
                          Read <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* INTERACTIVE ARTICLE READING MODAL */}
      {readingPost && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[90vh] bg-[#111113] border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141417] shrink-0">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="px-2 py-0.5 font-semibold bg-white/10 text-white rounded">
                  {readingPost.category}
                </span>
                <span>•</span>
                <span>{readingPost.readTime}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleShare(readingPost)}
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  title="Copy Link"
                >
                  {copiedLink ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setReadingPost(null)}
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  aria-label="Close article modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* Cover Banner */}
              <div className="relative w-full aspect-[21/9] bg-neutral-900 rounded-none overflow-hidden">
                <Image
                  src={readingPost.coverImage}
                  alt={readingPost.title}
                  fill
                  className="object-cover rounded-none"
                />
              </div>

              {/* Title & Metadata */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                  {readingPost.title}
                </h2>
                <div className="mt-4 flex items-center justify-between pb-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-800 border border-white/10">
                      <Image
                        src={readingPost.author.avatar}
                        alt={readingPost.author.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {readingPost.author.name}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {readingPost.author.role} • {readingPost.author.batch}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs text-neutral-400">{readingPost.date}</span>
                </div>
              </div>

              {/* Article Paragraphs */}
              <div className="space-y-4 text-sm sm:text-base text-neutral-300 leading-relaxed">
                {readingPost.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {/* Tags Strip */}
              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-2">
                <span className="text-xs text-neutral-500 mr-2">Tags:</span>
                {readingPost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-xs bg-white/5 text-neutral-300 rounded-md border border-white/10"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#141417] flex items-center justify-between shrink-0">
              <span className="text-xs text-neutral-400">
                PTSC Technical Publication • Batch 2026 – 2029
              </span>
              <button
                type="button"
                onClick={() => setReadingPost(null)}
                className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-semibold rounded-full transition-colors cursor-pointer"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Site Footer */}
      <Footer />
    </div>
  );
}
