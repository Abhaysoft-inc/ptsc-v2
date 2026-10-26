"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Project } from "@/lib/dashboard";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: Omit<Project, "id" | "stars">) => void;
}

export default function NewProjectModal({
  isOpen,
  onClose,
  onSubmit,
}: NewProjectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Full Stack Web");
  const [tags, setTags] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || "No description provided.",
      category,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : ["Next.js", "TypeScript"],
      status: "In Development",
      githubUrl: "https://github.com/ptsc/new-repo",
    });

    setTitle("");
    setDescription("");
    setTags("");
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
        className="relative w-full max-w-lg bg-[#111113] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
          aria-label="Close Project Modal"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-xl font-bold text-white tracking-tight mb-1">
          Submit a Campus Build
        </h3>
        <p className="text-xs text-neutral-400 mb-6">
          Showcase what you are building to the PTSC Network community.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AI Workflow Engine"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#18181b] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              One-Line Description
            </label>
            <textarea
              rows={2}
              placeholder="What problem does it solve and what is your stack?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#18181b] border border-white/15 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#18181b] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-white/40 cursor-pointer"
              >
                <option value="Full Stack Web">Full Stack Web</option>
                <option value="AI & Agents">AI & Agents</option>
                <option value="Systems & Cloud">Systems & Cloud</option>
                <option value="Mobile App">Mobile App</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Tech Stack (comma separated)
              </label>
              <input
                type="text"
                placeholder="Next.js, Python, Rust"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-[#18181b] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/40"
              />
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
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-colors cursor-pointer"
            >
              Publish Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
