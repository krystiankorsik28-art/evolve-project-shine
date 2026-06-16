"use client";
import { motion } from "framer-motion";
import { FileText, BrainCircuit, Users, CheckCircle2, BarChart3 } from "lucide-react";

const steps = [
  { icon: FileText, title: "Create an exam", desc: "Type your topic or upload a document. AI analyzes curriculum standards." },
  { icon: BrainCircuit, title: "AI generates questions", desc: "100,000+ unique variations. Difficulty calibrated automatically." },
  { icon: Users, title: "Students solve", desc: "Share a link or PIN. Works on any device. AI proctoring active." },
  { icon: CheckCircle2, title: "System grades", desc: "AI grades everything — from multiple choice to essays — in real-time." },
  { icon: BarChart3, title: "Report ready", desc: "Instant analytics: class trends, weak areas, individual progress." },
];

export function HowItWorks() {
  return (
    <section className="relative py-24 sm:py-32 border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            How It Works
          </h2>
          <p className="mt-3 text-sm text-white/40">From zero to exam results in 5 minutes</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                <s.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-xs text-white/20 font-mono mb-1">Step {i + 1}</div>
              <h3 className="text-sm font-semibold text-white/80 mb-1">{s.title}</h3>
              <p className="text-xs text-white/30 leading-relaxed">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute top-6 -right-2 w-4 h-px bg-white/[0.08]" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
