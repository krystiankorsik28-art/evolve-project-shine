"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQ = [
  { q: "Do students need to create accounts?", a: "Students can take exams with a PIN code — no account needed. For full features (AI Tutor, certificates, progress tracking), they can create a free account." },
  { q: "Can I import questions from Word or Excel?", a: "Yes. Drag-and-drop .docx, .xlsx, .csv, or .txt files. AI parses and structures them automatically." },
  { q: "How fast can I get started?", a: "Under 5 minutes. Register, create your first class, invite students, and generate an exam — all in one session." },
  { q: "What makes AI cheating detection different?", a: "Our system analyzes typing patterns, eye movement via webcam, screen switching, and audio. Suspicious behavior triggers real-time alerts to the teacher." },
  { q: "Does it work on mobile devices?", a: "Yes. Students can take exams on any device. Teachers have a dedicated mobile dashboard for monitoring." },
  { q: "Can I try before buying?", a: "The free Starter plan is unlimited in time. Upgrade only when you need more students or AI features." },
  { q: "What integrations are supported?", a: "Moodle, Microsoft Teams, Google Classroom, plus REST API and webhooks for custom integrations." },
  { q: "Is my data secure?", a: "Yes. End-to-end encryption, GDPR/RODO compliant, EU-based servers, automated backups, and ISO 27001 aligned security." },
  { q: "Can I use EduNex for multiple schools?", a: "Yes. The School and Enterprise plans support multi-school management with centralized administration." },
  { q: "What payment methods do you accept?", a: "Credit/debit cards via Stripe, bank transfer, and crypto payments via NexaPay. Enterprise billing available." },
  { q: "Do you offer training for teachers?", a: "Yes. All paid plans include onboarding support. Enterprise includes dedicated training sessions for staff." },
  { q: "Can I export my data?", a: "Yes. Export all exam results, student data, and analytics to CSV, Excel, or PDF at any time." },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-24 sm:py-32 border-t border-white/[0.04]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm text-white/40">Everything you need to know about EduNex</p>
        </motion.div>

        <div className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.06]">
          {FAQ.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex items-center justify-between w-full px-5 py-4 text-left text-sm text-white/70 hover:text-white transition-colors"
              >
                <span>{item.q}</span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="shrink-0 ml-4"
                >
                  <ChevronDown className="w-4 h-4 text-white/20" />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-xs text-white/40 leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
