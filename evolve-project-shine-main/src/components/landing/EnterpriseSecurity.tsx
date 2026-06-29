import { CheckCircle2 } from "lucide-react";
import { EnterprisePackages as Packages } from "@/components/landing/EnterprisePackages";

const items = ["Role i uprawnienia użytkowników", "Kontrola kont pracowników", "Historia aktywności", "Reset dostępu przez e-mail", "Oddzielne widoki dla ról", "Porządek danych szkoły"];

export function EnterpriseSecurity() {
  return <><section id="zaufanie" className="mt-16 scroll-mt-28 rounded-[38px] border border-slate-200 bg-white p-8 shadow-[0_30px_100px_rgba(15,23,42,.10)] lg:p-12"><div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr]"><div><div className="text-xs font-semibold uppercase tracking-[0.26em] text-blue-700">Zaufanie</div><h2 className="mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-5xl">Produkt dla szkoły musi wyglądać spokojnie i pewnie.</h2><p className="mt-5 text-base leading-7 text-slate-600">Dlatego strona główna stawia na czystość, czytelność, powagę i uporządkowany język produktu.</p></div><div className="grid gap-3 sm:grid-cols-2">{items.map((item) => <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /><span className="text-sm font-medium text-slate-700">{item}</span></div>)}</div></div></section><Packages /></>;
}
