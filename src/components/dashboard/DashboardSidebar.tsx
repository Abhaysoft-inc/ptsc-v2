"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  QrCode,
  Mail,
  ImageIcon,
  Users,
  GraduationCap,
  FolderGit2,
  Trophy,
  PenLine,
  UserCog,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import type { DashboardRole } from "@/lib/dashboard";
import { setSessionUser } from "@/lib/auth/client-session";

export type DashboardTab =
  | "overview"
  | "events"
  | "registrations"
  | "attendance"
  | "mails"
  | "media"
  | "projects"
  | "blog"
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
  { id: "projects", label: "Projects", href: "/dashboard/projects", icon: FolderGit2, roles: STAFF },
  { id: "blog", label: "Blog", href: "/dashboard/blog", icon: PenLine, roles: ALL },
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
  /** Labels shown next to the icons (md screens and up). */
  expanded: boolean;
  onToggle: () => void;
}

export default function DashboardSidebar({ role, expanded, onToggle }: DashboardSidebarProps) {
  const activeTab = getTabFromPath(usePathname());
  const router = useRouter();

  // Clears the session cookie on the server, then leaves the dashboard.
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setSessionUser(null); // so the navbar goes back to "Sign in"
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };
  const visibleTabs = getVisibleTabs(role);

  // On phones the sidebar is always the icon rail; from md up it follows `expanded`.
  const wide = expanded ? "md:w-[224px] md:items-stretch" : "";
  const label = expanded ? "hidden md:inline truncate" : "hidden";
  const row = expanded ? "md:w-full md:justify-start md:gap-3 md:px-3" : "";
  // The floating name only appears when the name isn't already shown.
  const tooltip = expanded ? "md:hidden" : "";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-[64px] flex-col items-center border-r border-white/[0.08] bg-[#0d0d10] px-2 py-4 transition-[width] duration-200 ${wide}`}
    >
      {/* Logo + collapse toggle */}
      <div className={`flex items-center ${expanded ? "md:justify-between md:px-1" : ""} justify-center`}>
        <Link
          href="/"
          aria-label="PTSC home"
          className="flex items-center gap-2.5 select-none"
        >
          <span className="relative h-10 w-10 shrink-0 rounded-xl border border-white/10 bg-white/[0.04] transition-colors hover:bg-white/10">
            <Image src="/logo.png" alt="PTSC logo" fill sizes="40px" priority className="object-contain p-1.5" />
          </span>
          <span className={`${label} text-sm font-bold tracking-tight text-white`}>PTSC</span>
        </Link>
        {expanded && (
          <button
            type="button"
            onClick={onToggle}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
            aria-expanded
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-white/5 hover:text-white cursor-pointer md:flex"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {!expanded && (
        <button
          type="button"
          onClick={onToggle}
          title="Expand sidebar"
          aria-label="Expand sidebar"
          aria-expanded={false}
          className="mt-3 hidden h-8 w-11 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-white/5 hover:text-white cursor-pointer md:flex"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}

      {/* Tabs */}
      <nav
        aria-label="Dashboard sections"
        className={`mt-6 flex w-full flex-1 flex-col items-center gap-1.5 overflow-y-auto no-scrollbar ${expanded ? "md:items-stretch" : ""}`}
      >
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              title={expanded ? undefined : tab.label}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
              className={`group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-medium transition-colors cursor-pointer ${row} ${
                isActive
                  ? "bg-white/10 text-white shadow-inner ring-1 ring-white/10"
                  : "text-neutral-500 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className={label}>{tab.label}</span>

              {/* Hover label when only the icon shows */}
              <span
                className={`pointer-events-none absolute left-[calc(100%+10px)] z-50 whitespace-nowrap rounded-md border border-white/10 bg-[#1c1c20] px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-xl transition-all group-hover:opacity-100 ${tooltip}`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        title={expanded ? undefined : "Logout"}
        aria-label="Logout"
        className={`mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-medium text-neutral-500 transition-colors hover:bg-red-500/10 hover:text-red-400 cursor-pointer ${row}`}
      >
        <LogOut className="h-[18px] w-[18px] shrink-0" />
        <span className={label}>Logout</span>
      </button>
    </aside>
  );
}
