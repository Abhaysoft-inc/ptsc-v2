"use client";

import { Select } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface DropdownProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: DropdownOption<T>[];
  /** For `<label htmlFor>` and error messages, like a normal input. */
  id?: string;
  disabled?: boolean;
  title?: string;
  /** Shown when `value` matches no option. */
  placeholder?: string;
  /** "sm" is for table cells and toolbars. */
  size?: "sm" | "md";
  className?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

// The select needs a non-empty value for "nothing chosen" (an option like "—"),
// so an empty string is swapped for this on the way in and out.
const NONE = "__none__";
const toInner = (value: string) => (value === "" ? NONE : value);
const fromInner = (value: string) => (value === NONE ? "" : value);

/**
 * A dropdown that looks like the rest of the dashboard instead of the
 * browser's own menu: dark popup, rounded options, a tick on the chosen one.
 * Built on Base UI's Select, so keyboard use (arrows, type-ahead, Escape) and
 * screen readers work as they do for a native select.
 */
export default function Dropdown<T extends string>({
  value,
  onChange,
  options,
  id,
  disabled,
  title,
  placeholder = "Select…",
  size = "md",
  className = "",
  ...aria
}: DropdownProps<T>) {
  const sizeClass =
    size === "sm" ? "gap-1.5 rounded-lg px-2.5 py-1.5 text-xs" : "gap-2 rounded-xl px-3.5 py-2.5 text-sm";

  return (
    <Select.Root
      value={toInner(value)}
      onValueChange={(next) => next != null && onChange(fromInner(String(next)) as T)}
      items={options.map((o) => ({ label: o.label, value: toInner(o.value) }))}
      disabled={disabled}
    >
      <Select.Trigger
        id={id}
        title={title}
        aria-label={aria["aria-label"]}
        aria-invalid={aria["aria-invalid"]}
        aria-describedby={aria["aria-describedby"]}
        className={`group flex w-full items-center justify-between border border-white/10 bg-[#18181b] text-left text-white transition-colors hover:border-white/20 focus-visible:border-white/40 focus-visible:outline-none data-popup-open:border-white/40 aria-invalid:border-red-400/60 data-disabled:cursor-not-allowed data-disabled:opacity-50 cursor-pointer ${sizeClass} ${className}`}
      >
        <Select.Value placeholder={placeholder} className="truncate data-placeholder:text-neutral-500" />
        <Select.Icon className="shrink-0 text-neutral-400 transition-transform duration-150 group-data-popup-open:rotate-180">
          <ChevronDown className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Positioner sideOffset={6} alignItemWithTrigger={false} className="z-[70] outline-none">
          <Select.Popup className="max-h-(--available-height) min-w-(--anchor-width) origin-(--transform-origin) overflow-y-auto rounded-xl border border-white/10 bg-[#141417] p-1 shadow-[0_16px_48px_rgba(0,0,0,0.6)] outline-none transition duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            {options.map((o) => (
              <Select.Item
                key={o.value}
                value={toInner(o.value)}
                disabled={o.disabled}
                className={`flex cursor-pointer select-none items-center justify-between gap-6 rounded-lg px-3 outline-none data-disabled:cursor-not-allowed data-disabled:opacity-40 data-highlighted:bg-white/10 data-highlighted:text-white data-selected:text-white text-neutral-300 ${
                  size === "sm" ? "py-1.5 text-xs" : "py-2 text-sm"
                }`}
              >
                <Select.ItemText>{o.label}</Select.ItemText>
                <Select.ItemIndicator className="shrink-0 text-emerald-400">
                  <Check className="h-3.5 w-3.5 stroke-3" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
