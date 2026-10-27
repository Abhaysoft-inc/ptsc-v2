import type { DashboardTab } from "./DashboardSidebar";

const TAB_COPY: Record<DashboardTab, { title: string; subtitle: string }> = {
  overview: {
    title: "Overview",
    subtitle: "System overview, active events, and platform metrics",
  },
  events: {
    title: "Events",
    subtitle: "Create, monitor registrations, and manage campus event schedules",
  },
  registrations: {
    title: "Registrations",
    subtitle: "Review sign-ups per event, inspect teams, and export the list",
  },
  attendance: {
    title: "Attendance",
    subtitle: "Mark who showed up at each event, then save",
  },
  mails: {
    title: "Mail Management",
    subtitle: "Send participation emails and certificates, and track delivery per event",
  },
  media: {
    title: "Media",
    subtitle: "Photos and highlights from PTSC events",
  },
  users: {
    title: "Users",
    subtitle: "Community members, builders, and administrative roles",
  },
  advisors: {
    title: "Faculty Advisors",
    subtitle: "Mentors and coordinators listed on the team page",
  },
  leaderboard: {
    title: "Leaderboard",
    subtitle: "Sync coding-platform ratings and recalculate rankings",
  },
  profile: {
    title: "My Profile",
    subtitle: "Account details, security, and access permissions",
  },
};

export default function DashboardHeader({ tab }: { tab: DashboardTab }) {
  const copy = TAB_COPY[tab];

  return (
    <div className="mb-8">
      <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
        {copy.title}
      </h1>
      <p className="text-sm text-neutral-500 mt-2">{copy.subtitle}</p>
    </div>
  );
}
