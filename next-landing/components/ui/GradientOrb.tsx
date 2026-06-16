"use client";
import { useEffect, useRef } from "react";

export function GradientOrb({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      el.style.setProperty("--x", String(x));
      el.style.setProperty("--y", String(y));
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute -inset-40 opacity-30 blur-[120px] transition-transform duration-500 ${className}`}
      style={{
        background: "radial-gradient(circle at calc(var(--x,0.5)*100%) calc(var(--y,0.5)*100%), oklch(0.82 0.12 200 / 0.4), oklch(0.60 0.18 260 / 0.2), transparent 70%)",
      }}
    />
  );
}
