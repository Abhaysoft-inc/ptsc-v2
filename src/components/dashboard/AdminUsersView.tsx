"use client";

import { useState } from "react";
import { Search, Users } from "lucide-react";
import {
  AdminUser,
  DashboardRole,
  POSTS,
  UserStatus,
} from "@/lib/dashboard";
import StaggerList from "@/components/motion/StaggerList";
import PillTabs from "@/components/dashboard/PillTabs";
import Pagination from "@/components/dashboard/Pagination";
import type { PageInfo } from "@/lib/types/admin";

export const USER_STATUS_FILTERS = ["All", "Pending", "Approved"] as const;
export type UserStatusFilter = (typeof USER_STATUS_FILTERS)[number];

export interface UsersPageInfo extends PageInfo {
  /** Pending requests across all pages, not just this one. */
  pendingCount: number;
}

const ROLES: DashboardRole[] = ["normal", "member", "admin"];

const STATUS_STYLE: Record<UserStatus, string> = {
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  denied: "bg-red-500/10 text-red-400 border-red-500/20",
};

type Edits = Pick<AdminUser, "role" | "batch" | "post">;

// Each action resolves to true once the server accepted it.
interface AdminUsersViewProps {
  users: AdminUser[];
  /** Your own row: its role and Delete are locked so you can't lock yourself out. */
  currentUserId?: string;
  allowSignup: boolean;
  onToggleSignup: (allow: boolean) => Promise<boolean>;
  onApprove: (id: string) => Promise<boolean>;
  onSave: (id: string, changes: Edits) => Promise<boolean>;
  /** Deletes an approved user, or denies (removes) a pending request. */
  onDelete: (id: string) => Promise<boolean>;
  // Search, filtering and paging happen on the server; the page owns them.
  search: string;
  onSearchChange: (search: string) => void;
  statusFilter: UserStatusFilter;
  onStatusFilterChange: (filter: UserStatusFilter) => void;
  pageInfo: UsersPageInfo;
  onPageChange: (page: number) => void;
  /** A new page or filter is loading; the current rows stay visible. */
  loading: boolean;
}

const field =
  "px-3 py-1.5 bg-[#18181b] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-white/30";

export default function AdminUsersView({
  users,
  currentUserId,
  allowSignup,
  onToggleSignup,
  onApprove,
  onSave,
  onDelete,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  pageInfo,
  onPageChange,
  loading,
}: AdminUsersViewProps) {
  // Unsaved row edits, keyed by user id. Cleared per row once Save succeeds.
  const [edits, setEdits] = useState<Record<string, Partial<Edits>>>({});
  // Rows with a request in flight, so buttons can't be double-clicked.
  const [busy, setBusy] = useState<Set<string>>(new Set());

  const track = async (id: string, action: () => Promise<boolean>) => {
    setBusy((prev) => new Set(prev).add(id));
    try {
      return await action();
    } finally {
      setBusy((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const { pendingCount } = pageInfo;
  const visible = users;

  const current = (u: AdminUser): Edits => ({
    role: edits[u.id]?.role ?? u.role,
    batch: edits[u.id]?.batch !== undefined ? edits[u.id]!.batch! : u.batch,
    post: edits[u.id]?.post ?? u.post,
  });

  const patch = (id: string, change: Partial<Edits>) =>
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...change } }));

  const handleSave = async (u: AdminUser) => {
    const ok = await track(u.id, () => onSave(u.id, current(u)));
    if (!ok) return; // keep the edits so nothing typed is lost
    setEdits((prev) => {
      const next = { ...prev };
      delete next[u.id];
      return next;
    });
  };

  const handleApprove = (u: AdminUser) => {
    if (window.confirm("Approve this user?")) track(u.id, () => onApprove(u.id));
  };

  const handleDeny = (u: AdminUser) => {
    if (window.confirm("Deny this user? This will delete their request."))
      track(u.id, () => onDelete(u.id));
  };

  const handleDelete = (u: AdminUser) => {
    if (window.confirm("Delete this user? This action cannot be undone."))
      track(u.id, () => onDelete(u.id));
  };

  return (
    <StaggerList className="space-y-6">
      {/* New signups control */}
      <div className="p-5 rounded-2xl bg-[#111113] border border-white/10 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Allow New Signups
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Toggle whether new users can create accounts from the signup page.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={allowSignup}
          onClick={() => onToggleSignup(!allowSignup)}
          className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
            allowSignup
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              : "bg-red-500/15 text-red-400 border-red-500/30"
          }`}
        >
          {allowSignup ? "Enabled" : "Disabled"}
        </button>
      </div>

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name, email, username, or mobile..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#121215] border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
          />
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="text-xs text-amber-400 font-mono">
              {pendingCount} pending
            </span>
          )}
          <PillTabs
            label="Filter users by status"
            options={USER_STATUS_FILTERS}
            value={statusFilter}
            onChange={onStatusFilterChange}
          />
        </div>
      </div>

      {visible.length > 0 ? (
        <div
          aria-busy={loading}
          className={`overflow-x-auto transition-opacity ${
            loading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] text-neutral-500 text-xs font-medium">
                <tr>
                  <th className="py-3.5 pr-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Mobile</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Batch</th>
                  <th className="py-3.5 px-4">Post</th>
                  <th className="py-3.5 pl-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.06]">
                {visible.map((u) => {
                  const value = current(u);
                  const dirty =
                    value.role !== u.role ||
                    value.batch !== u.batch ||
                    value.post !== u.post;
                  const isPending = u.status === "pending";
                  const isSelf = u.id === currentUserId;
                  const isBusy = busy.has(u.id);

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3.5 pr-4 font-semibold text-white whitespace-nowrap">
                        {u.firstName} {u.lastName}
                        {isSelf && (
                          <span className="ml-2 text-[11px] font-normal text-neutral-500">
                            (you)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-400">{u.email}</td>
                      <td className="py-3.5 px-4 text-neutral-400 whitespace-nowrap">
                        {u.mobile || "-"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium border capitalize ${STATUS_STYLE[u.status]}`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={value.role}
                          onChange={(e) =>
                            patch(u.id, { role: e.target.value as DashboardRole })
                          }
                          aria-label={`Role for ${u.firstName}`}
                          disabled={isSelf}
                          title={isSelf ? "You can't change your own role" : undefined}
                          className={`${field} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="number"
                          min={2000}
                          max={2100}
                          placeholder="Year"
                          value={value.batch ?? ""}
                          onChange={(e) =>
                            patch(u.id, {
                              batch:
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value),
                            })
                          }
                          aria-label={`Batch for ${u.firstName}`}
                          className={`${field} w-20`}
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={value.post}
                          onChange={(e) => patch(u.id, { post: e.target.value })}
                          aria-label={`Post for ${u.firstName}`}
                          className={`${field} cursor-pointer max-w-[11rem]`}
                        >
                          <option value="">—</option>
                          {POSTS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 pl-4">
                        <div className="flex items-center justify-center gap-2">
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(u)}
                                disabled={isBusy}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-xs font-medium transition-colors cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeny(u)}
                                disabled={isBusy}
                                className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs font-medium transition-colors cursor-pointer"
                              >
                                Deny
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSave(u)}
                                disabled={!dirty || isBusy}
                                className="px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-500/15"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(u)}
                                disabled={isSelf || isBusy}
                                title={isSelf ? "You can't delete your own account" : undefined}
                                className="disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs font-medium transition-colors cursor-pointer"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-[#111113] rounded-2xl border border-white/10">
          <Users className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">No users found</p>
          <p className="text-xs text-neutral-400 mt-1">
            Try a different search or filter.
          </p>
        </div>
      )}

      <Pagination
        info={pageInfo}
        onPageChange={onPageChange}
        loading={loading}
        noun={["user", "users"]}
      />
    </StaggerList>
  );
}

