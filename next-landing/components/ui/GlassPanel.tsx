"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
}

export function GlassPanel({ children, className, glow, hover }: GlassPanelProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.015, y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative rounded-2xl border border-glass-border bg-glass backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden",
        glow && "before:absolute before:inset-0 before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100 before:bg-gradient-to-br before:from-cyan-500/10 before:to-blue-600/10",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
