import { useEffect, useRef, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export function RouteTransitionOverlay() {
  const location = useLocation();
  const previousPath = useRef(location.pathname);
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (previousPath.current === location.pathname) return;
    previousPath.current = location.pathname;
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), reduceMotion ? 80 : 260);
    return () => window.clearTimeout(timer);
  }, [location.pathname, reduceMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none fixed inset-x-0 top-0 z-[999] h-[3px] origin-left bg-[linear-gradient(90deg,#168cff,#70d5f8,#168cff)] shadow-[0_0_18px_rgba(22,140,255,.55)]"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.05 : 0.24, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  );
}
