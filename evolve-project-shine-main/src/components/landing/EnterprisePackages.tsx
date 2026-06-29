const packages = [
  ["Start", "0 zł", "Dla testów i małych klas", "1 nauczyciel, 1 klasa, podstawowe sprawdziany"],
  ["School", "99 zł", "Dla szkoły i zespołu", "wiele klas, raporty, rodzice, sesje live"],
  ["Enterprise", "Oferta", "Dla dużej placówki", "SSO, audyt, AI, wsparcie premium"],
];

export function EnterprisePackages() {
  return (
    <section id="cennik" className="mt-16 scroll-mt-28">
      <div className="mb-8 max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Cennik</div>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-.045em] sm:text-5xl">Plany dla klasy, szkoły i placówki.</h2>
        <p className="mt-4 text-base leading-7 text-slate-600">EduNex wygląda jak gotowy produkt: ma pakiety, funkcje i jasny kierunek wdrożenia.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {packages.map(([name, price, text, list]) => (
          <div key={name} className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,.08)]">
            <div className="text-sm font-semibold text-blue-700">{name}</div>
            <div className="mt-4 text-4xl font-semibold tracking-[-.05em]">{price}</div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-600">{list}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
