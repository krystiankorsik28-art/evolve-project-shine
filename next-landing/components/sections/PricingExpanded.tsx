"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, X } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    price: { monthly: "0", yearly: "0" },
    period: "free forever",
    desc: "Perfect for trying EduNex with a single class.",
    cta: "Start free",
    popular: false,
    lines: ["Up to 35 students", "Basic exam creation", "300+ question bank", "Manual grading", "1 class"],
  },
  {
    name: "Teacher Pro",
    price: { monthly: "99", yearly: "79" },
    period: "/month",
    desc: "For individual teachers who want full AI power.",
    cta: "Get started",
    popular: true,
    lines: ["Up to 60 students", "AI exam generator", "AI auto-grading", "AI Tutor access", "3,000+ question bank", "Analytics dashboard", "Up to 3 classes", "Priority support"],
  },
  {
    name: "School",
    price: { monthly: "490", yearly: "390" },
    period: "/month",
    desc: "Complete solution for schools and institutions.",
    cta: "Contact sales",
    popular: false,
    lines: ["Up to 300 students", "All AI features", "AI proctoring", "LMS integration", "Unlimited question bank", "Custom branding", "Unlimited classes", "Dedicated manager"],
  },
  {
    name: "Enterprise",
    price: { monthly: "Custom", yearly: "Custom" },
    period: "",
    desc: "For districts and large-scale deployments.",
    cta: "Talk to us",
    popular: false,
    lines: ["Unlimited users", "On-premise option", "Custom AI training", "SSO / SAML", "99.99% SLA", "White-label", "24/7 premium support"],
  },
];

const FEATURE_COMPARISON = [
  { category: "Core Features", features: [
    { name: "Students per plan", starter: "35", pro: "60", school: "300", enterprise: "Unlimited" },
    { name: "Classes", starter: "1", pro: "3", school: "Unlimited", enterprise: "Unlimited" },
    { name: "Question bank", starter: "300+", pro: "3,000+", school: "Unlimited", enterprise: "Unlimited" },
  ]},
  { category: "AI Features", features: [
    { name: "Exam generation", starter: "Manual", pro: "✓ AI-powered", school: "✓ Advanced", enterprise: "✓ Custom" },
    { name: "Auto grading", starter: false, pro: true, school: true, enterprise: true },
    { name: "AI Tutor", starter: false, pro: true, school: true, enterprise: true },
    { name: "Proctoring", starter: false, pro: false, school: true, enterprise: true },
    { name: "Personalization", starter: false, pro: "Basic", school: "Advanced", enterprise: "Custom" },
  ]},
  { category: "Analytics & Insights", features: [
    { name: "Basic analytics", starter: true, pro: true, school: true, enterprise: true },
    { name: "Advanced dashboard", starter: false, pro: true, school: true, enterprise: true },
    { name: "AI insights", starter: false, pro: true, school: true, enterprise: true },
    { name: "Custom reports", starter: false, pro: false, school: true, enterprise: true },
  ]},
  { category: "Support & Integration", features: [
    { name: "Email support", starter: true, pro: true, school: true, enterprise: true },
    { name: "Priority support", starter: false, pro: true, school: true, enterprise: true },
    { name: "24/7 support", starter: false, pro: false, school: "Business hours", enterprise: true },
    { name: "LMS integration", starter: false, pro: false, school: true, enterprise: true },
    { name: "SSO / SAML", starter: false, pro: false, school: false, enterprise: true },
    { name: "Custom branding", starter: false, pro: false, school: true, enterprise: true },
  ]},
];

export function PricingExpanded() {
  const [yearly, setYearly] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  return (
    <section id="pricing" className="relative py-24 sm:py-32 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
          <p className="mt-3 text-sm text-white/40">Start free. Upgrade when you need more power. Cancel anytime.</p>
          
          {/* Toggle */}
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
              Yearly <span className="text-cyan-400 ml-1 font-semibold">Save 20%</span>
            </button>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={`relative flex flex-col p-6 rounded-xl border ${
                plan.popular
                  ? "border-cyan-500/40 bg-gradient-to-b from-cyan-500/[0.04] to-transparent ring-2 ring-cyan-500/20"
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
                  <a
                    href={plan.price.monthly === "Custom" ? "#contact" : "/auth/register"}
                    className={`flex items-center justify-center gap-1.5 w-full px-4 py-2.5 text-xs font-medium rounded-lg transition-all ${
                      plan.popular
                        ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/20"
                        : plan.price.monthly === "0"
                          ? "bg-white text-[#0a0a12] hover:bg-white/90"
                          : "border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {plan.cta} <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Toggle */}
        <div className="text-center mb-12">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] text-sm text-white/60 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            {showComparison ? "Hide" : "Show"} detailed comparison
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Detailed Comparison Table */}
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 mb-12"
          >
            {FEATURE_COMPARISON.map((section, idx) => (
              <motion.div
                key={section.category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.02]"
              >
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-6 py-3 border-b border-white/[0.06]">
                  <h4 className="text-sm font-semibold text-white">{section.category}</h4>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {section.features.map((feature, fidx) => (
                        <tr key={feature.name} className={fidx !== section.features.length - 1 ? "border-b border-white/[0.03]" : ""}>
                          <td className="px-6 py-4 text-sm text-white/60 w-1/4">{feature.name}</td>
                          <td className="px-6 py-4 text-sm text-center">
                            {typeof feature.starter === "boolean" ? (
                              feature.starter ? (
                                <CheckCircle2 className="w-4 h-4 text-cyan-500 mx-auto" />
                              ) : (
                                <X className="w-4 h-4 text-white/20 mx-auto" />
                              )
                            ) : (
                              <span className="text-white/70">{feature.starter}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-center font-medium bg-white/[0.02]">
                            {typeof feature.pro === "boolean" ? (
                              feature.pro ? (
                                <CheckCircle2 className="w-4 h-4 text-cyan-400 mx-auto" />
                              ) : (
                                <X className="w-4 h-4 text-white/20 mx-auto" />
                              )
                            ) : (
                              <span className="text-white">{feature.pro}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-center">
                            {typeof feature.school === "boolean" ? (
                              feature.school ? (
                                <CheckCircle2 className="w-4 h-4 text-cyan-500 mx-auto" />
                              ) : (
                                <X className="w-4 h-4 text-white/20 mx-auto" />
                              )
                            ) : (
                              <span className="text-white/70">{feature.school}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-center">
                            {typeof feature.enterprise === "boolean" ? (
                              feature.enterprise ? (
                                <CheckCircle2 className="w-4 h-4 text-cyan-500 mx-auto" />
                              ) : (
                                <X className="w-4 h-4 text-white/20 mx-auto" />
                              )
                            ) : (
                              <span className="text-white/70">{feature.enterprise}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}

            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 mt-6 pt-6 border-t border-white/[0.06]">
              <div className="text-xs font-semibold text-white/60">Feature</div>
              <div className="text-xs font-semibold text-white/60 text-center">Starter</div>
              <div className="text-xs font-semibold text-cyan-400 text-center">Teacher Pro</div>
              <div className="text-xs font-semibold text-white/60 text-center">School</div>
              <div className="text-xs font-semibold text-white/60 text-center">Enterprise</div>
            </div>
          </motion.div>
        )}

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-t border-white/[0.06] pt-12"
        >
          <h3 className="text-2xl font-bold mb-8 text-center">Pricing FAQ</h3>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {[
              {
                q: "Czy mogę anulować subskrypcję w dowolnym momencie?",
                a: "Tak! Możesz anulować swoją subskrypcję w każdej chwili bez żadnych kar lub opłat za rozwiązanie umowy.",
              },
              {
                q: "Czy mogę zmienić plan w trakcie roku?",
                a: "Oczywiście. Możesz zmienić plan w dowolnym momencie. Różnica będzie przeliczona proporcjonalnie.",
              },
              {
                q: "Jakie metody płatności są akceptowane?",
                a: "Akceptujemy karty kredytowe, przelewy bankowe, PayPal i dla Enterprise - umowy roczne.",
              },
              {
                q: "Czy jest dostępny trial na płatne plany?",
                a: "Tak, zacznij od planu Starter za darmo i uaktualnij się kiedy będziesz gotowy. Brak wymaganych danych karty.",
              },
            ].map((faq, i) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02]"
              >
                <h4 className="font-semibold text-white text-sm mb-2">{faq.q}</h4>
                <p className="text-xs text-white/50">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
