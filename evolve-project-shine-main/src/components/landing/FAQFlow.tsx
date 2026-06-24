import { useState } from "react";
import { Plus } from "lucide-react";
import TextReveal from "./TextReveal";

const FAQ = [
  { q: "Czy uczniowie muszą zakładać konto?", a: "Nie. Uczeń wchodzi przeglądarką, wpisuje PIN i imię. Konto nie jest wymagane — zero rejestracji." },
  { q: "Czy mogę wgrać pytania z dokumentu?", a: "Tak. Wspieramy import z Worda, PDF oraz Excel. Możesz też wczytać zdjęcie — AI odczyta pytania automatycznie." },
  { q: "Jak szybko mogę zacząć?", a: "Rejestracja trwa 2 minuty. Dla planu Klasa — dostęp od razu, bez karty płatniczej." },
  { q: "Jak AI wykrywa ściąganie?", a: "AI analizuje ruchy myszy, wykrywa opuszczanie okna, porównuje odpowiedzi uczniów i wysyła alerty na żywo." },
  { q: "Czy platforma działa na telefonie?", a: "Tak. EduNex działa w każdej przeglądarce — komputer, tablet, telefon. Bez instalacji." },
  { q: "Czy mogę przetestować przed zakupem?", a: "Tak. Plan Klasa jest całkowicie darmowy — bez limitu czasu, bez karty, bez zobowiązań." },
];

export default function FAQFlow() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative py-28 sm:py-36 overflow-hidden section-premium">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="reveal text-center mb-14">
          <span className="section-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/50 backdrop-blur-sm">FAQ</span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight"><TextReveal text="Wątpliwości? Wyjaśniamy" /></h2>
        </div>
        <div className="reveal space-y-3">
          {FAQ.map((it, i) => (
            <div key={it.q} className="card-premium rounded-2xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-white/[0.02]">
                <span className="text-sm font-medium text-white/80 pr-4">{it.q}</span>
                <span className={`shrink-0 w-7 h-7 rounded-full bg-white/[0.04] border border-white/[0.06] grid place-items-center transition-all duration-300 ${open === i ? "border-accent/30 text-accent rotate-45" : "text-white/30"}`}>
                  <Plus className="w-3.5 h-3.5"/>
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-out ${open === i ? "max-h-48" : "max-h-0"}`}>
                <p className="px-6 pb-4 text-sm text-white/50 leading-relaxed">{it.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
