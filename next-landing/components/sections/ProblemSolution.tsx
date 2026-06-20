"use client";
import { motion } from "framer-motion";
import { Clock, AlertTriangle, BarChart3, XCircle, CheckCircle2, Sparkles } from "lucide-react";

const problems = [
  { icon: Clock, title: "Hours of manual grading", desc: "Teachers spend 40% of their time on repetitive grading tasks instead of teaching." },
  { icon: AlertTriangle, title: "Cheating goes undetected", desc: "Traditional exams can't detect AI-generated answers or sophisticated cheating." },
  { icon: BarChart3, title: "No real-time analytics", desc: "By the time you spot a struggling student, it's often too late to intervene." },
];

const solutions = [
  { icon: Sparkles, title: "AI auto-grading in seconds", desc: "From simple quizzes to essays — AI grades everything in real-time with detailed feedback." },
  { icon: CheckCircle2, title: "AI proctoring & cheat detection", desc: "Real-time monitoring of typing patterns, eye movement, and behavior analysis." },
  { icon: BarChart3, title: "Live analytics dashboard", desc: "Spot learning gaps instantly with heat maps, trends, and individual student insights." },
];

export function ProblemSolution() {
  return (
    <section className="relative py-24 sm:py-32 border-t border-white/[0.04] overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.7 0.15 200 / 0.04) 0%, transparent 60%)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Education Today{" "}
            <span style={{ color: "oklch(1 0 0 / 0.3)" }}>vs.</span>{" "}
            <span style={{
              background: "linear-gradient(135deg, oklch(0.75 0.15 200), oklch(0.6 0.2 240))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Education Tomorrow
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div>
            <h3 className="text-sm font-semibold mb-6 flex items-center gap-2" style={{ color: "oklch(0.72 0.18 30 / 0.8)" }}>
              <XCircle className="w-4 h-4" />
              The Old Way
            </h3>
            <div className="space-y-3">
              {problems.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 p-4 rounded-xl"
                  style={{
                    background: "oklch(0.72 0.18 30 / 0.04)",
                    border: "1px solid oklch(0.72 0.18 30 / 0.1)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: "oklch(0.72 0.18 30 / 0.1)" }}>
                    <p.icon className="w-5 h-5" style={{ color: "oklch(0.72 0.18 30 / 0.8)" }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white/80">{p.title}</h4>
                    <p className="text-xs mt-1" style={{ color: "oklch(1 0 0 / 0.4)" }}>{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-6 flex items-center gap-2" style={{ color: "oklch(0.7 0.15 200 / 0.8)" }}>
              <CheckCircle2 className="w-4 h-4" />
              EduNex Solution
            </h3>
            <div className="space-y-3">
              {solutions.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 p-4 rounded-xl"
                  style={{
                    background: "oklch(0.7 0.15 200 / 0.04)",
                    border: "1px solid oklch(0.7 0.15 200 / 0.1)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: "oklch(0.7 0.15 200 / 0.1)" }}>
                    <s.icon className="w-5 h-5" style={{ color: "oklch(0.7 0.15 200)" }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white/80">{s.title}</h4>
                    <p className="text-xs mt-1" style={{ color: "oklch(1 0 0 / 0.4)" }}>{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
