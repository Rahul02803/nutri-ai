import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
  glowColor?: "primary" | "secondary" | "emerald" | "none";
  hoverable?: boolean;
}

export function GlassCard({
  children,
  className,
  glow = false,
  glowColor = "primary",
  hoverable = false,
  ...props
}: GlassCardProps) {
  const glowStyles = {
    primary: "border-emerald-200 bg-emerald-50/10 shadow-[0_8px_30px_rgba(16,185,129,0.03)]",
    secondary: "border-amber-200 bg-amber-50/10 shadow-[0_8px_30px_rgba(245,158,11,0.03)]",
    emerald: "border-emerald-300 bg-emerald-50/20 shadow-[0_8px_30px_rgba(16,185,129,0.05)]",
    none: "border-slate-100 bg-white",
  };

  return (
    <div
      className={cn(
        "relative rounded-[24px] border border-slate-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.025)] transition-all duration-300",
        glow && glowStyles[glowColor],
        hoverable && "hover:-translate-y-1 hover:border-slate-200 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]",
        className
      )}
      {...props}
    >
      {/* Premium subtle minimalist highlight overlay */}
      <div className="absolute inset-0 -z-10 rounded-[24px] bg-slate-50/30 opacity-100 pointer-events-none" />
      {children}
    </div>
  );
}
