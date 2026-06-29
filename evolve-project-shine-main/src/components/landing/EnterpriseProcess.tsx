const steps = [
  ["01", "Projekt", "Pytania, czas i punktacja."],
  ["02", "Sesja", "Kontrolowany dostęp klasy."],
  ["03", "Praca", "Postęp widoczny na bieżąco."],
  ["04", "Raport", "Wyniki uporządkowane dla szkoły."],
];

export function EnterpriseProcess() {
  return (
    <section className="mt-16">
      <div className="mb-8 max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Proces</div>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-.045em] sm:text-5xl">Od egzaminu do raportu.</h2>
        <p className="mt-4 text-base leading-7 text-slate-600">Prosty przepływ dla nauczyciela i uporządkowane dane dla szkoły.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        {steps.map(([nr, title, text]) => (
          <div key={nr} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,.08)]">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">{nr}</div>
            <h3 className="mt-6 text-xl font-semibold">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
