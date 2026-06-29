import { motion } from "framer-motion";

const layers = [
  ["Dostęp", "role, logowanie i widoki"],
  ["Egzaminy", "sesje, pytania i odpowiedzi"],
  ["Dane", "wyniki, raporty i analiza"],
  ["AI", "pomoc, ocena i rekomendacje"],
];

export function EnterpriseLayers() {
  return (
    <section className="mt-16 overflow-hidden rounded-[38px] border border-slate-200 bg-[#0f172a] p-8 text-white shadow-[0_36px_120px_rgba(15,23,42,.22)] lg:p-12">
      <div className="max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-[0.26em] text-blue-200">Architektura</div>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-5xl">EduNex jako system warstwowy.</h2>
        <p className="mt-5 text-base leading-7 text-white/65">Poważna strona powinna pokazać, że produkt ma strukturę, skalę i sens.</p>
      </div>
      <div className="mt-10 grid gap-4 lg:grid-cols-4">
        {layers.map(([title, text], index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: .45, delay: index * .08 }}
            className="rounded-3xl border border-white/10 bg-white/[.06] p-6 backdrop-blur-xl"
          >
            <div className="text-xs font-semibold text-blue-200">0{index + 1}</div>
            <h3 className="mt-6 text-xl font-semibold">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-white/60">{text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
