"use client";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";

export function FinalCTA() {
  return (
    <section id="contact" className="relative py-24 sm:py-32 border-t border-white/[0.04]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.82_0.12_200_/_0.04),_transparent_60%)] pointer-events-none" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Ready to Transform Your School?
          </h2>
          <p className="mt-4 text-sm text-white/40 max-w-lg mx-auto">
            Join 36,000+ students and 800+ teachers already using EduNex.
            Start free — no credit card required, no time limit.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <a
              href="/auth/register"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium bg-white text-[#0a0a12] rounded-lg hover:bg-white/90 transition-all hover:shadow-lg hover:shadow-white/10"
            >
              Start free <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="mailto:kontakt@edunex.pl"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm text-white/60 hover:text-white border border-white/[0.08] rounded-lg hover:bg-white/[0.04] transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              Contact sales
            </a>
          </div>
          <p className="mt-4 text-xs text-white/20">Free plan includes full features for one class. Upgrade anytime.</p>
        </motion.div>
      </div>
    </section>
  );
}
