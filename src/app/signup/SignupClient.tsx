"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, ArrowRight } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import AuthSuccessState from "@/components/auth/AuthSuccessState";

const BATCH_OPTIONS = [
  "Batch of 2026",
  "Batch of 2027",
  "Batch of 2028",
  "Batch of 2029",
  "Alumni / External Builder",
];

const DOMAIN_OPTIONS = [
  "Full Stack & Web",
  "AI & Systems",
  "Product & UI/UX Design",
  "Mobile & Micro-Apps",
  "Founder / Non-Technical",
];

export default function SignupClient() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [batch, setBatch] = useState("Batch of 2027");
  const [domain, setDomain] = useState("Full Stack & Web");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 600);
  };

  const leftFooter = (
    <div className="grid grid-cols-3 gap-3 text-center">
      <div>
        <p className="text-lg lg:text-xl font-bold text-white font-mono">1,200+</p>
        <p className="text-[10px] text-neutral-400 mt-0.5">Makers</p>
      </div>
      <div>
        <p className="text-lg lg:text-xl font-bold text-white font-mono">24+</p>
        <p className="text-[10px] text-neutral-400 mt-0.5">Shipped Apps</p>
      </div>
      <div>
        <p className="text-lg lg:text-xl font-bold text-white font-mono">4</p>
        <p className="text-[10px] text-neutral-400 mt-0.5">Batches</p>
      </div>
    </div>
  );

  return (
    <AuthLayout
      badgeText="Join the Movement"
      heroHeading="Ship software. Build in public. Learn with peers."
      heroSubtitle="Create your free student builder pass to access hackathons, exclusive workshops, sprint pods, and peer reviews from campus seniors."
      bgImage="/team.jpg"
      leftFooter={leftFooter}
    >
      {success ? (
        <AuthSuccessState
          title="Account Created!"
          description={
            <p>
              Welcome to PTSC, <strong className="text-white">{fullName}</strong>. Your builder account has been registered for <span className="text-neutral-300 font-medium">{batch}</span>.
            </p>
          }
          actionText="Open Builder Dashboard"
          actionHref="/dashboard"
        />
      ) : (
        <div className="w-full flex flex-col">
          {/* Form Header */}
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Create PTSC Account
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1.5">
              Join the college builder directory and access upcoming hackathons.
            </p>
          </div>

          {/* Registration Form with 2-Column Landscape Grid (No OAuth) */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Full Name */}
            <AuthInput
              label="Full Name *"
              icon={User}
              type="text"
              required
              placeholder="Alex Chen"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            {/* Email Address on Next Line */}
            <AuthInput
              label="Email Address *"
              icon={Mail}
              type="email"
              required
              placeholder="alex@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Row 2: Batch & Domain Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Graduating Batch
                </label>
                <select
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full bg-[#141417] border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-white/40 transition-colors cursor-pointer"
                >
                  {BATCH_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-neutral-900 text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Primary Domain
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full bg-[#141417] border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-white/40 transition-colors cursor-pointer"
                >
                  {DOMAIN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-neutral-900 text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AuthInput
                label="Create Password *"
                icon={Lock}
                type="password"
                required
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <AuthInput
                label="Confirm Password *"
                icon={Lock}
                type="password"
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Row 4: Terms Checkbox & Submit Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 border-white/20 bg-neutral-900 text-white rounded cursor-pointer accent-white shrink-0"
                  required
                />
                <label htmlFor="terms" className="text-xs text-neutral-400 cursor-pointer select-none">
                  I agree to the Community Code of Conduct
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !agreeTerms}
                className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-neutral-200 text-black font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
              >
                <span>{loading ? "Creating..." : "Create Account"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Footer Switch to Sign In */}
          <div className="mt-4 pt-3.5 border-t border-white/10 text-center sm:text-left">
            <p className="text-xs text-neutral-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-white hover:underline ml-1"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
