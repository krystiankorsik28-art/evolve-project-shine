"use client";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { HeroTitle } from "./HeroTitle";
import { MagneticButton } from "./MagneticButton";
import { SocialProofIcons } from "./SocialProofIcons";
import { Scene3D } from "@/components/ui/ThreeProvider";
import { GradientOrb } from "@/components/ui/GradientOrb";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Scene3D />
      <GradientOrb className="!opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-glass-border bg-glass backdrop-blur-md text-xs text-cyan-400 mb-8"
        >
          <Sparkles className="w-3 h-3" />
          AI-powered education platform
        </motion.div>

        <HeroTitle />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-6 text-base sm:text-lg text-white/40 max-w-xl mx-auto leading-relaxed"
        >
          Generate exams, tutor students with AI, track progress in real-time.
          One platform for the entire school ecosystem.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-8 flex items-center justify-center gap-4 flex-wrap"
        >
          <MagneticButton onClick={() => window.location.href = "/auth/teacher"}>
            Start for free <ArrowRight className="w-4 h-4" />
          </MagneticButton>
          <MagneticButton variant="outline" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
            Explore features
          </MagneticButton>
        </motion.div>

        <div className="mt-12">
          <SocialProofIcons />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
