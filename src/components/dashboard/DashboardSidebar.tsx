"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  QrCode,
  Mail,
  ImageIcon,
  Users,
  GraduationCap,
  Trophy,
  UserCog,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import type { DashboardRole } from "@/lib/dashboard";

export type DashboardTab =
  | "overview"
  | "events"
  | "registrations"
  | "attendance"
  | "mails"
  | "media"
  | "users"
  | "advisors"
  | "leaderboard"
  | "profile";

interface TabConfig {
  id: DashboardTab;
  label: string;
  /** Each tab is its own route, so the URL carries which page you're on. */
  href: string;
  icon: LucideIcon;
  roles: DashboardRole[];
}

const ALL: DashboardRole[] = ["admin", "member", "normal"];
const STAFF: DashboardRole[] = ["admin", "member"];

export const DASHBOARD_TABS: TabConfig[] = [
  { id: "overview", label: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: STAFF },
  { id: "events", label: "Events", href: "/dashboard/events", icon: CalendarDays, roles: ALL },
  { id: "registrations", label: "Registrations", href: "/dashboard/registrations", icon: ClipboardList, roles: STAFF },
  { id: "attendance", label: "Attendance", href: "/dashboard/attendance", icon: QrCode, roles: STAFF },
  { id: "mails", label: "Mail Management", href: "/dashboard/mail", icon: Mail, roles: STAFF },
  { id: "media", label: "Media", href: "/dashboard/media", icon: ImageIcon, roles: ALL },
  { id: "users", label: "Users", href: "/dashboard/users", icon: Users, roles: ["admin"] },
  { id: "advisors", label: "Faculty Advisors", href: "/dashboard/advisors", icon: GraduationCap, roles: ["admin"] },
  { id: "leaderboard", label: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy, roles: STAFF },
  { id: "profile", label: "My Profile", href: "/dashboard/profile", icon: UserCog, roles: ALL },
];

export function getTabFromPath(pathname: string): DashboardTab | null {
  if (pathname === "/dashboard") return "overview";
  const match = DASHBOARD_TABS.find(
    (t) => t.href !== "/dashboard" && pathname.startsWith(t.href)
  );
  return match?.id ?? null;
}

export function getTabHref(tab: DashboardTab) {
  return DASHBOARD_TABS.find((t) => t.id === tab)!.href;
}

export function getVisibleTabs(role: DashboardRole) {
  return DASHBOARD_TABS.filter((tab) => tab.roles.includes(role));
}

interface DashboardSidebarProps {
  role: DashboardRole;
  /** Tabs that should show an attention dot (e.g. pending items). */
  alertTabs?: DashboardTab[];
}

export default function DashboardSidebar({
  role,
  alertTabs = [],
}: DashboardSidebarProps) {
  const activeTab = getTabFromPath(usePathname());
  const visibleTabs = getVisibleTabs(role);
  const alerts = new Set(alertTabs);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-[64px] bg-[#0d0d10] border-r border-white/[0.08] flex flex-col items-center py-4">
      {/* Logo */}
      <Link
        href="/"
        aria-label="PTSC home"
        className="relative w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/10 transition-colors select-none"
      >
        <Image
          src="/logo.png"
          alt="PTSC logo"
          fill
          sizes="40px"
          priority
          className="object-contain p-1.5"
        />
      </Link>

      {/* Tab icons */}
      <nav
        aria-label="Dashboard sections"
        className="mt-6 flex-1 flex flex-col items-center gap-1.5 w-full px-2 overflow-y-auto no-scrollbar"
      >
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              title={tab.label}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
              className={`group relative w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isActive
                  ? "bg-white/10 text-white shadow-inner ring-1 ring-white/10"
                  : "text-neutral-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />

              {alerts.has(tab.id) && !isActive && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}

              {/* Hover label */}
              <span className="pointer-events-none absolute left-[calc(100%+10px)] z-50 whitespace-nowrap px-2 py-1 rounded-md bg-[#1c1c20] border border-white/10 text-[11px] font-medium text-white opacity-0 translate-x-(-1) group-hover:opacity-100 group-hover:translate-x-0 transition-all shadow-xl">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <Link
        href="/login"
        title="Logout"
        aria-label="Logout"
        className="mt-2 w-11 h-11 rounded-xl flex items-center justify-center text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <LogOut className="w-[18px] h-[18px]" />
      </Link>
    </aside>
  );
}
