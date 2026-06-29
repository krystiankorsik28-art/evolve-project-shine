import { motion } from "framer-motion";
import { BarChart3, FileText, ShieldCheck, Sparkles, Users } from "lucide-react";
import { EnterpriseHeader } from "@/components/landing/EnterpriseHeader";
import { EnterpriseProcess } from "@/components/landing/EnterpriseProcess";
import { EnterpriseSecurity } from "@/components/landing/EnterpriseSecurity";

const cards = [
  [FileText, "Egzaminy", "Testy, punktacja i czas."],
  [Users, "Panele", "Role i widoki użytkowników."],
  [BarChart3, "Raporty", "Wyniki i eksport danych."],
  [Sparkles, "AI", "Pytania i rekomendacje."],
];

export function EnterpriseLanding() {
  return <div className="min-h-screen bg-[#f7f8fb] px-4 py-24 text-[#0f172a]"><EnterpriseHeader /><main className="mx-auto max-w-7xl pt-20"><motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}}><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"><ShieldCheck className="h-3.5 w-3.5"/> Platforma egzaminacyjna</div><h1 className="max-w-5xl text-5xl font-semibold leading-[.94] tracking-[-.07em] sm:text-7xl">Poważny system do egzaminów, wyników i pracy szkoły.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">EduNex łączy egzaminy PIN, panele użytkowników, raporty, AI i bezpieczeństwo w jednym dopracowanym systemie.</p></motion.div><section className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{cards.map(([Icon,title,text]: any)=><div key={title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,.08)]"><Icon className="h-5 w-5 text-blue-700"/><h3 className="mt-6 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{text}</p></div>)}</section><EnterpriseProcess /><EnterpriseSecurity /><section className="mt-16 rounded-[34px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,.08)]"><h2 className="text-3xl font-semibold tracking-[-.045em]">Czysty kierunek enterprise.</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">Mniej neonów, mniej chaosu, więcej zaufania i powagi produktu dla szkoły.</p></section></main></div>;
}
