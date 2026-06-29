const packages = [
  ["Start", "Dla testów i małych klas"],
  ["School", "Dla szkoły i zespołu"],
  ["Enterprise", "Dla dużej placówki"],
];

export function EnterprisePackages() {
  return (
    <section id="cennik" className="mt-16 scroll-mt-28">
      <div className="mb-8 max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Pakiety</div>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-.045em] sm:text-5xl">Warianty dla klasy, szkoły i placówki.</h2>
        <p className="mt-4 text-base leading-7 text-slate-600">Strona pokazuje EduNex jako gotowy produkt do wdrożenia.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {packages.map(([name, text]) => (
          <div key={name} className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,.08)]">
            <div className="text-sm font-semibold text-blue-700">{name}</div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
