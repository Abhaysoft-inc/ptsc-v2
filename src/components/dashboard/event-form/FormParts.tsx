"use client";

import { AlertCircle } from "lucide-react";

/** Shared look for text inputs, selects and textareas in the event form. */
export const inputClass =
  "w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors aria-invalid:border-red-400/60";

export function SectionHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <header className="space-y-1">
      <h2 className="text-lg font-semibold text-white tracking-tight">{title}</h2>
      <p className="text-sm text-neutral-400 leading-relaxed">{hint}</p>
    </header>
  );
}

/** Props that tie an input to its helper text and error message for screen readers. */
export function describe(id: string, opts: { hint?: boolean; error?: string }) {
  const ids = [opts.hint ? `${id}-hint` : null, opts.error ? `${id}-error` : null].filter(Boolean);
  return {
    id,
    "aria-invalid": opts.error ? true : undefined,
    "aria-describedby": ids.length ? ids.join(" ") : undefined,
  } as const;
}

interface FieldProps {
  id: string;
  label: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  hint?: React.ReactNode;
  error?: string;
  /** Right-aligned note on the label row, e.g. a character count. */
  aside?: React.ReactNode;
  children: React.ReactNode;
}

/** A labelled input with optional helper text and an inline error. */
export function Field({ id, label, required, optional, hint, error, aside, children }: FieldProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <label htmlFor={id} className="text-xs font-medium text-neutral-200">
          {label}
          {required && <span className="text-red-400"> *</span>}
          {optional && <span className="ml-1.5 font-normal text-neutral-500">Optional</span>}
        </label>
        {aside && <span className="text-[11px] text-neutral-500">{aside}</span>}
      </div>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-neutral-500 leading-relaxed">
          {hint}
        </p>
      )}
      {error && <FieldError id={`${id}-error`} message={error} />}
    </div>
  );
}

export function FieldError({ id, message }: { id?: string; message: string }) {
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs text-red-400">
      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-px" />
      <span>{message}</span>
    </p>
  );
}

interface ChoiceOption<T extends string> {
  value: T;
  title: string;
  description: string;
}

/** Pick one of a few options, each with a short explanation. */
export function ChoiceCards<T extends string>({
  name,
  legend,
  value,
  options,
  onChange,
}: {
  name: string;
  legend: string;
  value: T;
  options: ChoiceOption<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-xs font-medium text-neutral-200 mb-2">{legend}</legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((o) => (
          <label
            key={o.value}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
              value === o.value
                ? "border-white/40 bg-white/5"
                : "border-white/10 hover:border-white/25"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="mt-0.5 h-4 w-4 accent-white cursor-pointer"
            />
            <span>
              <span className="block text-sm font-medium text-white">{o.title}</span>
              <span className="mt-0.5 block text-xs text-neutral-400 leading-relaxed">
                {o.description}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** A checkbox with a title and an explanation. */
export function CheckRow({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3.5 transition-colors hover:border-white/25">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded accent-white cursor-pointer"
      />
      <span>
        <span className="block text-sm font-medium text-white">{title}</span>
        <span className="mt-0.5 block text-xs text-neutral-400 leading-relaxed">{description}</span>
      </span>
    </label>
  );
}
