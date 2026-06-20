"use client";
import { motion } from "framer-motion";
import { FileText, BrainCircuit, Users, CheckCircle2, BarChart3 } from "lucide-react";

const steps = [
  { icon: FileText, title: "Create an exam", desc: "Type your topic or upload a document. AI analyzes curriculum standards.", accent: "oklch(0.7 0.15 200)" },
  { icon: BrainCircuit, title: "AI generates questions", desc: "100,000+ unique variations. Difficulty calibrated automatically.", accent: "oklch(0.65 0.2 240)" },
  { icon: Users, title: "Students solve", desc: "Share a link or PIN. Works on any device. AI proctoring active.", accent: "oklch(0.6 0.2 280)" },
  { icon: CheckCircle2, title: "System grades", desc: "AI grades everything — from multiple choice to essays — in real-time.", accent: "oklch(0.7 0.15 160)" },
  { icon: BarChart3, title: "Report ready", desc: "Instant analytics: class trends, weak areas, individual progress.", accent: "oklch(0.65 0.18 200)" },
];

export function HowItWorks() {
  return (
    <section className="relative py-24 sm:py-32 border-t border-white/[0.04] overflow-hidden">
      <div className="absolute top-1/2 left-0 right-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, oklch(0.7 0.15 200 / 0.1), transparent)" }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            How It{" "}
            <span style={{
              background: "linear-gradient(135deg, oklch(0.75 0.15 200), oklch(0.6 0.2 240))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Works
            </span>
          </h2>
          <p className="mt-3 text-sm" style={{ color: "oklch(1 0 0 / 0.4)" }}>From zero to exam results in 5 minutes</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative group"
            >
              <div className="relative rounded-2xl p-5 text-center h-full transition-all duration-500"
                style={{
                  background: "linear-gradient(180deg, oklch(0.08 0.03 270 / 0.5), oklch(0.04 0.02 270 / 0.3))",
                  border: "1px solid oklch(1 0 0 / 0.06)",
                  backdropFilter: "blur(12px)",
                }}>
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${s.accent.replace(")", "/ 0.08)")}, transparent 70%)` }} />

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${s.accent.replace(")", "/ 0.15)")}, ${s.accent.replace(")", "/ 0.05)")})`,
                      border: `1px solid ${s.accent.replace(")", "/ 0.2)")}`,
                      boxShadow: `0 0 15px ${s.accent.replace(")", "/ 0.1)")}`,
                    }}>
                    <s.icon className="w-5 h-5" style={{ color: s.accent }} />
                  </div>

                  <div className="text-xs font-mono mb-1" style={{ color: `${s.accent.replace(")", "/ 0.5)")}` }}>Step {i + 1}</div>
                  <h3 className="text-sm font-semibold text-white/80 mb-1">{s.title}</h3>
                  <p className="text-xs" style={{ color: "oklch(1 0 0 / 0.35)" }}>{s.desc}</p>
                </div>
              </div>

              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute top-1/2 -right-1.5 w-3 h-3 -translate-y-1/2 z-20">
                  <div className="w-full h-full rounded-full" style={{
                    background: "linear-gradient(135deg, oklch(0.7 0.15 200), oklch(0.6 0.2 240))",
                    boxShadow: "0 0 8px oklch(0.7 0.15 200 / 0.3)",
                  }} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
