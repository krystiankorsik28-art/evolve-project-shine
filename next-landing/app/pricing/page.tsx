"use client";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { NavBar } from "@/components/sections/NavBar";
import { Footer } from "@/components/sections/Footer";
import { Pricing } from "@/components/sections/Pricing";

export default function PricingPage() {
  return (
    <main className="bg-[#0a0a12] min-h-screen">
      <NavBar />
      <div className="pt-28 sm:pt-36">
        <Pricing />
        <section className="py-24 border-t border-white/[0.04]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-12">Compare Plans</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="py-3 pr-4 text-xs text-white/30 font-medium">Feature</th>
                    <th className="py-3 px-4 text-xs text-white/30 font-medium">Starter</th>
                    <th className="py-3 px-4 text-xs text-cyan-400 font-medium">Teacher Pro</th>
                    <th className="py-3 px-4 text-xs text-white/30 font-medium">School</th>
                    <th className="py-3 pl-4 text-xs text-white/30 font-medium">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {[
                    ["Students", "35", "60", "300", "Unlimited"],
                    ["Question bank", "300+", "3,000+", "Unlimited", "Unlimited"],
                    ["AI exam generator", "—", "✓", "✓", "✓"],
                    ["AI auto-grading", "—", "✓", "✓", "✓"],
                    ["AI Tutor", "—", "✓", "✓", "✓"],
                    ["AI proctoring", "—", "—", "✓", "✓"],
                    ["LMS integration", "—", "—", "✓", "✓"],
                    ["Custom branding", "—", "—", "✓", "✓"],
                    ["SSO / SAML", "—", "—", "—", "✓"],
                    ["On-premise option", "—", "—", "—", "✓"],
                    ["SLA", "—", "Standard", "Standard", "99.99%"],
                    ["Support", "Email", "Priority", "Dedicated", "24/7 Premium"],
                  ].map(([feature, ...vals]) => (
                    <tr key={feature}>
                      <td className="py-3 pr-4 text-xs text-white/60">{feature}</td>
                      {vals.map((v, i) => (
                        <td key={i} className={`py-3 px-4 text-xs ${v === "✓" ? "text-cyan-400" : v === "—" ? "text-white/20" : "text-white/40"}`}>
                          {v === "✓" ? <CheckCircle2 className="w-3.5 h-3.5" /> : v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
