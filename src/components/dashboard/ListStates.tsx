"use client";

import { AlertTriangle, Loader2, RotateCcw, Search, type LucideIcon } from "lucide-react";

// Shared loading / error / empty blocks for the dashboard's server-backed lists.

export function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-xs text-neutral-400">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorBlock({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center py-16">
      <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs text-neutral-400 mt-1">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try again</span>
        </button>
      )}
    </div>
  );
}

export function EmptyBlock({
  icon: Icon,
  title,
  hint,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
}) {
  return (
    <div className="text-center py-16">
      <Icon className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs text-neutral-400 mt-1">{hint}</p>
    </div>
  );
}

/** Dismissible red banner for a failed action. */
export function ErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="text-red-300 hover:text-white cursor-pointer"
      >
        Dismiss
      </button>
    </div>
  );
}

/** Search box that reports every keystroke; debounce in the caller. */
export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full lg:max-w-sm">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full pl-10 pr-4 py-2.5 bg-[#121215] border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
      />
    </div>
  );
}

