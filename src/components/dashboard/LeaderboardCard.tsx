"use client";

import { Trophy } from "lucide-react";
import { LeaderboardEntry } from "@/lib/dashboard";

interface LeaderboardCardProps {
  entries: LeaderboardEntry[];
  fullWidth?: boolean;
}

export default function LeaderboardCard({
  entries,
  fullWidth = false,
}: LeaderboardCardProps) {
  return (
    <div className={`${fullWidth ? "lg:col-span-12" : "lg:col-span-4"} space-y-4`}>
      <div className="p-6 rounded-2xl bg-[#111113] border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Campus Leaderboard</span>
          </h3>
          <span className="text-[11px] text-neutral-500 font-mono">
            Batch 2027
          </span>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {entries.map((user) => (
            <div
              key={user.rank}
              className={`py-3 flex items-center justify-between text-xs ${
                user.isUser ? "bg-white/5 -mx-3 px-3 rounded-xl border border-white/10" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-5 font-mono font-bold text-center ${
                    user.rank === 1
                      ? "text-amber-400"
                      : user.rank === 2
                      ? "text-neutral-300"
                      : user.rank === 3
                      ? "text-amber-600"
                      : "text-neutral-500"
                  }`}
                >
                  #{user.rank}
                </span>
                <div>
                  <p className={`font-semibold ${user.isUser ? "text-emerald-400" : "text-white"}`}>
                    {user.name}
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono">{user.batch}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold text-white font-mono">{user.points}</span>
                <span className="text-[10px] text-neutral-500 ml-1">pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
