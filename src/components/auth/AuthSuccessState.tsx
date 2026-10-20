import { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface AuthSuccessStateProps {
  title: string;
  description: ReactNode;
  actionText?: string;
  actionHref?: string;
  secondaryAction?: ReactNode;
}

export default function AuthSuccessState({
  title,
  description,
  actionText = "Continue",
  actionHref = "/events",
  secondaryAction,
}: AuthSuccessStateProps) {
  return (
    <div className="bg-[#111113] border border-emerald-500/30 rounded-2xl p-8 sm:p-10 text-center animate-in fade-in zoom-in-95 duration-200">
      <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-7 h-7" />
      </div>

      <h3 className="text-2xl font-bold text-white tracking-tight mb-2">
        {title}
      </h3>

      <div className="text-sm text-neutral-400 mb-6 leading-relaxed">
        {description}
      </div>

      <div className="space-y-3">
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center gap-2 w-full py-3 bg-white text-black font-semibold text-sm rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99]"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        {secondaryAction}
      </div>
    </div>
  );
}
