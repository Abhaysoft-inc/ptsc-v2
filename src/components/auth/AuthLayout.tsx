"use client";

import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  badgeText?: string;
  heroHeading?: string;
  heroSubtitle?: string;
  bgImage?: string;
  leftFooter?: ReactNode;
}

export default function AuthLayout({
  children,
  badgeText = "PTSC Builder Portal",
  heroHeading = "The home for student founders & hackers.",
  heroSubtitle = "Join 1,200+ student founders, hackers, and creators across graduating classes shipping real-world software and building in public.",
  bgImage = "/bg.jpg",
  leftFooter,
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen bg-[#080809] text-white flex flex-col justify-center items-center px-4 sm:px-8 py-16 sm:py-20 selection:bg-white selection:text-black overflow-x-clip">
      {/* Top Header Navigation Strip */}
      <header className="absolute top-0 inset-x-0 z-30 px-6 sm:px-10 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors select-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to PTSC</span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 text-white font-bold tracking-tight select-none"
        >
          <div className="relative h-7 w-6 shrink-0">
            <Image
              src="/logo.png"
              alt="PTSC Logo"
              fill
              sizes="28px"
              priority
              className="object-contain"
            />
          </div>
          <span>PTSC</span>
        </Link>
      </header>

      {/* Ambient Radial Glow in Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[450px] bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

      {/* WIDESCREEN LANDSCAPE AUTH CARD */}
      <main className="relative z-10 w-full max-w-md sm:max-w-xl lg:max-w-5xl bg-[#111113] border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.85)] grid grid-cols-1 lg:grid-cols-12 min-h-0 lg:min-h-[580px] my-auto">
        {/* Left Landscape Column (Visual, Identity, & Community Badge - Hidden on mobile) */}
        <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-8 sm:p-10 lg:p-12 lg:border-r border-white/10 overflow-hidden select-none">
          {/* Background Image with Dark Vignette */}
          <div className="absolute inset-0 z-0">
            <Image
              src={bgImage}
              alt="PTSC Community"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-center scale-105 opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#111113]/70 to-[#111113]/85" />
            <div className="absolute inset-0 bg-radial from-transparent to-black/80" />
          </div>

          {/* Top Community Badge & Headings */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 text-xs font-medium text-neutral-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{badgeText}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-5 leading-tight text-white">
              {heroHeading}
            </h2>

            <p className="text-xs sm:text-sm text-neutral-400 mt-2.5 leading-relaxed max-w-md">
              {heroSubtitle}
            </p>
          </div>

          {/* Bottom Custom Metric / Testimonial */}
          {leftFooter && (
            <div className="relative z-10 pt-8 mt-8 border-t border-white/10">
              {leftFooter}
            </div>
          )}
        </div>

        {/* Right Landscape Column: The Horizontal Form Container */}
        <div className="col-span-1 lg:col-span-7 flex flex-col justify-start p-6 sm:p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
