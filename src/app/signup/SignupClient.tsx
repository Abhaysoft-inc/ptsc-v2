"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, ArrowRight, AtSign, Phone } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import AuthSuccessState from "@/components/auth/AuthSuccessState";

// "" means no graduating batch (alumni / external).
const BATCH_OPTIONS = [
  { value: "2026", label: "Batch of 2026" },
  { value: "2027", label: "Batch of 2027" },
  { value: "2028", label: "Batch of 2028" },
  { value: "2029", label: "Batch of 2029" },
  { value: "", label: "Alumni / External Builder" },
];

type FieldErrors = Partial<Record<string, string>>;

export default function SignupClient() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [batch, setBatch] = useState("2027");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords don't match." });
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          username,
          email,
          mobile,
          batch: batch === "" ? null : Number(batch),
          password,
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setErrors(data?.errors ?? {});
        setFormError(data?.message ?? "Something went wrong. Please try again.");
        return;
      }
      setSuccess(true);
    } catch {
      setFormError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
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
              Thanks, <strong className="text-white">{firstName}</strong>. An
              admin will review your account, and you can sign in as soon as it
              is approved.
            </p>
          }
          actionText="Back to Sign In"
          actionHref="/login"
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

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AuthInput
                label="First Name *"
                icon={User}
                type="text"
                required
                autoComplete="given-name"
                placeholder="Alex"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={errors.firstName}
              />
              <AuthInput
                label="Last Name *"
                icon={User}
                type="text"
                required
                autoComplete="family-name"
                placeholder="Chen"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={errors.lastName}
              />
            </div>

            <AuthInput
              label="Email Address *"
              icon={Mail}
              type="email"
              required
              autoComplete="email"
              placeholder="alex@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AuthInput
                label="Username *"
                icon={AtSign}
                type="text"
                required
                autoComplete="username"
                placeholder="alexchen"
                helperText="At least 6 characters."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={errors.username}
              />
              <AuthInput
                label="Mobile *"
                icon={Phone}
                type="tel"
                required
                autoComplete="tel"
                placeholder="9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                error={errors.mobile}
              />
            </div>

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
                  <option key={opt.label} value={opt.value} className="bg-neutral-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.batch && (
                <p role="alert" className="text-[11px] text-red-400 mt-1">
                  {errors.batch}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AuthInput
                label="Create Password *"
                icon={Lock}
                type="password"
                required
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />
              <AuthInput
                label="Confirm Password *"
                icon={Lock}
                type="password"
                required
                autoComplete="new-password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
              />
            </div>

            {formError && (
              <p
                role="alert"
                className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
              >
                {formError}
              </p>
            )}

            {/* Terms Checkbox & Submit Button */}
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
