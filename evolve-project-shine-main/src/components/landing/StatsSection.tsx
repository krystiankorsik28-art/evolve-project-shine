import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, FileText, GraduationCap, Activity } from "lucide-react";

const STATS = [
  { value: 36140, label: "Uczniów w systemie", suffix: "+", icon: Users },
  { value: 10000, label: "Przeprowadzonych egzaminów", suffix: "+", icon: FileText },
  { value: 829, label: "Aktywnych nauczycieli", suffix: "+", icon: GraduationCap },
  { value: 99.98, label: "Dostępność", suffix: "%", icon: Activity },
];

function AnimatedCounter({ target, suffix, isInView }: { target: number; suffix: string; isInView: boolean }) {
  const value = target > 1000
    ? Math.round(Math.min(target, (target * 1)))
    : parseFloat((Math.min(target, (target * 1))).toFixed(1));

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="tabular-nums font-bold"
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {value.toLocaleString()}{suffix}
    </motion.div>
  );
}

export default function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-16 sm:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.015] to-transparent" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-72 h-72 rounded-full bg-accent/5 blur-[100px]" />
        <div className="absolute bottom-1/2 right-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-[120px]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3"
                style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.06)" }}>
                <s.icon className="w-5 h-5" style={{ color: "oklch(0.7 0.15 200 / 0.7)" }} />
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold"
                style={{
                  background: "linear-gradient(135deg, oklch(0.75 0.15 200), oklch(0.6 0.2 240))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                <AnimatedCounter target={s.value} suffix={s.suffix} isInView={isInView} />
              </div>
              <div className="text-xs mt-1.5 font-medium" style={{ color: "oklch(1 0 0 / 0.35)" }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
