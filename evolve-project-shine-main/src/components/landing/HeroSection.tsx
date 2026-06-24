import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Globe2, Cpu } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Cpu, label: "AI Powered" },
  { icon: Zap, label: "99.98% Uptime" },
  { icon: Shield, label: "Enterprise Security" },
  { icon: Globe2, label: "RODO Ready" },
];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div ref={bgRef} className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% 10%, oklch(0.82 0.12 200 / 0.06) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 20% 70%, oklch(0.7 0.2 240 / 0.04) 0%, transparent 50%),
              radial-gradient(ellipse 50% 50% at 80% 80%, oklch(0.65 0.25 290 / 0.03) 0%, transparent 50%),
              radial-gradient(ellipse 100% 50% at 50% 100%, oklch(0 0 0 / 0.4) 0%, transparent 60%)
            `,
          }}
        />
        <motion.div
          className="absolute top-1/4 -left-48 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, oklch(0.82 0.12 200 / 0.04) 0%, transparent 60%)",
          }}
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, oklch(0.7 0.2 240 / 0.03) 0%, transparent 60%)",
          }}
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, transparent 0%, oklch(0.06 0.04 260) 100%)",
          opacity: 0.6,
        }} />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate={mounted ? "visible" : "hidden"}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center"
      >
        <motion.div variants={fadeUp} className="mb-8">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-medium tracking-[0.12em] uppercase"
            style={{
              background: "oklch(1 0 0 / 0.04)",
              border: "1px solid oklch(1 0 0 / 0.06)",
              color: "oklch(1 0 0 / 0.5)",
              backdropFilter: "blur(12px)",
            }}
          >
            <span className="relative flex w-1.5 h-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full" style={{ background: "oklch(0.82 0.12 200)" }} />
              <span className="relative inline-flex rounded-full w-1.5 h-1.5" style={{ background: "oklch(0.82 0.12 200)" }} />
            </span>
            Globalna platforma edukacyjna nowej generacji
          </span>
        </motion.div>

        <motion.h1 variants={scaleIn} className="select-none">
          <span className="block text-[clamp(3rem,10vw,7rem)] font-bold leading-[1.02] tracking-[-0.04em] text-white">
            Przyszłość edukacji
          </span>
          <span
            className="block text-[clamp(2.2rem,7vw,5rem)] font-bold leading-[1.1] tracking-[-0.03em] mt-2"
            style={{
              background: "linear-gradient(135deg, oklch(0.88 0.10 200), oklch(0.7 0.20 240), oklch(0.82 0.12 200))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            napędzana przez AI
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed"
          style={{ color: "oklch(1 0 0 / 0.45)" }}
        >
          Wykorzystaj sztuczną inteligencję, aby tworzyć egzaminy, uczyć i zarządzać szkołą — wszystko w jednej platformie.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/auth/teacher"
            className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 text-sm font-semibold rounded-full overflow-hidden transition-all duration-500"
            style={{
              background: "linear-gradient(135deg, oklch(0.82 0.12 200), oklch(0.7 0.20 240))",
              color: "#fff",
              boxShadow: "0 4px 24px oklch(0.82 0.12 200 / 0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 8px 40px oklch(0.82 0.12 200 / 0.4), 0 0 60px oklch(0.82 0.12 200 / 0.15)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 24px oklch(0.82 0.12 200 / 0.25)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Rozpocznij za darmo
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <a
            href="#funkcje"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("funkcje")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 text-sm font-medium rounded-full transition-all duration-300"
            style={{
              background: "oklch(1 0 0 / 0.04)",
              color: "oklch(1 0 0 / 0.65)",
              border: "1px solid oklch(1 0 0 / 0.08)",
              backdropFilter: "blur(12px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "oklch(1 0 0 / 0.08)";
              e.currentTarget.style.color = "oklch(1 0 0 / 0.9)";
              e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "oklch(1 0 0 / 0.04)";
              e.currentTarget.style.color = "oklch(1 0 0 / 0.65)";
              e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.08)";
            }}
          >
            Zobacz możliwości
          </a>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-14 flex flex-wrap items-center justify-center gap-6"
        >
          {TRUST_ITEMS.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-2 text-xs font-medium"
              style={{ color: "oklch(1 0 0 / 0.35)" }}
            >
              <item.icon className="w-3.5 h-3.5" style={{ color: "oklch(0.82 0.12 200 / 0.5)" }} />
              {item.label}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
