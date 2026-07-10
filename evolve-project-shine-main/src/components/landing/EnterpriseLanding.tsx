import { motion } from "framer-motion";
import { BarChart3, FileText, ShieldCheck, Sparkles, Users, type LucideIcon } from "lucide-react";
import { EnterpriseHeader } from "@/components/landing/EnterpriseHeader";
import { EnterpriseLayers } from "@/components/landing/EnterpriseLayers";
import { EnterpriseModules } from "@/components/landing/EnterpriseModules";
import { EnterpriseProcess } from "@/components/landing/EnterpriseProcess";
import { EnterpriseProductPanel } from "@/components/landing/EnterpriseProductPanel";
import { EnterpriseSecurity } from "@/components/landing/EnterpriseSecurity";

const cards: Array<[LucideIcon, string, string]> = [
  [FileText, "Egzaminy", "Testy, punktacja, czas i sesje PIN."],
  [Users, "Panele", "Role i widoki dla całej placówki."],
  [BarChart3, "Raporty", "Wyniki, zestawienia i eksport danych."],
  [Sparkles, "AI", "Pytania, rekomendacje i wsparcie nauki."],
];

export function EnterpriseLanding() {
  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-24 text-slate-950">
      <EnterpriseHeader />
      <main id="system" className="mx-auto max-w-7xl pt-20">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Platforma egzaminacyjna
          </div>
          <h1 className="max-w-5xl text-5xl font-semibold leading-none sm:text-7xl">
            Poważny system do egzaminów, wyników i pracy szkoły.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
            EduNex łączy egzaminy PIN, panele użytkowników, raporty, AI i bezpieczeństwo w jednym dopracowanym
            systemie.
          </p>
        </motion.div>

        <EnterpriseProductPanel />

        <section id="panele" className="mt-16 grid scroll-mt-28 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map(([Icon, title, text]) => (
            <article key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,.08)]">
              <Icon className="h-5 w-5 text-blue-700" />
              <h3 className="mt-6 text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </section>

        <EnterpriseModules />
        <EnterpriseLayers />
        <EnterpriseProcess />
        <EnterpriseSecurity />

        <section id="kontakt" className="mt-16 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,.08)]">
          <h2 className="text-3xl font-semibold">Kierunek enterprise, bez chaosu.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            EduNex ma budzić zaufanie szkoły, dyrekcji, nauczyciela i rodzica od pierwszego kontaktu z systemem.
          </p>
        </section>
      </main>
    </div>
  );
}
