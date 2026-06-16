"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

const TESTIMONIALS = [
  {
    n: "Katarzyna Mazurek",
    r: "Matematyka · XIV LO Warszawa",
    t: "EduNex completely transformed how I prepare my students for matura exams. The AI generates realistic practice tests in seconds, and the analytics show exactly where each student struggles.",
  },
  {
    n: "Paweł Górski",
    r: "Wicedyrektor · III LO Gdynia",
    t: "We deployed EduNex across our entire school. The proctoring system gave us confidence in remote testing, and teachers saved an average of 12 hours per week on grading.",
  },
  {
    n: "Magdalena Adamczyk",
    r: "Polonistka · V LO Kraków",
    t: "The AI grading for essays is remarkably accurate. It doesn't just check grammar — it evaluates argument structure, creativity, and adherence to the prompt.",
  },
  {
    n: "Tomasz Wróblewski",
    r: "Dyrektor · ZSE Poznań",
    t: "From 0 to 1,200 active students in three months. The onboarding was seamless, the support team is responsive, and the pricing is unmatched for what you get.",
  },
];

export function Testimonials() {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => { setDir(1); setIdx((i) => (i + 1) % TESTIMONIALS.length); }, 5000);
    return () => clearInterval(iv);
  }, []);

  const prev = () => { setDir(-1); setIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length); };
  const next = () => { setDir(1); setIdx((i) => (i + 1) % TESTIMONIALS.length); };

  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Trusted by Educators
          </h2>
          <p className="mt-4 text-white/40 max-w-md mx-auto">
            Join hundreds of schools already using EduNex.
          </p>
        </motion.div>

        <div className="relative">
          <GlassPanel className="p-8 sm:p-12 text-center">
            <Quote className="w-8 h-8 text-cyan-500/30 mx-auto mb-6" />
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={idx}
                custom={dir}
                initial={{ opacity: 0, x: dir > 0 ? 60 : -60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir > 0 ? -60 : 60 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-base sm:text-lg text-white/70 leading-relaxed italic">
                  &ldquo;{TESTIMONIALS[idx].t}&rdquo;
                </p>
                <div className="mt-6">
                  <p className="text-sm font-semibold text-white">{TESTIMONIALS[idx].n}</p>
                  <p className="text-xs text-white/30 mt-1">{TESTIMONIALS[idx].r}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </GlassPanel>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={prev} className="p-2 rounded-xl border border-glass-border bg-glass backdrop-blur-sm hover:border-white/20 transition-colors">
              <ChevronLeft className="w-4 h-4 text-white/40" />
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => { setDir(i > idx ? 1 : -1); setIdx(i); }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i === idx ? "bg-cyan-500 w-6" : "bg-white/10 hover:bg-white/20"}`}
                />
              ))}
            </div>
            <button onClick={next} className="p-2 rounded-xl border border-glass-border bg-glass backdrop-blur-sm hover:border-white/20 transition-colors">
              <ChevronRight className="w-4 h-4 text-white/40" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
