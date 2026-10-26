"use client";

import AdminUsersView from "@/components/dashboard/AdminUsersView";
import { useAdminDashboard } from "@/context/AdminDashboardContext";

export default function AdminUsersPage() {
  const { users, handleToggleUserRole, handleToggleUserStatus } =
    useAdminDashboard();

  return (
    <AdminUsersView
      users={users}
      onToggleRole={handleToggleUserRole}
      onToggleStatus={handleToggleUserStatus}
    />
  );
}
