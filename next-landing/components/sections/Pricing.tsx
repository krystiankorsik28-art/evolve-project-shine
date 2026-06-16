"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    price: { monthly: "0", yearly: "0" },
    period: "free forever",
    desc: "Perfect for trying EduNex with a single class.",
    lines: ["Up to 35 students", "Basic exam creation", "300+ question bank", "Manual grading", "1 class"],
  },
  {
    name: "Teacher Pro",
    price: { monthly: "99", yearly: "79" },
    period: "/month",
    desc: "For individual teachers who want full AI power.",
    popular: true,
    lines: ["Up to 60 students", "AI exam generator", "AI auto-grading", "AI Tutor access", "3,000+ question bank", "Analytics dashboard", "Up to 3 classes", "Priority support"],
  },
  {
    name: "School",
    price: { monthly: "490", yearly: "390" },
    period: "/month",
    desc: "Complete solution for schools and institutions.",
    lines: ["Up to 300 students", "All AI features", "AI proctoring", "LMS integration", "Unlimited question bank", "Custom branding", "Unlimited classes", "Dedicated manager"],
  },
  {
    name: "Enterprise",
    price: { monthly: "Custom", yearly: "Custom" },
    period: "",
    desc: "For districts and large-scale deployments.",
    lines: ["Unlimited users", "On-premise option", "Custom AI training", "SSO / SAML", "99.99% SLA", "White-label", "24/7 premium support"],
  },
];

export function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="relative py-24 sm:py-32 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
          <p className="mt-3 text-sm text-white/40">Start free. Upgrade when you need more power.</p>
          <div className="mt-6 inline-flex items-center gap-1 p-1 rounded-lg border border-white/[0.06] bg-white/[0.02]">
            <button
              onClick={() => setYearly(false)}
              className={`px-3.5 py-1.5 text-xs rounded-md transition-all ${!yearly ? "bg-white text-[#0a0a12]" : "text-white/40 hover:text-white/60"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-3.5 py-1.5 text-xs rounded-md transition-all ${yearly ? "bg-white text-[#0a0a12]" : "text-white/40 hover:text-white/60"}`}
            >
              Yearly <span className="text-cyan-400 ml-1">-20%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={`relative flex flex-col p-6 rounded-xl border ${
                plan.popular
                  ? "border-cyan-500/40 bg-gradient-to-b from-cyan-500/[0.04] to-transparent"
                  : "border-white/[0.06] bg-white/[0.02]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-[10px] font-semibold text-white whitespace-nowrap">
                  Most Popular
                </div>
              )}
              <div className="flex flex-col h-full">
                <div>
                  <h3 className="text-base font-semibold text-white/90">{plan.name}</h3>
                  <p className="text-xs text-white/30 mt-1">{plan.desc}</p>
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    {plan.price.monthly === "Custom" ? "Custom" : plan.price[yearly ? "yearly" : "monthly"]}
                  </span>
                  {plan.period && <span className="text-xs text-white/30">{plan.period}</span>}
                </div>
                <ul className="mt-6 space-y-2.5 flex-1">
                  {plan.lines.map((l) => (
                    <li key={l} className="text-xs text-white/50 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500/40 mt-0.5 shrink-0" />
                      {l}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  {plan.price.monthly === "Custom" ? (
                    <a href="#contact" className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 text-xs font-medium rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.04] transition-all">
                      Contact us <ArrowRight className="w-3 h-3" />
                    </a>
                  ) : plan.price.monthly === "0" ? (
                    <a href="/auth/register" className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 text-xs font-medium rounded-lg bg-white text-[#0a0a12] hover:bg-white/90 transition-all">
                      Start free <ArrowRight className="w-3 h-3" />
                    </a>
                  ) : (
                    <a
                      href="/auth/register"
                      className={`flex items-center justify-center gap-1.5 w-full px-4 py-2.5 text-xs font-medium rounded-lg transition-all ${
                        plan.popular
                          ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/20"
                          : "border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      {plan.popular ? "Get started" : "Contact"} <ArrowRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
