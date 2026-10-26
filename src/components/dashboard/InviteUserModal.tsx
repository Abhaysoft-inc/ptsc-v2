"use client";

import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { AdminUser } from "@/lib/dashboard";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: Omit<AdminUser, "id" | "projectsCount" | "eventsAttended" | "avatar" | "joinedDate">) => void;
}

export default function InviteUserModal({
  isOpen,
  onClose,
  onSubmit,
}: InviteUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [batch, setBatch] = useState("Batch of 2027");
  const [role, setRole] = useState<"Student Builder" | "Core Organizer" | "Admin">("Student Builder");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      batch,
      role,
      status: "Active",
    });

    setName("");
    setEmail("");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#111113] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
          aria-label="Close Modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <UserPlus className="w-5 h-5 text-blue-400" />
          <h3 className="text-xl font-bold text-white tracking-tight">
            Invite Campus Member
          </h3>
        </div>
        <p className="text-xs text-neutral-400 mb-6">
          Grant access to PTSC builder registry or assign organizer roles.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Member Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#18181c] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Student / University Email *
            </label>
            <input
              type="email"
              required
              placeholder="rahul@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#18181c] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Batch
              </label>
              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full bg-[#18181c] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-white/40 cursor-pointer"
              >
                <option value="Batch of 2026">Batch of 2026</option>
                <option value="Batch of 2027">Batch of 2027</option>
                <option value="Batch of 2028">Batch of 2028</option>
                <option value="Alumni Mentor">Alumni Mentor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Access Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as typeof role)}
                className="w-full bg-[#18181c] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-white/40 cursor-pointer"
              >
                <option value="Student Builder">Student Builder</option>
                <option value="Core Organizer">Core Organizer</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-colors cursor-pointer"
            >
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
