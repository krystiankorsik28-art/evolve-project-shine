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
    <section className="relative py-24 sm:py-32 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Education Today vs. Education Tomorrow
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <h3 className="text-sm font-semibold text-red-400/80 mb-6 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              The Old Way
            </h3>
            <div className="space-y-4">
              {problems.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 p-4 rounded-lg bg-red-500/[0.03] border border-red-500/10"
                >
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <p.icon className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white/80">{p.title}</h4>
                    <p className="text-xs text-white/40 mt-1">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cyan-400/80 mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              EduNex Solution
            </h3>
            <div className="space-y-4">
              {solutions.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 p-4 rounded-lg bg-cyan-500/[0.03] border border-cyan-500/10"
                >
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white/80">{s.title}</h4>
                    <p className="text-xs text-white/40 mt-1">{s.desc}</p>
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
