import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import ScrambleLogo from "@/components/hero/ScrambleLogo";

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6 pt-28 pb-20 bg-black">
      {/* Dot grid, fading out toward the edges */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.11) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 35%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 35%, transparent 100%)",
        }}
      />
      {/* Soft glow behind the logo */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-3xl h-64 rounded-full bg-white/4 blur-3xl z-0"
      />
      {/* Fade into the next section */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-[#080808] to-transparent z-0"
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto text-center flex flex-col items-center">
        <Reveal onMount y={20} delay={0.05}>
          <ScrambleLogo />
        </Reveal>

        <Reveal onMount y={24} delay={0.15}>
          <h1 className="mt-7 sm:mt-9 text-2xl sm:text-4xl md:text-5xl font-bold text-white tracking-[-0.03em] leading-tight">
            Programming &amp; Tech Skills Club
          </h1>
        </Reveal>

        <Reveal onMount delay={0.25}>
          <p className="mt-4 text-sm sm:text-base md:text-[17px] text-neutral-400 leading-relaxed max-w-xl mx-auto tracking-[-0.01em]">
            Learn to code, build real projects, and grow with fellow students.
            <br className="hidden sm:inline" /> All branches and skill levels are welcome.
          </p>
        </Reveal>

        <Reveal onMount delay={0.35}>
          <div className="mt-8 sm:mt-10 flex flex-row items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/signup"
              className="rounded-lg bg-white hover:bg-neutral-200 text-black text-sm sm:text-[15px] font-semibold px-6 sm:px-7 py-3 transition-all duration-200 shadow-[0_2px_14px_rgba(255,255,255,0.12)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Join the Club
            </Link>
            <Link
              href="/events"
              className="text-white hover:text-neutral-300 text-sm sm:text-[15px] font-medium px-4 py-3 transition-colors"
            >
              Explore events →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
