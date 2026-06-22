import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Zap,
  Globe2,
  Activity,
  Play,
  Sparkles,
  Brain,
  GraduationCap,
  Users,
  Bot,
} from "lucide-react";

function AnimatedCounter({
  end,
  suffix = "",
  prefix = "",
}: {
  end: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          let start = 0;
          const dur = 2000;
          const startTime = performance.now();
          const step = (ts: number) => {
            const prog = Math.min((ts - startTime) / dur, 1);
            const eased = 1 - Math.pow(1 - prog, 3);
            start = Math.round(eased * end);
            setCount(start);
            if (prog < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString("pl-PL")}
      {suffix}
    </span>
  );
}

const TRUST_ITEMS = [
  { icon: Shield, label: "RODO & ISO 27001" },
  { icon: Zap, label: "99.98% uptime" },
  { icon: Globe2, label: "CDN w 42 krajach" },
  { icon: Activity, label: "AI-native" },
];

const STATS = [
  { value: 36000, suffix: "+", label: "uczniów" },
  { value: 800, suffix: "+", label: "nauczycieli" },
  { value: 120, suffix: "+", label: "szkół" },
  { value: 2, prefix: "", suffix: "M+", label: "egzaminów" },
];

const FLOATING_CARDS = [
  { icon: Brain, label: "AI Generator", status: "Aktywny", x: "78%", y: "18%", delay: 0 },
  { icon: Bot, label: "AI Tutor", status: "Online 24/7", x: "82%", y: "52%", delay: 0.3 },
  { icon: Users, label: "Monitoring", status: "342 live", x: "72%", y: "75%", delay: 0.6 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function HeroSection() {
  const [revealed, setRevealed] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 30 });
  const parallaxX = useTransform(springX, [-0.5, 0.5], [20, -20]);
  const parallaxY = useTransform(springY, [-0.5, 0.5], [15, -15]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY],
  );

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen pt-28 pb-20 sm:pb-28 overflow-hidden flex items-center"
    >
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{
            top: "-20%",
            left: "-10%",
            background: "radial-gradient(circle, oklch(0.6 0.18 230 / 0.08), transparent 60%)",
            filter: "blur(80px)",
          }}
          animate={{ x: [0, 60, -40, 0], y: [0, -40, 30, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            bottom: "-10%",
            right: "-5%",
            background: "radial-gradient(circle, oklch(0.72 0.16 200 / 0.06), transparent 60%)",
            filter: "blur(60px)",
          }}
          animate={{ x: [0, -50, 30, 0], y: [0, 30, -50, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{
            top: "40%",
            left: "50%",
            background: "radial-gradient(circle, oklch(0.55 0.2 270 / 0.05), transparent 60%)",
            filter: "blur(50px)",
          }}
          animate={{ scale: [1, 1.2, 0.9, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0 / 0.02) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 40%, black 20%, transparent 70%)",
          maskImage: "radial-gradient(ellipse at 50% 40%, black 20%, transparent 70%)",
        }}
      />

      {/* Floating UI Cards (right side) */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none">
        {FLOATING_CARDS.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            animate={revealed ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ delay: 0.8 + card.delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute"
            style={{ left: card.x, top: card.y }}
          >
            <motion.div
              className="px-4 py-3 rounded-xl flex items-center gap-3"
              style={{
                background: "oklch(0.06 0.02 270)",
                border: "1px solid oklch(0.72 0.16 200 / 0.2)",
                boxShadow: "0 8px 32px oklch(0 0 0 / 0.4), 0 0 20px oklch(0.6 0.18 230 / 0.05)",
              }}
              animate={{ y: [0, -8, 0, 6, 0] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
            >
              <div
                className="w-8 h-8 rounded-lg grid place-items-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.72 0.16 200 / 0.2), oklch(0.55 0.2 250 / 0.1))",
                  border: "1px solid oklch(0.72 0.16 200 / 0.3)",
                }}
              >
                <card.icon className="w-4 h-4" style={{ color: "oklch(0.78 0.15 200)" }} />
              </div>
              <div>
                <div className="text-xs font-medium text-white">{card.label}</div>
                <div
                  className="text-[10px] flex items-center gap-1"
                  style={{ color: "oklch(0.65 0.2 150)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {card.status}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative w-full">
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={revealed ? "visible" : "hidden"}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8"
            style={{
              background: "oklch(0.72 0.16 200 / 0.08)",
              border: "1px solid oklch(0.72 0.16 200 / 0.2)",
            }}
          >
            <span className="relative flex w-2 h-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full"
                style={{ background: "oklch(0.72 0.16 200)" }}
              />
              <span
                className="relative inline-flex rounded-full w-2 h-2"
                style={{ background: "oklch(0.72 0.16 200)" }}
              />
            </span>
            <span
              className="text-xs font-medium tracking-wide"
              style={{ color: "oklch(0.78 0.15 200)" }}
            >
              Platforma AI nowej generacji · v11.1
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div style={{ x: parallaxX, y: parallaxY }}>
            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate={revealed ? "visible" : "hidden"}
              className="text-[clamp(2.5rem,7vw,5.5rem)] font-bold tracking-tight leading-[1.05]"
            >
              <span className="text-white">Edukacja, która </span>
              <span
                style={{
                  background: "linear-gradient(135deg, oklch(0.8 0.14 195), oklch(0.65 0.2 250))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                wyprzedza
              </span>
              <br />
              <span className="text-white">przyszłość</span>
            </motion.h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate={revealed ? "visible" : "hidden"}
            className="text-base sm:text-lg max-w-xl mt-6 leading-relaxed"
            style={{ color: "oklch(1 0 0 / 0.55)" }}
          >
            Platforma, która łączy sztuczną inteligencję z nauczaniem. Generuj egzaminy w sekundy,
            automatyzuj ocenianie i daj uczniom dostęp do AI Tutora 24/7.
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate={revealed ? "visible" : "hidden"}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/auth/teacher"
              className="magnetic-btn group relative inline-flex items-center gap-2.5 px-8 py-4 text-sm font-semibold rounded-xl overflow-hidden transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, oklch(0.72 0.16 200), oklch(0.55 0.22 250))",
                color: "#fff",
                boxShadow:
                  "0 4px 30px oklch(0.6 0.18 230 / 0.4), 0 0 60px oklch(0.72 0.16 200 / 0.12)",
              }}
            >
              <Sparkles className="w-4 h-4" />
              Rozpocznij za darmo
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <a
              href="#demo"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="magnetic-btn inline-flex items-center gap-2.5 px-7 py-4 text-sm font-medium rounded-xl transition-all duration-300"
              style={{
                background: "oklch(0.06 0.02 270)",
                color: "oklch(1 0 0 / 0.75)",
                border: "1px solid oklch(0.72 0.16 200 / 0.15)",
              }}
            >
              <Play className="w-4 h-4" style={{ color: "oklch(0.78 0.15 200)" }} />
              Zobacz demo
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate={revealed ? "visible" : "hidden"}
            className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            {TRUST_ITEMS.map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-2 text-xs font-medium"
                style={{ color: "oklch(1 0 0 / 0.4)" }}
              >
                <item.icon
                  className="w-3.5 h-3.5"
                  style={{ color: "oklch(0.72 0.16 200 / 0.6)" }}
                />
                {item.label}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Animated counters */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate={revealed ? "visible" : "hidden"}
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6"
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-4 rounded-xl"
              style={{
                background: "oklch(0.05 0.015 270)",
                border: "1px solid oklch(0.15 0.02 270)",
              }}
            >
              <div
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: "oklch(0.82 0.14 200)" }}
              >
                <AnimatedCounter end={stat.value} suffix={stat.suffix} prefix={stat.prefix || ""} />
              </div>
              <div className="text-xs mt-1" style={{ color: "oklch(1 0 0 / 0.4)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
