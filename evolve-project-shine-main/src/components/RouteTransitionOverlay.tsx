import { useEffect, useRef, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { AuthRegistrationExpansion } from "@/components/AuthRegistrationExpansion";

type OverlayMode = "auth" | "dashboard";

const dashboardPaths = ["/teacher", "/admin", "/parent", "/student/dashboard"];

function isDashboardPath(pathname: string) {
  return dashboardPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function getCopy(mode: OverlayMode) {
  if (mode === "auth") {
    return {
      eyebrow: "EduNex Secure Gate",
      title: "Przygotowuję panel logowania",
      text: "Ładowanie bramy dostępu i zabezpieczeń...",
    };
  }

  return {
    eyebrow: "EduNex Dashboard",
    title: "Otwieram Twój panel",
    text: "Synchronizacja widoku, sesji i modułów systemu...",
  };
}

export function RouteTransitionOverlay() {
  const location = useLocation();
  const previousPath = useRef(location.pathname);
  const [mode, setMode] = useState<OverlayMode | null>(null);

  useEffect(() => {
    const prev = previousPath.current;
    const next = location.pathname;
    previousPath.current = next;

    const enteringAuth = next === "/auth" && prev !== "/auth";
    const enteringDashboard = prev.startsWith("/auth") && isDashboardPath(next);

    if (!enteringAuth && !enteringDashboard) return;

    setMode(enteringAuth ? "auth" : "dashboard");
    const timer = window.setTimeout(() => setMode(null), enteringAuth ? 1050 : 1350);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  const copy = mode ? getCopy(mode) : null;

  return (
    <>
      <AuthRegistrationExpansion />
      <AnimatePresence>
        {mode && copy && (
          <motion.div
            className="fixed inset-0 z-[999] grid place-items-center overflow-hidden bg-[#020617] text-white"
            initial={{ opacity: 0, clipPath: "circle(0% at 50% 50%)" }}
            animate={{ opacity: 1, clipPath: "circle(150% at 50% 50%)" }}
            exit={{ opacity: 0, scale: 1.02, filter: "blur(18px)" }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(0,120,212,0.36),transparent_30%),radial-gradient(circle_at_20%_78%,rgba(80,230,255,0.16),transparent_32%),linear-gradient(135deg,#020617,#07111f,#01030a)]" />
            <div className="absolute inset-0 opacity-[0.18]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.10) 1px, transparent 1px)", backgroundSize: "54px 54px" }} />

            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="absolute h-72 w-72 rounded-full border border-[#50e6ff]/20"
                animate={{ scale: [0.25, 1.7], opacity: [0.55, 0] }}
                transition={{ duration: 1.85, repeat: Infinity, delay: index * 0.34, ease: "easeOut" }}
              />
            ))}

            <motion.div
              className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#50e6ff] to-transparent"
              animate={{ scaleX: [0, 1, 0.54], opacity: [0, 1, 0.45] }}
              transition={{ duration: 0.95, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              className="relative z-10 mx-6 w-full max-w-lg rounded-[34px] border border-white/10 bg-white/[0.065] p-8 text-center shadow-[0_40px_140px_rgba(0,0,0,0.58)] backdrop-blur-2xl"
              initial={{ y: 18, opacity: 0, scale: 0.94 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -10, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.38, delay: 0.08 }}
            >
              <motion.div
                className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full border border-[#50e6ff]/30 bg-[#0078d4]/16 shadow-[0_0_90px_rgba(80,230,255,0.38)]"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
              >
                <div className="grid h-16 w-16 place-items-center rounded-full bg-[#0078d4] shadow-[0_0_60px_rgba(0,120,212,0.62)]">
                  {mode === "dashboard" ? <Sparkles className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
                </div>
              </motion.div>

              <div className="text-xs font-bold uppercase tracking-[0.32em] text-[#50e6ff]">{copy.eyebrow}</div>
              <div className="mt-3 text-3xl font-semibold tracking-[-0.045em]">{copy.title}</div>
              <p className="mt-3 text-sm text-white/58">{copy.text}</p>

              <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-mono text-white/56">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#50e6ff]" /> secure transition
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
