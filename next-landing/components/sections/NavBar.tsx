"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "AI", href: "#ai" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

export function NavBar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sectionIds = NAV_LINKS.filter(l => l.href.startsWith("#")).map(l => l.href.slice(1));
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { threshold: 0.2, rootMargin: "-80px 0px 0px 0px" }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const handleClick = (e: React.MouseEvent, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      setOpen(false);
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        height: scrolled ? "56px" : "64px",
        background: scrolled ? "oklch(0.04 0.02 270 / 0.75)" : "oklch(0.04 0.02 270 / 0.3)",
        backdropFilter: scrolled ? "blur(32px)" : "blur(12px)",
        WebkitBackdropFilter: scrolled ? "blur(32px)" : "blur(12px)",
        borderBottom: scrolled ? "1px solid oklch(1 0 0 / 0.06)" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/10 to-white/5 p-[1.5px] shadow-lg transition-all duration-500 group-hover:scale-105">
            <div className="w-full h-full rounded-[6px] bg-[oklch(0.06_0.04_260)] grid place-items-center">
              <Sparkles className="w-4 h-4" style={{ color: "oklch(0.7 0.15 200)" }} />
            </div>
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">EduNex</span>
        </a>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={(e) => handleClick(e, href)}
              className="relative px-3 py-2 text-sm rounded-lg transition-all duration-300"
              style={{
                color: active === href.slice(1) ? "oklch(0.8 0.12 200)" : "oklch(1 0 0 / 0.5)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "oklch(1 0 0 / 0.9)"; }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = active === href.slice(1) ? "oklch(0.8 0.12 200)" : "oklch(1 0 0 / 0.5)";
              }}
            >
              {label}
              {active === href.slice(1) && (
                <motion.span
                  layoutId="nav-active-next"
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{
                    background: "oklch(0.7 0.15 200 / 0.08)",
                    border: "1px solid oklch(0.7 0.15 200 / 0.15)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/auth/login"
            className="hidden sm:inline-flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200"
            style={{ color: "oklch(1 0 0 / 0.5)", background: "oklch(1 0 0 / 0.04)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "oklch(1 0 0 / 0.08)"; e.currentTarget.style.color = "oklch(1 0 0 / 0.9)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "oklch(1 0 0 / 0.04)"; e.currentTarget.style.color = "oklch(1 0 0 / 0.5)"; }}
          >
            Sign in
          </a>
          <a
            href="/auth/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, oklch(0.7 0.15 200 / 0.9), oklch(0.6 0.2 240 / 0.9))",
              color: "#fff",
              boxShadow: "0 0 20px oklch(0.7 0.15 200 / 0.2)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 30px oklch(0.7 0.15 200 / 0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 20px oklch(0.7 0.15 200 / 0.2)"; }}
          >
            Start free
          </a>
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg"
            style={{ color: "oklch(1 0 0 / 0.5)", background: "oklch(1 0 0 / 0.04)" }}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 right-0 lg:hidden"
            style={{
              background: "oklch(0.04 0.02 270 / 0.9)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderBottom: "1px solid oklch(1 0 0 / 0.06)",
            }}
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map(({ label, href }, i) => (
                <motion.a
                  key={href}
                  href={href}
                  onClick={(e) => handleClick(e, href)}
                  className="px-4 py-3 rounded-xl text-sm"
                  style={{
                    color: active === href.slice(1) ? "oklch(0.8 0.12 200)" : "oklch(1 0 0 / 0.5)",
                    background: active === href.slice(1) ? "oklch(0.7 0.15 200 / 0.08)" : "transparent",
                  }}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  {label}
                </motion.a>
              ))}
              <div className="h-px my-2" style={{ background: "oklch(1 0 0 / 0.06)" }} />
              <a href="/auth/login" onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-sm" style={{ color: "oklch(1 0 0 / 0.5)" }}>
                Sign in
              </a>
              <a href="/auth/register" onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium"
                style={{ color: "oklch(0.7 0.15 200)" }}>
                Start free →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
