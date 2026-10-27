"use client";

import React, { createContext, useContext, useState } from "react";
import type { SessionUser } from "@/lib/auth/types";
import {
  INITIAL_EVENTS,
  INITIAL_USERS,
  INITIAL_REGISTRATIONS,
  INITIAL_MEDIA,
  INITIAL_ADVISORS,
  AdminEvent,
  AdminUser,
  Registration,
  MediaItem,
  FacultyAdvisor,
  DashboardRole,
} from "@/lib/dashboard";

interface AdminDashboardContextType {
  events: AdminEvent[];
  users: AdminUser[];
  registrations: Registration[];
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
  handleCreateEvent: (
    eventData: Omit<AdminEvent, "id" | "registeredCount" | "attendedCount">
  ) => void;
  handleDeleteEvent: (id: string) => void;
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
  const [events, setEvents] = useState<AdminEvent[]>(INITIAL_EVENTS);
  // Sample data, only used for the Overview count. The Users page loads real
  // accounts from /api/admin/users.
  const [users] = useState<AdminUser[]>(INITIAL_USERS);
  // Sample data, only used for the Overview numbers. The Registrations and
  // Attendance pages load real data from the API.
  const [registrations] = useState<Registration[]>(INITIAL_REGISTRATIONS);
  const [media, setMedia] = useState<MediaItem[]>(INITIAL_MEDIA);
  const [advisors, setAdvisors] = useState<FacultyAdvisor[]>(INITIAL_ADVISORS);
  // No auth backend yet; the sidebar lets you preview each role's tab access.
  const [role, setRole] = useState<DashboardRole>(user.role);

  const handleCreateEvent = (
    eventData: Omit<AdminEvent, "id" | "registeredCount" | "attendedCount">
  ) => {
    const newEvent: AdminEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
      registeredCount: 0,
      attendedCount: 0,
    };
    setEvents((prev) => [newEvent, ...prev]);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

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
        events,
        users,
        registrations,
        media,
        advisors,
        currentUser: user,
        role,
        setRole,
        handleCreateEvent,
        handleDeleteEvent,
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
