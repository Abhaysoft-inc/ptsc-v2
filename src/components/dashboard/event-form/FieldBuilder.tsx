"use client";

import { Plus, Trash2, X } from "lucide-react";
import type { RegistrationField } from "@/lib/dashboard";
import {
  FIELD_TYPES,
  FILE_TYPE_PRESETS,
  isOptionType,
  makeField,
} from "./fields";

const subInput =
  "w-full px-3 py-2 bg-[#18181b] border border-white/10 rounded-lg text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30";

interface FieldBuilderProps {
  /** Describes who the fields apply to, shown above the list. */
  hint: string;
  addLabel: string;
  itemLabel: string;
  fields: RegistrationField[];
  onChange: (fields: RegistrationField[]) => void;
}

export default function FieldBuilder({
  hint,
  addLabel,
  itemLabel,
  fields,
  onChange,
}: FieldBuilderProps) {
  const add = () => onChange([...fields, makeField()]);
  const remove = (id: string) => onChange(fields.filter((f) => f.id !== id));

  const update = (id: string, patch: Partial<RegistrationField>) =>
    onChange(
      fields.map((f) => {
        if (f.id !== id) return f;
        const next = { ...f, ...patch };
        // Seed a couple of options the first time a choice type is picked.
        if (
          patch.type &&
          isOptionType(patch.type) &&
          next.options.length === 0
        ) {
          next.options = ["Option 1", "Option 2"];
        }
        return next;
      })
    );

  const setOptions = (id: string, options: string[]) =>
    onChange(fields.map((f) => (f.id === id ? { ...f, options } : f)));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-neutral-400">{hint}</p>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{addLabel}</span>
        </button>
      </div>

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="rounded-xl bg-[#0d0d10] border border-white/10 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-white">
              {itemLabel} {index + 1}
            </h4>
            <button
              type="button"
              onClick={() => remove(field.id)}
              className="p-1 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              aria-label="Remove field"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">
                Field Name *
              </label>
              <input
                type="text"
                value={field.name}
                onChange={(e) => update(field.id, { name: e.target.value })}
                placeholder="e.g. teamName"
                className={subInput}
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">
                Field Label *
              </label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => update(field.id, { label: e.target.value })}
                placeholder="e.g. Team Name"
                className={subInput}
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">
                Field Type
              </label>
              <select
                value={field.type}
                onChange={(e) =>
                  update(field.id, {
                    type: e.target.value as RegistrationField["type"],
                  })
                }
                className={`${subInput} cursor-pointer`}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">
                Placeholder
              </label>
              <input
                type="text"
                value={field.placeholder}
                onChange={(e) =>
                  update(field.id, { placeholder: e.target.value })
                }
                placeholder="Placeholder text"
                className={subInput}
              />
            </div>
          </div>

          {/* Options for select / checkbox */}
          {isOptionType(field.type) && (
            <div className="rounded-lg bg-[#131316] border border-white/10 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-300">
                  {field.type === "select"
                    ? "Dropdown options"
                    : "Checkbox options"}
                </span>
                <button
                  type="button"
                  onClick={() => setOptions(field.id, [...field.options, ""])}
                  className="text-[11px] text-neutral-300 hover:text-white font-medium cursor-pointer"
                >
                  + Add option
                </button>
              </div>
              {field.options.length === 0 && (
                <p className="text-[11px] text-neutral-500">
                  No options yet — add at least one.
                </p>
              )}
              {field.options.map((opt, optIndex) => (
                <div key={optIndex} className="flex gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) =>
                      setOptions(
                        field.id,
                        field.options.map((o, i) =>
                          i === optIndex ? e.target.value : o
                        )
                      )
                    }
                    placeholder={`Option ${optIndex + 1}`}
                    className={subInput}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setOptions(
                        field.id,
                        field.options.filter((_, i) => i !== optIndex)
                      )
                    }
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                    aria-label="Remove option"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* File settings */}
          {field.type === "file" && (
            <div className="rounded-lg bg-[#131316] border border-white/10 p-3 space-y-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  Allowed file types (comma separated)
                </label>
                <input
                  type="text"
                  value={field.allowedTypes.join(", ")}
                  onChange={(e) =>
                    update(field.id, {
                      allowedTypes: e.target.value
                        .split(",")
                        .map((t) => t.trim().toLowerCase())
                        .filter(Boolean),
                    })
                  }
                  placeholder=".pdf, .jpg, .png"
                  className={subInput}
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-neutral-500 mr-1">
                    Presets:
                  </span>
                  {FILE_TYPE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        update(field.id, { allowedTypes: preset.types })
                      }
                      className="px-2 py-0.5 text-[11px] rounded-md bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-colors cursor-pointer"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  Max file size (MB, up to 10)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={field.maxSizeMB}
                  onChange={(e) =>
                    update(field.id, {
                      maxSizeMB: Math.min(
                        10,
                        Math.max(1, Number(e.target.value) || 1)
                      ),
                    })
                  }
                  className={`${subInput} w-36`}
                />
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => update(field.id, { required: e.target.checked })}
              className="w-4 h-4 rounded accent-white"
            />
            <span className="text-xs text-neutral-300">Required field</span>
          </label>
        </div>
      ))}
    </div>
  );
}
