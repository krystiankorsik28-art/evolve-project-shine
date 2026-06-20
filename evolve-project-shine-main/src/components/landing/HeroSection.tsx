import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Shield, Zap, Globe2, Activity } from "lucide-react";

function useDeviceCan3D() {
  const [can3D, setCan3D] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = /Mobi|Android/i.test(navigator.userAgent);
    setCan3D(!reduced && !mobile);
  }, []);
  return can3D;
}

const TRUST_ITEMS = [
  { icon: Shield, label: "RODO & ISO 27001" },
  { icon: Zap, label: "99.98% uptime" },
  { icon: Globe2, label: "Global CDN" },
  { icon: Activity, label: "AI Powered" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function HeroSection() {
  const can3D = useDeviceCan3D();
  const [HeroBg, setHeroBg] = useState<React.ComponentType | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (can3D) {
      import("@/components/three/Hero3DBg").then((mod) => {
        setHeroBg(() => mod.default);
      });
    }
  }, [can3D]);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(t);
  }, []);

  const headline = "Przyszłość nauki zaczyna się tutaj".split(" ");

  return (
    <section className="relative min-h-screen pt-28 pb-24 sm:pb-32 overflow-hidden flex items-center">
      <div className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 20%, oklch(0.82 0.12 200 / 0.05) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, oklch(0.82 0.12 200 / 0.03) 0%, transparent 50%)",
        }}
      />
      {HeroBg && <HeroBg />}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center relative w-full">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate={revealed ? "visible" : "hidden"}
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-10"
          style={{
            background: "oklch(1 0 0 / 0.04)",
            border: "1px solid oklch(1 0 0 / 0.06)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full" style={{ background: "oklch(0.7 0.15 200)" }} />
            <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: "oklch(0.7 0.15 200)" }} />
          </span>
          <span className="text-xs font-medium tracking-wide" style={{ color: "oklch(1 0 0 / 0.6)" }}>
            Globalna platforma edukacyjna nowej generacji
          </span>
        </motion.div>

        <h1 className="max-w-5xl mx-auto">
          {headline.map((word, i) => (
            <motion.span
              key={i}
              custom={i + 1}
              variants={fadeUp}
              initial="hidden"
              animate={revealed ? "visible" : "hidden"}
              className="inline-block text-[clamp(2.8rem,9vw,6.5rem)] font-bold tracking-tight leading-[1.05]"
              style={{
                color: i >= 3 ? "oklch(0.75 0.15 200)" : "#fff",
                textShadow: i >= 3 ? "0 0 30px oklch(0.7 0.15 200 / 0.3)" : "none",
                marginRight: "0.15em",
              }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          custom={headline.length + 1}
          variants={fadeUp}
          initial="hidden"
          animate={revealed ? "visible" : "hidden"}
          className="text-base sm:text-lg max-w-2xl mx-auto mt-6 leading-relaxed"
          style={{ color: "oklch(1 0 0 / 0.5)" }}
        >
          Wykorzystaj sztuczną inteligencję, aby uczyć się szybciej, skuteczniej i bardziej świadomie niż kiedykolwiek wcześniej.
        </motion.p>

        <motion.div
          custom={headline.length + 2}
          variants={fadeUp}
          initial="hidden"
          animate={revealed ? "visible" : "hidden"}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/auth/teacher"
            className="group relative inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-xl overflow-hidden transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, oklch(0.7 0.15 200), oklch(0.6 0.2 240))",
              color: "#fff",
              boxShadow: "0 0 24px oklch(0.7 0.15 200 / 0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 0 40px oklch(0.7 0.15 200 / 0.4)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 24px oklch(0.7 0.15 200 / 0.25)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Rozpocznij za darmo
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>

          <a
            href="#funkcje"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("funkcje")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium rounded-xl transition-all duration-300"
            style={{
              background: "oklch(1 0 0 / 0.04)",
              color: "oklch(1 0 0 / 0.7)",
              border: "1px solid oklch(1 0 0 / 0.08)",
              backdropFilter: "blur(8px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "oklch(1 0 0 / 0.08)";
              e.currentTarget.style.color = "oklch(1 0 0 / 0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "oklch(1 0 0 / 0.04)";
              e.currentTarget.style.color = "oklch(1 0 0 / 0.7)";
            }}
          >
            Zobacz możliwości
          </a>
        </motion.div>

        <motion.div
          custom={headline.length + 3}
          variants={fadeUp}
          initial="hidden"
          animate={revealed ? "visible" : "hidden"}
          className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          {TRUST_ITEMS.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "oklch(1 0 0 / 0.35)" }}
            >
              <item.icon className="w-3.5 h-3.5" style={{ color: "oklch(0.7 0.15 200 / 0.5)" }} />
              {item.label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
