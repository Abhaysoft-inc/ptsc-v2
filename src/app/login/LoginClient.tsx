"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, ArrowRight } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import OAuthButtons from "@/components/auth/OAuthButtons";
import AuthDivider from "@/components/auth/AuthDivider";
import AuthInput from "@/components/auth/AuthInput";
import AuthSuccessState from "@/components/auth/AuthSuccessState";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
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

  const handleOAuthLogin = (provider: string) => {
    setEmail(`${provider.toLowerCase()}.builder@ptsc.dev`);
    setPassword("••••••••••••");
    setSuccess(true);
  };

  const leftFooter = (
    <div>
      <p className="text-xs sm:text-sm italic text-neutral-300 leading-relaxed">
        &quot;PTSC gave me the peers, mentors, and accountability to launch my first production software before my junior year.&quot;
      </p>
      <div className="mt-4 flex items-center gap-3">
        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-neutral-800 border border-white/10">
          <Image
            src="/featured-saas.jpg"
            alt="Student Builder"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">Abhay Sharma</p>
          <p className="text-[11px] text-neutral-500 font-mono">Founder • Batch of 2026</p>
        </div>
      </div>
    </div>
  );

  return (
    <AuthLayout
      badgeText="PTSC Builder Portal"
      heroHeading="The home for student founders & hackers."
      heroSubtitle="Sign in to manage event tickets, submit projects to the campus showcase, collaborate on hackathons, and connect with 1,200+ makers."
      bgImage="/bg.jpg"
      leftFooter={leftFooter}
    >
      {success ? (
        <AuthSuccessState
          title="Welcome Back!"
          description={
            <p>
              You are signed in as <strong className="text-white">{email}</strong>. Ready to build?
            </p>
          }
          actionText="Go to Events Hub"
          actionHref="/events"
        />
      ) : (
        <div className="w-full flex flex-col">
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Sign in to PTSC
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1.5">
              Enter your email and password to access your community account.
            </p>
          </div>

          {/* Reusable OAuth Buttons with React-Icons */}
          <OAuthButtons
            actionText="Sign in"
            onGithubClick={() => handleOAuthLogin("GitHub")}
            onGoogleClick={() => handleOAuthLogin("Google")}
          />

          {/* Reusable Divider */}
          <AuthDivider label="or with email" />

          {/* Form with Landscape Flow */}
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

            <AuthInput
              label="Password"
              icon={Lock}
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              rightLabelAction={
                <Link
                  href="/forgot-password"
                  className="text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  Forgot password?
                </Link>
              }
            />

            {/* Remember Me Checkbox & Submit Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 border-white/20 bg-neutral-900 text-white rounded cursor-pointer accent-white"
                />
                <span>Remember me for 30 days</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-neutral-200 text-black font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? "Signing in..." : "Sign in to Account"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Footer Switch to Sign Up */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center sm:text-left">
            <p className="text-xs text-neutral-400">
              Don&apos;t have an account yet?{" "}
              <Link
                href="/signup"
                className="font-semibold text-white hover:underline ml-1"
              >
                Create PTSC Account
              </Link>
            </p>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
