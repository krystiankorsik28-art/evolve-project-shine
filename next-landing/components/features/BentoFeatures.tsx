"use client";
import { motion } from "framer-motion";
import {
  BrainCircuit, FileText, BarChart3, Shield, Puzzle, GraduationCap, Sparkles,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "AI Exam Generator",
    desc: "Generate 100,000+ unique exam variations from a single topic. AI analyzes curriculum standards and creates balanced assessments in seconds.",
    gradient: "from-cyan-500 to-blue-600",
    span: "lg:col-span-2 lg:row-span-2",
    items: ["Smart question bank with 10,000+ items", "Automatic difficulty calibration", "Plagiarism-proof variant generation", "Multi-language support (PL/EN/UA)"],
  },
  {
    icon: Sparkles,
    title: "AI Tutor",
    desc: "24/7 personalized tutoring powered by Gemini. Adapts to each student's learning style and pace.",
    gradient: "from-violet-500 to-purple-600",
    span: "lg:col-span-1",
    items: ["Natural conversation interface", "Step-by-step problem solving", "Subject mastery tracking"],
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Real-time insights into class performance, question difficulty, and learning gaps.",
    gradient: "from-emerald-500 to-teal-600",
    span: "lg:col-span-1",
    items: ["Live exam monitoring", "Heat maps of weak areas", "Automated report cards"],
  },
  {
    icon: Shield,
    title: "Smart Security",
    desc: "Enterprise-grade proctoring with AI cheat detection, face verification, and screen monitoring.",
    gradient: "from-rose-500 to-pink-600",
    span: "lg:col-span-1",
    items: ["AI proctoring in real-time", "Face recognition + liveness check", "Screen recording with alerts"],
  },
  {
    icon: FileText,
    title: "Auto-Grading",
    desc: "AI grades open-ended responses, essays, and code. Cuts grading time by 90%.",
    gradient: "from-amber-500 to-orange-600",
    span: "lg:col-span-1",
    items: ["Open-ended answer analysis", "Code evaluation with feedback", "Essay scoring with rubric"],
  },
  {
    icon: Puzzle,
    title: "Integrations",
    desc: "Seamlessly connects with your existing tools. CSV import, LMS sync, and API access.",
    gradient: "from-blue-500 to-indigo-600",
    span: "lg:col-span-1",
    items: ["LMS integration (Moodle, Teams)", "CSV/Excel bulk import", "REST API for custom tools"],
  },
  {
    icon: GraduationCap,
    title: "Certification",
    desc: "Blockchain-verified certificates with QR codes. Instant generation on exam completion.",
    gradient: "from-cyan-400 to-emerald-500",
    span: "lg:col-span-2",
    items: ["Tamper-proof PDF certificates", "QR verification system", "Shareable credential links"],
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export function BentoFeatures() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-glass-border bg-glass backdrop-blur-md text-xs text-cyan-400 mb-4">
            <Sparkles className="w-3 h-3" />
            Everything you need
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            The Complete AI-Powered<br />Education Ecosystem
          </h2>
          <p className="mt-4 text-white/40 max-w-xl mx-auto">
            Seven integrated modules that work together to create the ultimate learning experience.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 auto-rows-[minmax(200px,auto)]"
        >
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} variants={itemAnim} className={f.span}>
              <GlassPanel hover className="p-6 sm:p-8 h-full group">
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center`}>
                    <f.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white group-hover:text-white transition-colors">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm text-white/40 leading-relaxed">{f.desc}</p>
                    <ul className="mt-4 space-y-1.5">
                      {f.items.map((item) => (
                        <li key={item} className="text-xs text-white/30 flex items-center gap-2">
                          <span className={`w-1 h-1 rounded-full bg-gradient-to-r ${f.gradient} shrink-0`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-[0.03] pointer-events-none`} />
              </GlassPanel>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
