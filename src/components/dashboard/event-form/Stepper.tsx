"use client";

import { AlertCircle, Check } from "lucide-react";

export interface StepperStep {
  id: string;
  title: string;
  hint: string;
}

interface StepperProps {
  steps: readonly StepperStep[];
  current: number;
  /** Steps that were visited and have nothing left to fix. */
  completed: boolean[];
  /** Steps with problems the user has already been shown. */
  invalid: boolean[];
  onSelect: (index: number) => void;
}

/**
 * Shows where you are and what's left. Every step stays clickable, so nothing
 * is locked away; the final save still checks the whole form.
 */
export default function Stepper({ steps, current, completed, invalid, onSelect }: StepperProps) {
  const done = completed.filter(Boolean).length;
  const percent = Math.round((done / (steps.length - 1)) * 100);

  return (
    <nav aria-label="Event form progress">
      {/* Phones and small tablets: a compact bar */}
      <div className="md:hidden">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold text-white">
            {steps[current].title}
          </p>
          <p className="text-xs text-neutral-400">
            Step {current + 1} of {steps.length}
          </p>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={current + 1}
          aria-label="Form progress"
          className="mt-2.5 flex gap-1.5"
        >
          {steps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Go to ${s.title}`}
              className={`h-1.5 flex-1 rounded-full transition-colors cursor-pointer ${
                invalid[i]
                  ? "bg-red-400/80"
                  : completed[i]
                  ? "bg-emerald-400"
                  : i === current
                  ? "bg-white"
                  : "bg-white/15"
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-neutral-500">{steps[current].hint}</p>
      </div>

      {/* Desktop: numbered steps */}
      <ol className="hidden md:flex items-start">
        {steps.map((s, i) => {
          const isCurrent = i === current;
          const isDone = completed[i];
          const isInvalid = invalid[i] && !isCurrent;

          return (
            <li key={s.id} className="flex-1 min-w-0 relative">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute top-3.5 right-1/2 w-full h-px ${
                    completed[i - 1] ? "bg-emerald-400/50" : "bg-white/10"
                  }`}
                />
              )}
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={isCurrent ? "step" : undefined}
                className="relative z-10 flex w-full flex-col items-center gap-2 px-1 text-center cursor-pointer group"
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                    isInvalid
                      ? "border-red-400/60 bg-red-500/10 text-red-300"
                      : isDone
                      ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-300"
                      : isCurrent
                      ? "border-white bg-white text-black"
                      : "border-white/15 bg-[#0d0d10] text-neutral-400 group-hover:border-white/30"
                  }`}
                >
                  {isInvalid ? (
                    <AlertCircle className="h-3.5 w-3.5" />
                  ) : isDone ? (
                    <Check className="h-3.5 w-3.5 stroke-3" />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="min-w-0">
                  <span
                    className={`block truncate text-xs font-medium ${
                      isCurrent ? "text-white" : "text-neutral-400 group-hover:text-neutral-200"
                    }`}
                  >
                    {s.title}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <p className="sr-only" aria-live="polite">
        {done} of {steps.length - 1} sections complete ({percent}%).
      </p>
    </nav>
  );
}
