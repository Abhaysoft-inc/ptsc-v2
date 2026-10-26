"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Users,
  Search,
  CheckCircle2,
  Ban,
} from "lucide-react";
import { AdminUser } from "@/lib/dashboard";
import StaggerList from "@/components/motion/StaggerList";

interface AdminUsersViewProps {
  users: AdminUser[];
  onToggleRole: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export default function AdminUsersView({
  users,
  onToggleRole,
  onToggleStatus,
}: AdminUsersViewProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.batch.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <StaggerList className="space-y-6">
      {/* Top Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search users by name, email, or batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#121215] border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {["All", "Core Organizer", "Student Builder", "Admin"].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                roleFilter === role
                  ? "bg-white text-black font-semibold"
                  : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table / Card List */}
      <div className="bg-[#111113] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151518] border-b border-white/[0.08] text-neutral-400 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">User</th>
                <th className="py-3.5 px-4">Batch</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Builds</th>
                <th className="py-3.5 px-4">Events</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.06]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* User Profile */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-none overflow-hidden bg-neutral-800 border border-white/10 shrink-0">
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          fill
                          className="object-cover rounded-none"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Batch */}
                  <td className="py-3.5 px-4 font-mono text-neutral-300">
                    {user.batch}
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        user.role === "Admin"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : user.role === "Core Organizer"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-mono ${
                        user.status === "Active" ? "text-emerald-400" : "text-neutral-500"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          user.status === "Active" ? "bg-emerald-400" : "bg-neutral-500"
                        }`}
                      />
                      {user.status}
                    </span>
                  </td>

                  {/* Projects */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-white">
                    {user.projectsCount}
                  </td>

                  {/* Events */}
                  <td className="py-3.5 px-4 font-mono text-neutral-400">
                    {user.eventsAttended}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleRole(user.id)}
                        title="Toggle Role (Promote/Demote)"
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-neutral-300 hover:text-white transition-colors cursor-pointer border border-white/10"
                      >
                        Change Role
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleStatus(user.id)}
                        title={user.status === "Active" ? "Suspend Member" : "Activate Member"}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          user.status === "Active"
                            ? "text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
                            : "text-emerald-400 hover:bg-emerald-500/10"
                        }`}
                      >
                        {user.status === "Active" ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-16 bg-[#111113] rounded-2xl border border-white/10">
          <Users className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">No campus members found</p>
          <p className="text-xs text-neutral-400 mt-1">Try adjusting the search query or filter.</p>
        </div>
      )}
    </StaggerList>
  );
}
