"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ShieldAlert } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import AuthSuccessState from "@/components/auth/AuthSuccessState";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 600);
  };

  const leftFooter = (
    <div className="flex items-center gap-3 text-xs text-neutral-300">
      <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
      <span>Two-factor authentication and verified email dispatch enabled.</span>
    </div>
  );

  return (
    <AuthLayout
      badgeText="Account Recovery"
      heroHeading="Reset your security credentials."
      heroSubtitle="Enter your registered campus or personal email to regain access to your PTSC tickets, showcase builds, and community dashboard."
      bgImage="/featured-launch.jpg"
      leftFooter={leftFooter}
    >
      {sent ? (
        <AuthSuccessState
          title="Check Your Inbox"
          description={
            <p>
              We have dispatched a password reset link to <strong className="text-white">{email}</strong>. Please check your spam folder if it doesn&apos;t arrive in 2 minutes.
            </p>
          }
          actionText="Return to Sign In"
          actionHref="/login"
          secondaryAction={
            <button
              type="button"
              onClick={() => setSent(false)}
              className="w-full text-center text-xs text-neutral-400 hover:text-white transition-colors pt-2 cursor-pointer"
            >
              Try another email address
            </button>
          }
        />
      ) : (
        <div className="w-full flex flex-col">
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Reset Password
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 leading-relaxed">
              Enter your registered email address and we will dispatch password recovery instructions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              label="Email address"
              icon={Mail}
              type="email"
              required
              placeholder="you@campus.edu or builder@ptsc.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white hover:bg-neutral-200 text-black font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{loading ? "Sending reset link..." : "Send Reset Instructions"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center sm:text-left">
            <p className="text-xs text-neutral-400">
              Remember your password?{" "}
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
