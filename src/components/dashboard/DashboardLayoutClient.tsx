"use client";

import { useState } from "react";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  AdminDashboardProvider,
  useAdminDashboard,
} from "@/context/AdminDashboardContext";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { events, users, attendance, campaigns } = useAdminDashboard();

  return (
    <div className="relative min-h-screen bg-[#080809] text-white selection:bg-white selection:text-black overflow-x-clip flex">
      {/* 1. Admin Sidebar */}
      <DashboardSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        stats={{
          activeEvents: events.filter(
            (e) => e.status === "Active" || e.status === "Upcoming"
          ).length,
          totalUsers: users.length,
          pendingAttendance: attendance.filter((a) => a.status === "Pending").length,
          queuedMails: campaigns.filter((c) => c.status === "Queued").length,
        }}
      />

      {/* 2. Main Admin Workspace */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <DashboardHeader
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 px-6 sm:px-10 py-8 max-w-6xl w-full mx-auto">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminDashboardProvider>
      <DashboardShell>{children}</DashboardShell>
    </AdminDashboardProvider>
  );
}
