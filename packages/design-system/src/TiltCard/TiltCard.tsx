"use client";
import { useRef, type ReactNode } from "react";

interface TiltCardProps {
  className?: string;
  children: ReactNode;
  maxTilt?: number;
  perspective?: number;
}

export function TiltCard({ className = "", children, maxTilt = 8, perspective = 800 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(${perspective}px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg)`;
  };

  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ transition: "transform 0.15s ease-out", transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </div>
  );
}
