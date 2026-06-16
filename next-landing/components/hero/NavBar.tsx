"use client";
import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Menu, X } from "lucide-react";
import { MagneticButton } from "./MagneticButton";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "AI Demo", href: "#ai-demo" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export function NavBar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ["rgba(0,0,0,0)", "rgba(2,2,10,0.8)"]);

  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setScrolled(v > 20));
    return () => unsub();
  }, [scrollY]);

  return (
    <motion.nav
      style={{
        background: scrolled ? navBg.get() : "transparent",
        borderColor: scrolled ? "oklch(0.15 0.03 260 / 0.5)" : "transparent",
      }}
      className="fixed top-0 left-0 right-0 z-40 border-b transition-[border-color] duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-cyan-500/25 transition-shadow">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold">EduNex</span>
        </a>

        <div className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-xs text-white/40 hover:text-white/70 transition-colors">
              {l.label}
            </a>
          ))}
          <div className="flex items-center gap-2 ml-4">
            <a href="/auth/student" className="text-xs text-white/30 hover:text-white/60 transition-colors px-3 py-1.5">
              Student
            </a>
            <MagneticButton onClick={() => window.location.href = "/auth/teacher"} className="!px-4 !py-1.5 !text-xs">
              Teacher Login
            </MagneticButton>
          </div>
        </div>

        <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-xl border border-glass-border bg-glass">
          {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden border-t border-glass-border bg-background/95 backdrop-blur-xl"
        >
          <div className="px-4 py-4 space-y-2">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm text-white/50 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors"
              >
                {l.label}
              </a>
            ))}
            <hr className="border-glass-border my-2" />
            <a href="/auth/student" onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-white/50 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              Student Login
            </a>
            <a href="/auth/teacher" onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-cyan-400 font-medium"
            >
              Teacher Login →
            </a>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
