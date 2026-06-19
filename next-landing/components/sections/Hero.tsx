"use client";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { MagneticBtn } from "../ui/MagneticBtn";
import { CountUp } from "../ui/CountUp";
import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("@/components/three/HeroScene").then((m) => ({ default: m.HeroScene })), { ssr: false });

const metrics = [
  { icon: Sparkles, value: 36140, label: "Students", suffix: "+" },
  { icon: Zap, value: 10000, label: "Exams Generated", suffix: "+" },
  { icon: Shield, value: 999, label: "Uptime", prefix: "", suffix: "%", decimals: 1 },
];

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.5 } } } as const;
const item = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } } };
const wordItem = (i: number) => ({ hidden: { opacity: 0, y: 60, rotate: 3 }, visible: { opacity: 1, y: 0, rotate: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30, delay: 0.8 + i * 0.06 } } });

export function Hero() {
  const headline = "The Future of Education × AI";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <HeroScene />

      <motion.div variants={container} initial="hidden" animate="visible" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon/20 bg-neon/5 text-xs text-neon mb-8 shadow-[0_0_20px_oklch(0.85_0.18_160_/_0.15)]">
          <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
          AI-Powered Education Platform
        </motion.div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight leading-[0.9] mb-6">
          {headline.split(" ").map((word, i) => (
            <motion.span key={i} variants={wordItem(i)} className="inline-block mr-[0.1em]">
              {word === "×" ? (
                <span className="text-neon mx-2 [text-shadow:0_0_20px_oklch(0.85_0.18_160_/_0.5)]">×</span>
              ) : (
                <span className="bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">{word}</span>
              )}
            </motion.span>
          ))}
        </h1>

        <motion.p variants={item} className="mt-4 text-base sm:text-lg text-fg-muted max-w-2xl mx-auto leading-relaxed">
          AI-powered platform for next-generation learning. Generate exams, tutor with AI,
          and track progress in real-time. One platform for the entire school ecosystem.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <MagneticBtn>
            <a href="/auth/register" className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-black bg-neon rounded-xl hover:bg-neon/90 transition-all shadow-[0_0_30px_oklch(0.85_0.18_160_/_0.4)] hover:shadow-[0_0_50px_oklch(0.85_0.18_160_/_0.6)]">
              Start for Free <ArrowRight className="w-4 h-4" />
            </a>
          </MagneticBtn>
          <MagneticBtn>
            <a href="#features" className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium text-white/70 hover:text-white border border-white/[0.08] rounded-xl hover:bg-white/[0.04] transition-all">
              View Features
            </a>
          </MagneticBtn>
        </motion.div>

        <motion.div variants={item} className="mt-16 flex items-center justify-center gap-8 sm:gap-16">
          {metrics.map((m) => (
            <div key={m.label} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <m.icon className="w-4 h-4 text-neon/60" />
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  <CountUp end={m.value} suffix={m.suffix} prefix={m.prefix || ""} decimals={(m as any).decimals || 0} />
                </div>
              </div>
              <div className="text-xs text-fg-muted">{m.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div variants={item} className="mt-20 max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/50 group">
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent z-10" />
            <div className="aspect-video bg-gradient-to-br from-bg-alt to-bg flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.85_0.18_160_/_0.06),_transparent_60%)]" />
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon/20 bg-neon/5 text-xs text-neon mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
                  Dashboard Preview
                </div>
                <div className="grid grid-cols-4 gap-2 max-w-lg mx-auto opacity-60">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`rounded-lg bg-white/[0.04] border border-white/[0.06] p-3 ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                      <div className="w-full h-4 rounded bg-white/[0.06] mb-2" />
                      <div className="w-2/3 h-3 rounded bg-white/[0.04]" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-fg-muted mt-4">Interactive dashboard with AI insights, exam tracking, and real-time analytics</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent z-10 pointer-events-none" />
    </section>
  );
}
