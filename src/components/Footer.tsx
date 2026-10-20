import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-[#050505] border-t border-white/[0.08] text-neutral-400 text-sm select-none">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-14 py-12 sm:py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-white/[0.06]">
          {/* Brand & Tagline */}
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-white text-base font-bold tracking-tight hover:opacity-85 transition-opacity"
            >
              <div className="relative h-7 w-6 shrink-0">
                <Image
                  src="/logo.png"
                  alt="PTSC Logo"
                  fill
                  sizes="28px"
                  className="object-contain"
                />
              </div>
              <span className="tracking-tight font-bold">PTSC</span>
            </Link>
            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
              The premier community for indie hackers, founders, and creators shipping fast and building in public.
            </p>
          </div>

          {/* Quick Minimal Links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-neutral-400">
            <Link href="/#community" className="hover:text-white transition-colors">
              Community
            </Link>
            <Link href="/#products" className="hover:text-white transition-colors">
              Products
            </Link>
            <Link href="/#events" className="hover:text-white transition-colors">
              Events
            </Link>
            <Link href="/#stories" className="hover:text-white transition-colors">
              Stories
            </Link>
            <Link href="/#privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/#terms" className="hover:text-white transition-colors">
              Terms
            </Link>
          </nav>
        </div>

        {/* Bottom Bar: Copyright & Subtle Status Indicator */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© 2026 PTSC Network. Built for builders.</p>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-neutral-400">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
