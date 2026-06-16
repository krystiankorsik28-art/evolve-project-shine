"use client";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "EduNex transformed how we prepare students for matura exams. The AI generates realistic practice tests in seconds.",
    author: "Katarzyna Mazurek",
    role: "Mathematics · XIV LO Warszawa",
  },
  {
    quote: "Teachers saved an average of 12 hours per week on grading. The proctoring system gave us confidence in remote testing.",
    author: "Paweł Górski",
    role: "Vice Principal · III LO Gdynia",
  },
  {
    quote: "From 0 to 1,200 active students in three months. The onboarding was seamless and the pricing is unmatched.",
    author: "Tomasz Wróblewski",
    role: "Principal · ZSE Poznań",
  },
];

const partners = ["Microsoft", "Google", "Moodle", "Teams", "Office 365", "Azure"];

export function SocialProof() {
  return (
    <section className="relative py-24 sm:py-32 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Trusted by Educators Nationwide
          </h2>
          <p className="mt-3 text-sm text-white/40">Join hundreds of schools already using EduNex</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl border border-white/[0.06] bg-white/[0.02]"
            >
              <Quote className="w-6 h-6 text-cyan-500/20 mb-4" />
              <p className="text-sm text-white/60 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="text-sm font-medium text-white/80">{t.author}</p>
                <p className="text-xs text-white/30 mt-0.5">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-xs text-white/20 uppercase tracking-wider mb-6">Integrated with</p>
          <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
            {partners.map((p) => (
              <span key={p} className="text-sm text-white/20 font-medium tracking-tight">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
