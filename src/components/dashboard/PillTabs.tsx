"use client";

interface PillTabsProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

// Segmented filter row: a dim track with the active option lifted onto a
// lighter pill.
export default function PillTabs<T extends string>({
  options,
  value,
  onChange,
  label,
}: PillTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex max-w-full items-center gap-1 p-1 rounded-2xl bg-white/[0.04] overflow-x-auto no-scrollbar"
    >
      {options.map((option) => {
        const isActive = option === value;
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              isActive
                ? "bg-white/10 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
