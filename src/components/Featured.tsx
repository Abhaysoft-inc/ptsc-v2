"use client";

import Image from "next/image";
import { ArrowUpRight, Sparkles } from "lucide-react";

interface FeaturedItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  image: string;
}

const featuredItems: FeaturedItem[] = [
  {
    id: "featured-1",
    tag: "Micro-SaaS Engine",
    title: "Ship Production-Ready Micro-SaaS",
    description:
      "Transform side projects into recurring revenue businesses. Access modern battle-tested boilerplates, monetization roadmaps, and 0-to-1 building playbooks.",
    image: "/featured-saas.jpg",
  },
  {
    id: "featured-2",
    tag: "Founder Masterminds",
    title: "Live Sprints & Peer Collaboration",
    description:
      "Never build in isolation again. Join weekly virtual co-working sprints, receive honest roast-style feedback, and team up with fellow ambitious builders.",
    image: "/featured-collab.jpg",
  },
  {
    id: "featured-3",
    tag: "Launch & Distribution",
    title: "Launchpad & Growth Distribution",
    description:
      "Get traction from day one. Leverage our high-engagement community launches, cross-promotions, and amplification network to scale your initial customer base.",
    image: "/featured-launch.jpg",
  },
];

export default function Featured() {
  return (
    <section
      id="products"
      className="relative z-10 w-full bg-[#050505] border-t border-white/[0.08] py-20 px-6 sm:px-10 lg:px-14 select-none"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-10 border-b border-white/[0.06]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900 border border-white/10 px-3.5 py-1 text-xs font-medium text-neutral-300 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
              <span>Featured Highlights</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              Built for Serious Indie Hackers
            </h2>
            <p className="mt-2 text-sm sm:text-base text-neutral-400 max-w-xl leading-relaxed">
              Curated tracks and community firepower to help you brainstorm, code,
              and monetize your digital products.
            </p>
          </div>
        </div>

        {/* 3 Featured Cards in a Row */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredItems.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between rounded-2xl bg-[#121214] border border-white/[0.08] hover:border-white/20 overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              {/* Card Image */}
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-neutral-900">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                {/* Tag pill badge on top-left of image */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-medium text-neutral-200 border border-white/10">
                    {item.tag}
                  </span>
                </div>
              </div>

              {/* Card Text Content */}
              <div className="flex flex-col flex-1 p-6 sm:p-7">
                <h3 className="text-xl sm:text-[22px] font-bold text-white tracking-tight leading-snug group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="mt-3 text-neutral-400 text-sm sm:text-[14.5px] leading-relaxed flex-1">
                  {item.description}
                </p>

                {/* Bottom link */}
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-neutral-300 group-hover:text-white transition-colors">
                  <span>Learn more</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
