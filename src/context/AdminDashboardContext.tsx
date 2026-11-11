"use client";

import React, { createContext, useContext, useState } from "react";
import type { SessionUser } from "@/lib/auth/types";
import {
  INITIAL_MEDIA,
  INITIAL_ADVISORS,
  MediaItem,
  FacultyAdvisor,
  DashboardRole,
} from "@/lib/dashboard";

interface AdminDashboardContextType {
  media: MediaItem[];
  advisors: FacultyAdvisor[];
  /** The signed-in user. */
  currentUser: SessionUser;
  /**
   * The role the dashboard is currently showing. Starts as the user's real
   * role; admins may switch it to preview what lower roles see.
   */
  role: DashboardRole;
  setRole: (role: DashboardRole) => void;
  handleAddMedia: (item: Omit<MediaItem, "id" | "uploadedAt">) => void;
  handleDeleteMedia: (id: string) => void;
  handleSaveAdvisor: (advisor: Omit<FacultyAdvisor, "id"> & { id?: string }) => void;
  handleDeleteAdvisor: (id: string) => void;
}

const AdminDashboardContext = createContext<AdminDashboardContextType | undefined>(
  undefined
);

export function AdminDashboardProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: SessionUser;
}) {
  // Events, users, registrations and the overview load from /api/admin/*. Media
  // and advisors are still sample data held in memory.
  const [media, setMedia] = useState<MediaItem[]>(INITIAL_MEDIA);
  const [advisors, setAdvisors] = useState<FacultyAdvisor[]>(INITIAL_ADVISORS);
  // No auth backend yet; the sidebar lets you preview each role's tab access.
  const [role, setRole] = useState<DashboardRole>(user.role);

  const handleAddMedia = (item: Omit<MediaItem, "id" | "uploadedAt">) => {
    const uploadedAt = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    setMedia((prev) => [{ ...item, id: `med-${Date.now()}`, uploadedAt }, ...prev]);
  };

  const handleDeleteMedia = (id: string) => {
    setMedia((prev) => {
      const target = prev.find((m) => m.id === id);
      if (target?.src.startsWith("blob:")) URL.revokeObjectURL(target.src);
      return prev.filter((m) => m.id !== id);
    });
  };

  const handleSaveAdvisor = (
    advisor: Omit<FacultyAdvisor, "id"> & { id?: string }
  ) => {
    const { id } = advisor;
    if (id) {
      setAdvisors((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...advisor, id } : a))
      );
    } else {
      setAdvisors((prev) => [...prev, { ...advisor, id: `adv-${Date.now()}` }]);
    }
  };

  const handleDeleteAdvisor = (id: string) => {
    setAdvisors((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AdminDashboardContext.Provider
      value={{
        media,
        advisors,
        currentUser: user,
        role,
        setRole,
        handleAddMedia,
        handleDeleteMedia,
        handleSaveAdvisor,
        handleDeleteAdvisor,
      }}
    >
      {children}
    </AdminDashboardContext.Provider>
  );
}

export function useAdminDashboard() {
  const context = useContext(AdminDashboardContext);
  if (!context) {
    throw new Error("useAdminDashboard must be used within an AdminDashboardProvider");
  }
  return context;
}
