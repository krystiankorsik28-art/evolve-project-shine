"use client";
import { motion } from "framer-motion";
import { BrainCircuit, Sparkles, BarChart3, Shield, GraduationCap, MessageSquare } from "lucide-react";

const features = [
  { icon: BrainCircuit, title: "AI Exam Generator", desc: "Generate 100,000+ unique exam variations from a single topic. AI analyzes curriculum standards and creates balanced assessments.", accent: "oklch(0.7 0.15 200)" },
  { icon: MessageSquare, title: "AI Tutor", desc: "24/7 personalized tutoring powered by Gemini. Adapts to each student's learning style and pace.", accent: "oklch(0.65 0.2 240)" },
  { icon: Sparkles, title: "AI Teacher Assistant", desc: "Create lesson plans, presentations, and course materials automatically. AI helps you prepare classes in minutes.", accent: "oklch(0.75 0.15 85)" },
  { icon: BarChart3, title: "AI Analytics", desc: "Real-time insights into class performance, question difficulty, and learning gaps with predictive analytics.", accent: "oklch(0.7 0.15 160)" },
  { icon: Shield, title: "AI Monitoring", desc: "Enterprise-grade proctoring with AI cheat detection, face verification, and real-time behavior analysis.", accent: "oklch(0.65 0.18 330)" },
  { icon: GraduationCap, title: "AI Reports", desc: "Auto-generated report cards, progress summaries, and personalized recommendations for each student.", accent: "oklch(0.65 0.2 260)" },
];

export function AIFeatures() {
  return (
    <section id="features" className="relative py-24 sm:py-32 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-xs"
            style={{ background: "oklch(0.7 0.15 200 / 0.08)", border: "1px solid oklch(0.7 0.15 200 / 0.15)", color: "oklch(0.7 0.15 200)" }}>
            <Sparkles className="w-3 h-3" />
            Powered by Gemini AI
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Six AI Modules,{" "}
            <span style={{
              background: "linear-gradient(135deg, oklch(0.75 0.15 200), oklch(0.6 0.2 240))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              One Platform
            </span>
          </h2>
          <p className="mt-3 text-sm max-w-lg mx-auto" style={{ color: "oklch(1 0 0 / 0.4)" }}>
            From exam creation to personalized tutoring — every aspect of education enhanced by artificial intelligence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group p-6 rounded-2xl transition-all duration-500"
              style={{
                background: "linear-gradient(180deg, oklch(0.08 0.03 270 / 0.4), oklch(0.04 0.02 270 / 0.2))",
                border: "1px solid oklch(1 0 0 / 0.06)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${f.accent.replace(")", "/ 0.2)")}, ${f.accent.replace(")", "/ 0.05)")})`,
                  border: `1px solid ${f.accent.replace(")", "/ 0.2)")}`,
                  boxShadow: `0 0 12px ${f.accent.replace(")", "/ 0.1)")}`,
                }}>
                <f.icon className="w-5 h-5" style={{ color: f.accent }} />
              </div>
              <h3 className="text-base font-semibold text-white/90 mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "oklch(1 0 0 / 0.4)" }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
