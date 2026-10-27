"use client";

import AdminMediaView from "@/components/dashboard/AdminMediaView";
import { useAdminDashboard } from "@/context/AdminDashboardContext";

export default function MediaPage() {
  const { media, role, handleAddMedia, handleDeleteMedia } = useAdminDashboard();

  return (
    <AdminMediaView
      media={media}
      canManage={role !== "normal"}
      onAdd={handleAddMedia}
      onDelete={handleDeleteMedia}
    />
  );
}
