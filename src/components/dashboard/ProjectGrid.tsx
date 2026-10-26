"use client";

import { FolderGit2, Plus, ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { Project } from "@/lib/dashboard";

interface ProjectGridProps {
  projects: Project[];
  onAddProject: () => void;
  fullWidth?: boolean;
}

export default function ProjectGrid({
  projects,
  onAddProject,
  fullWidth = false,
}: ProjectGridProps) {
  return (
    <div className={`${fullWidth ? "lg:col-span-12" : "lg:col-span-8"} space-y-4`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-blue-400" />
          <span>My Active Builds ({projects.length})</span>
        </h3>
        <button
          type="button"
          onClick={onAddProject}
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      </div>

      <div className={`grid grid-cols-1 ${fullWidth ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}>
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-5 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/25 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-emerald-400 font-mono text-[11px]">
                  {proj.status}
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {proj.category}
                </span>
              </div>

              <h4 className="text-base font-bold text-white tracking-tight leading-snug">
                {proj.title}
              </h4>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed line-clamp-2">
                {proj.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {proj.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-[10px] bg-white/5 border border-white/10 rounded-md text-neutral-300 font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.08] text-xs">
              <a
                href={proj.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
              >
                <FaGithub className="w-3.5 h-3.5" />
                <span>Source</span>
              </a>

              {proj.liveUrl && (
                <a
                  href={proj.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-medium"
                >
                  <span>Live App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
