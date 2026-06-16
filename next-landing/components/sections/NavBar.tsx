"use client";
import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "AI", href: "#ai" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "#contact" },
];

export function NavBar() {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const scrolled = useTransform(scrollY, [0, 50], [0, 1]);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: useTransform(scrolled, [0, 1], ["rgba(10,10,18,0)", "rgba(10,10,18,0.85)"]),
        borderColor: useTransform(scrolled, [0, 1], ["rgba(255,255,255,0)", "rgba(255,255,255,0.06)"]),
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-shadow">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight">EduNex</span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 text-xs text-white/40 hover:text-white/80 transition-colors rounded-md hover:bg-white/[0.04]"
            >
              {l.label}
            </a>
          ))}
          <div className="h-5 w-px bg-white/[0.06] mx-3" />
          <a
            href="/auth/login"
            className="px-3 py-1.5 text-xs text-white/40 hover:text-white/80 transition-colors"
          >
            Sign in
          </a>
          <a
            href="/auth/register"
            className="ml-1 px-4 py-1.5 text-xs font-medium bg-white text-[#0a0a12] rounded-lg hover:bg-white/90 transition-all hover:shadow-lg"
          >
            Start free
          </a>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg border border-white/[0.06] bg-white/[0.03]">
          {open ? <X className="w-4 h-4 text-white/60" /> : <Menu className="w-4 h-4 text-white/60" />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-white/[0.06] bg-[#0a0a12]/95 backdrop-blur-xl"
        >
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm text-white/50 hover:text-white rounded-lg hover:bg-white/[0.04]"
              >
                {l.label}
              </a>
            ))}
            <hr className="border-white/[0.06] my-2" />
            <a href="/auth/login" onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-white/50 hover:text-white"
            >
              Sign in
            </a>
            <a href="/auth/register" onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-cyan-400 font-medium"
            >
              Start free →
            </a>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
