"use client";

import { useState } from "react";
import { Check, Ticket, Bell } from "lucide-react";

interface EventRsvpButtonProps {
  eventId: string;
  spotsLeft?: number;
}

export default function EventRsvpButton({ eventId, spotsLeft = 12 }: EventRsvpButtonProps) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRegister = () => {
    setIsRegistered((prev) => !prev);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleRegister}
        className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 select-none cursor-pointer ${
          isRegistered
            ? "bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-500/25"
            : "bg-white hover:bg-neutral-200 text-black shadow-lg shadow-white/10 hover:scale-[1.01] active:scale-[0.99]"
        }`}
      >
        {isRegistered ? (
          <>
            <Check className="w-4 h-4 stroke-[3]" />
            Spot Confirmed • You are attending!
          </>
        ) : (
          <>
            <Ticket className="w-4 h-4" />
            Claim Your Free Spot
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleShare}
        className="w-full py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-neutral-900/60 hover:bg-neutral-800/80 text-neutral-300 hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <Bell className="w-3.5 h-3.5 text-neutral-400" />
        {copied ? "Link copied to clipboard!" : "Share event link"}
      </button>
    </div>
  );
}
