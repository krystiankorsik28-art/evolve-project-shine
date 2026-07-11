import { useEffect, useRef, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Layers3, Loader2 } from "lucide-react";

type OverlayMode = "auth" | "dashboard";

const dashboardPaths = ["/teacher", "/admin", "/parent", "/student/dashboard"];

function isDashboardPath(pathname: string) {
  return dashboardPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function getCopy(mode: OverlayMode) {
  if (mode === "auth") {
    return {
      label: "Portal dostępu",
      title: "Otwieranie bezpiecznego logowania",
      text: "Przygotowujemy metody dostępu i ustawienia sesji.",
    };
  }

  return {
    label: "EduNex Workspace",
    title: "Przygotowujemy Twój panel",
    text: "Ładujemy dane użytkownika i najważniejsze moduły.",
  };
}

export function RouteTransitionOverlay() {
  const location = useLocation();
  const previousPath = useRef(location.pathname);
  const [mode, setMode] = useState<OverlayMode | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const previous = previousPath.current;
    const next = location.pathname;
    previousPath.current = next;

    const enteringAuth = next === "/auth" && previous !== "/auth";
    const enteringDashboard = previous.startsWith("/auth") && isDashboardPath(next);

    if (!enteringAuth && !enteringDashboard) return;

    setMode(enteringAuth ? "auth" : "dashboard");
    const timer = window.setTimeout(() => setMode(null), reduceMotion ? 220 : enteringAuth ? 560 : 760);
    return () => window.clearTimeout(timer);
  }, [location.pathname, reduceMotion]);

  const copy = mode ? getCopy(mode) : null;

  return (
    <AnimatePresence>
      {mode && copy && (
        <motion.div
          className="fixed inset-0 z-[999] grid place-items-center bg-white/94 px-5 text-slate-950 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.08 : 0.2 }}
          aria-live="polite"
          aria-busy="true"
        >
          <motion.div
            className="fixed inset-x-0 top-0 h-0.5 origin-left bg-[#0067b8]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: reduceMotion ? 0.15 : mode === "dashboard" ? 0.7 : 0.52, ease: [0.22, 1, 0.36, 1] }}
          />

          <motion.div
            className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 text-center shadow-[0_24px_70px_rgba(15,23,42,0.14)]"
            initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: reduceMotion ? 0.08 : 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-md bg-slate-950 text-white">
              <Layers3 className="h-5 w-5" />
            </div>
            <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#0067b8]">{copy.label}</div>
            <div className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{copy.title}</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{copy.text}</p>
            <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0067b8]" />
              Trwa ładowanie
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
