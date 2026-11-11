import SitePage, { PageHeader } from "./SitePage";

export interface LegalSection {
  /** Used for the link in the contents list, e.g. "cookies". */
  id: string;
  title: string;
  content: React.ReactNode;
}

/** A policy page: contents list beside numbered sections. */
export default function LegalPage({
  path,
  title,
  lead,
  updated,
  sections,
}: {
  path: string;
  title: string;
  lead: string;
  /** Shown as "Last updated …". */
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <SitePage>
      <PageHeader path={path} title={title} lead={lead}>
        <p className="font-mono text-xs text-neutral-500">Last updated {updated}</p>
      </PageHeader>

      <div className="px-6 py-14 sm:px-10 sm:py-20 lg:px-14">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[14rem_1fr] lg:gap-16">
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-8">
              <p className="mb-3 font-mono text-xs text-neutral-500">{"// contents"}</p>
              <ol className="space-y-2 border-l border-white/10">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="-ml-px flex gap-2.5 border-l border-transparent py-0.5 pl-3 text-sm text-neutral-400 transition-colors hover:border-white/40 hover:text-white"
                    >
                      <span className="font-mono text-xs leading-5 text-neutral-600">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{s.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className="max-w-3xl space-y-12">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-8">
                <h2 className="flex items-baseline gap-3 text-xl font-semibold tracking-tight text-white">
                  <span className="font-mono text-xs font-normal text-emerald-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.title}
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-400 sm:text-[15px] [&_a]:text-white [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-neutral-300 [&_li]:pl-1 [&_strong]:font-medium [&_strong]:text-neutral-200 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:marker:text-neutral-600">
                  {s.content}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </SitePage>
  );
}
