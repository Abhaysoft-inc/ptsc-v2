"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { INITIAL_PLATFORMS, LeaderboardPlatform } from "@/lib/dashboard";
import StaggerList from "@/components/motion/StaggerList";

type Job = "refresh" | "update";

const JOBS: {
  id: Job;
  title: string;
  description: string;
  button: string;
  busy: string;
  primary: boolean;
}[] = [
  {
    id: "refresh",
    title: "Refresh Leaderboard",
    description:
      "Fetch the latest ratings from every connected platform and store the new data.",
    button: "Refresh Now",
    busy: "Refreshing...",
    primary: true,
  },
  {
    id: "update",
    title: "Update Leaderboard",
    description:
      "Recalculate scores and rankings from the data that has already been fetched.",
    button: "Update Now",
    busy: "Updating...",
    primary: false,
  },
];

export default function AdminLeaderboardView() {
  const [running, setRunning] = useState<Job | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [platforms, setPlatforms] =
    useState<LeaderboardPlatform[]>(INITIAL_PLATFORMS);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // Simulated job: swap in the real API call once a backend exists.
  const run = (job: Job) => {
    setRunning(job);
    setNotice(null);
    timer.current = setTimeout(() => {
      if (job === "refresh") {
        setPlatforms((prev) =>
          prev.map((p) => ({ ...p, lastSynced: "Just now" }))
        );
      }
      setRunning(null);
      setNotice(
        job === "refresh"
          ? "Leaderboard refreshed successfully."
          : "Leaderboard rankings updated."
      );
    }, 1400);
  };

  return (
    <StaggerList className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {JOBS.map((job) => (
          <div
            key={job.id}
            className="p-6 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all flex flex-col"
          >
            <h3 className="text-base font-bold text-white tracking-tight">
              {job.title}
            </h3>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed flex-1">
              {job.description}
            </p>
            <button
              type="button"
              onClick={() => run(job.id)}
              disabled={running !== null}
              className={`mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                job.primary
                  ? "bg-white hover:bg-neutral-200 text-black shadow-md"
                  : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
              }`}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${running === job.id ? "animate-spin" : ""}`}
              />
              <span>{running === job.id ? job.busy : job.button}</span>
            </button>
          </div>
        ))}
      </div>

      {notice && (
        <div
          role="status"
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="bg-[#111113] border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 bg-[#151518] border-b border-white/[0.08] text-neutral-400 uppercase font-mono text-[10px] tracking-wider">
          Connected platforms
        </div>
        <div className="divide-y divide-white/[0.06] text-xs">
          {platforms.map((p) => (
            <div
              key={p.id}
              className="px-5 py-3.5 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-semibold text-white">{p.name}</p>
                <p className="text-[11px] text-neutral-400">
                  {p.tracked} profiles tracked
                </p>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono text-right">
                Synced {p.lastSynced}
              </p>
            </div>
          ))}
        </div>
      </div>
    </StaggerList>
  );
}
