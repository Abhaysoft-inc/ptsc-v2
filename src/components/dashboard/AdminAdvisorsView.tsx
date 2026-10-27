"use client";

import { useState } from "react";
import { GraduationCap, Pencil, Plus, Trash2, X } from "lucide-react";
import { FacultyAdvisor } from "@/lib/dashboard";
import StaggerList from "@/components/motion/StaggerList";

interface AdminAdvisorsViewProps {
  advisors: FacultyAdvisor[];
  onSave: (advisor: Omit<FacultyAdvisor, "id"> & { id?: string }) => void;
  onDelete: (id: string) => void;
}

const inputClass =
  "w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30";

function initials(name: string) {
  return name
    .replace(/^(dr|prof)\.?\s+/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface AdvisorFormProps {
  advisor: FacultyAdvisor | null;
  onSave: AdminAdvisorsViewProps["onSave"];
  onClose: () => void;
}

function AdvisorForm({ advisor, onSave, onClose }: AdvisorFormProps) {
  const [name, setName] = useState(advisor?.name ?? "");
  const [role, setRole] = useState(advisor?.role ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;
    onSave({ id: advisor?.id, name: name.trim(), role: role.trim() });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md bg-[#111113] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white tracking-tight">
          {advisor ? "Edit Advisor" : "Add Advisor"}
        </h3>

        <input
          type="text"
          required
          autoFocus
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        <input
          type="text"
          required
          placeholder="Role, e.g. Faculty Coordinator, CSE"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={inputClass}
        />

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-colors cursor-pointer"
          >
            {advisor ? "Save changes" : "Add advisor"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminAdvisorsView({
  advisors,
  onSave,
  onDelete,
}: AdminAdvisorsViewProps) {
  // `undefined` = closed, `null` = adding a new advisor, object = editing.
  const [editing, setEditing] = useState<FacultyAdvisor | null | undefined>(
    undefined
  );

  return (
    <StaggerList className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-neutral-400">
          Shown on the public team page.
        </p>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Advisor</span>
        </button>
      </div>

      {advisors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {advisors.map((advisor) => (
            <div
              key={advisor.id}
              className="p-4 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-full bg-[#18181b] border border-white/15 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {initials(advisor.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {advisor.name}
                  </p>
                  <p className="text-xs text-neutral-400 truncate">
                    {advisor.role}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditing(advisor)}
                  aria-label={`Edit ${advisor.name}`}
                  className="p-1.5 text-neutral-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(advisor.id)}
                  aria-label={`Delete ${advisor.name}`}
                  className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#111113] rounded-2xl border border-white/10">
          <GraduationCap className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">No faculty advisors</p>
          <p className="text-xs text-neutral-400 mt-1">
            Add the first advisor to list them on the team page.
          </p>
        </div>
      )}

      {editing !== undefined && (
        <AdvisorForm
          // Remount per target so form state resets between add/edit.
          key={editing?.id ?? "new"}
          advisor={editing}
          onSave={onSave}
          onClose={() => setEditing(undefined)}
        />
      )}
    </StaggerList>
  );
}
