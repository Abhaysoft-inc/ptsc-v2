"use client";

import { FaGithub } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";

interface OAuthButtonsProps {
  onGithubClick?: () => void;
  onGoogleClick?: () => void;
  actionText?: "Sign in" | "Continue" | "Join";
}

export default function OAuthButtons({
  onGithubClick,
  onGoogleClick,
  actionText = "Continue",
}: OAuthButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <button
        type="button"
        onClick={onGithubClick}
        className="flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
      >
        <FaGithub className="w-4 h-4 text-white shrink-0" />
        <span>{actionText} with GitHub</span>
      </button>

      <button
        type="button"
        onClick={onGoogleClick}
        className="flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
      >
        <FcGoogle className="w-4 h-4 shrink-0" />
        <span>{actionText} with Google</span>
      </button>
    </div>
  );
}
