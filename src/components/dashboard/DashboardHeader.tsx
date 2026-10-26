"use client";

import { usePathname, useRouter } from "next/navigation";
import { Menu, Plus, ShieldCheck, Mail, QrCode } from "lucide-react";
import { AdminDashboardTab } from "./DashboardSidebar";

interface DashboardHeaderProps {
  onOpenMobileSidebar: () => void;
}

export default function DashboardHeader({
  onOpenMobileSidebar,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isCreateEventPage = pathname === "/dashboard/events/create";

  const getActiveTab = (): AdminDashboardTab => {
    if (pathname.includes("/dashboard/events")) return "events";
    if (pathname.includes("/dashboard/users")) return "users";
    if (pathname.includes("/dashboard/attendance")) return "attendance";
    if (pathname.includes("/dashboard/mails")) return "mails";
    if (pathname.includes("/dashboard/profile")) return "profile";
    return "overview";
  };

  const activeTab = getActiveTab();

  const tabTitles: Record<AdminDashboardTab, { title: string; subtitle: string }> = {
    overview: {
      title: "Admin Command Center",
      subtitle: "System overview, active events, and platform metrics",
    },
    events: {
      title: isCreateEventPage ? "Create Campus Event" : "Manage Events",
      subtitle: isCreateEventPage
        ? "Configure event logistics, seat allocations, and attendee check-in desks"
        : "Create, monitor registrations, and manage campus event schedules",
    },
    users: {
      title: "Manage Users",
      subtitle: "Community members, builders, and administrative roles",
    },
    attendance: {
      title: "Attendance Desk",
      subtitle: "Real-time attendee check-in and QR ticket verification",
    },
    mails: {
      title: "Mail Management",
      subtitle: "Broadcast announcements, event notifications, and email logs",
    },
    profile: {
      title: "My Profile",
      subtitle: "Admin security, credentials, and access permissions",
    },
  };

  const handleAction = () => {
    switch (activeTab) {
      case "events":
      case "overview":
        router.push("/dashboard/events/create");
        break;
      case "attendance":
        break;
      case "mails":
        router.push("/dashboard/mails");
        break;
      default:
        router.push("/dashboard/events/create");
        break;
    }
  };

  const getActionButton = () => {
    switch (activeTab) {
      case "events":
      case "overview":
        return { label: "Create Event", icon: Plus };
      case "attendance":
        return { label: "Scan QR Pass", icon: QrCode };
      case "mails":
        return { label: "Compose Blast", icon: Mail };
      default:
        return null;
    }
  };

  const action = getActionButton();
  const showActionButton =
    action !== null && !isCreateEventPage && activeTab !== "profile" && activeTab !== "users";

  return (
    <header className="sticky top-0 z-30 w-full bg-[#080809]/80 backdrop-blur-md border-b border-white/[0.08] px-6 sm:px-10 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer"
          aria-label="Open Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            {tabTitles[activeTab]?.title || "Admin Dashboard"}
          </h1>
          <p className="hidden md:block text-[11px] text-neutral-400 font-normal">
            {tabTitles[activeTab]?.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Security Node Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Root Authenticated</span>
        </div>

        {showActionButton && action && (
          <button
            type="button"
            onClick={handleAction}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <action.icon className="w-4 h-4 stroke-[2.5]" />
            <span>{action.label}</span>
          </button>
        )}
      </div>
    </header>
  );
}
