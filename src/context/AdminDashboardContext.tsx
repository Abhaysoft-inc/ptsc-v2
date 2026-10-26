"use client";

import React, { createContext, useContext, useState } from "react";
import {
  INITIAL_EVENTS,
  INITIAL_USERS,
  INITIAL_ATTENDANCE,
  INITIAL_MAILS,
  AdminEvent,
  AdminUser,
  AttendanceRecord,
  MailCampaign,
} from "@/lib/dashboard";

interface AdminDashboardContextType {
  events: AdminEvent[];
  users: AdminUser[];
  attendance: AttendanceRecord[];
  campaigns: MailCampaign[];
  handleCreateEvent: (
    eventData: Omit<AdminEvent, "id" | "registeredCount" | "attendedCount">
  ) => void;
  handleDeleteEvent: (id: string) => void;
  handleToggleUserRole: (id: string) => void;
  handleToggleUserStatus: (id: string) => void;
  handleToggleCheckIn: (id: string) => void;
  handleQuickVerify: (ticketId: string) => boolean;
  handleSendMail: (
    campaignData: Omit<MailCampaign, "id" | "sentAt" | "openRate">
  ) => void;
}

const AdminDashboardContext = createContext<AdminDashboardContextType | undefined>(
  undefined
);

export function AdminDashboardProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<AdminEvent[]>(INITIAL_EVENTS);
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [campaigns, setCampaigns] = useState<MailCampaign[]>(INITIAL_MAILS);

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

  const handleToggleUserRole = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const nextRole =
          u.role === "Student Builder"
            ? "Core Organizer"
            : u.role === "Core Organizer"
            ? "Admin"
            : "Student Builder";
        return { ...u, role: nextRole };
      })
    );
  };

  const handleToggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        return { ...u, status: u.status === "Active" ? "Suspended" : "Active" };
      })
    );
  };

  const handleToggleCheckIn = (id: string) => {
    setAttendance((prev) =>
      prev.map((record) => {
        if (record.id !== id) return record;
        const isPresent = record.status === "Checked In" || record.status === "Late";
        return {
          ...record,
          status: isPresent ? "Pending" : "Checked In",
          checkInTime: isPresent ? "—" : "Just now",
        };
      })
    );
  };

  const handleQuickVerify = (ticketId: string): boolean => {
    const cleanId = ticketId.trim().toUpperCase();
    const match = attendance.find((a) => a.ticketId.toUpperCase() === cleanId);
    if (!match) return false;

    setAttendance((prev) =>
      prev.map((record) =>
        record.id === match.id
          ? { ...record, status: "Checked In", checkInTime: "Just now" }
          : record
      )
    );
    return true;
  };

  const handleSendMail = (
    campaignData: Omit<MailCampaign, "id" | "sentAt" | "openRate">
  ) => {
    const newCampaign: MailCampaign = {
      ...campaignData,
      id: `mail-${Date.now()}`,
      sentAt: "Just now",
      openRate: "100%",
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
  };

  return (
    <AdminDashboardContext.Provider
      value={{
        events,
        users,
        attendance,
        campaigns,
        handleCreateEvent,
        handleDeleteEvent,
        handleToggleUserRole,
        handleToggleUserStatus,
        handleToggleCheckIn,
        handleQuickVerify,
        handleSendMail,
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
