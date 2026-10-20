"use client";

import { useState, InputHTMLAttributes, ReactNode, ComponentType } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ComponentType<{ className?: string }>;
  rightLabelAction?: ReactNode;
  helperText?: string;
}

export default function AuthInput({
  label,
  icon: Icon,
  type = "text",
  rightLabelAction,
  helperText,
  className = "",
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-medium text-neutral-300">
          {label}
        </label>
        {rightLabelAction}
      </div>

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
        )}

        <input
          type={inputType}
          className={`w-full bg-[#141417] border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 transition-colors py-2.5 ${Icon ? "pl-10" : "pl-4"
            } ${isPassword ? "pr-10" : "pr-4"} ${className}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {helperText && (
        <p className="text-[11px] text-neutral-400 mt-1">{helperText}</p>
      )}
    </div>
  );
}
