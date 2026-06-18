"use client";
import { type ReactNode } from "react";

type GlassVariant = "light" | "strong" | "neon" | "card";

interface GlassPanelProps {
  variant?: GlassVariant;
  className?: string;
  children: ReactNode;
}

const variantStyles: Record<GlassVariant, string> = {
  light: "bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06]",
  strong: "bg-black/70 backdrop-blur-3xl border border-white/[0.08] shadow-2xl",
  neon: "bg-black/40 backdrop-blur-2xl border border-neon/15 shadow-[0_0_20px_oklch(0.85_0.18_160_/_0.3)]",
  card: "bg-black/50 backdrop-blur-xl border border-white/[0.06] hover:border-neon/30 transition-all duration-300 hover:shadow-[0_0_20px_oklch(0.85_0.18_160_/_0.3)]",
};

export function GlassPanel({ variant = "card", className = "", children }: GlassPanelProps) {
  return (
    <div className={`rounded-xl ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}
