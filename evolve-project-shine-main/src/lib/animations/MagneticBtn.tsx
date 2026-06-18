"use client";
import { useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { springSnap } from "./variants";

export function MagneticBtn({ className = "", children, as: Tag = "button", href, onClick }: { className?: string; children: ReactNode; as?: "button" | "a"; href?: string; onClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };
  const handleLeave = () => { if (ref.current) ref.current.style.transform = ""; };
  const content = (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={handleLeave} whileTap={{ scale: 0.97 }}
      transition={springSnap} className={`inline-flex items-center transition-transform duration-150 ease-out ${className}`} onClick={onClick}>
      {children}
    </motion.div>
  );
  if (Tag === "a" && href) return <a href={href}>{content}</a>;
  return content;
}
