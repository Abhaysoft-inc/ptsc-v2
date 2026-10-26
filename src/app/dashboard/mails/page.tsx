"use client";

import AdminMailView from "@/components/dashboard/AdminMailView";
import { useAdminDashboard } from "@/context/AdminDashboardContext";

export default function AdminMailPage() {
  const { campaigns, handleSendMail } = useAdminDashboard();

  return <AdminMailView campaigns={campaigns} onSendMail={handleSendMail} />;
}
