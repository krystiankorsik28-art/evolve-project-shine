import { useMemo, useState, type ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  Bot,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Database,
  Download,
  FileCheck2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  MonitorDot,
  ReceiptText,
  SearchCheck,
  ServerCog,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WalletCards,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";

type IconType = ComponentType<{ className?: string }>;
type DocumentId = "privacy" | "terms" | "dpa" | "security" | "accessibility" | "ai";

type DocumentItem = {
  id: DocumentId;
  icon: IconType;
  title: string;
  owner: string;
  description: string;
  tags: string[];
};

const navItems = [
  ["Platforma", "#platforma"],
  ["Kokpit", "#dashboard"],
  ["Cennik", "#cennik"],
  ["Dokumenty", "#dokumenty"],
  ["RODO", "#rodo"],
];

const metrics = [
  ["99.98%", "gotowosc platformy"],
  ["3 role", "uczen, nauczyciel, admin"],
  ["AI", "ocena i adaptacja"],
  ["RODO", "dokumenty i audyt"],
];

const platformTabs = {
  teacher: {
    icon: GraduationCap,
    label: "Nauczyciel",
    title: "Centrum pracy nauczyciela bez chaosu narzedzi",
    copy:
      "Plan dnia, kreator egzaminu, kolejka ocen AI, status klas i eksporty sa ulozone pod szybka decyzje.",
    points: ["Plan lekcji", "Kolejka AI", "Status klas", "Raporty"],
  },
  student: {
    icon: BookOpenCheck,
    label: "Uczen",
    title: "Prosty tryb egzaminu dla ucznia",
    copy:
      "Wejscie przez PIN, jasny timer, pytania multimedialne i czytelna informacja po zakonczeniu.",
    points: ["PIN", "Timer", "Mobile", "Feedback"],
  },
  admin: {
    icon: ServerCog,
    label: "Admin",
    title: "Kontrola dostepow, dokumentow i zgodnosci",
    copy:
      "Role, audyt, polityki danych, dokumenty i integracje sa zebrane w jednym modelu administracyjnym.",
    points: ["Role", "Audyt", "DPA/RODO", "Integracje"],
  },
  ai: {
    icon: WandSparkles,
    label: "AI",
    title: "AI pomaga, ale nauczyciel zatwierdza",
    copy:
      "System podpowiada oceny i sygnaly ryzyka, pokazuje uzasadnienia i zostawia finalna decyzje czlowiekowi.",
    points: ["Uzasadnienia", "Adaptacja", "Ryzyka", "Override"],
  },
};

const dashboardCards = [
  { icon: ClipboardCheck, title: "Eseje do decyzji", value: "36", hint: "12 z wysoka pewnoscia" },
  { icon: ShieldCheck, title: "Sygnaly ryzyka", value: "7", hint: "3 wymagaja przegladu" },
  { icon: CalendarDays, title: "Sesje dzis", value: "5", hint: "najblizsza 10:45" },
  { icon: Download, title: "Eksporty", value: "9", hint: "PDF, CSV, Excel" },
];

const plans = [
  {
    name: "Klasa",
    price: "0 zl",
    label: "Darmowy start",
    features: ["Sesje PIN", "Podstawowe wyniki", "Proste sprawdziany", "Panel ucznia"],
  },
  {
    name: "Nauczyciel",
    price: "99 zl",
    label: "Najczesciej wybierany",
    featured: true,
    features: ["AI generator pytan", "Wyniki live", "Eksport PDF/CSV", "Biblioteka egzaminow", "Kolejka ocen"],
  },
  {
    name: "Szkola",
    price: "490 zl",
    label: "Dla placowki",
    features: ["Panel admina", "Role i klasy", "2FA", "Raporty zbiorcze", "Dokumenty RODO"],
  },
  {
    name: "Enterprise",
    price: "Indywidualnie",
    label: "Sieci i kuratoria",
    features: ["SSO/LTI", "SLA", "Dedykowane polityki", "API", "Opieka wdrozeniowa"],
  },
];

const documents: DocumentItem[] = [
  {
    id: "privacy",
    icon: LockKeyhole,
    title: "Polityka prywatnosci",
    owner: "Administrator danych",
    description: "Kategorie danych, podstawy prawne, prawa osob i kontakt w sprawach prywatnosci.",
    tags: ["RODO", "Uczniowie", "Dostep"],
  },
  {
    id: "terms",
    icon: ReceiptText,
    title: "Regulamin platformy",
    owner: "Wlasciciel uslugi",
    description: "Zasady korzystania z egzaminow, sesji PIN, kont, banku pytan i raportow.",
    tags: ["Regulamin", "Role", "Sesje"],
  },
  {
    id: "dpa",
    icon: FileCheck2,
    title: "Umowa powierzenia DPA",
    owner: "Szkola + dostawca",
    description: "Zakres powierzenia, podprocesorzy, retencja, usuniecie danych i srodki techniczne.",
    tags: ["DPA", "Retencja", "Podprocesorzy"],
  },
  {
    id: "security",
    icon: ShieldCheck,
    title: "Procedura incydentu",
    owner: "IOD / IT",
    description: "Klasyfikacja zdarzen, reakcja, dowody, komunikacja i odpowiedzialnosci.",
    tags: ["Incydenty", "Audyt", "SLA"],
  },
  {
    id: "accessibility",
    icon: SearchCheck,
    title: "WCAG i dostepnosc",
    owner: "Zespol produktu",
    description: "Kontrast, klawiatura, mobile, etykiety i standard dostepnych egzaminow.",
    tags: ["WCAG", "Mobile", "Kontrast"],
  },
  {
    id: "ai",
    icon: Bot,
    title: "Karta AI",
    owner: "Nauczyciel + admin",
    description: "Zakres automatyzacji, nadzor czlowieka, wyjasnienia i rejestr decyzji AI.",
    tags: ["AI", "Wyjasnienia", "Decyzje"],
  },
];

const documentContent: Record<DocumentId, [string, string][]> = {
  privacy: [
    ["Zakres", "Dokument opisuje dane kont, wyniki egzaminow, logi techniczne, sesje live i dane kontaktowe administratorow szkolnych."],
    ["Podstawa", "Przetwarzanie odbywa sie w celu realizacji procesu dydaktycznego, obslugi egzaminow oraz zapewnienia bezpieczenstwa platformy."],
    ["Prawa osob", "Uzytkownik moze zadac dostepu do danych, sprostowania, ograniczenia przetwarzania oraz informacji o odbiorcach."],
  ],
  terms: [
    ["Korzystanie", "Platforma sluzy do tworzenia, prowadzenia i analizowania egzaminow oraz pracy z dokumentami szkolnymi."],
    ["Role", "Administrator zarzadza ustawieniami, nauczyciel prowadzi egzaminy, a uczen korzysta z udostepnionych sesji."],
    ["Odpowiedzialnosc", "Nauczyciel zatwierdza wyniki i decyzje wspierane przez AI. System nie zastepuje oceny pedagogicznej."],
  ],
  dpa: [
    ["Przedmiot", "Powierzenie obejmuje konta, sesje egzaminacyjne, wyniki, eksporty oraz logi bezpieczenstwa."],
    ["Retencja", "Dane sa przechowywane zgodnie z polityka szkoly, konfiguracja wdrozenia i obowiazkami archiwizacyjnymi."],
    ["Zakonczenie", "Po zakonczeniu uslugi dane powinny zostac usuniete albo zwrocone zgodnie z dyspozycja administratora."],
  ],
  security: [
    ["Klasyfikacja", "Incydenty dzielone sa wedlug wplywu na poufnosc, integralnosc, dostepnosc i prawa osob."],
    ["Reakcja", "System wspiera rejestr czasu wykrycia, osob odpowiedzialnych, dzialan naprawczych oraz komunikacji."],
    ["Dowody", "Logi dostepu, eksporty, zmiany ocen i zdarzenia sesji powinny byc zabezpieczone przed modyfikacja."],
  ],
  accessibility: [
    ["Kontrast", "Interfejs utrzymuje czytelny kontrast tekstu, przyciskow i informacji statusowych."],
    ["Klawiatura", "Glowne akcje, formularze i dokumenty powinny byc dostepne z klawiatury."],
    ["Mobile", "Tryb ucznia i nauczyciela powinien dzialac na waskich ekranach bez poziomego przewijania."],
  ],
  ai: [
    ["Zakres AI", "AI moze wspierac ocene esejow, adaptacje pytan i wykrywanie sygnalow ryzyka."],
    ["Nadzor", "Finalna decyzja nalezy do nauczyciela lub administratora wskazanego przez szkole."],
    ["Rejestr", "Decyzje wspierane przez AI powinny trafiac do audytu razem z osoba zatwierdzajaca."],
  ],
};

function getDocument(id: DocumentId) {
  return documents.find((item) => item.id === id) ?? documents[0];
}

function makeDocumentHtml(item: DocumentItem) {
  const sections = documentContent[item.id]
    .map(([title, copy]) => `<section><h2>${title}</h2><p>${copy}</p></section>`)
    .join("");

  return `<!doctype html><html lang="pl"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${item.title} - EduNex</title><style>body{margin:0;background:#f6f7f9;color:#0f172a;font-family:Segoe UI,Arial,sans-serif}main{max-width:840px;margin:48px auto;background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:42px;box-shadow:0 24px 70px rgba(15,23,42,.08)}.eyebrow{color:#64748b;font-size:13px;font-weight:700;text-transform:uppercase}h1{margin:10px 0 12px;font-size:34px;line-height:1.12}h2{margin:28px 0 8px;font-size:18px}p{color:#475569;line-height:1.72}.meta{color:#64748b;border-bottom:1px solid #e2e8f0;padding-bottom:24px}@media print{body{background:#fff}main{box-shadow:none;border:0;margin:0}}</style></head><body><main><div class="eyebrow">EduNex</div><h1>${item.title}</h1><p class="meta">${item.description}</p>${sections}</main></body></html>`;
}

function downloadDocument(item: DocumentItem) {
  const blob = new Blob([makeDocumentHtml(item)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = `edunex-${item.id}.html`;
  link.click();
  URL.revokeObjectURL(url);
}

function SectionHeader({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      <div className="text-sm font-semibold uppercase text-slate-500">{eyebrow}</div>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">{title}</h2>
      {text ? <p className="mt-4 text-base leading-7 text-slate-600">{text}</p> : null}
    </div>
  );
}

function ProductModel() {
  return (
    <div className="relative min-h-[390px] overflow-hidden rounded-3xl border border-slate-200 bg-[linear-gradient(145deg,#ffffff,#edf2f8)] shadow-[0_32px_100px_rgba(15,23,42,0.12)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(37,99,235,.13),transparent_36%)]" />
      <motion.div
        className="absolute left-10 top-12 h-64 w-[78%] rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-2xl"
        animate={{ rotateX: [5, 8, 5], rotateY: [-8, -4, -8] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase text-slate-400">Kokpit nauczyciela</span>
          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-200">Online</span>
        </div>
        <div className="mt-8 grid grid-cols-4 gap-3">
          {[62, 82, 46, 95].map((height, index) => (
            <div key={index} className="flex h-32 items-end rounded-xl bg-white/5 p-2">
              <div className="w-full rounded-lg bg-white" style={{ height: `${height}%`, opacity: 0.55 + index * 0.09 }} />
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div
        className="absolute bottom-9 right-8 w-56 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="text-xs font-semibold uppercase text-slate-500">Dokumenty</div>
        {["Regulamin", "RODO/DPA", "Karta AI"].map((item) => (
          <div key={item} className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <Check className="h-4 w-4 text-emerald-700" /> {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function DocumentModal({
  item,
  onClose,
}: {
  item: DocumentItem | null;
  onClose: () => void;
}) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <div className="text-sm font-semibold uppercase text-slate-500">EduNex</div>
            <h3 className="mt-1 text-2xl font-semibold text-slate-950">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Zamknij dokument">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[56vh] overflow-y-auto p-5">
          <div className="space-y-4">
            {documentContent[item.id].map(([title, copy]) => (
              <section key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="font-semibold text-slate-950">{title}</h4>
                <p className="mt-2 text-sm leading-7 text-slate-600">{copy}</p>
              </section>
            ))}
          </div>
          <p className="mt-5 text-xs leading-6 text-slate-500">
            To roboczy szablon produktu. Finalna tresc prawna powinna zostac zatwierdzona przez prawnika lub IOD szkoly.
          </p>
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => downloadDocument(item)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50">
            <Download className="h-5 w-5" /> Pobierz plik
          </button>
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-950 px-4 py-3 font-semibold text-white hover:bg-slate-800">
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}

export function PremiumLanding() {
  const [activeTab, setActiveTab] = useState<keyof typeof platformTabs>("teacher");
  const [activeDocument, setActiveDocument] = useState<DocumentItem | null>(null);
  const selectedTab = platformTabs[activeTab];
  const SelectedIcon = selectedTab.icon;

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-950">
      <DocumentModal item={activeDocument} onClose={() => setActiveDocument(null)} />

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/88 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3">
          <a href="#" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white">
              <Zap className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-semibold leading-5">EduNex</span>
              <span className="block text-xs text-slate-500">Exam OS</span>
            </span>
          </a>
          <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {navItems.map(([label, href]) => (
              <a key={href} href={href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950">
                {label}
              </a>
            ))}
          </div>
          <Link to="/auth/teacher" className="ml-auto inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 lg:ml-0">
            Panel nauczyciela <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid min-h-[78vh] max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                <Sparkles className="h-4 w-4" />
                Premium platforma egzaminacyjna dla szkol
              </div>
              <h1 className="mt-7 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 md:text-6xl">
                EduNex Exam OS dla nowoczesnej szkoly
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Elegancki system do egzaminow live, oceniania AI, dokumentow i zgodnosci RODO. Zaprojektowany jak dojrzale narzedzie operacyjne.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#dashboard" className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-slate-800">
                  Zobacz kokpit <LayoutDashboard className="h-5 w-5" />
                </a>
                <a href="#dokumenty" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-900 hover:bg-slate-50">
                  Dokumenty i RODO <FileText className="h-5 w-5" />
                </a>
              </div>
            </motion.div>
            <ProductModel />
          </div>
        </section>

        <section className="mx-auto -mt-8 grid max-w-7xl gap-4 px-5 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map(([value, label]) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-3xl font-semibold text-slate-950">{value}</div>
              <div className="mt-2 text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </section>

        <section id="platforma" className="mx-auto max-w-7xl px-5 py-20">
          <SectionHeader eyebrow="Platforma" title="Jedna aplikacja dla nauczyciela, ucznia i administracji" text="Widoki sa rozdzielone rolami, ale pozostaja spojne wizualnie i procesowo." />
          <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              {Object.entries(platformTabs).map(([id, item]) => {
                const Icon = item.icon;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id as keyof typeof platformTabs)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-4 text-left transition ${activeTab === id ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-100"}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
                    <div>
                      <div className="grid h-11 w-11 place-items-center rounded-lg border border-blue-100 bg-blue-50 text-blue-700">
                        <SelectedIcon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 text-2xl font-semibold text-slate-950">{selectedTab.title}</h3>
                      <p className="mt-3 leading-7 text-slate-600">{selectedTab.copy}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {selectedTab.points.map((point) => (
                        <div key={point} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <Check className="mb-3 h-5 w-5 text-emerald-700" />
                          <div className="font-medium text-slate-950">{point}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        <section id="dashboard" className="mx-auto max-w-7xl px-5 py-20">
          <SectionHeader eyebrow="Dashboard nauczyciela" title="Kokpit do prowadzenia egzaminow i decyzji" text="Priorytety, plan dnia, klasy, sygnaly ryzyka i status platformy w jednym profesjonalnym widoku." />
          <div className="grid gap-4 lg:grid-cols-4">
            {dashboardCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300" />
                  </div>
                  <div className="mt-5 text-3xl font-semibold text-slate-950">{card.value}</div>
                  <div className="mt-1 font-medium text-slate-800">{card.title}</div>
                  <div className="mt-2 text-sm text-slate-500">{card.hint}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="cennik" className="mx-auto max-w-7xl px-5 py-20">
          <SectionHeader eyebrow="Cennik" title="Pakiety dla nauczyciela, szkoly i wiekszych wdrozen" text="Cennik jest rozbudowany, ale czytelny: jasne roznice, konkretne funkcje i brak sztucznego szumu." />
          <div className="grid gap-5 lg:grid-cols-4">
            {plans.map((plan) => (
              <div key={plan.name} className={`rounded-xl border p-6 shadow-sm ${plan.featured ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-950"}`}>
                <div className="text-sm font-semibold uppercase opacity-70">{plan.label}</div>
                <h3 className="mt-4 text-2xl font-semibold">{plan.name}</h3>
                <div className="mt-5 text-4xl font-semibold">{plan.price}</div>
                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className={`flex items-center gap-3 text-sm ${plan.featured ? "text-slate-100" : "text-slate-700"}`}>
                      <Check className={plan.featured ? "h-4 w-4 text-emerald-300" : "h-4 w-4 text-emerald-700"} />
                      {feature}
                    </div>
                  ))}
                </div>
                <Link to="/auth/teacher" className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold ${plan.featured ? "bg-white text-slate-950 hover:bg-slate-100" : "bg-slate-950 text-white hover:bg-slate-800"}`}>
                  Wybierz <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section id="dokumenty" className="mx-auto max-w-7xl px-5 py-20">
          <SectionHeader eyebrow="Dokumenty" title="Centrum dokumentow dla szkoly, IOD i administratora" text="Regulamin, prywatnosc, DPA i karta AI otwieraja sie w aplikacji oraz mozna je pobrac jako plik HTML." />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {documents.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <Icon className="h-6 w-6 text-slate-700" />
                  <h3 className="mt-4 text-xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setActiveDocument(item)} className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                      Otworz
                    </button>
                    <button type="button" onClick={() => downloadDocument(item)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                      Pobierz
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="rodo" className="mx-auto max-w-7xl px-5 py-20">
          <SectionHeader eyebrow="RODO" title="Zgodnosc i prywatnosc jako widoczna warstwa produktu" text="Minimalizacja danych, retencja, audyt, role i dokumenty sa pokazane wprost, bez szukania po ustawieniach." />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              [Database, "Minimalizacja danych", "Profil, wyniki, logi i eksporty sa rozdzielone jako osobne obszary."],
              [Clock3, "Retencja", "Czytelne okresy przechowywania wynikow, logow i zalacznikow."],
              [ShieldCheck, "Audyt", "Rejestr dostepu, zmian ocen i eksportow dokumentow."],
              [LockKeyhole, "Zabezpieczenia", "2FA, role, tokeny i kontrola dostepu."],
            ].map(([Icon, title, copy]) => {
              const TypedIcon = Icon as IconType;
              return (
                <div key={title as string} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <TypedIcon className="h-6 w-6 text-slate-700" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{copy as string}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-semibold text-slate-950">EduNex Exam OS</div>
            <div className="mt-1 text-sm text-slate-500">Premium platforma egzaminacyjna dla szkol.</div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-slate-600">
            {[
              ["Regulamin", "terms"],
              ["Prywatnosc", "privacy"],
              ["RODO/DPA", "dpa"],
              ["Karta AI", "ai"],
            ].map(([label, id]) => (
              <button key={id} type="button" onClick={() => setActiveDocument(getDocument(id as DocumentId))} className="rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
                {label}
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-400">{currentYear}</div>
        </div>
      </footer>
    </div>
  );
}
