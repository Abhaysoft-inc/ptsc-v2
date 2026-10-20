"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6 py-20 select-none">
      {/* Background Image using user's collage.png from public folder */}
      <div className="absolute inset-0 z-0 ]">
        <Image
          src="/collage.png"
          alt="Indie Hackers Community Collage Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Dark Moody Gradient Overlays for High-Contrast Cinematic Aesthetic */}
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/75" />
        <div className="absolute inset-0 bg-radial from-transparent via-black/30 to-black/90" />
      </div>

      {/* Ceiling Ambient Light Bar Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-3xl h-1 bg-gradient-to-r from-transparent via-neutral-400/30 to-transparent blur-xs z-10" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-bold text-white tracking-[-0.035em] leading-[1.08] sm:leading-[1.1] max-w-4xl mx-auto drop-shadow-sm">
          The best community for <br />
          <span className="text-white">Indie Hackers</span>
        </h1>

        {/* Subtitle Description */}
        <p className="mt-5 sm:mt-6 text-sm sm:text-base md:text-[17px] text-neutral-300 font-normal leading-relaxed max-w-xl mx-auto tracking-[-0.01em]">
          We&apos;re building a community of indie hackers to help each other succeed. <br className="hidden sm:inline" />
          Get in touch with us to join the community.
        </p>

        {/* Call to Action Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-row items-center justify-center gap-4 sm:gap-6">
          {/* Primary CTA: Solid White Button */}
          <button
            type="button"
            className="rounded-lg bg-white hover:bg-neutral-200 text-black text-sm sm:text-[15px] font-semibold px-6 sm:px-7 py-3 transition-all duration-200 shadow-[0_2px_14px_rgba(255,255,255,0.12)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            Join Community
          </button>

          {/* Secondary CTA: Clean Text / Link */}
          <button
            type="button"
            className="text-white hover:text-neutral-300 text-sm sm:text-[15px] font-medium px-4 py-3 transition-colors cursor-pointer"
          >
            Add your product
          </button>
        </div>
      </div>
    </section>
  );
}
