"use client";

import Link from "next/link";
import Image from "next/image";
import { ADMIN_USER, type DashboardRole } from "@/lib/dashboard";

interface DashboardTopBarProps {
  role: DashboardRole;
  onChangeRole: (role: DashboardRole) => void;
}

const ROLES: { value: DashboardRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "normal", label: "Normal" },
];

const LINKS = [
  { label: "Dashboard", href: "/dashboard", active: true },
  { label: "Events", href: "/events", active: false },
  { label: "Team", href: "/team", active: false },
];

export default function DashboardTopBar({
  role,
  onChangeRole,
}: DashboardTopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-5 sm:px-10 h-16 bg-[#080809]/80 backdrop-blur-md border-b border-white/[0.08]">
      <Link
        href="/dashboard"
        className="text-sm sm:text-base font-semibold text-white tracking-tight"
      >
        PTSC portal
      </Link>

      <div className="flex items-center gap-5 sm:gap-8">
        <nav className="hidden md:flex items-center gap-7 text-sm">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              aria-current={link.active ? "page" : undefined}
              className={`transition-colors ${
                link.active
                  ? "text-white"
                  : "text-neutral-500 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* No auth backend yet: lets you preview what each role can see. */}
        <label className="flex items-center gap-2 text-[11px] text-neutral-500">
          <span className="hidden sm:inline uppercase tracking-wider font-bold">
            View as
          </span>
          <select
            value={role}
            onChange={(e) => onChangeRole(e.target.value as DashboardRole)}
            className="px-2.5 py-1.5 bg-[#18181b] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-white/30 cursor-pointer"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <div
          className="relative w-8 h-8 rounded-full overflow-hidden bg-neutral-800 border border-white/20 shrink-0"
          title={`${ADMIN_USER.name} · ${ADMIN_USER.email}`}
        >
          <Image
            src={ADMIN_USER.avatar}
            alt={ADMIN_USER.name}
            fill
            sizes="32px"
            className="object-cover"
          />
        </div>
      </div>
    </header>
  );
}
