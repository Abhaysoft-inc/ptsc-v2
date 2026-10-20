"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  Ticket,
  BookOpen,
  ArrowUpRight,
  X,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { EventData } from "@/lib/events";

interface EventDetailClientProps {
  event: EventData;
}

export default function EventDetailClient({ event }: EventDetailClientProps) {
  const [showRulebookModal, setShowRulebookModal] = useState(false);

  // Pre-configured hosts with color badges matching the design
  const hosts = event.speakers && event.speakers.length > 0
    ? event.speakers.map((sp, idx) => ({
        initials: sp.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        name: sp.name,
        isHost: idx === 0,
        color:
          idx === 0
            ? "bg-[#6366f1]" // Indigo/Purple
            : idx === 1
            ? "bg-[#10b981]" // Emerald/Green
            : "bg-[#f59e0b]", // Amber/Orange
      }))
    : [
        {
          initials: "JA",
          name: "John Arowoka",
          isHost: true,
          color: "bg-[#6366f1]",
        },
        {
          initials: "DC",
          name: "Daniel Chillwell",
          isHost: false,
          color: "bg-[#10b981]",
        },
        {
          initials: "FO",
          name: "Faith Onasanya",
          isHost: false,
          color: "bg-[#f59e0b]",
        },
      ];

  const whatsappUrl =
    event.whatsappLink || "https://chat.whatsapp.com/invite/example-ptsc-community";

  return (
    <div className="relative min-h-screen bg-[#080809] text-white selection:bg-white selection:text-black overflow-x-hidden">
      {/* Site Navbar */}
      <Navbar />

      {/* Ambient Blurred Header Backdrop */}
      <div className="absolute top-0 inset-x-0 h-[460px] overflow-hidden pointer-events-none select-none z-0">
        <Image
          src={event.image}
          alt={event.title}
          fill
          priority
          className="object-cover blur-3xl scale-125 opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#080809]/80 to-[#080809]" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 pt-28 sm:pt-32 pb-24">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/#events"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 text-sm font-medium text-white transition-all shadow-sm group"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5] transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Events</span>
          </Link>
        </div>

        {/* Two-Column Event Details Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Event Card Image, Register Button, WhatsApp & Rulebook */}
          <div className="md:col-span-5 flex flex-col items-center sm:items-start max-w-sm mx-auto md:max-w-none w-full">
            {/* Square Poster Card */}
            <div className="relative w-full aspect-square rounded-[26px] overflow-hidden bg-neutral-900 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              <Image
                src={event.image}
                alt={event.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-cover"
              />

              {/* Status Pill Badge (Top-Right) */}
              <div className="absolute top-3.5 right-3.5 z-10">
                <span className="inline-flex items-center rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white border border-white/15 tracking-wide">
                  Starts in 3H
                </span>
              </div>
            </div>

            {/* Register Action Button leading to dedicated registration page */}
            <Link
              href={`/events/${event.id}/register`}
              className="w-full mt-4 py-3.5 px-6 rounded-full font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 select-none shadow-lg cursor-pointer bg-white hover:bg-neutral-200 text-black shadow-white/10 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Ticket className="w-4 h-4" />
              <span>Register for this Event</span>
            </Link>

            {/* Event Quick-Action Cards: WhatsApp Group & Rulebook */}
            <div className="w-full mt-4 flex flex-col gap-2.5">
              {/* WhatsApp Card */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer bg-[#141416] hover:bg-[#1a1a1d] border-white/10 hover:border-white/20"
              >
                <div className="flex items-center gap-3">
                  {/* WhatsApp SVG Icon */}
                  <div className="w-9 h-9 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 fill-[#25D366]"
                      viewBox="0 0 24 24"
                    >
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs sm:text-sm font-semibold text-white">
                      Join WhatsApp Group
                    </span>
                    <span className="text-[11px] sm:text-xs text-neutral-400">
                      Live announcements & attendee chat
                    </span>
                  </div>
                </div>

                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
              </a>

              {/* Event Rulebook Card */}
              <button
                type="button"
                onClick={() => setShowRulebookModal(true)}
                className="group flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer bg-[#141416] hover:bg-[#1a1a1d] border-white/10 hover:border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs sm:text-sm font-semibold text-white">
                      Event Rulebook & FAQs
                    </span>
                    <span className="text-[11px] sm:text-xs text-neutral-400">
                      Code of conduct, schedule & gear
                    </span>
                  </div>
                </div>

                <span className="text-xs font-medium text-neutral-400 group-hover:text-white transition-colors">
                  View
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Meta, Title, Description, and Host List */}
          <div className="md:col-span-7 flex flex-col">
            {/* Date & Time Header */}
            <span className="text-xs sm:text-sm font-medium text-neutral-400 tracking-wide">
              {event.month ? `Wed, ${event.day} ${event.month}` : "Wed, 12 April"}{" "}
              • {event.time ? event.time.split("–")[0].trim() : "9pm"}
            </span>

            {/* Big Event Title */}
            <h1 className="mt-2 text-2xl sm:text-3xl lg:text-[38px] font-bold text-white tracking-tight leading-[1.18]">
              {event.title}
            </h1>

            {/* Sub-meta Details row */}
            <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-[13px] text-neutral-400">
              <span>Multi session</span>
              <span>•</span>
              <span>Weekly</span>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <span>Guest</span>
                {/* Guest Initial Avatars */}
                <div className="flex -space-x-1.5 overflow-hidden items-center ml-0.5">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#06b6d4] text-[9px] font-bold text-white ring-1.5 ring-[#080809]">
                    AS
                  </span>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#ec4899] text-[9px] font-bold text-white ring-1.5 ring-[#080809]">
                    FA
                  </span>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#10b981] text-[9px] font-bold text-white ring-1.5 ring-[#080809]">
                    TA
                  </span>
                </div>
                <span className="text-xs text-neutral-400 font-medium ml-0.5">
                  32+
                </span>
              </div>
            </div>

            {/* Description Section */}
            <div className="mt-8 flex flex-col">
              <h2 className="text-xs sm:text-sm font-semibold text-neutral-400 uppercase tracking-wider">
                Description
              </h2>
              <p className="mt-3 text-sm sm:text-[15px] text-neutral-300 font-normal leading-relaxed whitespace-pre-line">
                {event.longDescription || event.description}
              </p>
            </div>

            {/* Event Host Section */}
            <div className="mt-9 flex flex-col">
              <h2 className="text-xs sm:text-sm font-semibold text-neutral-400 uppercase tracking-wider">
                Event Host
              </h2>

              <div className="mt-4 flex flex-col gap-3.5">
                {hosts.map((host, idx) => (
                  <div key={idx} className="flex items-center gap-3.5">
                    {/* Circle Avatar with Initials */}
                    <div
                      className={`w-9 h-9 rounded-full ${host.color} flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0`}
                    >
                      {host.initials}
                    </div>

                    {/* Host Name & Tag */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {host.name}
                      </span>
                      {host.isHost && (
                        <span className="text-xs font-medium text-neutral-400">
                          [Host]
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rulebook Modal */}
      {showRulebookModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowRulebookModal(false)}
        >
          <div
            className="relative w-full max-w-xl bg-[#141417] border border-white/15 rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Event Rulebook & Guidelines
                  </h3>
                  <span className="text-xs text-neutral-400">
                    Official code of conduct & attendee expectations
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRulebookModal(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Rules Content */}
            <div className="mt-5 overflow-y-auto pr-2 flex flex-col gap-5 text-sm text-neutral-300">
              {/* Section 1 */}
              <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>1. Safe & Inclusive Space</span>
                </div>
                <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed">
                  Harassment of any kind, discriminatory language, or unwanted
                  advances are strictly prohibited. Treat all builders, hackers,
                  and speakers with respect.
                </p>
              </div>

              {/* Section 2 */}
              <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>2. Check-in & Timings</span>
                </div>
                <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed">
                  Doors open 30 minutes prior to kickoff. Please arrive early to
                  claim your seat and check in with your digital confirmation badge.
                </p>
              </div>

              {/* Section 3 */}
              <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>3. What to Bring</span>
                </div>
                <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed">
                  Bring your laptop, charger, valid student/government ID, and an open
                  mind ready to collaborate. Power strips and high-speed Wi-Fi will be
                  provided at the venue.
                </p>
              </div>

              {/* Section 4 */}
              <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <Ticket className="w-4 h-4 text-blue-400" />
                  <span>4. Cancellations & Waitlist</span>
                </div>
                <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed">
                  If you cannot attend, please release your spot at least 24 hours in
                  advance so fellow builders on the waitlist can take your place.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <span className="text-xs text-neutral-500">
                PTSC Community Guidelines v2.4
              </span>
              <button
                type="button"
                onClick={() => setShowRulebookModal(false)}
                className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs sm:text-sm hover:bg-neutral-200 transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Minimal Footer */}
      <Footer />
    </div>
  );
}
