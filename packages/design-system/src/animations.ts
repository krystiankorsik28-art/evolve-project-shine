import { type Variants } from "framer-motion";

export const spring = { type: "spring" as const, stiffness: 300, damping: 30 };
export const springSnap = { type: "spring" as const, stiffness: 400, damping: 25 };
export const springGentle = { type: "spring" as const, stiffness: 200, damping: 25 };

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: spring },
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: spring },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: spring },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: spring },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: spring },
};

export const tiltIn: Variants = {
  hidden: { opacity: 0, rotateX: 5, y: 30 },
  visible: { opacity: 1, rotateX: 0, y: 0, transition: spring },
};

export const wordReveal: Variants = {
  hidden: { opacity: 0, y: 60, rotate: 3 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0, rotate: 0,
    transition: { ...spring, delay: i * 0.05 },
  }),
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0 } },
};

export const staggerFast: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, scale: 0.98, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0, transition: spring },
  exit: { opacity: 0, scale: 0.98, y: -10, transition: { duration: 0.2 } },
};

export const tileEntry: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: spring },
  hover: { y: -4, scale: 1.02, transition: springSnap },
};

export const buttonTap = {
  scale: 0.97,
  transition: { duration: 0.1 },
};

export const neonPulse = {
  initial: { boxShadow: "0 0 20px oklch(0.85 0.18 160 / 0.3)" },
  animate: {
    boxShadow: [
      "0 0 20px oklch(0.85 0.18 160 / 0.3)",
      "0 0 40px oklch(0.85 0.18 160 / 0.5)",
      "0 0 20px oklch(0.85 0.18 160 / 0.3)",
    ],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
};

export const shimmer: Variants = {
  initial: { backgroundPosition: "-200% center" },
  animate: {
    backgroundPosition: "200% center",
    transition: { duration: 3, repeat: Infinity, ease: "linear" },
  },
};
