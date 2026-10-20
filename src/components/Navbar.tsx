"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "Team", href: "/team" },
    { name: "Blogs", href: "/blogs" },
  ];

  return (
    <header className="absolute top-0 inset-x-0 z-30 w-full bg-transparent">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-5 flex items-center justify-between">
        {/* PTSC Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-white text-base sm:text-lg font-semibold tracking-tight hover:opacity-85 transition-opacity select-none"
        >
          <div className="relative h-8 w-7 sm:h-9 sm:w-8 shrink-0">
            <Image
              src="/logo.png"
              alt="PTSC Logo"
              fill
              sizes="36px"
              priority
              className="object-contain"
            />
          </div>
          <span className="tracking-tight font-bold">PTSC</span>
        </Link>

        {/* Desktop Links - Simple Text */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="hover:text-white transition-colors duration-150"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Action - Simple Text */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/login"
            className="text-neutral-300 hover:text-white transition-colors duration-150"
          >
            Sign in
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-neutral-300 hover:text-white p-1"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown - Minimal Text Links */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pb-6 pt-2 flex flex-col gap-4 text-sm font-medium text-neutral-300 bg-black/85 backdrop-blur-md">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white transition-colors py-1"
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="text-white hover:text-neutral-300 transition-colors py-1 pt-2 border-t border-white/10"
          >
            Sign in
          </Link>
        </div>
      )}
    </header>
  );
}
