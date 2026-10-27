import DashboardLayoutClient from "@/components/dashboard/DashboardLayoutClient";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
