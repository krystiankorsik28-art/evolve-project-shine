"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

const FAQ = [
  { q: "Do students need to create accounts?", a: "Yes, each student needs a lightweight account (email + name). They can join your class with a unique code — no payment info needed." },
  { q: "Can I import questions from Word/Excel?", a: "Absolutely. Drag-and-drop .docx, .xlsx, .csv, or .txt files. The AI will parse and structure them automatically." },
  { q: "How fast can I get started?", a: "Under 5 minutes. Register, create your first class, invite students, and generate an exam — all in a single session." },
  { q: "How does AI cheating detection work?", a: "Our system analyzes typing patterns, eye movement (via webcam), screen switching, and audio anomalies. Suspicious behavior triggers real-time alerts." },
  { q: "Does it work on mobile?", a: "Fully responsive. Students can take exams on any device. Teachers have a dedicated mobile dashboard for monitoring." },
  { q: "Can I try before buying?", a: "The free Klasa plan is unlimited in time. Upgrade only when you need more students or AI features." },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-glass-border bg-glass backdrop-blur-md text-xs text-cyan-400 mb-4">
            <Sparkles className="w-3 h-3" />
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <GlassPanel className="p-2">
          {FAQ.map((item, i) => (
            <div key={i} className="border-b border-glass-border last:border-0">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex items-center justify-between w-full px-4 py-4 text-left text-sm text-white/70 hover:text-white transition-colors"
              >
                <span>{item.q}</span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-4 h-4 text-white/30" />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-xs text-white/40 leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </GlassPanel>
      </div>
    </section>
  );
}
