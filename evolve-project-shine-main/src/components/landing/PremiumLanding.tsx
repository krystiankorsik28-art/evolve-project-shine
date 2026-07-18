import { useMemo, useState, type ComponentType, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  Layers3,
  LifeBuoy,
  LockKeyhole,
  Mail,
  MonitorDot,
  ReceiptText,
  School,
  SearchCheck,
  ServerCog,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

type IconType = ComponentType<{ className?: string }>;
type RoleKey = "teacher" | "student" | "school" | "admin";
type ContactFormState = {
  interest: string;
  email: string;
  institutionType: string;
  institutionSize: string;
  institutionName: string;
  firstName: string;
  lastName: string;
  phone: string;
  needs: string;
  marketingConsent: boolean;
};

const navItems = [
  ["Platforma", "#platforma"],
  ["Rozwiązania", "#rozwiazania"],
  ["Bezpieczeństwo", "#bezpieczenstwo"],
  ["Wdrożenie", "#wdrozenie"],
  ["Cennik", "#cennik"],
  ["Kontakt", "#kontakt"],
];

const productFacts = [
  ["4 role", "Spójne panele ucznia, nauczyciela, dyrekcji i administratora"],
  ["6-cyfrowy PIN", "Wejście ucznia do egzaminu bez zakładania pełnego konta"],
  ["NexAi", "Wsparcie tworzenia, nauki i oceniania pod nadzorem człowieka"],
  ["RODO", "Dokumenty, role, ślad działań i kontrola dostępu w produkcie"],
];

const institutionTypes = [
  "Szkoły podstawowe",
  "Szkoły średnie",
  "Zespoły szkół",
  "Placówki publiczne",
  "Centra szkoleniowe",
  "Organizacje edukacyjne",
];

const roles: Record<
  RoleKey,
  {
    icon: IconType;
    label: string;
    title: string;
    copy: string;
    points: string[];
    previewTitle: string;
    previewRows: Array<[string, string]>;
  }
> = {
  teacher: {
    icon: GraduationCap,
    label: "Nauczyciel",
    title: "Pełny pulpit pracy z egzaminami, klasami i materiałami",
    copy: "Nauczyciel przygotowuje sprawdzian, uruchamia sesję PIN, obserwuje przebieg i analizuje wyniki bez przechodzenia między przypadkowymi narzędziami.",
    points: [
      "Egzaminy i sprawdziany",
      "Sesje PIN na żywo",
      "Bank pytań i media",
      "Raporty i eksporty",
    ],
    previewTitle: "Dzień nauczyciela",
    previewRows: [
      ["08:00", "Matematyka — klasa 7B"],
      ["10:15", "Sesja PIN — 28 uczestników"],
      ["13:30", "Sprawdzenie odpowiedzi otwartych"],
    ],
  },
  student: {
    icon: UserRound,
    label: "Uczeń",
    title: "Proste wejście i spokojny tryb rozwiązywania egzaminu",
    copy: "Uczeń widzi jasne instrukcje, timer, postęp i pytania. Interfejs ogranicza rozproszenie i prowadzi krok po kroku do bezpiecznego oddania pracy.",
    points: [
      "Wejście kodem PIN",
      "Czytelny timer i postęp",
      "Automatyczny zapis",
      "Historia wyników",
    ],
    previewTitle: "Sesja ucznia",
    previewRows: [
      ["01", "Instrukcja i potwierdzenie danych"],
      ["02", "Pytania oraz zapis odpowiedzi"],
      ["03", "Podsumowanie i bezpieczne oddanie"],
    ],
  },
  school: {
    icon: School,
    label: "Dyrekcja",
    title: "Widok placówki, jakości pracy i gotowości operacyjnej",
    copy: "Dyrekcja otrzymuje uporządkowane wskaźniki, raporty klas, stan wdrożenia, dokumenty i informacje potrzebne do podejmowania decyzji.",
    points: [
      "Raporty zbiorcze",
      "Przegląd aktywności",
      "Dokumenty i zgodność",
      "Zarządzanie placówką",
    ],
    previewTitle: "Przegląd placówki",
    previewRows: [
      ["12", "aktywnych klas"],
      ["38", "nauczycieli w systemie"],
      ["94%", "ukończonych prac"],
    ],
  },
  admin: {
    icon: ServerCog,
    label: "Administrator",
    title: "Kontrola dostępu, ustawień i porządku organizacyjnego",
    copy: "Administrator zarządza rolami, zatwierdza konta, konfiguruje placówkę oraz śledzi działania istotne z punktu widzenia bezpieczeństwa.",
    points: ["Role i uprawnienia", "Zatwierdzanie kont", "Ustawienia organizacji", "Audyt działań"],
    previewTitle: "Centrum administracyjne",
    previewRows: [
      ["7", "oczekujących kont"],
      ["4", "role systemowe"],
      ["31", "zdarzeń w dzienniku audytu"],
    ],
  },
};

const platformPillars: Array<[IconType, string, string, string]> = [
  [
    MonitorDot,
    "Egzaminy i sesje PIN",
    "Od utworzenia pytań do wyników",
    "Tworzenie egzaminu, generowanie kodu, lista uczestników, automatyczny zapis i podsumowanie sesji w jednym procesie.",
  ],
  [
    Sparkles,
    "NexAi w procesie nauczania",
    "AI jako narzędzie, nie dekoracja",
    "Generator materiałów, tutor i wsparcie oceny są osadzone w konkretnych zadaniach, z kontrolą nauczyciela.",
  ],
  [
    BarChart3,
    "Dane i decyzje",
    "Wynik zamieniony w informację",
    "Raporty ucznia, klasy i placówki pomagają zauważyć postęp, luki oraz działania wymagające uwagi.",
  ],
];

const modules: Array<[IconType, string, string, string]> = [
  [
    MonitorDot,
    "Egzaminy online",
    "Rdzeń platformy",
    "Sesje PIN, status uczestników, pytania zamknięte i otwarte, multimedia oraz kontrolowane oddanie pracy.",
  ],
  [
    ClipboardCheck,
    "Bank pytań",
    "Wiedza do ponownego użycia",
    "Kategorie, warianty, media, poziom trudności i zestawy gotowe do kolejnych sprawdzianów.",
  ],
  [
    Sparkles,
    "NexAi",
    "Wsparcie dla nauczyciela i ucznia",
    "Tworzenie pytań, podpowiedzi edukacyjne, materiały i analiza odpowiedzi z jasną rolą człowieka.",
  ],
  [
    BookOpenCheck,
    "NexDziennik",
    "Własny e-dziennik EduNex",
    "Plan, oceny, zadania, frekwencja, klasy i komunikacja działają we wspólnym modelu danych EduNex.",
  ],
  [
    BarChart3,
    "Analityka",
    "Widok od ucznia do placówki",
    "Wyniki, średnie, postęp, porównania i raporty przygotowane do dalszej pracy szkoły.",
  ],
  [
    CalendarDays,
    "Plan pracy",
    "Terminy i organizacja",
    "Lekcje, sprawdziany, zadania, komunikaty i materiały w jednym uporządkowanym kalendarzu.",
  ],
  [
    FileCheck2,
    "Dokumenty",
    "Formalności dostępne od razu",
    "Regulaminy, prywatność, RODO, powierzenie danych i informacje o statusie systemu.",
  ],
  [
    ServerCog,
    "Administracja",
    "Kontrola organizacji",
    "Role, zatwierdzanie kont, ustawienia placówki, logi bezpieczeństwa i proces wdrożenia.",
  ],
];

const workflow = [
  [
    "01",
    "Przygotowanie",
    "Nauczyciel wybiera klasę, buduje egzamin, ustala czas, punktację i zasady sesji.",
  ],
  [
    "02",
    "Uruchomienie",
    "EduNex generuje PIN, przyjmuje uczniów i pokazuje status gotowości przed rozpoczęciem.",
  ],
  [
    "03",
    "Realizacja",
    "Odpowiedzi są zapisywane, postęp jest widoczny, a nauczyciel obserwuje przebieg sesji.",
  ],
  [
    "04",
    "Ocena i raport",
    "System porządkuje wyniki, odpowiedzi otwarte, certyfikaty i eksporty dla dalszej pracy.",
  ],
];

const securityItems: Array<[IconType, string, string]> = [
  [
    LockKeyhole,
    "Dostęp według roli",
    "Każdy użytkownik otrzymuje zakres funkcji dopasowany do roli i decyzji placówki.",
  ],
  [
    ShieldCheck,
    "Audyt i zdarzenia",
    "Istotne operacje mogą być rejestrowane, analizowane i dostępne dla administratora.",
  ],
  [
    SearchCheck,
    "Minimalizacja danych",
    "Uczeń może wejść do egzaminu kodem PIN bez tworzenia pełnego profilu w systemie.",
  ],
  [
    FileCheck2,
    "Dokumentacja w produkcie",
    "Regulamin, polityka prywatności i dokumenty RODO są częścią publicznego centrum dokumentów.",
  ],
  [
    ServerCog,
    "Ustawienia organizacji",
    "Placówka kontroluje role, zatwierdzanie kont, konfigurację oraz sposób korzystania z platformy.",
  ],
  [
    ReceiptText,
    "Eksport i retencja",
    "Wyniki i raporty mogą być porządkowane zgodnie z procesami oraz obowiązkami placówki.",
  ],
];

const implementationSteps = [
  [
    "1",
    "Rozpoznanie procesu",
    "Ustalamy role, rodzaje egzaminów, strukturę klas i sposób raportowania.",
  ],
  ["2", "Konfiguracja placówki", "Zakładamy organizację, role, konta i podstawowe zasady dostępu."],
  [
    "3",
    "Pilotaż",
    "Wybrana grupa nauczycieli prowadzi pierwsze sesje i przekazuje konkretne uwagi.",
  ],
  ["4", "Uruchomienie", "Rozszerzamy dostęp, porządkujemy dokumentację i ustalamy standard pracy."],
];

const plans = [
  {
    name: "Klasa",
    price: "99 zł",
    note: "miesięcznie",
    target: "Dla nauczyciela lub małego zespołu rozpoczynającego pracę cyfrową.",
    features: ["Egzaminy PIN", "Bank pytań", "Podstawowe raporty", "Dokumenty i zgody"],
    cta: "Rozpocznij",
  },
  {
    name: "Szkoła",
    price: "399 zł",
    note: "miesięcznie",
    target: "Dla placówki potrzebującej ról, klas, raportów i wspólnego standardu.",
    featured: true,
    features: [
      "Panel dyrekcji",
      "Role i zatwierdzanie",
      "NexDziennik",
      "NexAi",
      "Eksporty PDF/CSV",
    ],
    cta: "Wybierz plan Szkoła",
  },
  {
    name: "Instytucja",
    price: "Indywidualnie",
    note: "wdrożenie",
    target: "Dla większych organizacji, sieci placówek i szczególnych wymagań.",
    features: [
      "Audyt dostępu",
      "SLA",
      "Migracja danych",
      "Branding organizacji",
      "Wsparcie wdrożeniowe",
    ],
    cta: "Porozmawiajmy",
  },
];

const documents: Array<[IconType, string, string]> = [
  [ReceiptText, "Regulamin", "Zasady korzystania, role użytkowników i warunki świadczenia usługi."],
  [
    LockKeyhole,
    "Polityka prywatności",
    "Zakres danych, podstawy prawne, prawa osób i kontakt w sprawach prywatności.",
  ],
  [
    FileCheck2,
    "Powierzenie danych",
    "Podział obowiązków, przetwarzanie danych uczniów i wymagania dla placówki.",
  ],
  [
    ShieldCheck,
    "RODO i bezpieczeństwo",
    "Role, audyt, logi, retencja, szyfrowanie i minimalizacja danych.",
  ],
  [SearchCheck, "Dostępność", "Kontrast, klawiatura, formularze, responsywność i podstawy WCAG."],
];

const faq = [
  [
    "Czy uczeń musi zakładać konto?",
    "Nie. Nauczyciel może uruchomić sesję egzaminacyjną z 6-cyfrowym PIN-em. Uczeń podaje wymagane dane i przechodzi bezpośrednio do przypisanego egzaminu.",
  ],
  [
    "Czy EduNex jest tylko systemem egzaminacyjnym?",
    "Nie. Platforma obejmuje również klasy, bank pytań, raporty, własny NexDziennik, zadania, dokumenty, administrację i funkcje NexAi.",
  ],
  [
    "Jak działa logowanie pracowników szkoły?",
    "Nauczyciel, dyrekcja i administrator mogą korzystać z e-maila i hasła lub logowania społecznościowego skonfigurowanego przez placówkę, w tym Microsoft i Google.",
  ],
  [
    "Czy AI podejmuje decyzje za nauczyciela?",
    "Nie powinno. NexAi ma wspierać tworzenie i analizę, natomiast nauczyciel zachowuje kontrolę nad materiałem, oceną i publikacją wyniku.",
  ],
  [
    "Czy dokumenty prawne są publiczne?",
    "Tak. Centrum dokumentów jest dostępne bez logowania i obejmuje regulamin, prywatność, informacje RODO, powierzenie danych oraz dostępność.",
  ],
  [
    "Czy można rozpocząć od małego pilotażu?",
    "Tak. Wdrożenie można zacząć od jednej klasy lub zespołu, a następnie rozszerzyć role i zakres działania na całą placówkę.",
  ],
];

const initialContactForm: ContactFormState = {
  interest: "Wdrożenie w szkole",
  email: "",
  institutionType: "Szkoła podstawowa",
  institutionSize: "101-500 uczniów",
  institutionName: "",
  firstName: "",
  lastName: "",
  phone: "",
  needs: "",
  marketingConsent: true,
};

function ProductConsole() {
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.14)]">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-slate-950 text-white">
            <Layers3 className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-950">EduNex Console</div>
            <div className="text-[10px] text-slate-500">Zespół Szkół nr 1</div>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          System online
        </div>
      </div>

      <div className="grid min-h-[470px] grid-cols-[94px_1fr] sm:grid-cols-[132px_1fr]">
        <aside className="border-r border-slate-200 bg-slate-50 p-2.5 sm:p-3">
          <div className="space-y-1.5">
            {["Przegląd", "Egzaminy", "Klasy", "Wyniki", "NexAi", "Dokumenty"].map(
              (item, index) => (
                <div
                  key={item}
                  className={`rounded-md px-2.5 py-2 text-[10px] font-medium sm:text-xs ${
                    index === 0 ? "bg-slate-950 text-white" : "text-slate-500"
                  }`}
                >
                  {item}
                </div>
              ),
            )}
          </div>
          <div className="mt-6 rounded-md border border-slate-200 bg-white p-2.5">
            <div className="text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Plan
            </div>
            <div className="mt-1 text-[10px] font-semibold text-slate-900 sm:text-xs">Szkoła</div>
            <div className="mt-1 text-[9px] leading-4 text-slate-500">Pełny dostęp organizacji</div>
          </div>
        </aside>

        <div className="min-w-0 bg-[#f7f8fa] p-3 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                Przegląd operacyjny
              </div>
              <div className="mt-1 text-base font-semibold text-slate-950 sm:text-xl">
                Dzień dobry, Anna
              </div>
            </div>
            <div className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[9px] font-medium text-slate-500 sm:text-[10px]">
              11 lipca 2026
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              ["12", "aktywnych klas"],
              ["3", "sesje dzisiaj"],
              ["91%", "oddanych prac"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="text-lg font-semibold text-slate-950 sm:text-2xl">{value}</div>
                <div className="mt-1 text-[9px] leading-4 text-slate-500 sm:text-[10px]">
                  {label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] text-slate-500">Aktywna sesja egzaminacyjna</div>
                  <div className="mt-1 text-xs font-semibold text-slate-950 sm:text-sm">
                    Matematyka — klasa 7B
                  </div>
                </div>
                <div className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-semibold text-blue-800">
                  NA ŻYWO
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-slate-950 p-4 text-white">
                <div className="text-[9px] uppercase tracking-[0.12em] text-white/50">
                  Kod wejścia
                </div>
                <div className="mt-2 text-2xl font-semibold tracking-[0.12em] sm:text-3xl">
                  482 913
                </div>
                <div className="mt-3 flex items-center justify-between text-[9px] text-white/60 sm:text-[10px]">
                  <span>28 uczestników</span>
                  <span>16 min pozostało</span>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {[
                  ["Oddane", "24 / 28", "86%"],
                  ["W trakcie", "4 osoby", "64%"],
                ].map(([label, value, width]) => (
                  <div key={label}>
                    <div className="mb-1.5 flex justify-between text-[9px] text-slate-500 sm:text-[10px]">
                      <span>{label}</span>
                      <span>{value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="h-full rounded-full bg-[#0067b8]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#0067b8]" />
                  <div className="text-xs font-semibold text-slate-950">NexAi — obserwacja</div>
                </div>
                <p className="mt-2 text-[10px] leading-5 text-slate-500">
                  Pytanie 6 ma wyraźnie niższą skuteczność. Sprawdź treść przed publikacją kolejnej
                  wersji.
                </p>
                <button className="mt-3 text-[10px] font-semibold text-[#0067b8]">
                  Zobacz analizę
                </button>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3.5">
                <div className="text-xs font-semibold text-slate-950">Najbliższe działania</div>
                <div className="mt-3 space-y-2.5">
                  {[
                    ["10:45", "Zamknięcie sesji 7B"],
                    ["12:00", "Publikacja wyników"],
                    ["14:30", "Rada zespołu"],
                  ].map(([time, item]) => (
                    <div key={item} className="flex gap-2 text-[9px] leading-4 sm:text-[10px]">
                      <span className="w-9 shrink-0 font-semibold text-slate-400">{time}</span>
                      <span className="text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  text,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  text: string;
  align?: "center" | "left";
}) {
  const alignment = align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl";

  return (
    <div className={alignment}>
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0067b8]">
        {eyebrow}
      </div>
      <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-8 text-slate-600">{text}</p>
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(initialContactForm);

  const update = <K extends keyof ContactFormState>(key: K, value: ContactFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (
      !form.email.trim() ||
      !form.institutionName.trim() ||
      !form.firstName.trim() ||
      !form.lastName.trim()
    ) {
      toast.error("Uzupełnij wymagane pola formularza.");
      return;
    }

    const subject = encodeURIComponent(`Kontakt EduNex: ${form.institutionName}`);
    const body = encodeURIComponent(
      [
        `Co interesuje placówkę: ${form.interest}`,
        `E-mail: ${form.email}`,
        `Typ placówki: ${form.institutionType}`,
        `Wielkość placówki: ${form.institutionSize}`,
        `Nazwa placówki: ${form.institutionName}`,
        `Imię i nazwisko: ${form.firstName} ${form.lastName}`,
        `Telefon: ${form.phone || "-"}`,
        `Zgoda marketingowa: ${form.marketingConsent ? "tak" : "nie"}`,
        "",
        "Potrzeby:",
        form.needs || "-",
      ].join("\n"),
    );

    window.location.href = `mailto:kontakt@edunex.pl?subject=${subject}&body=${body}`;
    toast.success("Dziękujemy, skontaktujemy się.");
  };

  const fieldClass =
    "h-12 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#0067b8] focus:ring-1 focus:ring-[#0067b8]";

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.09)] sm:p-7"
    >
      <div className="mb-6">
        <div className="text-sm font-semibold text-slate-950">Dane do rozmowy wdrożeniowej</div>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Odpowiadamy na podstawie potrzeb konkretnej placówki.
        </p>
      </div>
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Zakres rozmowy
          <select
            value={form.interest}
            onChange={(event) => update("interest", event.target.value)}
            className={fieldClass}
          >
            <option>Wdrożenie w szkole</option>
            <option>Egzaminy PIN</option>
            <option>NexAi i generator</option>
            <option>NexDziennik i eksport ocen</option>
            <option>Oferta dla instytucji</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Służbowy adres e-mail *
          <input
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            type="email"
            placeholder="anna.nowak@szkola.pl"
            className={fieldClass}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Typ placówki
            <select
              value={form.institutionType}
              onChange={(event) => update("institutionType", event.target.value)}
              className={fieldClass}
            >
              <option>Szkoła podstawowa</option>
              <option>Szkoła średnia</option>
              <option>Zespół szkół</option>
              <option>Uczelnia</option>
              <option>Organ prowadzący</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Wielkość placówki
            <select
              value={form.institutionSize}
              onChange={(event) => update("institutionSize", event.target.value)}
              className={fieldClass}
            >
              <option>1-100 uczniów</option>
              <option>101-500 uczniów</option>
              <option>501-1000 uczniów</option>
              <option>1001-5000 uczniów</option>
              <option>5001+ uczniów</option>
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Nazwa placówki *
          <input
            value={form.institutionName}
            onChange={(event) => update("institutionName", event.target.value)}
            placeholder="Nazwa szkoły lub instytucji"
            className={fieldClass}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Imię *
            <input
              value={form.firstName}
              onChange={(event) => update("firstName", event.target.value)}
              placeholder="Anna"
              className={fieldClass}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Nazwisko *
            <input
              value={form.lastName}
              onChange={(event) => update("lastName", event.target.value)}
              placeholder="Nowak"
              className={fieldClass}
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Numer telefonu
          <input
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder="+48 000 000 000"
            className={fieldClass}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Najważniejsze potrzeby
          <textarea
            value={form.needs}
            onChange={(event) => update("needs", event.target.value)}
            rows={4}
            placeholder="Liczba klas, rodzaje egzaminów, obecny sposób pracy i oczekiwany zakres wdrożenia."
            className="resize-none rounded-md border border-slate-300 bg-white px-3 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#0067b8] focus:ring-1 focus:ring-[#0067b8]"
          />
        </label>

        <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
          <input
            type="checkbox"
            checked={form.marketingConsent}
            onChange={(event) => update("marketingConsent", event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0067b8]"
          />
          <span>
            Chcę otrzymywać informacje o EduNex i wdrożeniach. Szczegóły znajdują się w{" "}
            <Link to="/dokumenty" className="font-semibold text-[#0067b8] hover:text-[#004f8b]">
              dokumentach
            </Link>
            .
          </span>
        </label>

        <button className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#0067b8] px-5 text-sm font-semibold text-white transition hover:bg-[#005a9e]">
          Umów rozmowę
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

export function PremiumLanding() {
  const [role, setRole] = useState<RoleKey>("teacher");
  const activeRole = roles[role];
  const roleEntries = useMemo(
    () => Object.entries(roles) as Array<[RoleKey, typeof activeRole]>,
    [],
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f7f7f8] text-slate-950">
      <Toaster richColors />

      <div className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex min-h-10 max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-xs text-slate-300 sm:px-6">
          <span className="hidden rounded-full bg-white/10 px-2 py-0.5 font-semibold text-white sm:inline">
            Nowość
          </span>
          <span>Nowy portal dostępu dla nauczyciela, ucznia, dyrekcji i administratora.</span>
          <Link
            to="/auth"
            className="inline-flex shrink-0 items-center gap-1 font-semibold text-white"
          >
            Zobacz
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0067b8]/30"
          >
            <div className="grid h-9 w-9 place-items-center rounded-md bg-slate-950 text-white">
              <Layers3 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-4">EduNex</div>
              <div className="hidden text-xs text-slate-500 sm:block">System operacyjny szkoły</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 xl:flex">
            <Link
              to="/edziennik"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              NexDziennik
            </Link>
            <Link
              to="/pomoc"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              Pomoc
            </Link>
            {navItems.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/auth"
              className="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Logowanie
            </Link>
            <Link
              to="/auth/register"
              className="inline-flex h-9 items-center justify-center rounded-md bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:px-4"
            >
              Załóż konto
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-slate-200 bg-white">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[linear-gradient(180deg,rgba(0,103,184,0.07),rgba(255,255,255,0))]" />
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-[#0067b8]" />
                Platforma dla szkół i instytucji edukacyjnych
              </div>
              <h1 className="mt-7 max-w-3xl text-4xl font-semibold leading-[1.03] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-[4.6rem]">
                Jedno środowisko do prowadzenia cyfrowej pracy szkoły.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                EduNex łączy bezpieczne egzaminy, klasy, raporty, własny NexDziennik, dokumenty i
                NexAi w produkcie zaprojektowanym dla codziennej pracy nauczyciela oraz zarządzania
                placówką.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/auth/register"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#0067b8] px-5 text-sm font-semibold text-white transition hover:bg-[#005a9e]"
                >
                  Rozpocznij pracę
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#kontakt"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Porozmawiaj o wdrożeniu
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs text-slate-500">
                {[
                  "Dostęp według roli",
                  "Wejście ucznia kodem PIN",
                  "Dokumenty publiczne",
                  "Kontrola człowieka nad AI",
                ].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#0067b8]" />
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="relative z-10 min-w-0"
            >
              <ProductConsole />
            </motion.div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-[#f7f7f8]">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Projektowany dla różnych typów organizacji
            </div>
            <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-3 lg:grid-cols-6">
              {institutionTypes.map((item) => (
                <div
                  key={item}
                  className="flex min-h-16 items-center justify-center bg-white px-3 text-center text-xs font-semibold text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Produkt"
              title="Nie kolejna aplikacja. Wspólny standard pracy placówki."
              text="EduNex porządkuje najważniejsze procesy edukacyjne i administracyjne tak, aby każdy użytkownik widział właściwe zadania, dane i decyzje."
            />
            <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 lg:grid-cols-3">
              {platformPillars.map(([Icon, title, subtitle, text]) => (
                <div key={title} className="bg-white p-6 sm:p-8">
                  <div className="grid h-11 w-11 place-items-center rounded-md bg-slate-950 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-6 text-xs font-semibold uppercase tracking-[0.1em] text-[#0067b8]">
                    {subtitle}
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
              {productFacts.map(([value, label]) => (
                <div key={value} className="bg-[#f8f9fa] p-5">
                  <div className="text-2xl font-semibold tracking-tight text-slate-950">
                    {value}
                  </div>
                  <div className="mt-2 text-xs leading-5 text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="platforma" className="border-y border-slate-200 bg-[#f7f7f8] py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
              <SectionHeader
                eyebrow="Platforma"
                title="Moduły połączone jednym językiem produktu"
                text="Funkcje są rozbudowane, ale użytkownik nie musi poznawać całego systemu. Każdy panel pokazuje zadania istotne dla konkretnej roli."
                align="left"
              />
              <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600">
                <div className="font-semibold text-slate-950">Zasada projektowa EduNex</div>
                <p className="mt-2">
                  Mniej ekranów bez celu, więcej zamkniętych procesów: przygotuj, uruchom, sprawdź,
                  zdecyduj i udokumentuj.
                </p>
              </div>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {modules.map(([Icon, title, label, text], index) => (
                <motion.article
                  key={title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: Math.min(index * 0.04, 0.2) }}
                  className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-md bg-slate-100 text-slate-800 transition group-hover:bg-slate-950 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="mt-5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0067b8]">
                    {label}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 lg:grid-cols-[1.18fr_.82fr]">
              <article className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0b1728_0%,#123861_62%,#0f6cbd_100%)] p-7 text-white shadow-[0_28px_80px_rgba(15,23,42,.16)] sm:p-10">
                <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -right-6 -top-6 h-44 w-44 rounded-full border border-white/10" />
                <div className="relative max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-blue-100">
                    <BookOpenCheck className="h-4 w-4" />
                    Nowy produkt EduNex
                  </div>
                  <h2 className="mt-6 text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-5xl">
                    Poznaj NexDziennik.
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                    Plan, klasy, oceny, frekwencja, zadania i wiadomości są częścią tego samego
                    środowiska — bez przeskakiwania między niepowiązanymi narzędziami.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-2 text-xs text-blue-50">
                    {["Plan dnia", "Frekwencja", "Oceny", "Wiadomości"].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/12 bg-white/[0.07] px-3 py-2"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <Link
                    to="/edziennik"
                    className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-blue-50"
                  >
                    Otwórz stronę NexDziennika
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>

              <article className="flex flex-col rounded-2xl border border-slate-200 bg-[#f7f7f8] p-7 sm:p-10">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[#0067b8] shadow-sm">
                  <LifeBuoy className="h-5 w-5" />
                </span>
                <div className="mt-7 text-xs font-semibold uppercase tracking-[0.13em] text-[#0067b8]">
                  Oddzielne Centrum Pomocy
                </div>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
                  Odpowiedź zanim powstanie zgłoszenie.
                </h2>
                <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">
                  Wyszukiwarka, pierwsze kroki, konta i role, NexDziennik, egzaminy PIN, NexAI oraz
                  bezpieczeństwo — dostępne publicznie.
                </p>
                <Link
                  to="/pomoc"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#0067b8] hover:text-[#004f8b]"
                >
                  Przejdź do Centrum Pomocy
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section id="rozwiazania" className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Przepływ pracy"
              title="Od pomysłu nauczyciela do raportu dla szkoły"
              text="Najważniejszy proces EduNex jest zamknięty w czterech czytelnych etapach. Każdy etap ma konkretny rezultat i właściciela."
            />
            <div className="mt-12 grid gap-4 lg:grid-cols-4">
              {workflow.map(([step, title, text], index) => (
                <div
                  key={step}
                  className="relative rounded-xl border border-slate-200 bg-white p-6"
                >
                  {index < workflow.length - 1 && (
                    <div className="absolute -right-3 top-10 z-10 hidden h-px w-6 bg-slate-300 lg:block" />
                  )}
                  <div className="text-xs font-semibold text-[#0067b8]">ETAP {step}</div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-950">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="panele" className="border-y border-slate-200 bg-[#f7f7f8] py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr]">
              <div>
                <SectionHeader
                  eyebrow="Role użytkowników"
                  title="Jeden system. Cztery różne perspektywy."
                  text="Każda rola otrzymuje własny zakres informacji i działań, przy zachowaniu spójnego sposobu obsługi całej platformy."
                  align="left"
                />
                <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
                  {roleEntries.map(([key, item]) => {
                    const Icon = item.icon;
                    const selected = role === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setRole(key)}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm font-semibold transition ${
                          selected
                            ? "border-[#0067b8] bg-white text-slate-950 shadow-sm"
                            : "border-slate-200 bg-transparent text-slate-500 hover:bg-white"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${selected ? "text-[#0067b8]" : "text-slate-400"}`}
                        />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={role}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
                >
                  <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="p-6 sm:p-8">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0067b8]">
                        Panel: {activeRole.label}
                      </div>
                      <h3 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-slate-950">
                        {activeRole.title}
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-slate-600">{activeRole.copy}</p>
                      <div className="mt-7 grid gap-3 sm:grid-cols-2">
                        {activeRole.points.map((point) => (
                          <div
                            key={point}
                            className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-medium text-slate-700"
                          >
                            <Check className="h-4 w-4 text-[#0067b8]" />
                            {point}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-slate-200 bg-slate-950 p-6 text-white lg:border-l lg:border-t-0 sm:p-8">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-200">
                        {activeRole.previewTitle}
                      </div>
                      <div className="mt-6 space-y-3">
                        {activeRole.previewRows.map(([value, label], index) => (
                          <motion.div
                            key={`${value}-${label}`}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.06 }}
                            className="rounded-lg border border-white/10 bg-white/[0.06] p-4"
                          >
                            <div className="text-xs font-semibold text-blue-200">{value}</div>
                            <div className="mt-1 text-sm leading-6 text-slate-200">{label}</div>
                          </motion.div>
                        ))}
                      </div>
                      <div className="mt-6 border-t border-white/10 pt-5 text-xs leading-5 text-slate-400">
                        Widok demonstracyjny pokazujący sposób organizacji pracy danej roli.
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-white">
              <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                <div className="p-7 sm:p-10 lg:p-12">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-200">
                    <Sparkles className="h-4 w-4" />
                    NexAi
                  </div>
                  <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
                    AI osadzone w odpowiedzialnym procesie edukacyjnym.
                  </h2>
                  <p className="mt-5 text-sm leading-7 text-slate-300 sm:text-base">
                    NexAi wspiera tworzenie pytań, materiałów, analizę postępu i pracę ucznia. Wynik
                    modelu nie zastępuje decyzji nauczyciela — ma ją przygotować i ułatwić.
                  </p>
                  <Link
                    to="/auth"
                    className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                  >
                    Przejdź do platformy
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="border-t border-white/10 bg-white/[0.04] p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      [
                        "Generator pytań",
                        "Tworzy propozycje na podstawie tematu, poziomu i rodzaju odpowiedzi.",
                      ],
                      [
                        "Tutor ucznia",
                        "Prowadzi przez materiał, zamiast natychmiast podawać gotowy wynik.",
                      ],
                      [
                        "Wsparcie oceny",
                        "Porządkuje odpowiedzi otwarte i wskazuje elementy wymagające uwagi.",
                      ],
                      [
                        "Analiza postępu",
                        "Łączy wyniki w obserwacje przydatne dla nauczyciela i ucznia.",
                      ],
                    ].map(([title, text], index) => (
                      <div
                        key={title}
                        className="rounded-lg border border-white/10 bg-white/[0.05] p-5"
                      >
                        <div className="text-xs font-semibold text-blue-200">0{index + 1}</div>
                        <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
                        <p className="mt-2 text-xs leading-6 text-slate-300">{text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-lg border border-blue-300/20 bg-blue-300/10 p-5">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-200" />
                      <div>
                        <div className="text-sm font-semibold text-white">
                          Kontrola człowieka pozostaje obowiązkowa
                        </div>
                        <p className="mt-1 text-xs leading-6 text-slate-300">
                          Nauczyciel zatwierdza treść, kryteria, ocenę i publikację rezultatów.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="bezpieczenstwo"
          className="border-y border-slate-200 bg-[#f7f7f8] py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <SectionHeader
                  eyebrow="Bezpieczeństwo i zgodność"
                  title="Dane uczniów wymagają produktu zaprojektowanego poważnie."
                  text="Bezpieczeństwo EduNex obejmuje warstwę dostępu, organizację ról, dokumentację, rejestrowanie zdarzeń i sposób przetwarzania danych."
                  align="left"
                />
                <Link
                  to="/dokumenty"
                  className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#0067b8] hover:text-[#004f8b]"
                >
                  Otwórz centrum dokumentów
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
                {securityItems.map(([Icon, title, text]) => (
                  <div key={title} className="bg-white p-5 sm:p-6">
                    <Icon className="h-5 w-5 text-[#0067b8]" />
                    <h3 className="mt-4 text-sm font-semibold text-slate-950">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="wdrozenie" className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
              <div className="lg:sticky lg:top-24">
                <SectionHeader
                  eyebrow="Wdrożenie"
                  title="Rozpocznij od pilotażu, nie od wielomiesięcznego projektu."
                  text="Zakres można dopasować do jednej klasy, zespołu nauczycieli albo całej organizacji. Najpierw zamykamy podstawowy proces, później rozszerzamy moduły."
                  align="left"
                />
                <div className="mt-8 rounded-xl border border-slate-200 bg-[#f7f7f8] p-5">
                  <div className="text-sm font-semibold text-slate-950">
                    Rezultat pierwszego etapu
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Nauczyciel potrafi przygotować egzamin, uruchomić PIN, odebrać pracę i pobrać
                    raport bez pomocy technicznej.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {implementationSteps.map(([step, title, text]) => (
                  <div
                    key={step}
                    className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-[64px_1fr] sm:p-6"
                  >
                    <div className="grid h-12 w-12 place-items-center rounded-md bg-slate-950 text-sm font-semibold text-white">
                      {step}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="cennik" className="border-y border-slate-200 bg-[#f7f7f8] py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Plany"
              title="Zakres dopasowany do skali organizacji"
              text="Jasny punkt startowy dla nauczyciela, kompletna wersja dla szkoły oraz indywidualny model dla większej instytucji."
            />
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {plans.map((plan) => (
                <article
                  key={plan.name}
                  className={`flex min-h-[430px] flex-col rounded-xl border p-6 shadow-sm ${
                    plan.featured
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-950"
                  }`}
                >
                  <div
                    className={`text-sm font-semibold ${plan.featured ? "text-blue-200" : "text-[#0067b8]"}`}
                  >
                    {plan.name}
                  </div>
                  <div className="mt-5 flex flex-wrap items-end gap-2">
                    <div className="text-4xl font-semibold tracking-tight">{plan.price}</div>
                    <div
                      className={`pb-1 text-sm ${plan.featured ? "text-slate-300" : "text-slate-500"}`}
                    >
                      {plan.note}
                    </div>
                  </div>
                  <p
                    className={`mt-4 text-sm leading-7 ${plan.featured ? "text-slate-300" : "text-slate-600"}`}
                  >
                    {plan.target}
                  </p>
                  <div className="mt-7 space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3 text-sm">
                        <Check
                          className={`h-4 w-4 ${plan.featured ? "text-blue-200" : "text-[#0067b8]"}`}
                        />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <a
                    href="#kontakt"
                    className={`mt-auto inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition ${
                      plan.featured
                        ? "bg-white text-slate-950 hover:bg-slate-100"
                        : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    {plan.cta}
                  </a>
                </article>
              ))}
            </div>
            <p className="mt-5 text-center text-xs leading-5 text-slate-500">
              Podane ceny i zakresy mogą zostać dopasowane do finalnego modelu wdrożenia oraz liczby
              użytkowników.
            </p>
          </div>
        </section>

        <section id="dokumenty" className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Centrum dokumentów"
              title="Formalności widoczne przed rozpoczęciem współpracy"
              text="Placówka może zapoznać się z zasadami działania, prywatnością, bezpieczeństwem i dostępnością bez logowania do systemu."
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {documents.map(([Icon, title, text]) => (
                <Link
                  key={title}
                  to="/dokumenty"
                  className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_16px_45px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Icon className="h-5 w-5 text-[#0067b8]" />
                    <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600" />
                  </div>
                  <h3 className="mt-5 text-sm font-semibold text-slate-950">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-[#f7f7f8] py-20 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="FAQ"
              title="Najważniejsze pytania przed wdrożeniem"
              text="Odpowiedzi dotyczące dostępu ucznia, zakresu platformy, AI, dokumentów i sposobu rozpoczęcia pracy."
            />
            <div className="mt-10 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {faq.map(([question, answer]) => (
                <details key={question} className="group p-5 sm:p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-950">
                    {question}
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-90" />
                  </summary>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="kontakt" className="bg-white py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.82fr_1fr] lg:px-8">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0067b8]">
                Kontakt i wdrożenie
              </div>
              <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-6xl">
                Zbudujmy spokojny standard cyfrowej pracy Twojej placówki.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
                Rozmowa zaczyna się od procesu, nie od listy funkcji. Określamy role, rodzaje
                egzaminów, sposób pracy nauczycieli oraz dane potrzebne dyrekcji.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  "Dobór zakresu do liczby klas i użytkowników.",
                  "Pilotaż najważniejszego procesu egzaminacyjnego.",
                  "Omówienie ról, dostępu, dokumentów i bezpieczeństwa.",
                  "Plan rozszerzania platformy bez chaosu wdrożeniowego.",
                ].map((item) => (
                  <div key={item} className="flex gap-3 text-sm leading-7 text-slate-700">
                    <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-slate-300 bg-white">
                      <Check className="h-3 w-3 text-[#0067b8]" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-9 rounded-xl border border-slate-200 bg-[#f7f7f8] p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                  Kontakt
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm font-semibold text-slate-950">
                  <Mail className="h-5 w-5 text-[#0067b8]" />
                  kontakt@edunex.pl
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Wiadomość z formularza zostanie przygotowana w domyślnej aplikacji pocztowej.
                </p>
              </div>
            </div>
            <ContactForm />
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-950 text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <div className="text-2xl font-semibold">Gotowy, aby zobaczyć EduNex od środka?</div>
              <p className="mt-2 text-sm text-slate-300">
                Przejdź do portalu dostępu albo rozpocznij konfigurację konta.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/auth"
                className="inline-flex h-11 items-center justify-center rounded-md border border-white/20 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Logowanie
              </Link>
              <Link
                to="/auth/register"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Załóż konto
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-md bg-slate-950 text-white">
                  <Layers3 className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-950">EduNex</div>
                  <div className="text-xs text-slate-500">System operacyjny szkoły</div>
                </div>
              </div>
              <p className="mt-4 max-w-sm text-xs leading-6 text-slate-500">
                Egzaminy, klasy, raporty, NexDziennik, dokumenty i odpowiedzialnie wdrażane funkcje
                AI w jednym środowisku.
              </p>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                Produkt
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <a href="#platforma" className="block hover:text-slate-950">
                  Platforma
                </a>
                <a href="#panele" className="block hover:text-slate-950">
                  Panele
                </a>
                <a href="#cennik" className="block hover:text-slate-950">
                  Plany
                </a>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                Organizacja
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <a href="#wdrozenie" className="block hover:text-slate-950">
                  Wdrożenie
                </a>
                <a href="#bezpieczenstwo" className="block hover:text-slate-950">
                  Bezpieczeństwo
                </a>
                <a href="#kontakt" className="block hover:text-slate-950">
                  Kontakt
                </a>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                Dostęp
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <Link to="/auth" className="block hover:text-slate-950">
                  Logowanie
                </Link>
                <Link to="/auth/register" className="block hover:text-slate-950">
                  Rejestracja
                </Link>
                <Link to="/edziennik" className="block hover:text-slate-950">
                  NexDziennik
                </Link>
                <Link to="/pomoc" className="block hover:text-slate-950">
                  Centrum Pomocy
                </Link>
                <Link to="/dokumenty" className="block hover:text-slate-950">
                  Dokumenty
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 EduNex. Platforma edukacyjna dla szkół i instytucji.</span>
            <span>edunex.pl</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
