import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Clock, Brain, Shield, BarChart3, Zap, Users } from "lucide-react";

const BENEFITS = [
  {
    icon: Clock,
    problem: "Godziny na przygotowanie egzaminu",
    solution: "AI Generator tworzy test w 30 sekund",
    effect: "85% mniej czasu na przygotowania",
    color: "oklch(0.72 0.16 200)",
  },
  {
    icon: Brain,
    problem: "Ręczne sprawdzanie prac",
    solution: "AI Ocenianie analizuje odpowiedzi natychmiast",
    effect: "Automatyczna ocena 500+ prac w minutę",
    color: "oklch(0.7 0.18 170)",
  },
  {
    icon: Shield,
    problem: "Brak kontroli nad ściąganiem",
    solution: "Anti-cheat + monitoring w czasie rzeczywistym",
    effect: "92% redukcja nieuczciwości na egzaminach",
    color: "oklch(0.65 0.2 250)",
  },
  {
    icon: BarChart3,
    problem: "Brak danych o postępach uczniów",
    solution: "Analityka AI z predykcją wyników",
    effect: "Wczesna identyfikacja zagrożonych uczniów",
    color: "oklch(0.7 0.16 280)",
  },
  {
    icon: Zap,
    problem: "Wolny dostęp do materiałów",
    solution: "AI Tutor dostępny 24/7 dla każdego ucznia",
    effect: "3x szybsze przyswajanie wiedzy",
    color: "oklch(0.75 0.14 50)",
  },
  {
    icon: Users,
    problem: "Chaos w komunikacji szkoły",
    solution: "Jeden panel dla dyrekcji, nauczycieli i rodziców",
    effect: "Pełna transparentność i kontrola",
    color: "oklch(0.68 0.18 320)",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function WhyEduNexSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-28 sm:py-36 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs mb-6"
            style={{
              background: "oklch(0.72 0.16 200 / 0.08)",
              border: "1px solid oklch(0.72 0.16 200 / 0.18)",
              color: "oklch(0.78 0.15 200)",
            }}
          >
            <Zap className="w-3.5 h-3.5" /> Dlaczego EduNex
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white text-balance">
            Każdy problem ma{" "}
            <span
              style={{
                background: "linear-gradient(135deg, oklch(0.8 0.14 195), oklch(0.6 0.2 250))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              inteligentne rozwiązanie
            </span>
          </h2>
          <p className="mt-4 text-base max-w-2xl mx-auto" style={{ color: "oklch(1 0 0 / 0.45)" }}>
            Zamieniamy największe wyzwania edukacji w automatyczne procesy. Problem → Rozwiązanie →
            Efekt. Bez kompromisów.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.solution}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="group relative p-6 rounded-2xl transition-all duration-500"
              style={{
                background: "oklch(0.05 0.015 270)",
                border: "1px solid oklch(0.15 0.02 270)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${b.color} / 0.3)`
                  .replace("oklch(", "oklch(")
                  .replace(")", " / 0.3)");
                e.currentTarget.style.boxShadow = `0 8px 40px ${b.color.replace(")", " / 0.1)")}`;
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "oklch(0.15 0.02 270)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                className="w-10 h-10 rounded-xl grid place-items-center mb-4"
                style={{
                  background: `${b.color.replace(")", " / 0.1)")}`,
                  border: `1px solid ${b.color.replace(")", " / 0.25)")}`,
                }}
              >
                <b.icon className="w-5 h-5" style={{ color: b.color }} />
              </div>

              <div
                className="text-[10px] uppercase tracking-widest font-medium mb-2 flex items-center gap-2"
                style={{ color: "oklch(1 0 0 / 0.3)" }}
              >
                <span className="w-4 h-px" style={{ background: "oklch(1 0 0 / 0.2)" }} />
                Problem
              </div>
              <p
                className="text-sm mb-3 line-through decoration-1"
                style={{ color: "oklch(1 0 0 / 0.4)", textDecorationColor: "oklch(1 0 0 / 0.15)" }}
              >
                {b.problem}
              </p>

              <div
                className="text-[10px] uppercase tracking-widest font-medium mb-2 flex items-center gap-2"
                style={{ color: "oklch(0.72 0.16 200 / 0.6)" }}
              >
                <span className="w-4 h-px" style={{ background: "oklch(0.72 0.16 200 / 0.4)" }} />
                Rozwiązanie
              </div>
              <p className="text-sm font-medium text-white mb-3">{b.solution}</p>

              <div className="mt-auto pt-3" style={{ borderTop: "1px solid oklch(0.15 0.02 270)" }}>
                <div className="text-xs font-semibold" style={{ color: b.color }}>
                  → {b.effect}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
