"use client";
import { motion } from "framer-motion";
import { BrainCircuit, Sparkles, BarChart3, Shield, GraduationCap, MessageSquare } from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Exam Generator",
    desc: "Generate 100,000+ unique exam variations from a single topic. AI analyzes curriculum standards and creates balanced assessments.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: MessageSquare,
    title: "AI Tutor",
    desc: "24/7 personalized tutoring powered by Gemini. Adapts to each student's learning style and pace.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Sparkles,
    title: "AI Teacher Assistant",
    desc: "Create lesson plans, presentations, and course materials automatically. AI helps you prepare classes in minutes.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: BarChart3,
    title: "AI Analytics",
    desc: "Real-time insights into class performance, question difficulty, and learning gaps with predictive analytics.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Shield,
    title: "AI Monitoring",
    desc: "Enterprise-grade proctoring with AI cheat detection, face verification, and real-time behavior analysis.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: GraduationCap,
    title: "AI Reports",
    desc: "Auto-generated report cards, progress summaries, and personalized recommendations for each student.",
    gradient: "from-blue-500 to-indigo-600",
  },
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-xs text-cyan-400 mb-4">
            <Sparkles className="w-3 h-3" />
            Powered by Gemini AI
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Six AI Modules, One Platform
          </h2>
          <p className="mt-3 text-sm text-white/40 max-w-lg mx-auto">
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
              className="group p-6 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] transition-all duration-300"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4`}>
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-white/90 mb-2">{f.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
