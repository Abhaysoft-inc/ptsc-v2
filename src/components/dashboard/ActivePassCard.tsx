"use client";

import Link from "next/link";
import { Ticket, CheckCircle2, Clock, MapPin, QrCode, ChevronRight } from "lucide-react";
import { EventPass } from "@/lib/dashboard";

interface ActivePassCardProps {
  pass: EventPass;
  onViewBadge: () => void;
}

export default function ActivePassCard({ pass, onViewBadge }: ActivePassCardProps) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Ticket className="w-4 h-4 text-emerald-400" />
          <span>My Active Event Pass</span>
        </h3>
        <span className="text-xs text-emerald-400 font-mono font-medium">
          Verified Registration
        </span>
      </div>

      {/* Landscape Ticket Card */}
      <div className="relative rounded-2xl bg-[#121215] border border-white/15 p-6 sm:p-7 overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left Ticket Info */}
          <div className="flex items-start gap-4">
            {/* Segmented Date Badge */}
            <div className="shrink-0 flex flex-col items-center justify-center w-14 h-16 bg-[#18181b] border border-white/15 text-center select-none rounded-none">
              <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                {pass.date.month}
              </span>
              <span className="text-2xl font-black text-white leading-none mt-1">
                {pass.date.day}
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>{pass.seatStatus}</span>
              </div>
              <h4 className="text-xl font-bold text-white tracking-tight">
                {pass.title}
              </h4>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400 mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  {pass.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                  {pass.location}
                </span>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex flex-wrap sm:flex-col items-center gap-2.5 w-full sm:w-auto shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/10">
            <button
              type="button"
              onClick={onViewBadge}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black hover:bg-neutral-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer w-full"
            >
              <QrCode className="w-4 h-4" />
              <span>View QR Badge</span>
            </button>

            <Link
              href="/events/1"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-neutral-300 hover:text-white rounded-xl transition-colors cursor-pointer w-full"
            >
              <span>Event Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
