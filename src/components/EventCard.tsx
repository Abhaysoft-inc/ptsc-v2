"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { EventData } from "@/lib/events";

interface EventCardProps {
  event: EventData;
}

export default function EventCard({ event }: EventCardProps) {
  const {
    id,
    tag,
    month,
    day,
    title,
    description,
    image,
    locationTitle,
    locationSubtitle,
  } = event;

  return (
    <Link
      href={`/events/${id}`}
      className="group relative flex flex-col justify-between rounded-2xl bg-[#171717] border border-white/[0.08] hover:border-white/20 overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 select-none cursor-pointer"
    >
      {/* Top Text Content Area */}
      <div className="flex flex-col px-6 sm:px-7 pt-6 sm:pt-7 pb-5">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Left Category/Tag Badge */}
          <span className="inline-flex items-center rounded-full bg-[#242424] px-4 py-1.5 text-xs sm:text-[13px] font-medium text-neutral-200 border border-white/[0.04]">
            {tag}
          </span>

          {/* Right Date Pill Badge */}
          <div className="inline-flex items-stretch rounded-xl bg-[#282828] border border-white/[0.04] overflow-hidden text-xs select-none">
            <span className="px-3 py-1.5 font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-center">
              {month}
            </span>
            <span className="bg-[#ededed] text-neutral-950 font-bold px-2.5 py-1.5 rounded-r-xl text-xs sm:text-sm min-w-[28px] flex items-center justify-center">
              {day}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="mt-5 text-2xl sm:text-[26px] font-bold text-white tracking-tight leading-tight group-hover:text-white transition-colors">
          {title}
        </h3>
        <p className="mt-2.5 text-neutral-400 text-sm sm:text-[14.5px] leading-relaxed line-clamp-3">
          {description}
        </p>
      </div>

      {/* Bottom Image Container - Full bleed with zero bezels */}
      <div className="relative w-full h-[260px] sm:h-[285px] rounded-t-2xl overflow-hidden bg-neutral-900 mt-auto">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Dark bottom gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

        {/* Location Pin & Text */}
        <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 flex items-center gap-2.5 z-10">
          <MapPin className="w-5 h-5 text-white shrink-0 stroke-[2.2]" />
          <div className="flex flex-col text-left">
            <span className="text-[15px] sm:text-base font-bold text-white leading-tight drop-shadow-md">
              {locationTitle}
            </span>
            <span className="text-xs sm:text-[13px] text-neutral-300 font-normal leading-tight mt-0.5 drop-shadow-md">
              {locationSubtitle}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
