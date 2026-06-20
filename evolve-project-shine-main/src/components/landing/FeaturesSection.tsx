import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, FileText, Sparkles, BarChart3, Shield, Bot, Activity, TrendingUp, ShieldCheck, Monitor, KeyRound, Library, Award, Zap } from "lucide-react";

const CATEGORIES = [
  {
    id: "egzaminy", label: "Egzaminy", icon: FileText,
    items: [
      { title: "Tworzenie egzaminów", desc: "Pytania zamknięte, otwarte, kod, dopasowania. Szablony z banku 200+ zestawów.", icon: FileText },
      { title: "Sprawdziany błyskawiczne", desc: "Kartkówki z 3-5 pytaniami w 2 minuty. Wyniki widoczne natychmiast.", icon: Zap },
      { title: "Bank pytań", desc: "200+ pytań gotowych do użycia. Import z Worda, PDF, Excel.", icon: Library },
      { title: "Generator AI", desc: "Generuj pytania z 3 słów. Wczytaj zdjęcie — AI odczytuje i tworzy test.", icon: BrainCircuit },
      { title: "Certyfikacja", desc: "Certyfikat PDF z unikalnym numerem i kodem QR. Weryfikacja online.", icon: Award },
    ],
  },
  {
    id: "ai", label: "AI", icon: BrainCircuit,
    items: [
      { title: "Auto-ocena odpowiedzi", desc: "AI ocenia otwarte odpowiedzi, rozumie kontekst. Korekta pisowni nie wpływa na ocenę.", icon: Bot },
      { title: "Asystent AI nauczyciela", desc: "Rozmowa głosowa z asystentem. Podpowiedzi przy układaniu pytań.", icon: Sparkles },
      { title: "Wykrywanie ściągania", desc: "AI analizuje ruchy myszy, wykrywa opuszczanie okna, alerty na żywo.", icon: Shield },
      { title: "Inteligentne rekomendacje", desc: "AI sugeruje pytania na podstawie wyników. Personalizowane zestawy.", icon: BarChart3 },
    ],
  },
  {
    id: "analityka", label: "Analityka", icon: BarChart3,
    items: [
      { title: "Panel nauczyciela", desc: "KPI: egzaminy, średnia, alerty. Wykresy wyników w czasie.", icon: BarChart3 },
      { title: "Monitoring na żywo", desc: "Postęp ucznia w czasie rzeczywistym. Aktywni/ryzyko podział.", icon: Activity },
      { title: "Raporty dla dyrekcji", desc: "Zbiorcze zestawienie klas. Wskaźniki zdawalności. Eksport PDF/Excel.", icon: FileText },
      { title: "Prognozy i trendy", desc: "Wykresy predykcyjne. Alerty przy spadku wyników. Rekomendacje AI.", icon: TrendingUp },
    ],
  },
  {
    id: "bezpieczenstwo", label: "Bezpieczeństwo", icon: Shield,
    items: [
      { title: "Ochrona danych", desc: "Szyfrowanie TLS 1.3, AES-256 w spoczynku, serwery w UE.", icon: Shield },
      { title: "Zgodność z RODO", desc: "Umowa powierzenia danych. Dziennik audytu. Eksport na żądanie.", icon: ShieldCheck },
      { title: "Tryb egzaminacyjny", desc: "Pełny ekran, blokada skrótów, zapis co 5s, monitoring aktywności.", icon: Monitor },
      { title: "Kontrola dostępu", desc: "Role: admin, nauczyciel, uczeń. 2FA. Sesja wygasa po 15 min.", icon: KeyRound },
    ],
  },
];

export default function FeaturesSection() {
  const [active, setActive] = useState(CATEGORIES[0].id);
  const [key, setKey] = useState(0);
  const cat = CATEGORIES.find((c) => c.id === active) ?? CATEGORIES[0];
  const total = CATEGORIES.reduce((a, c) => a + c.items.length, 0);

  return (
    <section id="funkcje" className="relative py-28 sm:py-36 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs mb-6"
            style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.06)", color: "oklch(1 0 0 / 0.5)" }}>
            Funkcje
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Ponad{" "}
            <span style={{
              background: "linear-gradient(135deg, oklch(0.75 0.15 200), oklch(0.6 0.2 240))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>{total}+</span>{" "}
            możliwości
          </h2>
          <p className="mt-3 text-sm" style={{ color: "oklch(1 0 0 / 0.4)" }}>
            Wszystko, czego potrzebuje nowoczesna szkoła — w jednej, spójnej platformie.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((c) => {
            const isActive = active === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setActive(c.id); setKey((k) => k + 1); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                style={{
                  background: isActive ? "oklch(1 0 0 / 0.9)" : "oklch(1 0 0 / 0.04)",
                  color: isActive ? "oklch(0.06 0.03 270)" : "oklch(1 0 0 / 0.4)",
                  boxShadow: isActive ? "0 0 20px oklch(1 0 0 / 0.15)" : "none",
                }}
              >
                <c.icon className="w-4 h-4" />
                {c.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active + key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {cat.items.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                className="rounded-2xl p-6 transition-all duration-300"
                style={{
                  background: "oklch(0.08 0.03 270 / 0.3)",
                  border: "1px solid oklch(1 0 0 / 0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "oklch(0.7 0.15 200 / 0.2)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 30px oklch(0 0 0 / 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0"
                    style={{ background: "oklch(0.7 0.15 200 / 0.1)", border: "1px solid oklch(0.7 0.15 200 / 0.15)" }}>
                    <item.icon className="w-4 h-4" style={{ color: "oklch(0.7 0.15 200 / 0.8)" }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white/90">{item.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed" style={{ color: "oklch(1 0 0 / 0.45)" }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
