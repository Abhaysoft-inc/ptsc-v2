"use client";

import { useState } from "react";
import Image from "next/image";
import {
  GraduationCap,
  Sparkles,
  ArrowDown,
  ArrowRight,
  MapPin,
  Users,
  ChevronDown,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { teamMembers, TeamMember } from "@/lib/team";

const ALL_BATCHES = ["2026", "2027", "2028", "2029"] as const;

const batchLabels: Record<string, string> = {
  "2026": "Batch of 2026",
  "2027": "Batch of 2027",
  "2028": "Batch of 2028",
  "2029": "Batch of 2029",
};

const memberImages: Record<string, string> = {
  "member-1": "/bg.jpg",
  "member-2": "/featured-collab.jpg",
  "member-3": "/featured-saas.jpg",
  "member-4": "/featured-launch.jpg",
  "member-5": "/collage.png",
  "member-6": "/bg.jpg",
  "member-7": "/featured-collab.jpg",
  "member-8": "/featured-saas.jpg",
  "member-9": "/featured-launch.jpg",
  "member-10": "/collage.png",
  "member-11": "/bg.jpg",
  "member-12": "/featured-collab.jpg",
  "member-13": "/featured-saas.jpg",
};

export default function TeamClient() {
  // Initial state is COLLAPSED (empty array = all collapsed)
  const [expandedBatches, setExpandedBatches] = useState<string[]>([]);

  const toggleBatchCollapse = (batch: string) => {
    if (expandedBatches.includes(batch)) {
      setExpandedBatches(expandedBatches.filter((b) => b !== batch));
    } else {
      setExpandedBatches([...expandedBatches, batch]);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080809] text-white selection:bg-white selection:text-black overflow-x-clip">
      {/* Site Navbar */}
      <Navbar />

      {/* 100% WIDTH HERO SECTION WITH BACKGROUND */}
      <section className="relative w-full min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex flex-col justify-end overflow-hidden pt-32 pb-16 sm:pb-20 px-6 sm:px-10 lg:px-14 select-none">
        {/* Background Team Image with Dark Cinematic Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/team.jpg"
            alt="PTSC Club Team Photo"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-105"
          />
          {/* Subtle Gradient Overlays matching Events Page */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080809] via-[#080809]/50 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/65 to-transparent" />
        </div>

        {/* Top Ambient Light Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-1 bg-gradient-to-r from-transparent via-neutral-300/30 to-transparent blur-xs z-10" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto w-full">
          {/* Status Badge */}


          {/* Page Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[68px] font-bold text-white tracking-tight leading-[1.08] max-w-4xl drop-shadow-md">
            The Builders Behind PTSC
          </h1>

          {/* Details Strip */}
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs sm:text-sm text-neutral-300">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-neutral-400" />
              <span className="font-medium text-white">Class of 2026 – 2029</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-neutral-400" />
              <span>4 Active Batches</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-neutral-400" />
              <span>Campus Innovation Hub</span>
            </div>
          </div>

          {/* Subtitle */}
          <p className="mt-4 text-sm sm:text-base md:text-lg text-neutral-300 max-w-2xl leading-relaxed">
            Student founders, hackers, and creators across every graduating class shipping
            real-world software and building in public.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#batches"
              className="inline-flex items-center gap-2 rounded-full bg-white hover:bg-neutral-200 text-black text-sm font-semibold px-7 py-3.5 transition-all duration-200 shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Explore Batches</span>
              <ArrowDown className="w-4 h-4" />
            </a>

          </div>
        </div>
      </section>

      {/* BATCH-WISE MEMBERS DIRECTORY */}
      <div id="batches" className="relative z-10 w-full py-16 px-6 sm:px-10 lg:px-14">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}


          {/* COLLAPSIBLE BATCH SECTIONS (Initially Collapsed, Clean Borderless) */}
          <div className="flex flex-col divide-y divide-white/[0.08]">
            {ALL_BATCHES.map((batch) => {
              const members = teamMembers.filter((m) => m.batch === batch);
              const label = batchLabels[batch] || `Batch of ${batch}`;
              const isExpanded = expandedBatches.includes(batch);

              return (
                <div
                  key={batch}
                  id={`batch-${batch}`}
                  className="py-6 sm:py-7 transition-colors"
                >
                  {/* Collapsible Accordion Header (Open, no card wrapper, no border, no desc) */}
                  <button
                    type="button"
                    onClick={() => toggleBatchCollapse(batch)}
                    className="w-full flex items-center justify-between text-left cursor-pointer select-none group py-1"
                  >
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-neutral-200 transition-colors">
                      {label}
                    </h3>

                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span className="text-xs text-neutral-400 font-mono">
                        {members.length} {members.length === 1 ? "Member" : "Members"}
                      </span>
                      <div
                        className={`w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 group-hover:text-white transition-transform duration-200 ${isExpanded ? "rotate-180 bg-white/10 text-white" : ""
                          }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </button>

                  {/* Collapsible Content: Members Grid (Open directly on page) */}
                  {isExpanded && (
                    <div className="mt-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6 sm:gap-8">
                        {members.map((member) => {
                          const imgSrc = memberImages[member.id] || "/bg.jpg";

                          return (
                            <div
                              key={member.id}
                              className="group flex flex-col select-none"
                            >
                              {/* Raw Image: 0 Roundness, no border wrapper */}
                              <div className="relative w-full aspect-[3/4] bg-neutral-900 overflow-hidden rounded-none">
                                <Image
                                  src={imgSrc}
                                  alt={member.name}
                                  fill
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 rounded-none"
                                />

                                {/* Subtle bottom vignette */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                              </div>

                              {/* Simple Centered Name Below Card */}
                              <div className="mt-3 flex flex-col items-center text-center px-1">
                                <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight leading-tight group-hover:text-neutral-200 transition-colors">
                                  {member.name}
                                </h4>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Site Footer */}
      <Footer />
    </div>
  );
}
