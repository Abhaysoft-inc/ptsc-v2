"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ExternalLink,
  GraduationCap,
  Pencil,
  Plus,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { FacultyAdvisor } from "@/lib/dashboard";
import StaggerList from "@/components/motion/StaggerList";

type AdvisorInput = Omit<FacultyAdvisor, "id"> & { id?: string };

interface AdminAdvisorsViewProps {
  advisors: FacultyAdvisor[];
  onSave: (advisor: AdvisorInput) => void;
  onDelete: (id: string) => void;
}

const inputClass =
  "w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors";
const labelClass = "block text-xs font-medium text-neutral-300 mb-1.5";

// Falls back to the user icon when there is no photo or the URL fails to load.
function AdvisorAvatar({ advisor }: { advisor: FacultyAdvisor }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#18181b] border border-white/15 flex items-center justify-center shrink-0">
      {advisor.imageUrl && !failed ? (
        <Image
          src={advisor.imageUrl}
          alt={advisor.name}
          fill
          unoptimized
          sizes="56px"
          onError={() => setFailed(true)}
          className="object-cover"
        />
      ) : (
        <UserRound className="w-6 h-6 text-neutral-500" />
      )}
    </div>
  );
}

interface AdvisorFormProps {
  advisor: FacultyAdvisor | null;
  nextOrder: number;
  onSave: (advisor: AdvisorInput) => void;
  onClose: () => void;
}

function AdvisorForm({ advisor, nextOrder, onSave, onClose }: AdvisorFormProps) {
  const isEdit = advisor !== null;
  const [name, setName] = useState(advisor?.name ?? "");
  const [role, setRole] = useState(advisor?.role ?? "");
  const [imageUrl, setImageUrl] = useState(advisor?.imageUrl ?? "");
  const [profileUrl, setProfileUrl] = useState(advisor?.profileUrl ?? "");
  const [order, setOrder] = useState(advisor?.order ?? nextOrder);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      setError("Name and role are required.");
      return;
    }
    onSave({
      id: advisor?.id,
      name: name.trim(),
      role: role.trim(),
      imageUrl: imageUrl.trim() || undefined,
      profileUrl: profileUrl.trim() || undefined,
      order: Number.isFinite(order) ? order : 0,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Edit advisor" : "Add advisor"}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg bg-[#111113] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 cursor-pointer"
          aria-label="Close form"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            {isEdit ? "Edit Advisor" : "Add Advisor"}
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Manage the public faculty advisor card.
          </p>
        </div>

        <div>
          <label className={labelClass}>Name *</label>
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Advisor name"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Role *</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Director"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Profile URL</label>
          <input
            type="url"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Display order</label>
          <input
            type="number"
            min={0}
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            className={inputClass}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
          >
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-sm font-semibold transition-colors cursor-pointer"
          >
            {isEdit ? "Save Changes" : "Create Advisor"}
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

  const sorted = [...advisors].sort(
    (a, b) => a.order - b.order || a.name.localeCompare(b.name)
  );
  const nextOrder = advisors.reduce((max, a) => Math.max(max, a.order), 0) + 1;

  const handleDelete = (advisor: FacultyAdvisor) => {
    if (window.confirm("Are you sure you want to delete this faculty advisor?")) {
      onDelete(advisor.id);
    }
  };

  return (
    <StaggerList className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-neutral-400">
          Shown on the public team page, in display order.
        </p>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Advisor</span>
        </button>
      </div>

      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map((advisor) => (
            <div
              key={advisor.id}
              className="p-4 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Remount when the photo URL changes so a prior load error clears. */}
                <AdvisorAvatar key={advisor.imageUrl ?? "none"} advisor={advisor} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {advisor.name}
                  </p>
                  <p className="text-xs text-neutral-400 truncate">
                    {advisor.role}
                  </p>
                  {advisor.profileUrl && (
                    <a
                      href={advisor.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Profile</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditing(advisor)}
                  aria-label={`Edit ${advisor.name}`}
                  className="p-2 text-neutral-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(advisor)}
                  aria-label={`Delete ${advisor.name}`}
                  className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
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
          <p className="text-sm font-semibold text-white">
            No faculty advisors found
          </p>
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
          nextOrder={nextOrder}
          onSave={onSave}
          onClose={() => setEditing(undefined)}
        />
      )}
    </StaggerList>
  );
}
