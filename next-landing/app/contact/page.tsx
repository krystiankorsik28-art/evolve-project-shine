"use client";
import { motion } from "framer-motion";
import { Sparkles, Mail, Phone, MapPin, Send } from "lucide-react";
import { NavBar } from "@/components/sections/NavBar";
import { Footer } from "@/components/sections/Footer";

export default function ContactPage() {
  return (
    <main className="bg-[#0a0a12] min-h-screen">
      <NavBar />
      <div className="pt-28 pb-24 sm:pt-36 sm:pb-32 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Contact Us</h1>
          <p className="mt-3 text-sm text-white/40 max-w-md mx-auto">Have questions? We&apos;d love to hear from you.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div className="space-y-6">
            {[
              { icon: Mail, label: "Email", value: "kontakt@edunex.pl" },
              { icon: Phone, label: "Phone", value: "+48 22 100 12 34" },
              { icon: MapPin, label: "Office", value: "Warsaw, Poland" },
            ].map((item) => (
              <div key={item.label} className="flex gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/80">{item.label}</h3>
                  <p className="text-xs text-white/40 mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <input placeholder="Your name" className="w-full h-10 px-3 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 transition-colors" />
            <input type="email" placeholder="Email" className="w-full h-10 px-3 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 transition-colors" />
            <select className="w-full h-10 px-3 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/60 outline-none focus:border-cyan-500/40 transition-colors">
              <option value="">Select topic</option>
              <option value="sales">Sales inquiry</option>
              <option value="support">Technical support</option>
              <option value="partnership">Partnership</option>
              <option value="other">Other</option>
            </select>
            <textarea rows={4} placeholder="Message" className="w-full px-3 py-2.5 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 transition-colors resize-none" />
            <button className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-white text-[#0a0a12] rounded-lg hover:bg-white/90 transition-all">
              Send message <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
