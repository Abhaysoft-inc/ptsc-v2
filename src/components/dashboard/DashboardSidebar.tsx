"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  QrCode,
  Mail,
  UserCog,
  X,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { ADMIN_USER } from "@/lib/dashboard";

export type AdminDashboardTab =
  | "overview"
  | "events"
  | "users"
  | "attendance"
  | "mails"
  | "profile";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  stats?: {
    activeEvents: number;
    totalUsers: number;
    pendingAttendance: number;
    queuedMails: number;
  };
}

export default function DashboardSidebar({
  isOpen,
  onClose,
  stats,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      id: "overview" as AdminDashboardTab,
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "events" as AdminDashboardTab,
      label: "Manage Events",
      href: "/dashboard/events",
      icon: CalendarDays,
      badge: stats ? `${stats.activeEvents} Active` : "4",
    },
    {
      id: "users" as AdminDashboardTab,
      label: "Manage Users",
      href: "/dashboard/users",
      icon: Users,
      badge: stats ? `${stats.totalUsers}` : "6",
    },
    {
      id: "attendance" as AdminDashboardTab,
      label: "Attendance",
      href: "/dashboard/attendance",
      icon: QrCode,
      badge: stats ? `${stats.pendingAttendance} Pending` : "Live",
    },
    {
      id: "mails" as AdminDashboardTab,
      label: "Mail Management",
      href: "/dashboard/mails",
      icon: Mail,
      badge: stats ? `${stats.queuedMails} Queued` : "Broadcast",
    },
    {
      id: "profile" as AdminDashboardTab,
      label: "My Profile",
      href: "/dashboard/profile",
      icon: UserCog,
      badge: "Admin",
    },
  ];

  const isTabActive = (itemHref: string) => {
    if (itemHref === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(itemHref);
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0d0d10] border-r border-white/[0.08] flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo Bar */}
          <div className="p-6 pb-5 flex items-center justify-between border-b border-white/[0.08]">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-white font-bold tracking-tight hover:opacity-85 transition-opacity select-none"
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
              <span className="tracking-tight font-bold">PTSC</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-semibold">
                ADMIN
              </span>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="lg:hidden text-neutral-400 hover:text-white p-1 cursor-pointer"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-6 flex-1">
            <div>
              <div className="px-3 flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Admin Console
                </p>
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isTabActive(item.href);

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={onClose}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-white text-black shadow-md"
                          : "text-neutral-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-neutral-400"}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                            isActive
                              ? "bg-black/10 text-black font-bold"
                              : "bg-white/5 text-neutral-400 border border-white/10"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Admin Notice Box */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[11px] text-neutral-400 space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-300 font-semibold text-xs">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Restricted Node</span>
              </div>
              <p className="text-[10px] leading-relaxed text-neutral-400">
                You are authenticated as Campus Superadmin with full database mutation access.
              </p>
            </div>
          </div>

          {/* Profile Capsule at Bottom of Sidebar */}
          <div className="p-4 border-t border-white/[0.08] bg-[#0f0f12]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-neutral-800 border border-white/20 shrink-0">
                  <Image
                    src={ADMIN_USER.avatar}
                    alt={ADMIN_USER.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{ADMIN_USER.name}</p>
                  <p className="text-[10px] text-red-400 font-mono truncate">{ADMIN_USER.role}</p>
                </div>
              </div>

              <Link
                href="/login"
                title="Sign Out"
                className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
}
