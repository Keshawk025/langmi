import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "purple";
}

export function Badge({
  className = "",
  variant = "default",
  ...props
}: BadgeProps) {
  const baseStyles = "inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold tracking-wide border transition-colors";
  
  const variants = {
    default: "bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700",
    secondary: "bg-zinc-950 text-zinc-400 border-zinc-900/60",
    success: "bg-emerald-950/40 text-emerald-400 border-emerald-800/40 hover:bg-emerald-950/60",
    warning: "bg-amber-950/40 text-amber-400 border-amber-800/40 hover:bg-amber-950/60",
    destructive: "bg-rose-950/40 text-rose-400 border-rose-800/40 hover:bg-rose-950/60",
    info: "bg-cyan-950/40 text-cyan-400 border-cyan-800/40 hover:bg-cyan-950/60",
    purple: "bg-indigo-950/40 text-indigo-400 border-indigo-800/40 hover:bg-indigo-950/60",
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
