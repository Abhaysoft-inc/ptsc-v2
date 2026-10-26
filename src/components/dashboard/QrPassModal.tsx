"use client";

import { X, CheckCircle2, QrCode } from "lucide-react";
import { EventPass } from "@/lib/dashboard";

interface QrPassModalProps {
  pass: EventPass;
  isOpen: boolean;
  onClose: () => void;
}

export default function QrPassModal({ pass, isOpen, onClose }: QrPassModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-[#111113] border border-white/15 rounded-3xl p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
          aria-label="Close QR Modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-4 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>OFFICIAL ATTENDEE BADGE</span>
        </div>

        <h3 className="text-xl font-bold text-white tracking-tight mb-1">
          {pass.title}
        </h3>
        <p className="text-xs text-neutral-400 mb-6 font-mono">
          Pass ID: {pass.ticketId} • {pass.seatStatus}
        </p>

        {/* QR Code Graphic Box with 0 roundness on image/box */}
        <div className="w-48 h-48 bg-white p-3 mx-auto rounded-none flex items-center justify-center shadow-lg">
          <QrCode className="w-full h-full text-black stroke-[1.5]" />
        </div>

        <div className="mt-6 pt-5 border-t border-white/10 text-xs text-neutral-400">
          <p className="font-semibold text-white">{pass.attendeeName}</p>
          <p className="text-[11px] text-neutral-400">
            {pass.attendeeEmail} • {pass.attendeeBatch}
          </p>
          <p className="text-[10px] text-neutral-500 mt-2 font-mono">
            Present this QR code at campus check-in desk.
          </p>
        </div>
      </div>
    </div>
  );
}
