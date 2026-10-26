"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Key,
  Lock,
  CheckCircle2,
  Bell,
  Cpu,
  Copy,
  Save,
} from "lucide-react";
import { ADMIN_USER } from "@/lib/dashboard";
import StaggerList from "@/components/motion/StaggerList";

export default function AdminProfileView() {
  const [name, setName] = useState(ADMIN_USER.name);
  const [email, setEmail] = useState(ADMIN_USER.email);
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [twoFactor, setTwoFactor] = useState(ADMIN_USER.twoFactorEnabled);
  const [copiedKey, setCopiedKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const apiKey = "ptsc_sec_live_49f82bc90a12e87";

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <StaggerList className="space-y-8 max-w-4xl">
      {/* 1. Admin Header Profile Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/15 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-16 rounded-none bg-neutral-800 border border-white/20 overflow-hidden shrink-0">
              <Image
                src={ADMIN_USER.avatar}
                alt={name}
                fill
                className="object-cover rounded-none"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                  {ADMIN_USER.badge}
                </span>
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Session
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{name}</h2>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                {ADMIN_USER.role} • {ADMIN_USER.nodeId}
              </p>
            </div>
          </div>

          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 font-mono">
            {ADMIN_USER.securityLevel}
          </div>
        </div>
      </div>

      {/* 2. Admin Settings Form */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/10 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Profile &amp; Credentials
            </h3>
            <p className="text-xs text-neutral-400">
              Update your administrative profile and communication settings.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Admin Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#18181c] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#18181c] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Campus Department
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-[#18181c] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/40"
            />
          </div>

          {/* Security & 2FA Toggle */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Two-Factor Authentication (2FA)</span>
              </p>
              <p className="text-[11px] text-neutral-400">
                Requires hardware TOTP token for high-privilege event data mutations.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setTwoFactor(!twoFactor)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                twoFactor
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/5 text-neutral-400 border border-white/10"
              }`}
            >
              {twoFactor ? "Enabled" : "Disabled"}
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Administrator profile changes committed successfully!</span>
          </div>
        )}
      </div>

      {/* 3. API & Webhook Credentials */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-neutral-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Root API Credentials
            </h3>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">
            REST &amp; Webhook Access
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#18181c] border border-white/10 flex items-center justify-between gap-4">
          <div className="font-mono text-xs text-neutral-300 truncate">
            {apiKey}
          </div>
          <button
            type="button"
            onClick={handleCopyKey}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedKey ? "Copied!" : "Copy Key"}</span>
          </button>
        </div>
      </div>
    </StaggerList>
  );
}
