"use client";

import { useState } from "react";
import Image from "@/components/ui/cloud-image";
import Link from "next/link";
import { ArrowRight, ExternalLink, Star } from "lucide-react";
import type { AdminProject } from "@/lib/types/admin";
import Reveal from "@/components/motion/Reveal";

const GithubMark = (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);

function ProjectImage({ project }: { project: AdminProject }) {
  // Cover images are links to other websites, which can go missing.
  const [failed, setFailed] = useState(false);

  if (project.imageUrl && !failed) {
    return (
      <Image
        src={project.imageUrl}
        alt={project.title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        onError={() => setFailed(true)}
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
    );
  }

  // No image: a quiet code-style tile instead of an empty box.
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0d0d10]">
      <span className="font-mono text-sm text-neutral-700">{"</>"}</span>
    </div>
  );
}

const CHIP =
  "rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors";
const CHIP_ON = "border-white bg-white text-black";
const CHIP_OFF = "border-white/10 text-neutral-400 hover:border-white/30 hover:text-white";

/** A link to /projects keeping the chosen technology. */
function projectsHref(tag: string, page: number) {
  const query = new URLSearchParams();
  if (tag) query.set("tag", tag);
  if (page > 1) query.set("page", String(page));
  const text = query.toString();
  return text ? `/projects?${text}` : "/projects";
}

interface ProjectsClientProps {
  /** One page of projects, already filtered by the server. */
  projects: AdminProject[];
  page: number;
  totalPages: number;
  total: number;
  tags: { label: string; count: number }[];
  /** The technology being filtered on, lower-case, or "". */
  activeTag: string;
}

export default function ProjectsClient({
  projects,
  page,
  totalPages,
  tags,
  activeTag,
}: ProjectsClientProps) {
  const shown = projects;

  if (projects.length === 0 && !activeTag) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
        <p className="font-mono text-sm text-neutral-500">{"> no projects yet"}</p>
        <p className="mt-3 text-sm leading-relaxed text-neutral-400">
          Members&apos; projects will be listed here. Want yours on this page?{" "}
          <Link href="/community" className="text-white underline underline-offset-4">
            Join the club
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      {(tags.length > 1 || activeTag) && (
        <nav className="mb-10 flex flex-wrap items-center gap-2" aria-label="Filter by technology">
          <Link
            href="/projects"
            aria-current={activeTag === "" ? "page" : undefined}
            className={`${CHIP} ${activeTag === "" ? CHIP_ON : CHIP_OFF}`}
          >
            all
          </Link>
          {tags.map(({ label }) => {
            const on = label.toLowerCase() === activeTag;
            return (
              <Link
                key={label}
                href={on ? "/projects" : projectsHref(label.toLowerCase(), 1)}
                aria-current={on ? "page" : undefined}
                className={`${CHIP} ${on ? CHIP_ON : CHIP_OFF}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      )}

      {shown.length === 0 && (
        <p className="rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center text-sm text-neutral-400">
          No projects use that technology yet.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((p, i) => (
          <Reveal key={p.id} className="h-full" delay={(i % 3) * 0.08}>
            <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#111113] transition-colors hover:border-white/20">
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                <ProjectImage project={p} />
                {p.featured && (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-amber-300 backdrop-blur-md">
                    <Star className="h-3 w-3" /> Featured
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`font-mono text-[11px] ${
                      p.status === "completed" ? "text-emerald-400" : "text-blue-400"
                    }`}
                  >
                    {p.status === "completed" ? "● completed" : "● in progress"}
                  </span>
                </div>

                <h2 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-white">
                  {p.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">{p.summary}</p>

                {p.tags.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <li
                        key={t}
                        className="rounded-md border border-white/8 bg-white/3 px-2 py-0.5 font-mono text-[11px] text-neutral-300"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                  <p className="min-w-0 truncate text-xs text-neutral-500">
                    {p.builtBy ? `by ${p.builtBy}` : ""}
                  </p>
                  <div className="flex shrink-0 items-center gap-1">
                    {p.githubUrl && (
                      <a
                        href={p.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${p.title} on GitHub`}
                        className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        {GithubMark}
                      </a>
                    )}
                    {p.liveUrl && (
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <span>Live</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Pages" className="mt-12 flex items-center justify-center gap-4 text-sm">
          {page > 1 ? (
            <Link
              href={projectsHref(activeTag, page - 1)}
              className="rounded-full border border-white/15 px-5 py-2 text-white transition-colors hover:bg-white/10"
            >
              Previous
            </Link>
          ) : (
            <span className="rounded-full border border-white/8 px-5 py-2 text-neutral-600">Previous</span>
          )}
          <span className="font-mono text-xs text-neutral-400">
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={projectsHref(activeTag, page + 1)}
              className="rounded-full border border-white/15 px-5 py-2 text-white transition-colors hover:bg-white/10"
            >
              Next
            </Link>
          ) : (
            <span className="rounded-full border border-white/8 px-5 py-2 text-neutral-600">Next</span>
          )}
        </nav>
      )}

      <div className="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0d0d10] p-6 sm:p-8">
        <div>
          <p className="font-mono text-xs text-neutral-500">$ ptsc build --with-us</p>
          <p className="mt-2 text-base font-semibold text-white">Have something you&apos;re building?</p>
          <p className="mt-1 text-sm text-neutral-400">
            Join the club and get help, reviews and teammates for it.
          </p>
        </div>
        <Link
          href="/community"
          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-all hover:scale-[1.02] hover:bg-neutral-200 active:scale-[0.98]"
        >
          <span>Join the club</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
