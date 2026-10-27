import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminDashboardProvider } from "@/context/AdminDashboardContext";
import { getCurrentUser } from "@/lib/auth/user";

export const metadata = {
  title: "Dashboard | PTSC Portal",
  description:
    "Manage PTSC campus events, registrations, attendance, members, and broadcasts.",
};

// Reads the session from the database on every request, so a deleted or
// un-approved user loses access immediately. The proxy only checks the cookie.
async function DashboardSession({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  // Not /login directly: the cookie may still be valid, and the proxy would
  // bounce a "signed-in" visitor from /login straight back here.
  if (!user) redirect("/api/auth/session-expired");

  // One provider shared by the dashboard tabs and the create-event route, so a
  // newly created event is still there when you navigate back.
  return <AdminDashboardProvider user={user}>{children}</AdminDashboardProvider>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Reading the session is request-time work, so with Cache Components it must
  // stream in behind a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <DashboardSession>{children}</DashboardSession>
    </Suspense>
  );
}
