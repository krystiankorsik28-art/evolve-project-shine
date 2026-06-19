import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { GraduationCap, Users, Sparkles, Activity } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Wybierz swoją rolę",
    desc: "Uczeń, nauczyciel, dyrektor — każdy znajdzie coś dla siebie. Rejestracja zajmuje 2 minuty.",
    icon: GraduationCap,
  },
  {
    number: "02",
    title: "AI dostosowuje się do Ciebie",
    desc: "Generuj egzaminy, twórz kursy i analizuj wyniki. AI robi ciężką pracę za Ciebie.",
    icon: Sparkles,
  },
  {
    number: "03",
    title: "Ucz się i rozwijaj",
    desc: "Śledź postępy, zdobywaj certyfikaty i osiągaj lepsze wyniki. Wszystko w jednym miejscu.",
    icon: Activity,
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-28 sm:py-36 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full bg-accent/5 blur-[100px]" />
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs mb-6"
            style={{
              background: "oklch(1 0 0 / 0.04)",
              border: "1px solid oklch(1 0 0 / 0.06)",
              color: "oklch(1 0 0 / 0.5)",
              backdropFilter: "blur(8px)",
            }}
          >
            Jak to działa
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Trzy kroki do{" "}
            <span
              style={{
                background: "linear-gradient(135deg, oklch(0.75 0.15 200), oklch(0.6 0.2 240))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              nowoczesnej edukacji
            </span>
          </h2>
          <p className="mt-3 text-sm max-w-lg mx-auto" style={{ color: "oklch(1 0 0 / 0.4)" }}>
            Proces, który zmienia sposób nauczania i uczenia się.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-[120px] right-[120px] h-px -translate-y-1/2"
            style={{ background: "linear-gradient(90deg, transparent, oklch(0.7 0.15 200 / 0.2), transparent)" }} />

          <div className="grid lg:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div
                  className="rounded-2xl p-6 sm:p-8 h-full transition-all duration-300"
                  style={{
                    background: "oklch(0.08 0.03 270 / 0.4)",
                    border: "1px solid oklch(1 0 0 / 0.06)",
                    backdropFilter: "blur(12px)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "oklch(0.7 0.15 200 / 0.2)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.06)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-4xl font-bold tabular-nums"
                      style={{
                        background: "linear-gradient(135deg, oklch(0.75 0.15 200 / 0.3), oklch(0.6 0.2 240 / 0.3))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {step.number}
                    </span>
                    <div
                      className="w-12 h-12 rounded-2xl grid place-items-center"
                      style={{
                        background: "oklch(0.7 0.15 200 / 0.1)",
                        border: "1px solid oklch(0.7 0.15 200 / 0.15)",
                      }}
                    >
                      <step.icon className="w-5 h-5" style={{ color: "oklch(0.7 0.15 200 / 0.8)" }} />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white/90">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "oklch(1 0 0 / 0.45)" }}>
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
