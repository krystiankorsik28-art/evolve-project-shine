"use client";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "EduNex transformed how we prepare students for matura exams. The AI generates realistic practice tests in seconds.",
    author: "Katarzyna Mazurek",
    role: "Mathematics · XIV LO Warszawa",
    gradient: "oklch(0.7 0.15 200)",
  },
  {
    quote: "Teachers saved an average of 12 hours per week on grading. The proctoring system gave us confidence in remote testing.",
    author: "Paweł Górski",
    role: "Vice Principal · III LO Gdynia",
    gradient: "oklch(0.65 0.2 240)",
  },
  {
    quote: "From 0 to 1,200 active students in three months. The onboarding was seamless and the pricing is unmatched.",
    author: "Tomasz Wróblewski",
    role: "Principal · ZSE Poznań",
    gradient: "oklch(0.6 0.2 280)",
  },
];

const partners = ["Microsoft", "Google", "Moodle", "Teams", "Office 365", "Azure"];

export function SocialProof() {
  return (
    <section className="relative py-24 sm:py-32 border-t border-white/[0.04] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Trusted by{" "}
            <span style={{
              background: "linear-gradient(135deg, oklch(0.75 0.15 200), oklch(0.6 0.2 240))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Educators Nationwide
            </span>
          </h2>
          <p className="mt-3 text-sm" style={{ color: "oklch(1 0 0 / 0.4)" }}>Join hundreds of schools already using EduNex</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative group p-6 rounded-2xl transition-all duration-500"
              style={{
                background: "linear-gradient(180deg, oklch(0.08 0.03 270 / 0.5), oklch(0.04 0.02 270 / 0.3))",
                border: "1px solid oklch(1 0 0 / 0.06)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${t.gradient.replace(")", "/ 0.06)")}, transparent 70%)` }} />

              <div className="relative z-10">
                <Quote className="w-6 h-6 mb-4" style={{ color: `${t.gradient.replace(")", "/ 0.2)")}` }} />
                <p className="text-sm leading-relaxed" style={{ color: "oklch(1 0 0 / 0.6)" }}>&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid oklch(1 0 0 / 0.06)" }}>
                  <p className="text-sm font-medium text-white/80">{t.author}</p>
                  <p className="text-xs mt-0.5" style={{ color: t.gradient }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-xs tracking-wider mb-6 uppercase" style={{ color: "oklch(1 0 0 / 0.2)" }}>Integrated with</p>
          <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
            {partners.map((p) => (
              <span key={p} className="text-sm font-medium tracking-tight" style={{ color: "oklch(1 0 0 / 0.2)" }}>{p}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
