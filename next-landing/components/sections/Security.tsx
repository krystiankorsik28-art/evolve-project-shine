"use client";
import { motion } from "framer-motion";
import { Shield, Lock, Server, Database, FileCheck, Activity } from "lucide-react";

const features = [
  { icon: Shield, title: "Enterprise Encryption", desc: "End-to-end encryption for all data in transit and at rest. AES-256 standard.", accent: "oklch(0.7 0.15 200)" },
  { icon: Lock, title: "GDPR / RODO Compliant", desc: "Full compliance with European data protection regulations. Data stored in EU.", accent: "oklch(0.65 0.2 240)" },
  { icon: Server, title: "EU-Based Servers", desc: "All data hosted on secure servers within the European Union. Zero data export.", accent: "oklch(0.75 0.15 85)" },
  { icon: Database, title: "Automated Backups", desc: "Daily encrypted backups with 30-day retention. Point-in-time recovery available.", accent: "oklch(0.7 0.15 160)" },
  { icon: FileCheck, title: "ISO 27001 Ready", desc: "Information security management aligned with ISO 27001 standards.", accent: "oklch(0.65 0.18 280)" },
  { icon: Activity, title: "24/7 Monitoring", desc: "Real-time threat detection, DDoS protection, and automated incident response.", accent: "oklch(0.65 0.18 330)" },
];

export function Security() {
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
            Enterprise-Grade{" "}
            <span style={{
              background: "linear-gradient(135deg, oklch(0.75 0.15 200), oklch(0.6 0.2 240))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Security
            </span>
          </h2>
          <p className="mt-3 text-sm" style={{ color: "oklch(1 0 0 / 0.4)" }}>Your data is protected by industry-leading security standards</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex gap-4 p-5 rounded-xl transition-all duration-300"
              style={{
                background: "linear-gradient(180deg, oklch(0.08 0.03 270 / 0.4), oklch(0.04 0.02 270 / 0.2))",
                border: "1px solid oklch(1 0 0 / 0.06)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${f.accent.replace(")", "/ 0.2)")}, ${f.accent.replace(")", "/ 0.05)")})`,
                  border: `1px solid ${f.accent.replace(")", "/ 0.2)")}`,
                }}>
                <f.icon className="w-5 h-5" style={{ color: f.accent }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/80">{f.title}</h3>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: "oklch(1 0 0 / 0.4)" }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
