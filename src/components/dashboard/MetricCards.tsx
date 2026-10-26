"use client";

import { Ticket, FolderGit2, Flame, Trophy } from "lucide-react";
import { CURRENT_USER } from "@/lib/dashboard";

interface MetricCardsProps {
  projectCount: number;
}

export default function MetricCards({ projectCount }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      <div className="p-5 rounded-2xl bg-[#111113] border border-white/10">
        <div className="flex items-center justify-between text-neutral-400 text-xs mb-3">
          <span>Active Passes</span>
          <Ticket className="w-4 h-4 text-emerald-400" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold font-mono text-white">1</p>
        <p className="text-[11px] text-neutral-400 mt-1">HackFest &apos;26 Secured</p>
      </div>

      <div className="p-5 rounded-2xl bg-[#111113] border border-white/10">
        <div className="flex items-center justify-between text-neutral-400 text-xs mb-3">
          <span>Shipped Projects</span>
          <FolderGit2 className="w-4 h-4 text-blue-400" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold font-mono text-white">{projectCount}</p>
        <p className="text-[11px] text-neutral-400 mt-1">Live in Community Registry</p>
      </div>

      <div className="p-5 rounded-2xl bg-[#111113] border border-white/10">
        <div className="flex items-center justify-between text-neutral-400 text-xs mb-3">
          <span>Builder Score</span>
          <Flame className="w-4 h-4 text-amber-400" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold font-mono text-white">{CURRENT_USER.builderScore}</p>
        <p className="text-[11px] text-neutral-400 mt-1">Rank #{CURRENT_USER.rank} in {CURRENT_USER.batch}</p>
      </div>

      <div className="p-5 rounded-2xl bg-[#111113] border border-white/10">
        <div className="flex items-center justify-between text-neutral-400 text-xs mb-3">
          <span>Community Sprints</span>
          <Trophy className="w-4 h-4 text-purple-400" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold font-mono text-white">{CURRENT_USER.sprintsCount}</p>
        <p className="text-[11px] text-neutral-400 mt-1">Hackathons &amp; Sprints</p>
      </div>
    </div>
  );
}
