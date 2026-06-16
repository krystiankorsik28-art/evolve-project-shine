"use client";
import { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
}

export function MagneticButton({ children, onClick, variant = "primary", className }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15 });
  const springY = useSpring(y, { stiffness: 200, damping: 15 });

  const onMove = useCallback((e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / 8;
    const dy = (e.clientY - cy) / 8;
    x.set(dx);
    y.set(dy);
  }, [x, y]);

  const onLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const ripple = useCallback((e: React.MouseEvent) => {
    const btn = e.currentTarget as HTMLElement;
    const r = document.createElement("span");
    r.className = "ripple-effect";
    const rect = btn.getBoundingClientRect();
    r.style.cssText = `left:${e.clientX - rect.left}px;top:${e.clientY - rect.top}px`;
    btn.appendChild(r);
    setTimeout(() => r.remove(), 700);
  }, []);

  const base = "relative inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm overflow-hidden cursor-pointer select-none";
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40",
    outline: "border border-glass-border bg-glass backdrop-blur-md text-white/80 hover:text-white hover:border-white/20",
    ghost: "text-white/50 hover:text-white/80",
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={(e) => { ripple(e); onClick?.(); }}
      className={cn(base, variants[variant], className)}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}
