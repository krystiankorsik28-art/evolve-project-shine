import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, useInView, animate, useMotionValue, useTransform } from "framer-motion";
import {
  CheckCircle2, Star, ArrowRight, Sparkles, ShieldCheck, Zap, CreditCard, Crown,
  ChevronDown, ChevronUp, Calculator, TrendingUp, Users, School, BarChart3,
  X, HelpCircle, Percent, DollarSign, Clock, Layers, Cpu, Award,
  BookOpen, Monitor, GitBranch, Gem, Target, Lightbulb, Globe, Smartphone,
  Server, Shield, Tablet, Wifi, ChevronRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { NexaPayCheckout } from "@/components/NexaPayCheckout";

const PLANS = [
  {
    name: "Klasa",
    price: "0",
    sub: "na zawsze",
    tagline: "Idealny na start",
    popular: false,
    icon: Sparkles,
    features: [
      { text: "Do 35 uczniów", highlight: false },
      { text: "Bank pytań 300+", highlight: false },
      { text: "Egzaminy bez limitu", highlight: false },
      { text: "Podstawowe raporty", highlight: false },
      { text: "Wsparcie e-mail", highlight: false },
      { text: "Podstawowe typy pytań", highlight: false },
      { text: "Import z PDF", highlight: false },
    ],
    highlightFeatures: [
      { text: "Generator AI — niedostępny", highlight: false },
      { text: "API — niedostępny", highlight: false },
      { text: "Anti-cheat — niedostępny", highlight: false },
    ],
    cta: "Rozpocznij za darmo",
    to: "/auth/teacher",
  },
  {
    name: "Nauczyciel",
    price: "99",
    sub: "/mies",
    yearlyPrice: "79",
    tagline: "Wybór profesjonalistów",
    popular: true,
    icon: Zap,
    features: [
      { text: "Do 60 uczniów", highlight: true },
      { text: "Bank pytań 3000+", highlight: true },
      { text: "Egzaminy bez limitu", highlight: true },
      { text: "Generator AI 200 zapytań/mies", highlight: true },
      { text: "Monitoring na żywo", highlight: true },
      { text: "Wsparcie priorytetowe", highlight: true },
      { text: "API REST", highlight: true },
    ],
    highlightFeatures: [
      { text: "Wszystkie typy pytań", highlight: false },
      { text: "AI Tutor 24/7", highlight: false },
      { text: "Eksport PDF/Excel", highlight: false },
    ],
    cta: "Wybierz Nauczyciel",
  },
  {
    name: "Szkoła",
    price: "490",
    sub: "/mies",
    yearlyPrice: "390",
    tagline: "Dla całej placówki",
    popular: false,
    icon: ShieldCheck,
    features: [
      { text: "Do 300 uczniów", highlight: true },
      { text: "Bank pytań bez limitu", highlight: true },
      { text: "Generator AI 2000 zapytań/mies", highlight: true },
      { text: "Anti-cheat + monitoring", highlight: true },
      { text: "Panel dyrekcji", highlight: true },
      { text: "Wsparcie 24/7", highlight: true },
      { text: "API REST + Webhooki", highlight: true },
    ],
    highlightFeatures: [
      { text: "SLA 99.95%", highlight: false },
      { text: "Dedykowane szkolenie", highlight: false },
      { text: "Migracja danych", highlight: false },
    ],
    cta: "Wybierz Szkoła",
  },
  {
    name: "Enterprise",
    price: "Indywidualnie",
    sub: "",
    tagline: "Skala bez granic",
    popular: false,
    icon: Crown,
    features: [
      { text: "Nieograniczeni użytkownicy", highlight: true },
      { text: "Bank pytań bez limitu", highlight: true },
      { text: "Generator AI bez limitu", highlight: true },
      { text: "Dedykowany serwer", highlight: true },
      { text: "SLA 99,99%", highlight: true },
      { text: "Szkolenia stacjonarne", highlight: true },
      { text: "Priorytetowe wsparcie 24/7", highlight: true },
    ],
    highlightFeatures: [
      { text: "Niestandardowe integracje", highlight: false },
      { text: "Własna domena", highlight: false },
      { text: "SLA z karami", highlight: false },
    ],
    cta: "Poproś o wycenę",
    contact: true,
  },
];

const COMPARISON_ROWS = [
  { category: "Uczniowie", items: [
    { label: "Maksymalna liczba uczniów", klasa: "35", nauczyciel: "60", szkola: "300", enterprise: "∞" },
    { label: "Dodatkowi opiekunowie", klasa: "—", nauczyciel: "—", szkola: "Do 5", enterprise: "∞" },
  ]},
  { category: "Bank pytań", items: [
    { label: "Dostępnych pytań", klasa: "300+", nauczyciel: "3000+", szkola: "∞", enterprise: "∞" },
    { label: "Typy pytań", klasa: "Podstawowe", nauczyciel: "Wszystkie", szkola: "Wszystkie", enterprise: "Wszystkie" },
    { label: "Import zdjęć → pytania AI", klasa: "—", nauczyciel: "✓", szkola: "✓", enterprise: "✓" },
  ]},
  { category: "Sztuczna inteligencja", items: [
    { label: "Generator AI (zapytania/mies)", klasa: "—", nauczyciel: "200", szkola: "2000", enterprise: "∞" },
    { label: "AI Tutor 24/7", klasa: "—", nauczyciel: "✓", szkola: "✓", enterprise: "✓" },
    { label: "AI Ocenianie odpowiedzi", klasa: "—", nauczyciel: "✓", szkola: "✓", enterprise: "✓" },
    { label: "AI Asystent głosowy", klasa: "—", nauczyciel: "✓", szkola: "✓", enterprise: "✓" },
  ]},
  { category: "Monitoring", items: [
    { label: "Ekran na żywo", klasa: "—", nauczyciel: "✓", szkola: "✓", enterprise: "✓" },
    { label: "Anti-cheat AI", klasa: "—", nauczyciel: "Podstawowy", szkola: "Zaawansowany", enterprise: "AI + manual" },
    { label: "Wykrywanie ściągania", klasa: "—", nauczyciel: "✓", szkola: "✓", enterprise: "✓" },
    { label: "Analiza podejrzeń", klasa: "—", nauczyciel: "—", szkola: "✓", enterprise: "✓" },
  ]},
  { category: "Wsparcie", items: [
    { label: "Poziom wsparcia", klasa: "E-mail", nauczyciel: "Priorytetowy", szkola: "24/7", enterprise: "24/7 dedykowany" },
    { label: "SLA", klasa: "Best effort", nauczyciel: "99.9%", szkola: "99.95%", enterprise: "99.99%" },
    { label: "Szkolenie", klasa: "—", nauczyciel: "—", szkola: "Online", enterprise: "Stacjonarne" },
  ]},
  { category: "API i integracje", items: [
    { label: "API REST", klasa: "—", nauczyciel: "✓", szkola: "✓", enterprise: "✓" },
    { label: "Webhooki", klasa: "—", nauczyciel: "—", szkola: "✓", enterprise: "✓" },
    { label: "LTI / SSO", klasa: "—", nauczyciel: "—", szkola: "—", enterprise: "✓" },
    { label: "Własna domena", klasa: "—", nauczyciel: "—", szkola: "—", enterprise: "✓" },
  ]},
  { category: "Bezpieczeństwo", items: [
    { label: "Szyfrowanie TLS 1.3", klasa: "✓", nauczyciel: "✓", szkola: "✓", enterprise: "✓" },
    { label: "Zgodność RODO", klasa: "✓", nauczyciel: "✓", szkola: "✓", enterprise: "✓" },
    { label: "2FA/MFA", klasa: "—", nauczyciel: "Opcjonalne", szkola: "Wymagane", enterprise: "Wymagane" },
    { label: "Audyt bezpieczeństwa", klasa: "—", nauczyciel: "—", szkola: "Kwartalny", enterprise: "Ciagły" },
    { label: "Dedykowany serwer", klasa: "—", nauczyciel: "—", szkola: "Współdzielony", enterprise: "Dedykowany" },
  ]},
];

const ROI_EXAMPLES = [
  { label: "Czas przygotowania egzaminu", tradycyjnie: "4 godz.", edunex: "15 min", savings: "94%", icon: Clock },
  { label: "Czas sprawdzania prac", tradycyjnie: "8 godz.", edunex: "30 sek", savings: "99.9%", icon: BarChart3 },
  { label: "Koszty druku (mies.)", tradycyjnie: "400 zł", edunex: "0 zł", savings: "100%", icon: DollarSign },
  { label: "Czas na analizę wyników", tradycyjnie: "2 dni", edunex: "1 klik", savings: "99%", icon: Target },
  { label: "Nakład na archiwizację", tradycyjnie: "5 godz./tydz.", edunex: "Automat", savings: "100%", icon: Layers },
  { label: "Generowanie certyfikatów", tradycyjnie: "30 min", edunex: "Automat", savings: "100%", icon: Award },
];

const FAQ_ITEMS = [
  { q: "Czy mogę zmienić plan w dowolnej chwili?", a: "Tak. Możesz przejść na wyższy plan lub anulować w każdej chwili. Nadpłata za niewykorzystany okres zostanie zwrócona." },
  { q: "Czy uczniowie muszą zakładać konto?", a: "Nie. Uczeń wchodzi przez przeglądarkę po PIN-ie — zero rejestracji. Idealne do szybkich klasówek." },
  { q: "Jak działa okres próbny?", a: "Plan Klasa jest całkowicie darmowy, bez limitu czasu i bez karty płatniczej. Możesz go używać tak długo, jak chcesz." },
  { q: "Jakie metody płatności akceptujecie?", a: "Karta kredytowa/debetowa, przelew bankowy oraz kryptowaluty (Bitcoin, Ethereum, USDT) przez NexaPay." },
  { q: "Czy mogę przenieść dane z innego systemu?", a: "Tak. Oferujemy bezpłatną migrację danych dla planów Szkoła i Enterprise. Skontaktuj się z nami." },
  { q: "Jakie są wymagania techniczne?", a: "EduNex działa w każdej nowoczesnej przeglądarce (Chrome, Firefox, Edge, Safari) na komputerze, tablecie i telefonie." },
  { q: "Czy mogę przetestować AI Generator przed zakupem?", a: "Plan Klasa zawiera podstawowe funkcje. Aby przetestować AI Generator, skontaktuj się z nami po demo." },
];

const TRUST = [
  { icon: ShieldCheck, label: "30 dni gwarancji zwrotu" },
  { icon: CreditCard, label: "Karta, przelew lub krypto" },
  { icon: Zap, label: "Aktywacja w 2 minuty" },
  { icon: Star, label: "Bez ukrytych kosztów" },
  { icon: Globe, label: "Hostowane w UE" },
];

function AnimatedPrice({ value, animateNow }: { value: string; animateNow: boolean }) {
  const isNumeric = /^\d+$/.test(value);
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toString());
  const [display, setDisplay] = useState(isNumeric ? "0" : value);
  useEffect(() => {
    if (!isNumeric) { setDisplay(value); return; }
    if (!animateNow) return;
    const controls = animate(mv, parseInt(value), { duration: 0.9, ease: [0.16, 1, 0.3, 1] });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [value, animateNow, isNumeric, mv, rounded]);
  return <>{display}</>;
}

function PricingCard({ pl, index, yearly, sectionInView }: { pl: (typeof PLANS)[number]; index: number; yearly: boolean; sectionInView: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const Icon = pl.icon;
  const price = yearly && pl.yearlyPrice ? pl.yearlyPrice : pl.price;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-3xl p-7 sm:p-8 flex flex-col h-full group will-change-transform"
      style={{
        marginTop: pl.popular ? "-12px" : "0",
        background: pl.popular
          ? "linear-gradient(165deg, oklch(0.14 0.05 250), oklch(0.07 0.03 260))"
          : "oklch(0.08 0.03 270)",
        border: pl.popular ? "1px solid oklch(0.72 0.16 200 / 0.35)" : "1px solid oklch(1 0 0 / 0.07)",
        boxShadow: pl.popular
          ? "0 24px 70px oklch(0.6 0.18 230 / 0.25), 0 0 50px oklch(0.72 0.16 200 / 0.15)"
          : "0 12px 40px oklch(0 0 0 / 0.3)",
        transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1), border-color 0.35s, box-shadow 0.35s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = pl.popular ? "translateY(-8px) scale(1.015)" : "translateY(-8px)";
        if (!pl.popular) e.currentTarget.style.borderColor = "oklch(0.72 0.16 200 / 0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        if (!pl.popular) e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.07)";
      }}
    >
      {pl.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-white"
            style={{
              background: "linear-gradient(135deg, oklch(0.72 0.16 200), oklch(0.6 0.2 250))",
              boxShadow: "0 6px 24px oklch(0.65 0.18 230 / 0.5)",
            }}
          >
            <Star className="w-3 h-3 fill-white" />
            Najpopularniejszy
          </span>
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-10 h-10 rounded-xl shrink-0" style={{
            background: pl.popular ? "linear-gradient(135deg, oklch(0.72 0.16 200 / 0.25), oklch(0.6 0.2 250 / 0.15))" : "oklch(1 0 0 / 0.05)",
            border: pl.popular ? "1px solid oklch(0.72 0.16 200 / 0.3)" : "1px solid oklch(1 0 0 / 0.08)",
          }}>
            <Icon className="w-5 h-5" style={{ color: pl.popular ? "oklch(0.78 0.15 200)" : "oklch(1 0 0 / 0.55)" }} />
          </span>
          <div>
            <h3 className="text-base font-semibold text-white">{pl.name}</h3>
            <p className="text-[11px]" style={{ color: "oklch(1 0 0 / 0.4)" }}>{pl.tagline}</p>
          </div>
        </div>

        <div className="mt-6 flex items-baseline gap-1">
          {pl.price !== "Indywidualnie" && <span className="text-2xl font-semibold text-white/50">zł</span>}
          <span className={`leading-none font-bold tracking-tight text-white ${pl.price === "Indywidualnie" ? "text-3xl sm:text-[2rem]" : "text-5xl sm:text-[3.4rem]"}`}>
            <AnimatedPrice value={price} animateNow={sectionInView} />
          </span>
          <span className="text-sm font-medium" style={{ color: "oklch(1 0 0 / 0.35)" }}>
            {yearly && pl.sub === "/mies" ? "/rok" : pl.sub}
          </span>
        </div>
        {yearly && pl.price !== "0" && pl.price !== "Indywidualnie" && (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-xs line-through" style={{ color: "oklch(1 0 0 / 0.3)" }}>{pl.price} zł/mies</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "oklch(0.72 0.16 200 / 0.18)", color: "oklch(0.78 0.15 200)" }}>
              Oszczędź {Math.round((1 - parseInt(pl.yearlyPrice || pl.price) / parseInt(pl.price)) * 100)}%
            </span>
          </div>
        )}

        <div className="mt-6 pt-5 flex-1" style={{ borderTop: "1px solid oklch(1 0 0 / 0.07)" }}>
          <ul className="space-y-3 text-sm">
            {pl.features.map((f, li) => (
              <motion.li key={f.text} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.2 + li * 0.04, duration: 0.4 }} className="flex gap-3 items-start">
                <span className="grid place-items-center w-[18px] h-[18px] rounded-full mt-0.5 shrink-0" style={{ background: pl.popular ? "oklch(0.72 0.16 200 / 0.18)" : "oklch(1 0 0 / 0.06)" }}>
                  <CheckCircle2 className="w-3 h-3" style={{ color: pl.popular ? "oklch(0.78 0.15 200)" : "oklch(1 0 0 / 0.5)" }} />
                </span>
                <span className={f.highlight ? "text-white font-medium" : ""} style={{ color: f.highlight ? undefined : (pl.popular ? "oklch(1 0 0 / 0.88)" : "oklch(1 0 0 / 0.6)") }}>{f.text}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          {pl.price === "0" && (
            <Link to={pl.to || "/auth/teacher"}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300"
              style={{ background: "oklch(1 0 0 / 0.92)", color: "oklch(0.06 0.03 270)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "oklch(1 0 0 / 1)"; e.currentTarget.style.boxShadow = "0 0 30px oklch(1 0 0 / 0.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "oklch(1 0 0 / 0.92)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              {pl.cta} <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          {pl.price !== "0" && pl.price !== "Indywidualnie" && (
            <NexaPayCheckout planName={pl.name} amount={yearly && pl.yearlyPrice ? pl.yearlyPrice + " zł" : pl.price + " zł"} amountUsd={String(Math.round(parseInt(pl.price) / 4))} />
          )}
          {pl.price === "Indywidualnie" && (
            <button onClick={() => document.getElementById("kontakt")?.scrollIntoView({ behavior: "smooth" })}
              className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300"
              style={{ border: "1px solid oklch(1 0 0 / 0.15)", color: "oklch(1 0 0 / 0.65)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.3)"; e.currentTarget.style.color = "oklch(1 0 0 / 0.95)"; e.currentTarget.style.background = "oklch(1 0 0 / 0.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.15)"; e.currentTarget.style.color = "oklch(1 0 0 / 0.65)"; e.currentTarget.style.background = "transparent"; }}
            >
              {pl.cta}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ComparisonTable() {
  const comparisionRef = useRef<HTMLDivElement>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  return (
    <motion.div ref={comparisionRef} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-24" id="comparison">
      <h3 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2 tracking-tight">
        Porównanie planów
      </h3>
      <p className="text-sm text-center mb-10" style={{ color: "oklch(1 0 0 / 0.45)" }}>
        Szczegółowe zestawienie wszystkich funkcji w każdym planie
      </p>

      <div className="max-w-5xl mx-auto">
        {COMPARISON_ROWS.map((cat) => (
          <div key={cat.category} className="mb-3">
            <button onClick={() => setOpenCategory(openCategory === cat.category ? null : cat.category)}
              className="w-full flex items-center justify-between px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.06)" }}
            >
              {cat.category}
              {openCategory === cat.category ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
            </button>
            {openCategory === cat.category && (
              <div className="mt-1 overflow-hidden rounded-xl" style={{ border: "1px solid oklch(1 0 0 / 0.06)" }}>
                <div className="grid grid-cols-[1fr_repeat(4,_100px)] sm:grid-cols-[1fr_repeat(4,_130px)] gap-x-2 gap-y-0 text-xs">
                  <div className="px-4 py-2 font-semibold text-white/60" style={{ background: "oklch(1 0 0 / 0.02)" }}>Funkcja</div>
                  {["Klasa", "Nauczyciel", "Szkoła", "Enterprise"].map((h, i) => (
                    <div key={h} className="px-2 py-2 text-center font-semibold" style={{ background: "oklch(1 0 0 / 0.02)", color: i === 1 ? "oklch(0.78 0.15 200)" : "oklch(1 0 0 / 0.6)" }}>{h}</div>
                  ))}
                  {cat.items.map((item, i) => (
                    <div key={i} className="contents">
                      <div className="px-4 py-2.5 text-white/70" style={{ borderTop: "1px solid oklch(1 0 0 / 0.04)" }}>{item.label}</div>
                      {[item.klasa, item.nauczyciel, item.szkola, item.enterprise].map((val, j) => (
                        <div key={j} className="px-2 py-2.5 text-center" style={{ borderTop: "1px solid oklch(1 0 0 / 0.04)", color: val === "✓" || val === "∞" ? "oklch(0.78 0.15 200)" : "oklch(1 0 0 / 0.45)" }}>{val}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function RoiCalculator() {
  const [teacherCount, setTeacherCount] = useState(10);
  const [hourlyRate, setHourlyRate] = useState(50);
  const yearlyCost = teacherCount * hourlyRate * 8 * 22 * 12;
  const edunexCost = teacherCount * 99 * 12;
  const savings = yearlyCost - edunexCost;
  const savingsPct = Math.round((savings / yearlyCost) * 100);
  const chartRef = useRef<HTMLDivElement>(null);
  const inView = useInView(chartRef, { once: true, margin: "-50px" });

  return (
    <motion.div ref={chartRef} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-24 max-w-4xl mx-auto" id="roi">
      <div className="rounded-3xl p-8 sm:p-10" style={{
        background: "linear-gradient(165deg, oklch(0.12 0.04 260), oklch(0.07 0.03 270))",
        border: "1px solid oklch(0.72 0.16 200 / 0.2)",
      }}>
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Calculator className="w-7 h-7" style={{ color: "oklch(0.78 0.15 200)" }} />
          Kalkulator ROI
        </h3>
        <p className="text-sm mb-8" style={{ color: "oklch(1 0 0 / 0.45)" }}>
          Sprawdź ile Twoja szkoła może zaoszczędzić z EduNex
        </p>

        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "oklch(1 0 0 / 0.6)" }}>Liczba nauczycieli</label>
            <div className="flex items-center gap-3">
              <input type="range" min={1} max={100} value={teacherCount} onChange={(e) => setTeacherCount(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                style={{ background: "oklch(0.72 0.16 200 / 0.25)", accentColor: "oklch(0.72 0.16 200)" }}
              />
              <span className="text-lg font-bold text-white w-12 text-right">{teacherCount}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "oklch(1 0 0 / 0.6)" }}>Stawka godzinowa (zł)</label>
            <div className="flex items-center gap-3">
              <input type="range" min={20} max={200} value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                style={{ background: "oklch(0.72 0.16 200 / 0.25)", accentColor: "oklch(0.72 0.16 200)" }}
              />
              <span className="text-lg font-bold text-white w-16 text-right">{hourlyRate} zł</span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-2xl p-5" style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.06)" }}>
            <p className="text-xs mb-1" style={{ color: "oklch(1 0 0 / 0.45)" }}>Tradycyjnie (rocznie)</p>
            <p className="text-2xl font-bold text-white/70">{yearlyCost.toLocaleString()} zł</p>
          </div>
          <div className="rounded-2xl p-5" style={{ background: "oklch(0.72 0.16 200 / 0.08)", border: "1px solid oklch(0.72 0.16 200 / 0.2)" }}>
            <p className="text-xs mb-1" style={{ color: "oklch(1 0 0 / 0.45)" }}>Z EduNex (rocznie)</p>
            <p className="text-2xl font-bold" style={{ color: "oklch(0.78 0.15 200)" }}>{edunexCost.toLocaleString()} zł</p>
          </div>
          <div className="rounded-2xl p-5" style={{ background: "oklch(0.65 0.2 150 / 0.08)", border: "1px solid oklch(0.65 0.2 150 / 0.2)" }}>
            <p className="text-xs mb-1" style={{ color: "oklch(1 0 0 / 0.45)" }}>Oszczędność</p>
            <p className="text-2xl font-bold" style={{ color: "oklch(0.65 0.2 150)" }}>
              {inView ? Math.max(0, savings).toLocaleString() : "—"} zł
              <span className="text-sm ml-1">({inView ? savingsPct : "—"}%)</span>
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {ROI_EXAMPLES.map((r) => {
            const RI = r.icon;
            return (
              <div key={r.label} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.06)" }}
              >
                <RI className="w-3.5 h-3.5" style={{ color: "oklch(0.78 0.15 200)" }} />
                <span style={{ color: "oklch(1 0 0 / 0.6)" }}>{r.label}:</span>
                <span className="font-semibold text-white">{r.savings}</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function PricingFAQ() {
  const [openQ, setOpenQ] = useState<string | null>(null);
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-24 max-w-3xl mx-auto" id="pricing-faq">
      <h3 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2 tracking-tight">
        Masz pytania?
      </h3>
      <p className="text-sm text-center mb-10" style={{ color: "oklch(1 0 0 / 0.45)" }}>
        Najczęściej zadawane pytania o cennik i plany
      </p>
      <div className="space-y-2">
        {FAQ_ITEMS.map((item) => (
          <div key={item.q} className="rounded-xl" style={{ border: "1px solid oklch(1 0 0 / 0.06)" }}>
            <button onClick={() => setOpenQ(openQ === item.q ? null : item.q)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-white text-left transition-all"
              style={{ background: "oklch(1 0 0 / 0.02)" }}
            >
              {item.q}
              {openQ === item.q ? <X className="w-4 h-4 shrink-0 opacity-50" /> : <HelpCircle className="w-4 h-4 shrink-0 opacity-30" />}
            </button>
            {openQ === item.q && (
              <div className="px-5 pb-4 text-sm" style={{ color: "oklch(1 0 0 / 0.6)" }}>
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} id="cennik" className="relative py-28 sm:py-36 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, oklch(0.6 0.18 230 / 0.07) 0%, transparent 60%)", filter: "blur(40px)" }} />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, oklch(0.72 0.16 200 / 0.05) 0%, transparent 65%)", filter: "blur(30px)" }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs mb-6"
            style={{ background: "oklch(0.72 0.16 200 / 0.08)", border: "1px solid oklch(0.72 0.16 200 / 0.18)", color: "oklch(0.78 0.15 200)" }}>
            <Sparkles className="w-3.5 h-3.5" />Cennik
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white text-balance">
            Wybierz swój{" "}
            <span style={{
              background: "linear-gradient(135deg, oklch(0.8 0.14 195), oklch(0.6 0.2 250))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>plan mocy</span>
          </h2>
          <p className="mt-4 text-base max-w-xl mx-auto text-pretty" style={{ color: "oklch(1 0 0 / 0.45)" }}>
            Od pojedynczej klasy po całą sieć szkół. Skaluj się wtedy, gdy chcesz — bez ukrytych kosztów.
          </p>
        </motion.div>

        <div className="flex items-center justify-center gap-4 mb-14">
          <span className="text-sm font-medium transition-colors" style={{ color: yearly ? "oklch(1 0 0 / 0.4)" : "oklch(1 0 0 / 0.9)" }}>Miesięcznie</span>
          <button onClick={() => setYearly(!yearly)}
            className="relative w-14 h-7 rounded-full transition-all duration-300"
            style={{ background: yearly ? "oklch(0.72 0.16 200)" : "oklch(1 0 0 / 0.12)", boxShadow: yearly ? "0 0 20px oklch(0.72 0.16 200 / 0.5)" : "none" }}
            role="switch" aria-checked={yearly} aria-label="Przełącz rozliczenie roczne"
          >
            <span className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300"
              style={{ transform: yearly ? "translateX(28px)" : "translateX(0)" }} />
          </button>
          <span className="text-sm font-medium transition-colors flex items-center gap-2"
            style={{ color: yearly ? "oklch(1 0 0 / 0.9)" : "oklch(1 0 0 / 0.4)" }}>
            Rocznie
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "oklch(0.72 0.16 200 / 0.18)", color: "oklch(0.78 0.15 200)" }}>
              Oszczędź 20%
            </span>
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {PLANS.map((pl, i) => (
            <PricingCard key={pl.name} pl={pl} index={i} yearly={yearly} sectionInView={inView} />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }} className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {TRUST.map((t) => {
            const TI = t.icon;
            return (
              <div key={t.label} className="flex items-center gap-2 text-sm" style={{ color: "oklch(1 0 0 / 0.5)" }}>
                <TI className="w-4 h-4" style={{ color: "oklch(0.78 0.15 200 / 0.8)" }} />
                {t.label}
              </div>
            );
          })}
        </motion.div>

        <ComparisonTable />
        <RoiCalculator />
        <PricingFAQ />
      </div>
    </section>
  );
}
