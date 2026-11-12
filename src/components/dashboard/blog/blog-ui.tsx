"use client";

import type { BlogRow } from "@/lib/types/blog";

export function shortDate(iso: string | null) {
  return iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "";
}

type Tone = "green" | "amber" | "red" | "grey" | "blue";

const TONES: Record<Tone, string> = {
  green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  grey: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
};

export function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/** The post's state, plus the state of an edit to it when it has one. */
export function StatusBadges({ post }: { post: Pick<BlogRow, "status" | "revision"> }) {
  const main =
    post.status === "published" ? (
      <Badge tone="green">Published</Badge>
    ) : post.status === "pending" ? (
      <Badge tone="amber">In review</Badge>
    ) : post.status === "rejected" ? (
      <Badge tone="red">Needs changes</Badge>
    ) : (
      <Badge tone="grey">Draft</Badge>
    );
  const edit = post.revision ? (
    post.revision.state === "pending" ? (
      <Badge tone="amber">Edit in review</Badge>
    ) : post.revision.state === "rejected" ? (
      <Badge tone="red">Edit needs changes</Badge>
    ) : (
      <Badge tone="blue">Edit in progress</Badge>
    )
  ) : null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {main}
      {edit}
    </span>
  );
}

export const rowButton =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";
export const dangerButton =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:bg-red-500/10 hover:text-red-400 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";
export const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black shadow-md transition-colors hover:bg-neutral-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60";
