"use client";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";

const metrics = [
  { icon: TrendingUp, value: "36,140+", label: "Students" },
  { icon: Zap, value: "10,000+", label: "Exams Generated" },
  { icon: Shield, value: "99.9%", label: "Uptime SLA" },
];

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.82_0.12_200_/_0.08),_transparent_60%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,_oklch(0.82_0.12_200_/_0.03),_transparent_60%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-xs text-cyan-400 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          AI-powered education platform
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[0.95]"
        >
          <span className="text-white">The AI Platform</span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
            for Modern Education
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-6 text-base sm:text-lg text-white/40 max-w-xl mx-auto leading-relaxed"
        >
          Generate exams, tutor students with AI, and track progress in real-time.
          One platform for the entire school ecosystem.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mt-8 flex items-center justify-center gap-3 flex-wrap"
        >
          <a
            href="/auth/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-white text-[#0a0a12] rounded-lg hover:bg-white/90 transition-all hover:shadow-lg hover:shadow-white/10"
          >
            Start for free <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm text-white/60 hover:text-white border border-white/[0.08] rounded-lg hover:bg-white/[0.04] transition-all"
          >
            View pricing
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-16 flex items-center justify-center gap-8 sm:gap-12"
        >
          {metrics.map((m) => (
            <div key={m.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{m.value}</div>
              <div className="text-xs text-white/30 mt-1">{m.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-16 max-w-5xl mx-auto"
        >
          <div className="relative rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-2 shadow-2xl">
            <div className="rounded-lg overflow-hidden bg-[#0c0c1a] aspect-video flex items-center justify-center">
              <div className="text-center p-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-xs text-cyan-400 mb-4">
                  Dashboard Preview
                </div>
                <p className="text-white/20 text-sm">Interactive dashboard mockup — coming in Sprint 1</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
