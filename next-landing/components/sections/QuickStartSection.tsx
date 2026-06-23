"use client";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Zap, Users, BarChart3, Rocket } from "lucide-react";

const QUICK_START_STEPS = [
  {
    step: 1,
    icon: Users,
    title: "Create Your Account",
    description: "Sign up in 2 minutes. No credit card required for the free plan.",
    action: "Sign Up Free",
  },
  {
    step: 2,
    icon: Zap,
    title: "Setup Your Class",
    description: "Add your students and invite them to join your class instantly.",
    action: "Create Class",
  },
  {
    step: 3,
    icon: BarChart3,
    title: "Generate AI Exams",
    description: "Use our AI to generate personalized exams in seconds, not hours.",
    action: "Generate Exam",
  },
  {
    step: 4,
    icon: Rocket,
    title: "Watch Results Improve",
    description: "Track progress with advanced analytics and adaptive learning insights.",
    action: "View Analytics",
  },
];

const QUICK_FEATURES = [
  { icon: "⚡", title: "Instant Exam Generation", desc: "Create complete exams in minutes" },
  { icon: "🤖", title: "24/7 AI Tutor", desc: "Available for students anytime" },
  { icon: "📊", title: "Smart Analytics", desc: "Real-time insights into performance" },
  { icon: "🔐", title: "Enterprise Security", desc: "Bank-grade encryption for all data" },
  { icon: "🔗", title: "Easy Integration", desc: "Works with your existing tools" },
  { icon: "🌍", title: "Multi-language", desc: "Support for global classrooms" },
];

export function QuickStartSection() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative py-24 sm:py-32 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Get Started in 4 Steps</h2>
          <p className="mt-3 text-sm text-white/40">From signup to transforming your classroom in under an hour</p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="space-y-4 mb-16"
        >
          {QUICK_START_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div key={step.step} variants={item} className="relative">
                {/* Connection Line */}
                {i !== QUICK_START_STEPS.length - 1 && (
                  <div className="absolute left-6 top-20 w-0.5 h-12 bg-gradient-to-b from-cyan-500/50 to-transparent" />
                )}

                <div className="flex gap-4">
                  {/* Step Circle */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                      {step.step}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1 pb-4 px-4 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                        <p className="text-sm text-white/50">{step.description}</p>
                      </div>
                      <a
                        href="/auth/register"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.04] transition-all whitespace-nowrap"
                      >
                        {step.action} <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent p-8 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.05] via-transparent to-blue-500/[0.05]" />
          <div className="relative">
            <h3 className="text-2xl font-bold mb-8 text-center">Packed with Powerful Features</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {QUICK_FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] transition-colors"
                >
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <h4 className="font-semibold text-white text-sm mb-1">{feature.title}</h4>
                  <p className="text-xs text-white/50">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-block p-8 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/[0.04] to-transparent backdrop-blur-sm">
            <div className="mb-6">
              <CheckCircle2 className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Ready to Transform Your Classroom?</h3>
              <p className="text-sm text-white/60">Join thousands of educators already using EduNex</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
              >
                Start for Free <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                View Pricing
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
