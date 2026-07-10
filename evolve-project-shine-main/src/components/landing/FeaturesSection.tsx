import { useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  Building2,
  Calendar,
  Database,
  Download,
  FileText,
  Globe,
  KeyRound,
  Library,
  Lock,
  MessageSquare,
  Monitor,
  Puzzle,
  Search,
  ShieldCheck,
  Upload,
  Users,
} from "lucide-react";

type FeatureItem = {
  title: string;
  desc: string;
  icon: ComponentType<{ className?: string }>;
};

type FeatureCategory = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  items: FeatureItem[];
};

const CATEGORIES: FeatureCategory[] = [
  {
    id: "egzaminy",
    label: "Egzaminy",
    icon: FileText,
    items: [
      { title: "Egzaminy PIN", desc: "Uczniowie dołączają kodem, a nauczyciel widzi postęp i status oddania.", icon: KeyRound },
      { title: "Bank pytań", desc: "Zestawy pytań, warianty odpowiedzi, import materiałów i ponowne użycie sprawdzianów.", icon: Library },
      { title: "Tryb egzaminacyjny", desc: "Czas, automatyczne zakończenie, czytelny status pracy i zapis odpowiedzi.", icon: Monitor },
      { title: "Eksport wyników", desc: "Raporty PDF, CSV i arkusze dla nauczyciela, klasy oraz dyrekcji.", icon: Download },
    ],
  },
  {
    id: "ai",
    label: "AI Tutor",
    icon: BrainCircuit,
    items: [
      { title: "Generator pytań", desc: "Propozycje pytań na podstawie tematu, poziomu i zakresu materiału.", icon: BrainCircuit },
      { title: "Wyjaśnienia dla ucznia", desc: "Spokojne wskazówki i dodatkowe przykłady bez zastępowania pracy nauczyciela.", icon: BookOpen },
      { title: "Rekomendacje", desc: "Sugestie powtórek, obszarów ryzyka i tematów wymagających uwagi.", icon: Search },
      { title: "Weryfikacja treści", desc: "Pomoc w sprawdzaniu jasności poleceń, punktacji i zgodności z poziomem klasy.", icon: ShieldCheck },
    ],
  },
  {
    id: "analityka",
    label: "Analityka",
    icon: BarChart3,
    items: [
      { title: "Wyniki klas", desc: "Średnie, rozkład punktów, najtrudniejsze pytania i porównanie terminów.", icon: BarChart3 },
      { title: "Plan dnia", desc: "Najbliższe sprawdziany, aktywne sesje i zadania wymagające decyzji.", icon: Calendar },
      { title: "Raporty dyrekcji", desc: "Zbiorcze metryki szkoły bez wchodzenia w szczegóły pojedynczego ucznia.", icon: Building2 },
      { title: "Historia aktywności", desc: "Kto utworzył egzamin, kiedy go uruchomił i jakie eksporty wykonano.", icon: FileText },
    ],
  },
  {
    id: "bezpieczenstwo",
    label: "Bezpieczeństwo",
    icon: ShieldCheck,
    items: [
      { title: "Role i uprawnienia", desc: "Oddzielne widoki dla ucznia, nauczyciela, rodzica, dyrekcji i administracji.", icon: Users },
      { title: "Dokumenty publiczne", desc: "Regulamin, RODO, polityka prywatności i powierzenie danych w jednym miejscu.", icon: FileText },
      { title: "Ochrona danych", desc: "Minimalizacja danych ucznia, szyfrowanie transmisji i uporządkowane logi.", icon: Lock },
      { title: "Kopie i zgodność", desc: "Eksport danych, retencja, ślad audytu i procesy zgodne z potrzebami szkoły.", icon: Database },
    ],
  },
  {
    id: "integracje",
    label: "Integracje",
    icon: Puzzle,
    items: [
      { title: "Microsoft i Google", desc: "Logowanie przez dostawców używanych w placówkach edukacyjnych.", icon: Globe },
      { title: "Import danych", desc: "Uczniowie, klasy i materiały mogą trafiać do systemu z istniejących plików.", icon: Upload },
      { title: "E-dziennik", desc: "Moduł dziennika wspiera oceny, frekwencję, notatki i komunikację.", icon: BookOpen },
      { title: "Komunikaty", desc: "Informacje dla ucznia i rodzica są zebrane w czytelnych panelach.", icon: MessageSquare },
    ],
  },
];

export default function FeaturesSection() {
  const [active, setActive] = useState(CATEGORIES[0].id);
  const category = CATEGORIES.find((item) => item.id === active) ?? CATEGORIES[0];
  const total = CATEGORIES.reduce((sum, item) => sum + item.items.length, 0);

  return (
    <section id="funkcje" className="relative overflow-hidden bg-[#f6f8fb] py-24 text-slate-950 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <span className="inline-flex rounded-full border border-blue-100 bg-white px-4 py-1.5 text-xs font-semibold text-blue-700">
            Funkcje platformy
          </span>
          <h2 className="mt-5 text-4xl font-semibold sm:text-5xl">Ponad {total} kluczowych możliwości dla szkoły.</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            EduNex łączy egzaminy, wyniki, dokumenty, AI i komunikację w jednym spokojnym systemie dla placówek.
          </p>
        </motion.div>

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((item) => {
            const Icon = item.icon;
            const selected = active === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  selected
                    ? "border-blue-200 bg-blue-700 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {category.items.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,.07)]"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
                </article>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
