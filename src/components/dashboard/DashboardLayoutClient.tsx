"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import DashboardSidebar, {
  getTabFromPath,
  getVisibleTabs,
} from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { useAdminDashboard } from "@/context/AdminDashboardContext";

// Rail + top bar + page title around whichever tab route is open. Each tab is
// its own route under /dashboard, so the URL is the source of truth for which
// tab you're on; shared data lives in AdminDashboardProvider (dashboard layout).
export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { role, setRole, currentUser } = useAdminDashboard();

  const visibleTabs = getVisibleTabs(role);
  const routeTab = getTabFromPath(pathname);
  const allowed = routeTab !== null && visibleTabs.some((t) => t.id === routeTab);
  const firstAllowedHref = visibleTabs[0].href;

  // Switching the previewed role can leave you on a tab that role can't see.
  useEffect(() => {
    if (!allowed) router.replace(firstAllowedHref);
  }, [allowed, firstAllowedHref, router]);

  return (
    <div className="relative min-h-screen bg-[#080809] text-white selection:bg-white selection:text-black overflow-x-clip">
      <DashboardSidebar role={role} />

      <div className="pl-[64px] min-h-screen flex flex-col">
        <DashboardTopBar
          user={currentUser}
          role={role}
          onChangeRole={setRole}
          // Only real admins may preview a lower role; everyone else sees their own.
          canPreviewRoles={currentUser.role === "admin"}
        />

        <main className="flex-1 px-5 sm:px-10 py-8 sm:py-10">
          <div className="max-w-7xl mx-auto">
            {allowed && routeTab && (
              <>
                <DashboardHeader tab={routeTab} />
                <motion.section
                  key={pathname}
                  className="min-w-0"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {children}
                </motion.section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
