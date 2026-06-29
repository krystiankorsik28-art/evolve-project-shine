import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/register")({ component: RegisterPage });

function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#f7f8fb] px-4 py-10 text-[#0f172a]">
      <div className="mx-auto max-w-4xl rounded-[34px] border border-slate-200 bg-white p-8 shadow-[0_30px_100px_rgba(15,23,42,.10)]">
        <Link to="/" className="mb-8 inline-flex items-center text-sm font-semibold text-slate-600">← Strona główna</Link>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"><ShieldCheck className="h-3.5 w-3.5" /> Pełna rejestracja EduNex</div>
          <h1 className="text-4xl font-semibold tracking-[-.055em] sm:text-6xl">Utwórz konto w systemie.</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">Pełny formularz rejestracyjny bez dodatkowych zakładek i bez przełączania trybów.</p>
        </motion.div>
        <form className="mt-8 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Imię" /><Input label="Nazwisko" /></div>
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Adres e-mail" type="email" /><Input label="Numer telefonu" /></div>
          <label className="grid gap-2 text-sm font-semibold text-slate-700"><span>Typ konta</span><select className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-600"><option>Rodzic</option><option>Nauczyciel</option><option>Uczeń</option><option>Administrator</option></select></label>
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Nazwa szkoły / placówki" /><Input label="Klasa / stanowisko" /></div>
          <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 text-sm font-semibold text-slate-800">Dane dziecka / ucznia</div>
            <div className="grid gap-4 sm:grid-cols-3"><Input label="Imię dziecka" /><Input label="Nazwisko dziecka" /><Input label="Klasa" /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Hasło" type="password" /><Input label="Powtórz hasło" type="password" /></div>
          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"><input type="checkbox" className="mt-1" /> Akceptuję regulamin, politykę prywatności i zasady przetwarzania danych.</label>
          <button type="button" className="mt-2 inline-flex items-center justify-center rounded-full bg-[#0f172a] px-6 py-3.5 text-sm font-semibold text-white">Utwórz konto <ArrowRight className="ml-2 h-4 w-4" /></button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, type = "text" }: { label: string; type?: string }) {
  return <label className="grid gap-2 text-sm font-semibold text-slate-700"><span>{label}</span><input type={type} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-600" /></label>;
}
