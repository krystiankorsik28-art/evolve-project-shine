"use client";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Users, Zap, TrendingUp, Award, Smartphone } from "lucide-react";

const USE_CASES = [
  {
    icon: BookOpen,
    title: "Individual Teachers",
    description: "Teach smarter, not harder. Generate personalized exams and get AI-powered grading.",
    benefits: ["Save 10+ hours/week", "Better student engagement", "24/7 AI tutor for students"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    title: "Schools & Districts",
    description: "Scale excellence across your institution. Unified dashboards, LMS integration, custom branding.",
    benefits: ["Unified platform for all", "Advanced analytics & insights", "Dedicated account manager"],
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Online Education Platforms",
    description: "Integrate AI tutoring into your platform. White-label solution with full customization.",
    benefits: ["White-label ready", "Custom AI training", "API access for integration"],
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: TrendingUp,
    title: "Tutoring Centers",
    description: "Enhance your services with AI. Manage multiple locations, track progress in real-time.",
    benefits: ["Multi-location support", "Student progress tracking", "Automated reporting"],
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Award,
    title: "Test Preparation",
    description: "Help students ace their exams. AI generates practice tests and targeted tutoring.",
    benefits: ["AI practice tests", "Personalized study plans", "Performance analytics"],
    color: "from-red-500 to-rose-500",
  },
  {
    icon: Smartphone,
    title: "Homeschooling Families",
    description: "Complete educational solution for home. AI Tutor adapts to your child's pace.",
    benefits: ["Affordable for families", "Flexible scheduling", "Progress tracking"],
    color: "from-indigo-500 to-blue-500",
  },
];

const IMPACT_METRICS = [
  { metric: "30%", description: "Average improvement in test scores" },
  { metric: "80%", description: "Students prefer AI tutoring" },
  { metric: "15h/week", description: "Time saved for teachers" },
  { metric: "95%", description: "Student satisfaction rate" },
];

export function UseCasesSection() {
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
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Built for Every Educator</h2>
          <p className="mt-3 text-sm text-white/40">Whether you're a solo teacher or leading a district, EduNex adapts to your needs</p>
        </motion.div>

        {/* Use Cases Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {USE_CASES.map((useCase, i) => {
            const Icon = useCase.icon;
            return (
              <motion.div
                key={useCase.title}
                variants={item}
                className="group p-6 rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent hover:border-white/[0.12] transition-all duration-300"
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${useCase.color} p-2.5 mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-full h-full text-white" />
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-semibold text-white mb-2">{useCase.title}</h3>
                <p className="text-sm text-white/50 mb-4">{useCase.description}</p>

                {/* Benefits */}
                <ul className="space-y-2">
                  {useCase.benefits.map((benefit) => (
                    <li key={benefit} className="text-xs text-white/40 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <a
                    href="/auth/register"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Learn more <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Impact Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent p-8 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.05] via-transparent to-blue-500/[0.05]" />
          <div className="relative">
            <h3 className="text-2xl font-bold mb-8 text-center">Proven Impact</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {IMPACT_METRICS.map((item, i) => (
                <motion.div
                  key={item.metric}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                    {item.metric}
                  </div>
                  <div className="text-sm text-white/60">{item.description}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
