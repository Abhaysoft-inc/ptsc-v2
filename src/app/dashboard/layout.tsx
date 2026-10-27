import { AdminDashboardProvider } from "@/context/AdminDashboardContext";

export const metadata = {
  title: "Dashboard | PTSC Portal",
  description:
    "Manage PTSC campus events, registrations, attendance, members, and broadcasts.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // One provider shared by the dashboard SPA and the create-event route, so a
  // newly created event is still there when you navigate back.
  return <AdminDashboardProvider>{children}</AdminDashboardProvider>;
}
