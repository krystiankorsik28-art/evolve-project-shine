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
    <section id="pricing" className="relative py-24 sm:py-32 border-t border-white/[0.04] overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, oklch(0.7 0.15 200 / 0.05) 0%, transparent 70%)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Simple,{" "}
            <span style={{
              background: "linear-gradient(135deg, oklch(0.75 0.15 200), oklch(0.6 0.2 240))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Transparent Pricing
            </span>
          </h2>
          <p className="mt-3 text-sm" style={{ color: "oklch(1 0 0 / 0.4)" }}>Start free. Upgrade when you need more power.</p>

          <div className="mt-6 inline-flex items-center p-0.5 rounded-xl"
            style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.06)" }}>
            <button
              onClick={() => setYearly(false)}
              className="relative px-4 py-1.5 text-sm rounded-lg transition-all duration-300"
              style={{
                color: !yearly ? "#fff" : "oklch(1 0 0 / 0.4)",
              }}
            >
              {!yearly && (
                <motion.span layoutId="toggle-pill" className="absolute inset-0 rounded-lg"
                  style={{ background: "linear-gradient(135deg, oklch(0.7 0.15 200 / 0.2), oklch(0.6 0.2 240 / 0.2))" }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }} />
              )}
              <span className="relative z-10">Monthly</span>
            </button>
            <button
              onClick={() => setYearly(true)}
              className="relative px-4 py-1.5 text-sm rounded-lg transition-all duration-300"
              style={{
                color: yearly ? "#fff" : "oklch(1 0 0 / 0.4)",
              }}
            >
              {yearly && (
                <motion.span layoutId="toggle-pill" className="absolute inset-0 rounded-lg"
                  style={{ background: "linear-gradient(135deg, oklch(0.7 0.15 200 / 0.2), oklch(0.6 0.2 240 / 0.2))" }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }} />
              )}
              <span className="relative z-10">Yearly</span>
              <span className="relative z-10 ml-1 text-xs" style={{ color: "oklch(0.7 0.15 200)" }}>-20%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col rounded-2xl overflow-hidden"
              style={{
                background: plan.popular
                  ? "linear-gradient(135deg, oklch(0.12 0.05 270 / 0.6), oklch(0.08 0.04 260 / 0.8))"
                  : "oklch(0.06 0.03 270 / 0.4)",
                border: plan.popular ? "1px solid oklch(0.7 0.15 200 / 0.25)" : "1px solid oklch(1 0 0 / 0.06)",
                backdropFilter: "blur(16px)",
              }}
            >
              {plan.popular && (
                <>
                  <div className="absolute -inset-[1px] rounded-2xl pointer-events-none z-0"
                    style={{ background: "linear-gradient(135deg, oklch(0.7 0.15 200 / 0.2), transparent 40%, transparent 60%, oklch(0.7 0.15 200 / 0.2))" }} />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full text-xs font-semibold whitespace-nowrap z-10"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.7 0.15 200), oklch(0.6 0.2 240))",
                      color: "#fff",
                      boxShadow: "0 0 20px oklch(0.7 0.15 200 / 0.3)",
                    }}>
                    Most Popular
                  </div>
                </>
              )}

              <div className="p-6 flex flex-col h-full relative z-10">
                <h3 className="text-lg font-semibold text-white/90">{plan.name}</h3>
                <p className="text-xs mt-1" style={{ color: "oklch(1 0 0 / 0.35)" }}>{plan.desc}</p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white tracking-tight">
                    {plan.price.monthly === "Custom" ? "Custom" : plan.price[yearly ? "yearly" : "monthly"]}
                    {plan.price.monthly !== "Custom" && <span className="text-xs font-normal ml-1" style={{ color: "oklch(1 0 0 / 0.3)" }}>zł</span>}
                  </span>
                  {plan.period && <span className="text-xs" style={{ color: "oklch(1 0 0 / 0.3)" }}>{plan.period}</span>}
                </div>

                <ul className="mt-6 space-y-3 flex-1">
                  {plan.lines.map((l) => (
                    <li key={l} className="text-xs flex items-start gap-2.5" style={{ color: "oklch(1 0 0 / 0.55)" }}>
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: plan.popular ? "oklch(0.7 0.15 200 / 0.6)" : "oklch(1 0 0 / 0.2)" }} />
                      {l}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  {plan.price.monthly === "Custom" ? (
                    <a href="#contact"
                      className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
                      style={{ background: "oklch(1 0 0 / 0.04)", color: "oklch(1 0 0 / 0.5)", border: "1px solid oklch(1 0 0 / 0.06)" }}>
                      Contact us <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  ) : plan.price.monthly === "0" ? (
                    <a href="/auth/register"
                      className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300"
                      style={{
                        background: "linear-gradient(135deg, oklch(0.7 0.15 200 / 0.15), oklch(0.6 0.2 240 / 0.15))",
                        color: "oklch(0.8 0.12 200)",
                        border: "1px solid oklch(0.7 0.15 200 / 0.15)",
                      }}>
                      Start free <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <a href="/auth/register"
                      className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300"
                      style={{
                        background: plan.popular ? "linear-gradient(135deg, oklch(0.7 0.15 200), oklch(0.6 0.2 240))" : "oklch(1 0 0 / 0.04)",
                        color: plan.popular ? "#fff" : "oklch(1 0 0 / 0.5)",
                        border: plan.popular ? "none" : "1px solid oklch(1 0 0 / 0.06)",
                        boxShadow: plan.popular ? "0 0 20px oklch(0.7 0.15 200 / 0.2)" : "none",
                      }}>
                      Get started <ArrowRight className="w-3.5 h-3.5" />
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
