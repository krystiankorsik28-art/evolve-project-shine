import { useEffect, useRef, useState, useCallback } from "react";
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

function Typewriter({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length < text.length) {
      const t = setTimeout(() => {
        setDisplayed(text.slice(0, displayed.length + 1));
      }, 25 + Math.random() * 15);
      return () => clearTimeout(t);
    }
  }, [started, displayed, text]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-[2px] h-[1em] ml-[1px] align-middle"
          style={{
            background: "oklch(0.7 0.15 200)",
            animation: "cursorBlink 0.8s step-end infinite",
          }}
        />
      )}
    </span>
  );
}

const WORD_REVEAL_VARIANTS = {
  hidden: { y: 60, opacity: 0, rotateX: -15 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    rotateX: 0,
    transition: {
      delay: i * 0.035,
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
} as any;

const TRUST_ITEMS = [
  { icon: Shield, label: "RODO & ISO 27001" },
  { icon: Zap, label: "99.98% uptime" },
  { icon: Globe2, label: "Global CDN" },
  { icon: Activity, label: "AI Powered" },
];

export default function HeroSection() {
  const can3D = useDeviceCan3D();
  const [HeroBg, setHeroBg] = useState<React.ComponentType | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [headlineRevealed, setHeadlineRevealed] = useState(false);

  useEffect(() => {
    if (can3D) {
      import("@/components/three/Hero3DBg").then((mod) => {
        setHeroBg(() => mod.default);
      });
    }
  }, [can3D]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeadlineRevealed(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen pt-24 pb-24 sm:pb-32 overflow-hidden flex items-center"
    >
      <div className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 20%, oklch(0.82 0.12 200 / 0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, oklch(0.82 0.12 200 / 0.02) 0%, transparent 50%)",
        }}
      />
      {HeroBg && <HeroBg />}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center relative w-full">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={headlineRevealed ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-10"
          style={{
            background: "oklch(1 0 0 / 0.04)",
            border: "1px solid oklch(1 0 0 / 0.06)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full" style={{ background: "oklch(0.7 0.15 200)" }} />
            <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: "oklch(0.7 0.15 200)" }} />
          </span>
          <span className="text-xs" style={{ color: "oklch(1 0 0 / 0.6)" }}>
            Globalna platforma edukacyjna nowej generacji
          </span>
        </motion.div>

        <h1 className="mb-6 leading-[0.95]" style={{ perspective: "1000px" }}>
          <span className="sr-only">Przyszłość nauki zaczyna się tutaj</span>
          <span className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-2">
            {"Przyszłość nauki".split(" ").map((word, i) => (
              <motion.span
                key={`line1-${i}`}
                custom={i}
                variants={WORD_REVEAL_VARIANTS}
                initial="hidden"
                animate={headlineRevealed ? "visible" : "hidden"}
                className="inline-block text-[clamp(2.5rem,8vw,5rem)] font-bold tracking-tight text-white"
                style={{
                  textShadow: headlineRevealed ? "0 0 40px oklch(0.7 0.15 200 / 0.15)" : "none",
                  transition: "text-shadow 0.8s ease 0.4s",
                }}
              >
                {word}
              </motion.span>
            ))}
          </span>
          <span className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-2 mt-2">
            {"zaczyna się tutaj".split(" ").map((word, i) => (
              <motion.span
                key={`line2-${i}`}
                custom={i + 3}
                variants={WORD_REVEAL_VARIANTS}
                initial="hidden"
                animate={headlineRevealed ? "visible" : "hidden"}
                className="inline-block text-[clamp(2.5rem,8vw,5rem)] font-bold tracking-tight"
                style={{
                  background: "linear-gradient(135deg, oklch(0.75 0.15 200), oklch(0.6 0.2 240))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: headlineRevealed ? "drop-shadow(0 0 20px oklch(0.7 0.15 200 / 0.3))" : "none",
                  transition: "filter 0.8s ease 0.6s",
                }}
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={headlineRevealed ? { opacity: 1, filter: "blur(0px)" } : {}}
          transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg sm:text-xl max-w-2xl mx-auto min-h-[2em]"
          style={{ color: "oklch(1 0 0 / 0.5)" }}
        >
          <Typewriter
            text="Wykorzystaj sztuczną inteligencję, aby uczyć się szybciej, skuteczniej i bardziej świadomie niż kiedykolwiek wcześniej."
            delay={1200}
          />
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={headlineRevealed ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/auth/teacher"
            className="group relative inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl overflow-hidden transition-all duration-300"
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
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300"
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
          initial={{ opacity: 0, y: 20 }}
          animate={headlineRevealed ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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

      <style>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </section>
  );
}
