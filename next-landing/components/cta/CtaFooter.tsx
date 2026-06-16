"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, ArrowUp, Sparkles, Github, MessageSquare, Mail, Phone } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { MagneticButton } from "@/components/hero/MagneticButton";

export function CtaFooter() {
  const footerRef = useRef<HTMLDivElement>(null);
  const ctaInView = useInView(footerRef, { once: true, margin: "-100px" });

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <section id="contact" className="relative py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-glass-border bg-glass backdrop-blur-md text-xs text-cyan-400 mb-4">
              <Sparkles className="w-3 h-3" />
              Get started today
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Ready to Transform Your School?
            </h2>
            <p className="mt-4 text-white/40 max-w-lg mx-auto">
              Join 36,000+ students and 800+ teachers already using EduNex. Start free, no credit card required.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
              <MagneticButton onClick={() => window.location.href = "/auth/teacher"}>
                Start free <ArrowRight className="w-4 h-4" />
              </MagneticButton>
              <MagneticButton variant="outline" onClick={() => window.location.href = "mailto:kontakt@edunex.pl"}>
                <Mail className="w-4 h-4" /> Contact sales
              </MagneticButton>
            </div>
            <p className="mt-4 text-xs text-white/20">Free plan includes full features for one class. No time limit.</p>
          </motion.div>
        </div>
      </section>

      <footer ref={footerRef} className="relative border-t border-glass-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="col-span-2 md:col-span-1 lg:col-span-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold">EduNex</span>
              </div>
              <p className="mt-4 text-xs text-white/30 leading-relaxed max-w-xs">
                The AI-powered education platform for the next generation. Generate exams, tutor with AI, and track progress in real-time.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <a href="#" className="p-2 rounded-lg border border-glass-border bg-glass hover:border-white/20 transition-colors">
                  <Github className="w-4 h-4 text-white/40" />
                </a>
                <a href="#" className="p-2 rounded-lg border border-glass-border bg-glass hover:border-white/20 transition-colors">
                  <MessageSquare className="w-4 h-4 text-white/40" />
                </a>
              </div>
            </motion.div>

            {[
              { title: "Platform", links: [{ label: "Features", href: "#features" }, { label: "AI Demo", href: "#ai-demo" }, { label: "Pricing", href: "#pricing" }, { label: "FAQ", href: "#faq" }] },
              { title: "For Users", links: [{ label: "Students", href: "/auth/student" }, { label: "Teachers", href: "/auth/teacher" }, { label: "Schools", href: "#pricing" }, { label: "Administrators", href: "#pricing" }] },
              { title: "Legal", links: [{ label: "Terms of Service", href: "#" }, { label: "Privacy Policy", href: "#" }, { label: "GDPR Compliance", href: "#" }, { label: "Cookie Policy", href: "#" }] },
            ].map((col) => (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 20 }}
                animate={ctaInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-xs text-white/30">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  kontakt@edunex.pl
                </li>
                <li className="flex items-center gap-2 text-xs text-white/30">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  +48 22 100 12 34
                </li>
              </ul>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400/60">All systems operational</span>
              </div>
            </motion.div>
          </div>

          <div className="mt-12 pt-6 border-t border-glass-border flex items-center justify-between">
            <p className="text-[10px] text-white/20">&copy; {new Date().getFullYear()} EduNex. All rights reserved.</p>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl border border-glass-border bg-glass backdrop-blur-sm hover:border-white/20 transition-colors"
            >
              <ArrowUp className="w-4 h-4 text-white/40" />
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
