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

const STATUS_FILTERS = ["All", "Pending", "Approved"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const ROLES: DashboardRole[] = ["normal", "member", "admin"];

const STATUS_STYLE: Record<UserStatus, string> = {
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

type Edits = Pick<AdminUser, "role" | "batch" | "post">;

interface AdminUsersViewProps {
  users: AdminUser[];
  allowSignup: boolean;
  onToggleSignup: (allow: boolean) => void;
  onApprove: (id: string) => void;
  onSave: (id: string, changes: Edits) => void;
  /** Deletes an approved user, or denies (removes) a pending request. */
  onDelete: (id: string) => void;
}

const field =
  "px-3 py-1.5 bg-[#18181b] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-white/30";

export default function AdminUsersView({
  users,
  allowSignup,
  onToggleSignup,
  onApprove,
  onSave,
  onDelete,
}: AdminUsersViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  // Unsaved row edits, keyed by user id. Cleared per row on Save.
  const [edits, setEdits] = useState<Record<string, Partial<Edits>>>({});

  const pendingCount = users.filter((u) => u.status === "pending").length;

  const query = search.trim().toLowerCase();
  const visible = users.filter((u) => {
    if (statusFilter !== "All" && u.status !== statusFilter.toLowerCase())
      return false;
    if (!query) return true;
    return [u.firstName, u.lastName, u.email, u.username, u.mobile].some((v) =>
      v.toLowerCase().includes(query)
    );
  });

  const current = (u: AdminUser): Edits => ({
    role: edits[u.id]?.role ?? u.role,
    batch: edits[u.id]?.batch !== undefined ? edits[u.id]!.batch! : u.batch,
    post: edits[u.id]?.post ?? u.post,
  });

  const patch = (id: string, change: Partial<Edits>) =>
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...change } }));

  const handleSave = (u: AdminUser) => {
    onSave(u.id, current(u));
    setEdits((prev) => {
      const next = { ...prev };
      delete next[u.id];
      return next;
    });
  };

  const handleApprove = (u: AdminUser) => {
    if (window.confirm("Approve this user?")) onApprove(u.id);
  };

  const handleDeny = (u: AdminUser) => {
    if (window.confirm("Deny this user? This will delete their request."))
      onDelete(u.id);
  };

  const handleDelete = (u: AdminUser) => {
    if (window.confirm("Delete this user? This action cannot be undone."))
      onDelete(u.id);
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
            onChange={(e) => setSearch(e.target.value)}
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
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      </div>

      {visible.length > 0 ? (
        <div className="bg-[#111113] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] text-neutral-500 text-xs font-medium">
                <tr>
                  <th className="py-3.5 px-5">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Username</th>
                  <th className="py-3.5 px-4">Mobile</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Batch</th>
                  <th className="py-3.5 px-4">Post</th>
                  <th className="py-3.5 px-5 text-center">Actions</th>
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

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3.5 px-5 font-semibold text-white whitespace-nowrap">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-400">{u.email}</td>
                      <td className="py-3.5 px-4 text-neutral-400">{u.username}</td>
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
                          className={`${field} cursor-pointer`}
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
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-center gap-2">
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(u)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-xs font-medium transition-colors cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeny(u)}
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
                                disabled={!dirty}
                                className="px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-500/15"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(u)}
                                className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs font-medium transition-colors cursor-pointer"
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
    </StaggerList>
  );
}
