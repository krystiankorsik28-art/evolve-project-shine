import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Brain, Bot, Cpu, Sparkles, Code2, BarChart3, Zap } from "lucide-react";

const AI_AGENTS = [
  {
    icon: Brain,
    name: "AI Generator",
    desc: "Generuje egzaminy, quizy i zadania z dowolnego przedmiotu w sekundy. Multi-model routing (Gemini, GPT-4o, Claude).",
    status: "Aktywny",
    model: "Gemini 2.5 Flash",
    speed: "< 2s",
  },
  {
    icon: Bot,
    name: "AI Tutor",
    desc: "Osobisty asystent ucznia dostępny 24/7. Wyjaśnia, tłumaczy, pomaga z zadaniami domowymi.",
    status: "Online",
    model: "Multi-model",
    speed: "Streaming",
  },
  {
    icon: Sparkles,
    name: "AI Ocenianie",
    desc: "Automatyczne sprawdzanie prac otwartych z rubryką, komentarzami i sugestiami poprawy.",
    status: "Aktywny",
    model: "GPT-4o",
    speed: "< 5s/praca",
  },
  {
    icon: Code2,
    name: "Code Mentor",
    desc: "Sprawdza kod uczniów, wykrywa błędy, sugeruje optymalizacje. Wspiera 12+ języków.",
    status: "Beta",
    model: "Claude 3.5",
    speed: "Real-time",
  },
  {
    icon: BarChart3,
    name: "Progress Analyzer",
    desc: "Analizuje wyniki ucznia w czasie, przewiduje zagrożenia i rekomenduje działania.",
    status: "Aktywny",
    model: "Custom ML",
    speed: "Ciągły",
  },
  {
    icon: Cpu,
    name: "AI Gateway",
    desc: "Własny routing multi-model z cache'owaniem, rate limiting i fallback. Zero vendor lock-in.",
    status: "Core",
    model: "Orchestrator",
    speed: "< 50ms",
  },
];

export default function AISectionPremium() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="ai" className="relative py-28 sm:py-36 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, oklch(0.6 0.18 230 / 0.06), transparent 60%)",
            filter: "blur(60px)",
          }}
        />
      </div>

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
            <Cpu className="w-3.5 h-3.5" /> Silnik AI
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white text-balance">
            AI to nie gadżet.{" "}
            <span
              style={{
                background: "linear-gradient(135deg, oklch(0.8 0.14 195), oklch(0.6 0.2 250))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              To serce platformy.
            </span>
          </h2>
          <p className="mt-4 text-base max-w-2xl mx-auto" style={{ color: "oklch(1 0 0 / 0.45)" }}>
            6 inteligentnych agentów, własny gateway multi-model, routing w &lt;50ms. Każdy moduł
            jest niezależnym AI, który uczy się i adaptuje.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {AI_AGENTS.map((agent, i) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative p-6 rounded-2xl group transition-all duration-500"
              style={{
                background: "oklch(0.05 0.015 270)",
                border: "1px solid oklch(0.15 0.02 270)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "oklch(0.72 0.16 200 / 0.3)";
                e.currentTarget.style.boxShadow = "0 8px 40px oklch(0.6 0.18 230 / 0.1)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "oklch(0.15 0.02 270)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Status light */}
              <div className="absolute top-5 right-5 flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    background:
                      agent.status === "Beta" ? "oklch(0.75 0.15 80)" : "oklch(0.65 0.2 150)",
                    boxShadow: `0 0 8px ${agent.status === "Beta" ? "oklch(0.75 0.15 80 / 0.5)" : "oklch(0.65 0.2 150 / 0.5)"}`,
                  }}
                />
                <span
                  className="text-[10px] font-medium"
                  style={{
                    color: agent.status === "Beta" ? "oklch(0.75 0.15 80)" : "oklch(0.65 0.2 150)",
                  }}
                >
                  {agent.status}
                </span>
              </div>

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl grid place-items-center mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.72 0.16 200 / 0.15), oklch(0.55 0.2 250 / 0.08))",
                  border: "1px solid oklch(0.72 0.16 200 / 0.25)",
                }}
              >
                <agent.icon className="w-6 h-6" style={{ color: "oklch(0.78 0.15 200)" }} />
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{agent.name}</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "oklch(1 0 0 / 0.5)" }}>
                {agent.desc}
              </p>

              {/* Meta */}
              <div
                className="flex items-center gap-3 pt-3"
                style={{ borderTop: "1px solid oklch(0.15 0.02 270)" }}
              >
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3" style={{ color: "oklch(0.72 0.16 200 / 0.6)" }} />
                  <span className="text-[10px] font-mono" style={{ color: "oklch(1 0 0 / 0.35)" }}>
                    {agent.model}
                  </span>
                </div>
                <div
                  className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded"
                  style={{
                    background: "oklch(0.72 0.16 200 / 0.08)",
                    color: "oklch(0.78 0.15 200)",
                  }}
                >
                  {agent.speed}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
