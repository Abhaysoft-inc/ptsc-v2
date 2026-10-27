"use client";

import AdminAdvisorsView from "@/components/dashboard/AdminAdvisorsView";
import { useAdminDashboard } from "@/context/AdminDashboardContext";

export default function AdvisorsPage() {
  const { advisors, handleSaveAdvisor, handleDeleteAdvisor } =
    useAdminDashboard();

  return (
    <AdminAdvisorsView
      advisors={advisors}
      onSave={handleSaveAdvisor}
      onDelete={handleDeleteAdvisor}
    />
  );
}
