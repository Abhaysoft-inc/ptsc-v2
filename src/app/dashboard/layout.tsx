import DashboardLayoutClient from "@/components/dashboard/DashboardLayoutClient";

export const metadata = {
  title: "Admin Command Center | PTSC Portal",
  description:
    "Root superadmin management portal for PTSC campus events, members, attendance, and broadcasts.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
