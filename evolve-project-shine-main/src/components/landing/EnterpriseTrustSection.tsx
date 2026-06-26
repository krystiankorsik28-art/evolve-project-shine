import { motion } from "framer-motion";
import { BadgeCheck, Cloud, Database, Fingerprint, GraduationCap, KeyRound, Lock, Network, ServerCog, ShieldCheck, Sparkles, Workflow } from "lucide-react";

const security = [
  { icon: ShieldCheck, title: "RODO-ready", text: "Komunikacja gotowa pod szkoły, dane uczniów, role i przejrzyste zasady przetwarzania." },
  { icon: KeyRound, title: "OTP i 2FA", text: "Reset hasła kodem, weryfikacja kont nauczycieli oraz dodatkowa ochrona administratora." },
  { icon: Fingerprint, title: "Audyt aktywności", text: "Historia logowań, zdarzeń, zmian i działań w panelach dla większej kontroli." },
  { icon: Lock, title: "Sesje PIN", text: "Ograniczone sesje egzaminacyjne, kody dostępu i kontrola czasu pracy ucznia." },
];

const integrations = [
  ["Supabase", "Auth, baza, storage"],
  ["Vercel", "deploy i hosting"],
  ["Google Classroom", "planowana integracja"],
  ["Moodle", "LMS / szkoły"],
  ["Microsoft", "logowanie i szkoły"],
  ["Stripe", "płatności SaaS"],
  ["API", "integracje zewnętrzne"],
  ["CSV / PDF", "eksport wyników"],
];

const timeline = [
  ["01", "Szkoła tworzy przestrzeń"],
  ["02", "Nauczyciele dostają role"],
  ["03", "Uczniowie wchodzą kodem PIN"],
  ["04", "Raporty trafiają do panelu"],
];

export function EnterpriseTrustSection({ isLight }: { isLight: boolean }) {
  return (
    <section id="enterprise" className="relative z-10 mx-auto max-w-7xl px-5 py-28 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <motion.div
          initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0078d4]/25 bg-[#0078d4]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#0078d4]">
            <BadgeCheck className="h-4 w-4" /> Enterprise ready
          </div>
          <h2 className="mt-6 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
            EduNex jako system dla szkoły, sieci szkół i instytucji.
          </h2>
          <p className={`mt-5 max-w-2xl text-lg leading-8 ${isLight ? "text-slate-600" : "text-white/62"}`}>
            Ta warstwa pokazuje, że platforma nie jest tylko ładną stroną. Ma komunikować bezpieczeństwo, wdrożenie, integracje, audyt i skalowanie pod większe organizacje.
          </p>

          <div className="mt-9 grid gap-3">
            {timeline.map(([nr, text], index) => (
              <motion.div
                key={nr}
                className={`flex items-center gap-4 rounded-[26px] border p-4 ${isLight ? "border-white/80 bg-white/76 shadow-[0_18px_50px_rgba(15,23,42,0.08)]" : "border-white/10 bg-white/[0.045]"}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#0078d4] text-sm font-black text-white">{nr}</div>
                <div className="font-bold tracking-[-0.02em]">{text}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-5">
          <motion.div
            className={`edunex-holo-border rounded-[38px] border p-5 backdrop-blur-2xl sm:p-7 ${isLight ? "border-white/80 bg-white/78 shadow-[0_38px_110px_rgba(15,23,42,0.14)]" : "border-white/10 bg-white/[0.055] shadow-[0_38px_120px_rgba(0,0,0,0.42)]"}`}
            initial={{ opacity: 0, x: 28, scale: 0.98 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.24em] text-[#0078d4]">Security layer</div>
                <div className="mt-2 text-3xl font-black tracking-[-0.05em]">Zaufanie i kontrola</div>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#0078d4] text-white shadow-[0_0_50px_rgba(0,120,212,0.42)]">
                <ShieldCheck className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {security.map(({ icon: Icon, title, text }, index) => (
                <motion.div
                  key={title}
                  className={`rounded-[26px] border p-5 ${isLight ? "border-slate-200/80 bg-white/70" : "border-white/10 bg-white/[0.045]"}`}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Icon className="mb-4 h-6 w-6 text-[#0078d4]" />
                  <div className="font-black tracking-[-0.03em]">{title}</div>
                  <p className={`mt-2 text-sm leading-6 ${isLight ? "text-slate-600" : "text-white/55"}`}>{text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className={`rounded-[38px] border p-5 backdrop-blur-2xl sm:p-7 ${isLight ? "border-white/80 bg-white/78 shadow-[0_28px_80px_rgba(15,23,42,0.10)]" : "border-white/10 bg-white/[0.045]"}`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0078d4]/12 text-[#0078d4]"><Network className="h-6 w-6" /></div>
              <div>
                <div className="text-xs font-black uppercase tracking-[0.22em] text-[#0078d4]">Integracje</div>
                <div className="text-2xl font-black tracking-[-0.04em]">Ekosystem szkoły</div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {integrations.map(([name, desc], index) => (
                <motion.div
                  key={name}
                  className={`rounded-2xl border p-4 ${isLight ? "border-slate-200/80 bg-white/72" : "border-white/10 bg-white/[0.045]"}`}
                  initial={{ opacity: 0, scale: 0.94 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.035 }}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#0078d4]" />
                    <div className="font-black text-sm">{name}</div>
                  </div>
                  <div className={`mt-2 text-xs ${isLight ? "text-slate-500" : "text-white/45"}`}>{desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <MetricCard isLight={isLight} icon={Database} label="Dane" value="Supabase" />
        <MetricCard isLight={isLight} icon={ServerCog} label="Wdrożenie" value="Vercel" />
        <MetricCard isLight={isLight} icon={Cloud} label="Model" value="SaaS" />
      </div>
    </section>
  );
}

function MetricCard({ isLight, icon: Icon, label, value }: { isLight: boolean; icon: typeof Database; label: string; value: string }) {
  return (
    <motion.div
      className={`rounded-[30px] border p-6 backdrop-blur-2xl ${isLight ? "border-white/80 bg-white/72 shadow-[0_20px_60px_rgba(15,23,42,0.08)]" : "border-white/10 bg-white/[0.045]"}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Icon className="mb-5 h-7 w-7 text-[#0078d4]" />
      <div className={`text-xs font-black uppercase tracking-[0.22em] ${isLight ? "text-slate-500" : "text-white/42"}`}>{label}</div>
      <div className="mt-2 text-3xl font-black tracking-[-0.05em]">{value}</div>
    </motion.div>
  );
}
