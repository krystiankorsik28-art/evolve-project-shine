"use client";
import { motion } from "framer-motion";
import { Sparkles, Github, MessageSquare, Mail, Phone, ArrowUp } from "lucide-react";

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold">EduNex</span>
            </div>
            <p className="mt-4 text-xs text-white/30 leading-relaxed max-w-xs">
              The AI-powered education platform for the next generation.
              Generate exams, tutor with AI, and track progress in real-time.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="#" className="p-2 rounded-lg border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <Github className="w-3.5 h-3.5 text-white/40" />
              </a>
              <a href="#" className="p-2 rounded-lg border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <MessageSquare className="w-3.5 h-3.5 text-white/40" />
              </a>
            </div>
          </div>

          {[
            { title: "Product", links: [{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "FAQ", href: "#faq" }, { label: "Blog", href: "/blog" }] },
            { title: "For Users", links: [{ label: "Students", href: "/auth/login" }, { label: "Teachers", href: "/auth/register" }, { label: "Schools", href: "#pricing" }, { label: "Administrators", href: "#pricing" }] },
            { title: "Legal", links: [{ label: "Terms of Service", href: "#" }, { label: "Privacy Policy", href: "#" }, { label: "GDPR", href: "#" }, { label: "Cookie Policy", href: "#" }] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">Contact</h4>
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
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400/60">All systems operational</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.04] flex items-center justify-between">
          <p className="text-[10px] text-white/20">&copy; {new Date().getFullYear()} EduNex. All rights reserved.</p>
          <button onClick={scrollToTop} className="p-2 rounded-lg border border-white/[0.06] hover:border-white/[0.12] transition-colors">
            <ArrowUp className="w-3.5 h-3.5 text-white/30" />
          </button>
        </div>
      </div>
    </footer>
  );
}
