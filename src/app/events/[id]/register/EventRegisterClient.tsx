"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Check,
  Ticket,
  ArrowRight,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { EventData } from "@/lib/events";

interface EventRegisterClientProps {
  event: EventData;
}

export default function EventRegisterClient({ event }: EventRegisterClientProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "Full-Stack Developer",
    socialLink: "",
    goals: "",
    agreeRulebook: true,
    joinWhatsapp: true,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) return;

    const randomTicket = `PTSC-${Math.floor(1000 + Math.random() * 9000)}`;
    setTicketId(randomTicket);
    setIsSubmitted(true);
  };

  const whatsappUrl =
    event.whatsappLink || "https://chat.whatsapp.com/invite/example-ptsc-community";

  return (
    <div className="relative min-h-screen bg-[#080809] text-white selection:bg-white selection:text-black overflow-x-clip">
      {/* Site Navbar */}
      <Navbar />

      {/* Ambient Blurred Header Backdrop */}
      <div className="absolute top-0 inset-x-0 h-[480px] overflow-hidden pointer-events-none select-none z-0">
        <Image
          src={event.image}
          alt={event.title}
          fill
          priority
          className="object-cover blur-3xl scale-125 opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#080809]/85 to-[#080809]" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 pt-28 sm:pt-32 pb-24">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 text-sm font-medium text-white transition-all shadow-sm group"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5] transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Event Details</span>
          </Link>
        </div>

        {/* Success Confirmation View (Landscape Boarding Pass Ticket) */}
        {isSubmitted ? (
          <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-4 shadow-xl shadow-emerald-500/10">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                You&apos;re Officially Registered!
              </h1>
              <p className="mt-2 text-neutral-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Your pass has been secured for <span className="text-white font-semibold">{event.title}</span>. We sent a copy to{" "}
                <span className="text-emerald-400 font-medium">{formData.email}</span>.
              </p>
            </div>

            {/* Landscape Pass Card */}
            <div className="w-full max-w-3xl rounded-3xl bg-[#141417] border border-white/15 shadow-2xl relative overflow-hidden flex flex-col md:flex-row">
              {/* Left Section: Event & Attendee Info */}
              <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      Confirmed Entry Pass
                    </span>
                    <span className="text-xs text-neutral-500">•</span>
                    <span className="text-xs text-neutral-400">PTSC Network</span>
                  </div>

                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {event.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    {event.locationTitle}, {event.locationSubtitle}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-neutral-500 block">Attendee</span>
                    <span className="font-semibold text-white text-sm mt-0.5 block truncate">
                      {formData.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Date</span>
                    <span className="font-semibold text-white text-sm mt-0.5 block">
                      {event.month} {event.day}, {event.year || "2026"}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Time</span>
                    <span className="font-semibold text-white text-sm mt-0.5 block">
                      {event.time ? event.time.split("–")[0].trim() : "10:00 AM"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Section: Perforated Divider & QR Code */}
              <div className="w-full md:w-64 p-6 sm:p-8 bg-[#101013] flex flex-col items-center justify-between text-center shrink-0">
                <div className="flex flex-col items-center">
                  <div className="w-28 h-28 rounded-2xl bg-neutral-900 border border-white/10 p-2 flex items-center justify-center text-neutral-200 shadow-inner">
                    <QrCode className="w-24 h-24" />
                  </div>
                  <span className="font-mono text-sm font-bold text-emerald-400 mt-3 tracking-wider">
                    {ticketId}
                  </span>
                  <span className="text-[11px] text-neutral-500 mt-0.5">
                    Scan for check-in
                  </span>
                </div>

                <div className="w-full mt-6 flex flex-col gap-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950"
                  >
                    <span>Join WhatsApp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>

                  <Link
                    href={`/events/${event.id}`}
                    className="w-full py-2 px-3 rounded-xl border border-white/10 hover:border-white/20 bg-neutral-900/60 text-neutral-400 hover:text-white text-xs font-medium text-center transition-colors"
                  >
                    Event Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Landscape Split Layout: Left Info Panel + Right Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT LANDSCAPE COLUMN (5 Cols): Event Summary & Highlights (Sticky) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 self-start flex flex-col gap-6 z-10">
              {/* Event Card Panel */}
              <div className="rounded-3xl bg-[#121214] border border-white/10 p-6 sm:p-7 shadow-xl overflow-hidden relative">
                {/* Poster Image */}
                <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-900 border border-white/10">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 450px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute top-3.5 left-3.5">
                    <span className="inline-flex items-center rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-medium text-neutral-200 border border-white/15">
                      {event.tag}
                    </span>
                  </div>
                </div>

                {/* Event Heading & Date Details */}
                <div className="mt-5 flex flex-col">
                  <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                    {event.title}
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-neutral-400 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {/* Metadata List */}
                <div className="mt-6 flex flex-col gap-3 pt-5 border-t border-white/10 text-xs sm:text-sm text-neutral-300">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>
                      {event.month} {event.day}, {event.year || "2026"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>{event.time || "10:00 AM – 3:30 PM EST"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>
                      {event.locationTitle}, {event.locationSubtitle}
                    </span>
                  </div>
                </div>

                {/* Included Perks Checklist */}
                <div className="mt-6 p-4 rounded-2xl bg-neutral-900/80 border border-white/5 flex flex-col gap-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    What&apos;s Included
                  </span>
                  <div className="flex items-center gap-2 text-xs text-neutral-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[3]" />
                    <span>Guaranteed seat reservation & badge</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[3]" />
                    <span>Invite to attendee WhatsApp community chat</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[3]" />
                    <span>Access to session decks & recorded resources</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT LANDSCAPE COLUMN (7 Cols): The Registration Form */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-6 p-6 sm:p-9 rounded-3xl bg-[#121214] border border-white/10 shadow-2xl"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Free Community Pass</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Attendee Registration
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Please provide your details to secure your spot for this session.
                  </p>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-neutral-300">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      placeholder="e.g. Alex Kumar"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900/90 border border-white/10 text-white placeholder:text-neutral-500 text-sm focus:border-white/30 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-neutral-300">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="alex@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900/90 border border-white/10 text-white placeholder:text-neutral-500 text-sm focus:border-white/30 focus:outline-none transition-all"
                    />
                  </div>

                  {/* WhatsApp Number */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-neutral-300">
                      WhatsApp Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900/90 border border-white/10 text-white placeholder:text-neutral-500 text-sm focus:border-white/30 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Primary Track / Role */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-neutral-300">
                      Primary Role / Track
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900/90 border border-white/10 text-white text-sm focus:border-white/30 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="Full-Stack Developer">Full-Stack Developer</option>
                      <option value="Student Hacker">Student Hacker</option>
                      <option value="Indie Founder">Indie Founder</option>
                      <option value="Product Designer">Product Designer</option>
                      <option value="AI / ML Engineer">AI / ML Engineer</option>
                      <option value="Curious Creator">Curious Creator</option>
                    </select>
                  </div>
                </div>

                {/* Portfolio / Social URL */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-neutral-300">
                    GitHub, Twitter, or Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={formData.socialLink}
                    onChange={(e) =>
                      setFormData({ ...formData, socialLink: e.target.value })
                    }
                    placeholder="https://github.com/username or https://x.com/username"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900/90 border border-white/10 text-white placeholder:text-neutral-500 text-sm focus:border-white/30 focus:outline-none transition-all"
                  />
                </div>

                {/* Goals */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-neutral-300">
                    What are you hoping to build or learn?
                  </label>
                  <textarea
                    rows={3}
                    value={formData.goals}
                    onChange={(e) =>
                      setFormData({ ...formData, goals: e.target.value })
                    }
                    placeholder="Tell us about your projects or what you hope to get out of this event..."
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900/90 border border-white/10 text-white placeholder:text-neutral-500 text-sm focus:border-white/30 focus:outline-none transition-all resize-none"
                  />
                </div>

                {/* Checkbox Agreements */}
                <div className="flex flex-col gap-3 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.agreeRulebook}
                      onChange={(e) =>
                        setFormData({ ...formData, agreeRulebook: e.target.checked })
                      }
                      className="mt-0.5 w-4 h-4 rounded border-white/20 bg-neutral-900 text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs text-neutral-300 leading-relaxed">
                      I agree to abide by the{" "}
                      <span className="text-white underline underline-offset-2">
                        Event Code of Conduct & Rulebook
                      </span>{" "}
                      and respect fellow builders.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.joinWhatsapp}
                      onChange={(e) =>
                        setFormData({ ...formData, joinWhatsapp: e.target.checked })
                      }
                      className="mt-0.5 w-4 h-4 rounded border-white/20 bg-neutral-900 text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs text-neutral-300 leading-relaxed">
                      Send me the WhatsApp community group link upon confirmation.
                    </span>
                  </label>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={!formData.agreeRulebook}
                  className="mt-2 w-full py-4 px-6 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-sm transition-all duration-200 shadow-xl shadow-white/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Confirm & Claim Event Pass</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <Footer />
    </div>
  );
}
