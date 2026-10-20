interface AuthDividerProps {
  label?: string;
}

export default function AuthDivider({ label = "or with email" }: AuthDividerProps) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-mono">
        {label}
      </span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}
