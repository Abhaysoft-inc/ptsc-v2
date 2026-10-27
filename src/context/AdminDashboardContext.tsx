"use client";

import React, { createContext, useContext, useState } from "react";
import type { SessionUser } from "@/lib/auth/types";
import {
  INITIAL_EVENTS,
  INITIAL_USERS,
  INITIAL_MAIL_LOGS,
  INITIAL_REGISTRATIONS,
  INITIAL_MEDIA,
  INITIAL_ADVISORS,
  AdminEvent,
  AdminUser,
  MailLog,
  MailType,
  Registration,
  MediaItem,
  FacultyAdvisor,
  DashboardRole,
} from "@/lib/dashboard";

interface AdminDashboardContextType {
  events: AdminEvent[];
  users: AdminUser[];
  mailLogs: MailLog[];
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
  /** Whether the public signup page accepts new accounts. */
  allowSignup: boolean;
  setAllowSignup: (allow: boolean) => void;
  handleApproveUser: (id: string) => void;
  handleSaveUser: (
    id: string,
    changes: Pick<AdminUser, "role" | "batch" | "post">
  ) => void;
  /** Removes a user, or rejects a pending signup request. */
  handleDeleteUser: (id: string) => void;
  /** Persists present/absent for the given registration ids. */
  handleSaveAttendance: (updates: Record<string, boolean>) => void;
  /**
   * Queues `type` emails for everyone marked present at the event. People who
   * already have a sent or pending email of that type are skipped.
   */
  handleSendMail: (
    eventId: string,
    type: MailType
  ) => { queued: number; skipped: number };
  handleResendMail: (logId: string) => void;
  handleDeleteRegistration: (id: string) => void;
  handleRestoreRegistration: (id: string) => void;
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
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [allowSignup, setAllowSignup] = useState(true);
  const [mailLogs, setMailLogs] = useState<MailLog[]>(INITIAL_MAIL_LOGS);
  const [registrations, setRegistrations] =
    useState<Registration[]>(INITIAL_REGISTRATIONS);
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

  const handleApproveUser = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "approved" } : u))
    );
  };

  const handleDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleSaveUser = (
    id: string,
    changes: Pick<AdminUser, "role" | "batch" | "post">
  ) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...changes } : u)));
  };

  const handleSaveAttendance = (updates: Record<string, boolean>) => {
    setRegistrations((prev) =>
      prev.map((r) => (r.id in updates ? { ...r, attended: updates[r.id] } : r))
    );
  };

  // No mail backend yet: queued emails flip to "sent" after a short delay.
  const settleMail = (ids: string[]) => {
    setTimeout(() => {
      setMailLogs((prev) =>
        prev.map((log) =>
          ids.includes(log.id)
            ? { ...log, status: "sent", error: undefined }
            : log
        )
      );
    }, 1500);
  };

  const handleSendMail = (eventId: string, type: MailType) => {
    const stamp = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // One email per attendee: every team member, or the lone registrant.
    const attendees = registrations
      .filter((r) => r.eventId === eventId && !r.deleted && r.attended)
      .flatMap((r) =>
        r.type === "team" && r.participants?.length
          ? r.participants.map((p) => ({ name: p.name, email: p.email }))
          : [{ name: r.name, email: r.email }]
      );

    const alreadyMailed = new Set(
      mailLogs
        .filter(
          (l) =>
            l.eventId === eventId &&
            l.emailType === type &&
            l.status !== "failed"
        )
        .map((l) => l.recipientEmail)
    );

    const fresh = attendees.filter((a) => !alreadyMailed.has(a.email));
    const created: MailLog[] = fresh.map((a, i) => ({
      id: `log-${Date.now()}-${i}`,
      eventId,
      recipientName: a.name,
      recipientEmail: a.email,
      emailType: type,
      status: "pending",
      createdAt: stamp,
    }));

    if (created.length > 0) {
      // A failed email being re-sent as a new one replaces the old failed row.
      const retried = new Set(created.map((c) => c.recipientEmail));
      setMailLogs((prev) => [
        ...created,
        ...prev.filter(
          (l) =>
            !(
              l.eventId === eventId &&
              l.emailType === type &&
              l.status === "failed" &&
              retried.has(l.recipientEmail)
            )
        ),
      ]);
      settleMail(created.map((c) => c.id));
    }

    return { queued: created.length, skipped: attendees.length - created.length };
  };

  const handleResendMail = (logId: string) => {
    setMailLogs((prev) =>
      prev.map((l) =>
        l.id === logId ? { ...l, status: "pending", error: undefined } : l
      )
    );
    settleMail([logId]);
  };

  const setRegistrationDeleted = (id: string, deleted: boolean) => {
    setRegistrations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, deleted } : r))
    );
  };

  const handleDeleteRegistration = (id: string) => setRegistrationDeleted(id, true);
  const handleRestoreRegistration = (id: string) => setRegistrationDeleted(id, false);

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
        mailLogs,
        registrations,
        media,
        advisors,
        currentUser: user,
        role,
        setRole,
        handleCreateEvent,
        handleDeleteEvent,
        allowSignup,
        setAllowSignup,
        handleApproveUser,
        handleSaveUser,
        handleDeleteUser,
        handleSaveAttendance,
        handleSendMail,
        handleResendMail,
        handleDeleteRegistration,
        handleRestoreRegistration,
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
