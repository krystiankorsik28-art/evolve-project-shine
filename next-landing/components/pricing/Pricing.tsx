"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { MagneticButton } from "@/components/hero/MagneticButton";

const PLANS = [
  {
    name: "Klasa",
    price: { monthly: "0", yearly: "0" },
    sub: "free forever",
    desc: "Perfect for trying out EduNex with a single class.",
    feat: false,
    lines: [
      "Up to 35 students",
      "Question bank: 300+ items",
      "Basic exam creation",
      "Manual grading",
      "Email support",
      "1 class",
    ],
  },
  {
    name: "Nauczyciel",
    price: { monthly: "99", yearly: "79" },
    sub: "/mo",
    desc: "For individual teachers who want full AI power.",
    feat: true,
    lines: [
      "Up to 60 students",
      "Question bank: 3,000+ items",
      "AI exam generator",
      "AI auto-grading",
      "AI Tutor access",
      "Analytics dashboard",
      "Priority support",
      "Up to 3 classes",
    ],
  },
  {
    name: "Szkoła",
    price: { monthly: "490", yearly: "390" },
    sub: "/mo",
    desc: "Complete solution for schools and institutions.",
    feat: false,
    lines: [
      "Up to 300 students",
      "Unlimited question bank",
      "All AI features",
      "AI proctoring",
      "LMS integration",
      "Custom branding",
      "Dedicated account manager",
      "Unlimited classes",
    ],
  },
  {
    name: "Enterprise",
    price: { monthly: "Custom", yearly: "Custom" },
    sub: "",
    desc: "For districts and large-scale deployments.",
    feat: false,
    lines: [
      "Unlimited users",
      "Everything in Szkoła",
      "Custom AI model training",
      "On-premise deployment option",
      "SSO / SAML",
      "SLA guarantee 99.99%",
      "White-label solution",
      "24/7 premium support",
    ],
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-glass-border bg-glass backdrop-blur-md text-xs text-cyan-400 mb-4">
            <Sparkles className="w-3 h-3" />
            Simple pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-white/40 max-w-md mx-auto">
            Start free, upgrade when you need more power.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 p-1 rounded-xl border border-glass-border bg-glass backdrop-blur-sm">
            <button onClick={() => setYearly(false)} className={`px-4 py-1.5 text-xs rounded-lg transition-all ${!yearly ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}>
              Monthly
            </button>
            <button onClick={() => setYearly(true)} className={`px-4 py-1.5 text-xs rounded-lg transition-all ${yearly ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}>
              Yearly <span className="text-cyan-400 ml-1">-20%</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {PLANS.map((plan) => (
            <motion.div key={plan.name} variants={itemAnim}>
              <GlassPanel
                hover
                className={`p-6 h-full flex flex-col ${plan.feat ? "border-cyan-500/40 relative" : ""}`}
              >
                {plan.feat && (
                  <>
                    <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-cyan-500/20 to-blue-600/20 opacity-50 pointer-events-none" />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-[10px] font-semibold text-white whitespace-nowrap z-10">
                      Most Popular
                    </div>
                  </>
                )}
                <div className="relative z-10 flex flex-col h-full">
                  <div>
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="text-xs text-white/30 mt-1">{plan.desc}</p>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{plan.price.monthly === "Custom" ? "Custom" : plan.price[yearly ? "yearly" : "monthly"]}</span>
                      {plan.sub && <span className="text-xs text-white/30">{plan.sub}</span>}
                    </div>
                  </div>
                  <ul className="mt-6 space-y-2.5 flex-1">
                    {plan.lines.map((l) => (
                      <li key={l} className="text-xs text-white/50 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500/60 mt-0.5 shrink-0" />
                        {l}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    {plan.price.monthly === "Custom" ? (
                      <MagneticButton
                        variant="outline"
                        onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                        className="w-full justify-center"
                      >
                        Contact us <ArrowRight className="w-3.5 h-3.5" />
                      </MagneticButton>
                    ) : plan.price.monthly === "0" ? (
                      <MagneticButton
                        onClick={() => window.location.href = "/auth/teacher"}
                        className="w-full justify-center"
                      >
                        Start free <ArrowRight className="w-3.5 h-3.5" />
                      </MagneticButton>
                    ) : (
                      <MagneticButton
                        variant={plan.feat ? "primary" : "outline"}
                        onClick={() => window.location.href = "/auth/teacher"}
                        className="w-full justify-center"
                      >
                        {plan.feat ? "Get started" : "Contact"} <ArrowRight className="w-3.5 h-3.5" />
                      </MagneticButton>
                    )}
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
