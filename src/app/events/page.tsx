import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Ticket,
  Sparkles,
  History,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { eventsList, getHeroFeaturedEvent } from "@/lib/events";

export default function EventsPage() {
  const heroData = getHeroFeaturedEvent();
  const featuredEvent = heroData?.event;
  const isUpcoming = heroData?.isUpcoming ?? true;

  return (
    <div className="relative min-h-screen bg-[#080809] text-white selection:bg-white selection:text-black overflow-x-clip">
      {/* Site Navbar */}
      <Navbar />

      {/* 100% WIDTH HERO SECTION WITH BACKGROUND */}
      {featuredEvent && (
        <section className="relative w-full min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex flex-col justify-end overflow-hidden pt-32 pb-16 sm:pb-20 px-6 sm:px-10 lg:px-14 select-none">
          {/* Background Image with Dark Cinematic Gradient Overlays */}
          <div className="absolute inset-0 z-0">
            <Image
              src={featuredEvent.image}
              alt={featuredEvent.title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center scale-105"
            />
            {/* Subtle Gradient Overlays for High Image Visibility and Legible Text */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080809] via-[#080809]/50 to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/65 to-transparent" />
          </div>

          {/* Top Ambient Light Glow Accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-1 bg-gradient-to-r from-transparent via-neutral-300/30 to-transparent blur-xs z-10" />

          {/* Hero Content */}
          <div className="relative z-10 max-w-6xl mx-auto w-full">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 px-3.5 py-1.5 text-xs font-semibold mb-4 text-white">
              {isUpcoming ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="tracking-wide">NEXT UPCOMING EVENT</span>
                </>
              ) : (
                <>
                  <History className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="tracking-wide text-neutral-300">
                    LATEST RECENT EVENT
                  </span>
                </>
              )}
              <span className="text-white/30">•</span>
              <span className="text-neutral-300 font-medium">
                {featuredEvent.tag}
              </span>
            </div>

            {/* Event Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[68px] font-bold text-white tracking-tight leading-[1.08] max-w-4xl drop-shadow-md">
              {featuredEvent.title}
            </h1>

            {/* Event Details Strip */}
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs sm:text-sm text-neutral-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <span className="font-medium text-white">
                  {featuredEvent.month} {featuredEvent.day}, {featuredEvent.year || "2026"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-400" />
                <span>{featuredEvent.time || "10:00 AM – 3:30 PM EST"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neutral-400" />
                <span>
                  {featuredEvent.locationTitle}, {featuredEvent.locationSubtitle}
                </span>
              </div>
            </div>

            {/* Short Description */}
            <p className="mt-4 text-sm sm:text-base md:text-lg text-neutral-300 max-w-2xl leading-relaxed line-clamp-2">
              {featuredEvent.description}
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={`/events/${featuredEvent.id}/register`}
                className="inline-flex items-center gap-2 rounded-full bg-white hover:bg-neutral-200 text-black text-sm font-semibold px-7 py-3.5 transition-all duration-200 shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>{isUpcoming ? "Register for Event" : "Join Waitlist"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href={`/events/${featuredEvent.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md border border-white/20 text-white text-sm font-semibold px-6 py-3.5 transition-all duration-200 hover:border-white/40 cursor-pointer"
              >
                <span>View Event Details</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ALL EVENTS SECTION (Below Hero) */}
      <section className="relative z-10 w-full py-20 px-6 sm:px-10 lg:px-14 border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-10 border-b border-white/[0.06]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900 border border-white/10 px-3.5 py-1 text-xs font-medium text-neutral-300 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                <span>Curated Lineup</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                All Community Events
              </h2>
              <p className="mt-2 text-sm sm:text-base text-neutral-400 max-w-xl leading-relaxed">
                Workshops, pitch sessions, demo days, and retreats built to help
                you ship fast and network with active indie makers.
              </p>
            </div>

            <div className="text-xs text-neutral-400 flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{eventsList.length} Active Sessions</span>
            </div>
          </div>

          {/* 3-Column Zero-Bezel Events Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {eventsList.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* Site Footer */}
      <Footer />
    </div>
  );
}
