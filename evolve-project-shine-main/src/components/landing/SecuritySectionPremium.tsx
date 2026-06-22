import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Shield, Lock, Eye, Server, Fingerprint, ShieldCheck, Globe, Cpu } from "lucide-react";

const SECURITY_FEATURES = [
  {
    icon: Lock,
    title: "TLS 1.3 + E2EE",
    desc: "Szyfrowanie end-to-end wszystkich danych w tranzycie i w spoczynku",
  },
  {
    icon: Shield,
    title: "Pełna zgodność RODO",
    desc: "Dane przetwarzane w EU. Audyt zgodności, DPO, procedury DPIA",
  },
  {
    icon: Eye,
    title: "Monitoring 24/7",
    desc: "SOC z alertami real-time, analiza anomalii AI, automatyczne blokowanie",
  },
  {
    icon: Server,
    title: "Backup 3-2-1",
    desc: "Kopie w 3 lokalizacjach, 2 media, 1 offsite. Odtworzenie < 4h",
  },
  {
    icon: Fingerprint,
    title: "Role-Based Access",
    desc: "Granularne uprawnienia: dyrektor, nauczyciel, uczeń, rodzic, audytor",
  },
  {
    icon: Globe,
    title: "WAF + DDoS Shield",
    desc: "Web Application Firewall + ochrona przed atakami DDoS na poziomie edge",
  },
  {
    icon: Cpu,
    title: "Anti-cheat Engine",
    desc: "Detekcja kopiowania, zmiany kart, screenshotów, drugiego ekranu",
  },
  {
    icon: ShieldCheck,
    title: "ISO 27001 Ready",
    desc: "Architektura zgodna ze standardami ISO 27001 i SOC 2 Type II",
  },
];

const BADGES = ["RODO", "ISO 27001", "SOC 2", "GDPR", "eIDAS", "MEN"];

export default function SecuritySectionPremium() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-28 sm:py-36 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs mb-6"
            style={{
              background: "oklch(0.65 0.2 150 / 0.08)",
              border: "1px solid oklch(0.65 0.2 150 / 0.18)",
              color: "oklch(0.72 0.18 150)",
            }}
          >
            <Shield className="w-3.5 h-3.5" /> Bezpieczeństwo
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white text-balance">
            Bezpieczeństwo na poziomie{" "}
            <span
              style={{
                background: "linear-gradient(135deg, oklch(0.75 0.18 150), oklch(0.6 0.2 200))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              bankowości
            </span>
          </h2>
          <p className="mt-4 text-base max-w-2xl mx-auto" style={{ color: "oklch(1 0 0 / 0.45)" }}>
            Infrastruktura zaprojektowana zgodnie ze standardami finansowymi. Dane uczniów chronione
            jak aktywa bankowe.
          </p>
        </motion.div>

        {/* Security grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SECURITY_FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="p-5 rounded-xl transition-all duration-300"
              style={{
                background: "oklch(0.05 0.015 270)",
                border: "1px solid oklch(0.15 0.02 270)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "oklch(0.65 0.2 150 / 0.3)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "oklch(0.15 0.02 270)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <feat.icon className="w-5 h-5 mb-3" style={{ color: "oklch(0.72 0.18 150)" }} />
              <h4 className="text-sm font-semibold text-white mb-1">{feat.title}</h4>
              <p className="text-xs leading-relaxed" style={{ color: "oklch(1 0 0 / 0.4)" }}>
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Animated certification badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          {BADGES.map((badge) => (
            <div
              key={badge}
              className="px-4 py-2 rounded-lg text-xs font-mono font-medium flex items-center gap-2"
              style={{
                background: "oklch(0.05 0.015 270)",
                border: "1px solid oklch(0.65 0.2 150 / 0.2)",
                color: "oklch(0.72 0.18 150)",
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {badge}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
