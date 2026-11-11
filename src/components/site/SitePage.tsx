import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/motion/Reveal";

/** Navbar, page body and footer on the site's standard dark background. */
export default function SitePage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#080809] text-white selection:bg-white selection:text-black overflow-x-clip">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

/**
 * The top of an information page: a terminal-style path, a title and a lead,
 * over the same faint dot grid as the home page.
 */
export function PageHeader({
  path,
  title,
  lead,
  children,
}: {
  /** Shown like a shell path, e.g. "community". */
  path: string;
  title: string;
  lead: string;
  children?: React.ReactNode;
}) {
  const mask = "radial-gradient(ellipse 80% 90% at 30% 20%, black 30%, transparent 100%)";
  return (
    <section className="relative overflow-hidden border-b border-white/8 px-6 pb-14 pt-32 sm:px-10 sm:pb-20 lg:px-14">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />
      <Reveal onMount y={20} className="relative mx-auto max-w-6xl">
        <p className="font-mono text-xs text-emerald-400">
          <span className="text-neutral-600">~/ptsc/</span>
          {path}
          <span className="ml-1 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-emerald-400/80" />
        </p>
        <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-400 sm:text-lg">
          {lead}
        </p>
        {children && <div className="mt-8 flex flex-wrap items-center gap-4">{children}</div>}
      </Reveal>
    </section>
  );
}

/** A section heading with a small monospace label above it. */
export function SectionTitle({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-xs text-neutral-500">{`// ${label}`}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h2>
      {children && <p className="mt-3 text-sm leading-relaxed text-neutral-400 sm:text-base">{children}</p>}
    </div>
  );
}

/** The wide container every section sits in. */
export function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`px-6 py-14 sm:px-10 sm:py-20 lg:px-14 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}
