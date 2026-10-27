"use client";

import AdminUsersView from "@/components/dashboard/AdminUsersView";
import { useAdminDashboard } from "@/context/AdminDashboardContext";

export default function UsersPage() {
  const {
    users,
    allowSignup,
    setAllowSignup,
    handleApproveUser,
    handleSaveUser,
    handleDeleteUser,
  } = useAdminDashboard();

  return (
    <AdminUsersView
      users={users}
      allowSignup={allowSignup}
      onToggleSignup={setAllowSignup}
      onApprove={handleApproveUser}
      onSave={handleSaveUser}
      onDelete={handleDeleteUser}
    />
  );
}
