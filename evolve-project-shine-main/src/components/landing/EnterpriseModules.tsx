import { motion } from "framer-motion";

const modules = ["Testy", "Sprawdziany", "Sesje live", "Biblioteka", "Raporty", "Powiadomienia", "Panele", "Eksport"];

export function EnterpriseModules() {
  return (
    <section className="mt-16">
      <div className="mb-8 max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Moduły</div>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-.045em] sm:text-5xl">System ma wyglądać na kompletny od pierwszego ekranu.</h2>
        <p className="mt-4 text-base leading-7 text-slate-600">Pokazujemy konkretne obszary pracy, nie przypadkowe ozdobniki.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map((label, index) => (
          <motion.div key={label} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .42, delay: index * .035 }} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 shadow-[0_16px_50px_rgba(15,23,42,.06)] transition hover:-translate-y-1">
            {label}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
