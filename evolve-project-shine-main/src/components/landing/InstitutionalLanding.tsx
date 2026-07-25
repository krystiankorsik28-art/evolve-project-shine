import { useState, type AriaAttributes, type ComponentType, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Accessibility,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Building2,
  Check,
  ChevronDown,
  ClipboardCheck,
  Database,
  FileClock,
  FileText,
  GraduationCap,
  KeyRound,
  Layers3,
  LifeBuoy,
  LockKeyhole,
  Mail,
  Menu,
  MonitorCheck,
  Network,
  School,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Send,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Toaster } from "@/components/ui/sonner";
import { submitContact } from "@/lib/contact.functions";

type IconType = ComponentType<{
  className?: string;
  "aria-hidden"?: AriaAttributes["aria-hidden"];
}>;
type AudienceKey = "men" | "samorzad" | "dyrekcja" | "nauczyciel" | "uczen" | "it";

const nav = [
  ["Produkt", "#produkt"],
  ["Rozwiązania", "#rozwiazania"],
  ["Dla instytucji", "#odbiorcy"],
  ["Cennik", "/cennik"],
  ["Bezpieczeństwo", "#bezpieczenstwo"],
  ["Kontakt", "#kontakt"],
] as const;

const problems: Array<[IconType, string, string]> = [
  [
    Layers3,
    "Rozproszone narzędzia",
    "Egzaminy, arkusze, komunikacja i raporty działają bez wspólnego kontekstu.",
  ],
  [
    ClipboardCheck,
    "Ręczne procesy",
    "Przygotowanie sesji i porządkowanie wyników zabierają czas nauczyciela.",
  ],
  [
    BarChart3,
    "Dane bez ciągłości",
    "Pojedynczy wynik rzadko pokazuje czytelny obraz postępu ucznia i klasy.",
  ],
  [
    FileClock,
    "Trudne raportowanie",
    "Zestawienia dla dyrekcji i organu prowadzącego są często składane ręcznie.",
  ],
];

const workflow = [
  ["01", "Przygotowanie", "Nauczyciel buduje egzamin, ustala zasady, czas i punktację."],
  ["02", "Bezpieczna sesja", "EduNex tworzy kod dostępu i kontroluje gotowość uczestników."],
  ["03", "Praca uczniów", "Odpowiedzi zapisują się automatycznie, a postęp jest widoczny."],
  ["04", "Ocena", "System porządkuje wyniki i odpowiedzi wymagające weryfikacji."],
  ["05", "Raport", "Nauczyciel otrzymuje wyniki i dane gotowe do dalszej pracy."],
];

const audiences: Record<
  AudienceKey,
  {
    label: string;
    icon: IconType;
    title: string;
    description: string;
    points: string[];
    metric: string;
  }
> = {
  men: {
    label: "Instytucje centralne",
    icon: Building2,
    title: "Porównywalny obraz pilotażu bez ingerencji w codzienną pracę szkoły",
    description:
      "Warstwa instytucjonalna może porządkować zagregowane dane, statusy programów i standard raportowania. Zakres wymaga uzgodnienia organizacyjnego i prawnego.",
    points: [
      "Zestawienia pilotażowe",
      "Wspólny standard raportu",
      "Rozdzielenie danych operacyjnych i zagregowanych",
    ],
    metric: "3 poziomy raportowania",
  },
  samorzad: {
    label: "Samorząd",
    icon: Network,
    title: "Spójny widok placówek i ich gotowości operacyjnej",
    description:
      "Organ prowadzący może otrzymać uporządkowany obraz wykorzystania platformy, postępu wdrożenia i obszarów wymagających wsparcia.",
    points: [
      "Widok szkół objętych wdrożeniem",
      "Raporty bez zbędnych danych uczniów",
      "Eksporty do dalszej analizy",
    ],
    metric: "4 obszary nadzoru",
  },
  dyrekcja: {
    label: "Dyrekcja",
    icon: School,
    title: "Jedno centrum organizacji pracy i jakości procesów",
    description:
      "Dyrekcja widzi aktywność klas, stan sesji, raporty oraz konfigurację ról bez przeglądania wielu niezależnych usług.",
    points: [
      "Przegląd klas i egzaminów",
      "Zatwierdzanie kont i ról",
      "Dokumentacja oraz historia działań",
    ],
    metric: "6 obszarów placówki",
  },
  nauczyciel: {
    label: "Nauczyciel",
    icon: GraduationCap,
    title: "Cały proces egzaminacyjny w jednym uporządkowanym pulpicie",
    description:
      "Od banku pytań i uruchomienia sesji PIN po sprawdzenie odpowiedzi, publikację wyników i analizę postępu.",
    points: [
      "Egzaminy i bank pytań",
      "Sesje PIN oraz monitoring",
      "Raporty i materiały wspierane przez NexAI",
    ],
    metric: "5 kroków procesu",
  },
  uczen: {
    label: "Uczeń",
    icon: UserRound,
    title: "Spokojny tryb pracy z jasną informacją o postępie",
    description:
      "Uczeń dołącza kodem, otrzymuje jednoznaczne instrukcje i pracuje w interfejsie ograniczającym rozproszenie.",
    points: [
      "Dołączenie kodem PIN",
      "Automatyczny zapis odpowiedzi",
      "Czytelny timer i podsumowanie",
    ],
    metric: "6 cyfr kodu sesji",
  },
  it: {
    label: "Administrator IT",
    icon: ServerCog,
    title: "Kontrola tożsamości, konfiguracji i zdarzeń systemowych",
    description:
      "Administrator zarządza rolami i ustawieniami organizacji, a operacje uprzywilejowane pozostają oddzielone od pracy nauczyciela.",
    points: [
      "Role i uprawnienia organizacji",
      "Zarządzanie sesjami",
      "Dziennik zdarzeń wymagających kontroli",
    ],
    metric: "4 podstawowe role",
  },
};

const capabilities: Array<[IconType, string, string, "Dostępne" | "Rozwijane"]> = [
  [
    MonitorCheck,
    "Cyfrowe sesje",
    "Kody dostępu, czas, pytania i bieżący stan uczestników.",
    "Dostępne",
  ],
  [
    Database,
    "Bank pytań",
    "Kategorie, poziomy trudności i materiały do ponownego użycia.",
    "Dostępne",
  ],
  [
    BarChart3,
    "Wyniki i raporty",
    "Widok ucznia, klasy oraz eksport do dalszej analizy.",
    "Dostępne",
  ],
  [
    Users,
    "Role i panele",
    "Oddzielne środowiska dla ucznia, nauczyciela i administracji.",
    "Dostępne",
  ],
  [Sparkles, "NexAI", "Wsparcie tworzenia i analizy pod kontrolą nauczyciela.", "Rozwijane"],
  [BookOpenCheck, "NexDziennik", "Lekcje, frekwencja, oceny i komunikacja.", "Rozwijane"],
];

const security: Array<[IconType, string, string]> = [
  [
    KeyRound,
    "Kontrola dostępu",
    "Uprawnienia wynikają z zatwierdzonej roli i kontekstu organizacji.",
  ],
  [
    LockKeyhole,
    "Ochrona sesji",
    "Logowanie, odzyskiwanie dostępu i aktywne sesje tworzą jeden proces.",
  ],
  [
    FileText,
    "Ślad działań",
    "Istotne operacje mogą być rejestrowane i dostępne dla uprawnionego nadzoru.",
  ],
  [
    Database,
    "Minimalizacja danych",
    "Zakres danych jest ograniczany do informacji potrzebnych w danym procesie.",
  ],
];

const faq = [
  [
    "Czy EduNex posiada formalne zatwierdzenie MEN?",
    "Nie. EduNex jest niezależnym projektem przygotowywanym do rozmów, pilotaży i formalnej oceny. Nie sugerujemy istniejącego partnerstwa ani zatwierdzenia.",
  ],
  [
    "Gdzie przechowywane są dane?",
    "Projekt wykorzystuje zarządzaną infrastrukturę aplikacyjną i bazodanową. Docelowy model lokalizacji, retencji i powierzenia danych musi zostać określony dla konkretnego wdrożenia.",
  ],
  [
    "Czy uczeń musi zakładać konto?",
    "Nie zawsze. Nauczyciel może uruchomić sesję z sześciocyfrowym kodem. Uczeń podaje wymagane dane i przechodzi do egzaminu bez klasycznego hasła.",
  ],
  [
    "Co dzieje się przy utracie połączenia?",
    "Interfejs zapisuje odpowiedzi w toku pracy, ale odporność na długą utratę internetu zależy od scenariusza i wymaga testów w warunkach placówki.",
  ],
  [
    "Czy system jest zgodny z WCAG i RODO?",
    "EduNex jest projektowany z uwzględnieniem dostępności i ochrony danych. Formalna zgodność wymaga niezależnego audytu, dokumentacji oraz oceny konkretnego wdrożenia.",
  ],
  [
    "Jak wygląda koszt pilotażu?",
    "Zakres zależy od liczby szkół, użytkowników, integracji i oczekiwanego wsparcia. Najpierw ustalany jest scenariusz, a następnie przejrzysty zakres organizacyjny.",
  ],
  [
    "Czy EduNex integruje się z innymi systemami?",
    "Architektura przewiduje eksport danych i dalsze integracje. Każda integracja wymaga analizy zakresu danych, bezpieczeństwa i dostępności interfejsów.",
  ],
  [
    "Jakie szkolenie otrzymuje szkoła?",
    "Pilotaż powinien obejmować wdrożenie administratora, szkolenie nauczycieli, scenariusz próbny oraz pomoc podczas pierwszych sesji.",
  ],
];

const buttonPrimary =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#0869c7] px-5 text-sm font-bold !text-[#fff] shadow-[0_12px_30px_rgba(8,105,199,.24)] transition hover:-translate-y-0.5 hover:bg-[#0759aa] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber-400";
const buttonSecondary =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber-400";

function Brand() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-3 rounded-lg"
      aria-label="EduNex — strona główna"
    >
      <img
        src="/images/edunex-liquid-glass-logo.png"
        alt=""
        width={512}
        height={512}
        className="h-11 w-11 rounded-xl object-cover shadow-[0_10px_26px_rgba(8,105,199,.24)] ring-1 ring-white/60"
        aria-hidden="true"
      />
      <span>
        <strong className="block text-[15px] leading-4 tracking-tight text-slate-950">
          EduNex
        </strong>
        <small className="mt-1 block text-[9px] font-bold uppercase tracking-[.14em] text-slate-500">
          System operacyjny edukacji
        </small>
      </span>
    </Link>
  );
}

function Heading({
  eyebrow,
  title,
  copy,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  centered?: boolean;
}) {
  return (
    <div className={`${centered ? "mx-auto text-center" : ""} max-w-4xl`}>
      <span className="text-[11px] font-extrabold uppercase tracking-[.14em] text-[#0869c7]">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-[clamp(2rem,4vw,3.7rem)] font-semibold leading-[1.04] tracking-[-.05em] text-[#07182e]">
        {title}
      </h2>
      <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600">{copy}</p>
    </div>
  );
}

function ProductPreview() {
  return (
    <div
      className="liquid-panel overflow-hidden rounded-[28px] border border-white/60 bg-white/80 shadow-[0_35px_95px_rgba(7,24,46,.18)]"
      aria-label="Przykładowy panel EduNex"
    >
      <div className="flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 px-4">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#07182e] !text-[#fff]">
            <Layers3 className="h-4 w-4" />
          </span>
          <span>
            <strong className="block text-xs">EduNex Workspace</strong>
            <small className="block text-[9px] text-slate-500">Podgląd interfejsu</small>
          </span>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-800">
          <i className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> System dostępny
        </span>
      </div>
      <div className="grid min-h-[430px] grid-cols-[90px_1fr] sm:grid-cols-[122px_1fr]">
        <aside className="border-r border-slate-200 bg-slate-50 p-2.5" aria-hidden="true">
          {["Pulpit", "Egzaminy", "Klasy", "Wyniki", "NexDziennik"].map((item, index) => (
            <span
              key={item}
              className={`mb-1 block rounded-md px-2 py-2 text-[9px] font-semibold sm:text-[10px] ${index === 0 ? "bg-[#07182e] !text-[#fff]" : "text-slate-500"}`}
            >
              {item}
            </span>
          ))}
        </aside>
        <div className="min-w-0 bg-[#f4f7fa] p-3 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <span>
              <small className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Przegląd operacyjny
              </small>
              <strong className="mt-1 block text-base tracking-tight sm:text-xl">
                Dzień dobry, Anno
              </strong>
            </span>
            <span className="hidden rounded-md border border-slate-200 bg-white px-2 py-1 text-[9px] text-slate-500 sm:block">
              25 lipca 2026
            </span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              ["12", "aktywnych klas"],
              ["3", "sesje dzisiaj"],
              ["91%", "oddanych prac"],
            ].map(([value, label]) => (
              <span key={label} className="rounded-lg border border-slate-200 bg-white p-3">
                <strong className="block text-xl text-[#07182e]">{value}</strong>
                <small className="text-[9px] text-slate-500">{label}</small>
              </span>
            ))}
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-[1.15fr_.85fr]">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Sesja egzaminacyjna
              </span>
              <div className="mt-1 flex items-center justify-between gap-2">
                <strong className="text-xs sm:text-sm">Matematyka — klasa 7B</strong>
                <span className="rounded-full bg-blue-50 px-2 py-1 text-[8px] font-extrabold text-blue-700">
                  NA ŻYWO
                </span>
              </div>
              <div className="mt-4 rounded-lg bg-[#07182e] p-4 !text-[#fff]">
                <small className="text-[8px] uppercase tracking-wider !text-[#a9bbcf]">
                  Kod dostępu
                </small>
                <strong className="mt-1 block text-2xl tracking-[.13em]">482 913</strong>
                <span className="mt-2 block text-[9px] !text-[#c0ccda]">
                  28 uczestników · 16 min pozostało
                </span>
              </div>
              <div className="mt-3 flex justify-between text-[9px] text-slate-500">
                <span>Oddane</span>
                <strong>24 / 28</strong>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-slate-100">
                <span className="block h-full w-[86%] rounded-full bg-[#0869c7]" />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-[#0869c7]">
                <Sparkles className="h-4 w-4" />
              </span>
              <small className="mt-4 block text-[9px] font-bold uppercase tracking-wider text-[#0869c7]">
                NexAI · obserwacja
              </small>
              <strong className="mt-1 block text-xs">Pytanie 6 wymaga uwagi</strong>
              <p className="mt-2 text-[10px] leading-5 text-slate-500">
                Skuteczność jest niższa niż w pozostałych zadaniach. Sprawdź treść przed publikacją.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AudiencePanel() {
  const [active, setActive] = useState<AudienceKey>("dyrekcja");
  const item = audiences[active];
  const ActiveIcon = item.icon;
  return (
    <div className="mt-12 grid gap-4 lg:grid-cols-[230px_1fr]">
      <div
        className="liquid-tablist flex gap-2 overflow-x-auto rounded-2xl p-2 pb-2 lg:grid lg:content-start lg:overflow-visible"
        role="tablist"
        aria-label="Rozwiązania według odpowiedzialności"
      >
        {(Object.entries(audiences) as Array<[AudienceKey, (typeof audiences)[AudienceKey]]>).map(
          ([key, audience]) => (
            <button
              key={key}
              type="button"
              role="tab"
              id={`audience-tab-${key}`}
              aria-controls="audience-panel"
              aria-selected={key === active}
              onClick={() => setActive(key)}
              className={`flex min-h-12 shrink-0 items-center gap-2 rounded-lg border px-3 text-left text-xs font-bold transition ${key === active ? "border-blue-200 bg-blue-50 text-[#0759aa]" : "border-transparent text-slate-600 hover:bg-slate-50"}`}
            >
              <audience.icon className="h-4 w-4" aria-hidden="true" />
              {audience.label}
            </button>
          ),
        )}
      </div>
      <div
        id="audience-panel"
        role="tabpanel"
        aria-labelledby={`audience-tab-${active}`}
        tabIndex={0}
        className="liquid-panel grid overflow-hidden rounded-2xl border border-white/60 bg-white/75 shadow-[0_22px_65px_rgba(7,24,46,.08)] md:grid-cols-[1fr_210px]"
      >
        <div className="p-6 sm:p-10">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#07182e] !text-[#fff]">
            <ActiveIcon className="h-5 w-5" />
          </span>
          <span className="mt-7 block text-[10px] font-extrabold uppercase tracking-[.14em] text-[#0869c7]">
            Korzyść dla roli
          </span>
          <h3 className="mt-3 max-w-3xl text-2xl font-semibold leading-tight tracking-[-.04em] text-[#07182e] sm:text-4xl">
            {item.title}
          </h3>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{item.description}</p>
          <ul className="mt-6 grid gap-3 text-sm text-slate-700">
            {item.points.map((point) => (
              <li key={point} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <aside className="grid content-center border-t border-slate-200 bg-[#f3f8fd] p-7 md:border-t-0 md:border-l">
          <span className="text-4xl font-semibold tracking-[-.06em] text-[#0869c7]">
            {item.metric.split(" ")[0]}
          </span>
          <strong className="mt-2 text-sm text-slate-800">
            {item.metric.substring(item.metric.indexOf(" ") + 1)}
          </strong>
          <small className="mt-5 text-[10px] leading-5 text-slate-500">
            Zakres orientacyjny zależny od konfiguracji i uprawnień placówki.
          </small>
        </aside>
      </div>
    </div>
  );
}

function ContactForm() {
  const sendContact = useServerFn(submitContact);
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "Wdrożenie w szkole",
    message: "",
    website: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSent(false);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      form.name.trim().length < 2 ||
      !/^\S+@\S+\.\S+$/.test(form.email.trim()) ||
      form.message.trim().length < 5
    ) {
      toast.error("Uzupełnij imię, poprawny e-mail i krótką wiadomość.");
      return;
    }
    setSending(true);
    try {
      await sendContact({
        data: {
          ...form,
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        },
      });
      setSent(true);
      setForm({
        name: "",
        email: "",
        topic: "Wdrożenie w szkole",
        message: "",
        website: "",
      });
      toast.success("Wiadomość została przyjęta. Odpowiemy na podany adres e-mail.");
    } catch {
      toast.error("Nie udało się wysłać wiadomości. Spróbuj ponownie.");
    } finally {
      setSending(false);
    }
  };

  const fieldClass =
    "liquid-field min-h-12 w-full rounded-xl border border-slate-300 bg-white/85 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#168cff] focus:ring-4 focus:ring-[#168cff]/15";

  return (
    <form
      onSubmit={submit}
      className="liquid-panel rounded-[28px] border border-white/60 p-5 sm:p-8"
    >
      <label
        className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        Pozostaw to pole puste
        <input
          name="website"
          value={form.website}
          onChange={(event) => update("website", event.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </label>
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#0869c7]">
            Formularz kontaktowy
          </span>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-[#07182e]">
            Porozmawiajmy o Twojej placówce
          </h3>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#07182e] text-white shadow-lg">
          <Mail className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Imię i nazwisko
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={fieldClass}
            autoComplete="name"
            placeholder="Anna Nowak"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Adres e-mail
          <input
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={fieldClass}
            type="email"
            autoComplete="email"
            placeholder="anna.nowak@szkola.pl"
            required
          />
        </label>
      </div>
      <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">
        Temat rozmowy
        <select
          value={form.topic}
          onChange={(e) => update("topic", e.target.value)}
          className={fieldClass}
        >
          <option>Wdrożenie w szkole</option>
          <option>Egzaminy i sesje PIN</option>
          <option>NexDziennik</option>
          <option>NexAI</option>
          <option>Oferta dla instytucji</option>
          <option>Bezpieczeństwo i integracje</option>
        </select>
      </label>
      <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">
        Jakiego rozwiązania potrzebujesz?
        <textarea
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className={`${fieldClass} min-h-36 resize-y py-3`}
          maxLength={4000}
          placeholder="Opisz liczbę klas, obecny proces i najważniejszy problem…"
          required
        />
      </label>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-slate-500">
          Wysyłając formularz, przekazujesz wyłącznie dane potrzebne do odpowiedzi.
        </p>
        <button
          type="submit"
          disabled={sending}
          className={`${buttonPrimary} shrink-0 disabled:cursor-wait disabled:opacity-60`}
        >
          {sending ? "Wysyłanie…" : sent ? "Wysłano" : "Wyślij wiadomość"}
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

export function InstitutionalLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="institutional-landing min-h-screen overflow-x-clip bg-white font-[Inter,_Segoe_UI,_sans-serif] text-slate-950">
      <Toaster position="top-center" richColors />
      <a
        href="#main-content"
        className="fixed left-4 top-[-100px] z-[200] rounded-lg bg-white px-4 py-3 font-bold shadow-xl focus:top-4"
      >
        Przejdź do treści
      </a>
      <div className="bg-[#07182e] !text-[#fff]">
        <div className="mx-auto flex min-h-10 max-w-[1440px] items-center justify-center gap-3 px-4 text-[11px]">
          <span className="rounded-full border border-white/20 px-2 py-0.5 font-bold">
            EduNex · środowisko rozwojowe
          </span>
          <p className="hidden !text-[#c8d5e4] sm:block">
            Platforma przygotowywana do pilotaży i niezależnej weryfikacji.
          </p>
          <Link
            to="/centrum-dokumentow"
            className="font-bold !text-[#9bdcff] underline-offset-4 hover:underline"
          >
            Dokumentacja
          </Link>
        </div>
      </div>
      <header className="liquid-nav sticky top-0 z-50 border-b border-white/55 bg-white/75 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-5 px-4 sm:px-7">
          <Brand />
          <nav className="hidden items-center gap-5 xl:flex" aria-label="Nawigacja główna">
            {nav.map(([label, href]) =>
              href.startsWith("#") ? (
                <a
                  key={href}
                  href={href}
                  className="text-xs font-bold text-slate-600 hover:text-[#0869c7]"
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={href}
                  to={href as "/centrum-dokumentow"}
                  className="text-xs font-bold text-slate-600 hover:text-[#0869c7]"
                >
                  {label}
                </Link>
              ),
            )}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeSwitcher compact />
            <Link
              to="/auth"
              className="hidden min-h-11 items-center px-3 text-xs font-bold text-slate-700 sm:inline-flex"
            >
              Logowanie
            </Link>
            <Link
              to="/auth/register"
              className={`${buttonPrimary} hidden min-h-11 px-4 sm:inline-flex`}
            >
              Zgłoś pilotaż
            </Link>
            <button
              type="button"
              aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="grid h-11 w-11 place-items-center rounded-lg border border-slate-300 xl:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav
            className="mx-auto grid max-w-[1440px] border-t border-slate-200 px-4 py-3 xl:hidden"
            aria-label="Nawigacja mobilna"
          >
            {nav.map(([label, href]) =>
              href.startsWith("#") ? (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center justify-between rounded-lg px-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  {label}
                  <ArrowRight className="h-4 w-4" />
                </a>
              ) : (
                <Link
                  key={href}
                  to={href as "/centrum-dokumentow"}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center justify-between rounded-lg px-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  {label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ),
            )}
            <Link
              to="/auth"
              onClick={() => setMenuOpen(false)}
              className="flex min-h-12 items-center justify-between rounded-lg px-3 text-sm font-bold text-[#0869c7]"
            >
              Logowanie do systemu
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        )}
      </header>

      <main id="main-content">
        <section className="institutional-hero relative overflow-hidden border-b border-[#1d344f] bg-[#061325]">
          <img
            src="/images/edunex-hero-director-samsung.webp"
            alt="Dyrektorka szkoły przed nowoczesnym budynkiem, trzymająca tablet"
            className="absolute inset-0 h-full w-full object-cover object-[64%_center] sm:object-center"
            fetchPriority="high"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(4,17,33,.98)_0%,rgba(4,17,33,.93)_34%,rgba(4,17,33,.42)_63%,rgba(4,17,33,.12)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,17,33,.14),rgba(4,17,33,.34))]" />
          <div className="relative mx-auto grid max-w-[1440px] items-center px-4 py-16 sm:px-7 lg:min-h-[720px] lg:grid-cols-[.9fr_1.1fr] lg:py-24">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[11px] font-extrabold !text-[#bce7fa] backdrop-blur">
                <ShieldCheck className="h-4 w-4" />
                Platforma egzaminacyjna dla polskiej edukacji
              </span>
              <h1 className="mt-6 text-[clamp(3rem,5.4vw,5.8rem)] font-semibold leading-[.96] tracking-[-.065em] !text-[#fff]">
                Bezpieczne egzaminy.
                <span className="block !text-[#77d1f2]">Spójna praca całej szkoły.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 !text-[#c4d0de]">
                EduNex łączy przygotowanie egzaminu, sesję ucznia, wyniki, raporty i administrację w
                jednym systemie projektowanym dla szkół oraz instytucji publicznych.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="/student/dashboard" className={buttonPrimary}>
                  Przejdź do panelu ucznia
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link to="/auth" className={buttonSecondary}>
                  Zaloguj się lub załóż konto
                </Link>
              </div>
              <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs !text-[#c4d0de]">
                {[
                  "Wejście ucznia kodem PIN",
                  "Role zatwierdzane przez placówkę",
                  "NexAI pod kontrolą nauczyciela",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="h-4 w-4 !text-[#83e0bd]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="landing-light-surface relative z-10 border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1180px] -translate-y-10 px-4 sm:-translate-y-14 sm:px-7">
            <ProductPreview />
          </div>
          <div className="mx-auto -mt-6 flex min-h-24 max-w-[1440px] flex-wrap items-center gap-x-8 gap-y-3 px-4 pb-4 sm:-mt-10 sm:px-7">
            <span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-400">
              Projektowany dla
            </span>
            {["szkół", "samorządów", "dyrekcji", "nauczycieli", "uczniów", "administracji IT"].map(
              (item) => (
                <strong key={item} className="text-xs text-slate-600">
                  {item}
                </strong>
              ),
            )}
          </div>
        </section>

        <section
          id="rozwiazania"
          className="mx-auto max-w-[1440px] scroll-mt-24 px-4 py-20 sm:px-7 lg:py-32"
        >
          <Heading
            eyebrow="Problem, który porządkujemy"
            title="Mniej obsługi narzędzi. Więcej czasu na decyzje i pracę z uczniem."
            copy="EduNex nie dodaje kolejnego izolowanego panelu. Łączy procesy, które dziś często wymagają arkuszy, wiadomości, osobnych formularzy i ręcznych zestawień."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {problems.map(([Icon, title, copy], index) => (
              <article
                key={title}
                className="relative min-h-64 rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
              >
                <span className="absolute right-5 top-4 font-mono text-3xl font-bold text-slate-200">
                  0{index + 1}
                </span>
                <Icon className="mt-14 h-5 w-5 text-[#0869c7]" />
                <h3 className="mt-5 font-bold text-[#07182e]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="produkt" className="landing-muted-surface scroll-mt-24 bg-[#f3f6fa]">
          <div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-7 lg:py-32">
            <Heading
              eyebrow="Jeden proces"
              title="Od przygotowania pytań do raportu po zakończeniu sesji"
              copy="Każdy etap ma jasnego właściciela, przewidywalny stan i informację potrzebną do wykonania następnego kroku."
            />
            <ol className="mt-12 grid border-t border-slate-300 md:grid-cols-5">
              {workflow.map(([number, title, copy]) => (
                <li key={number} className="border-b border-slate-300 py-6 md:border-b-0 md:pr-5">
                  <span className="font-mono text-[11px] font-bold text-[#0869c7]">{number}</span>
                  <h3 className="mt-3 font-bold text-[#07182e]">{title}</h3>
                  <p className="mt-2 text-xs leading-6 text-slate-600">{copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="odbiorcy"
          className="mx-auto max-w-[1440px] scroll-mt-24 px-4 py-20 sm:px-7 lg:py-32"
        >
          <Heading
            eyebrow="Rozwiązania według odpowiedzialności"
            title="Każda rola widzi dokładnie ten kontekst, którego potrzebuje"
            copy="Zamiast jednego przeładowanego panelu EduNex rozdziela pracę operacyjną, nadzór placówki i raportowanie instytucjonalne."
          />
          <AudiencePanel />
        </section>

        <section className="bg-[#07182e] !text-[#fff]">
          <div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-7 lg:py-32">
            <div className="max-w-4xl">
              <span className="text-[11px] font-extrabold uppercase tracking-[.14em] !text-[#8bd7f5]">
                Zakres produktu
              </span>
              <h2 className="mt-3 text-[clamp(2rem,4vw,3.7rem)] font-semibold leading-[1.04] tracking-[-.05em] !text-[#fff]">
                Funkcje pokazane wraz z uczciwym statusem rozwoju
              </h2>
              <p className="mt-4 max-w-3xl text-[15px] leading-7 !text-[#b9c7d8]">
                Nie prezentujemy atrap jako gotowych modułów. Obszary nadal rozwijane są oznaczone
                wprost.
              </p>
            </div>
            <div className="mt-12 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {capabilities.map(([Icon, title, copy, status]) => (
                <article
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/[.05] p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-300/10 !text-[#94ddf8]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide ${status === "Dostępne" ? "border-emerald-300/30 bg-emerald-400/10 !text-[#88ebc9]" : "border-amber-300/30 bg-amber-400/10 !text-[#ffd181]"}`}
                    >
                      {status}
                    </span>
                  </div>
                  <h3 className="mt-5 font-bold !text-[#fff]">{title}</h3>
                  <p className="mt-3 text-sm leading-7 !text-[#b8c6d6]">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="bezpieczenstwo"
          className="mx-auto grid max-w-[1440px] scroll-mt-24 gap-12 px-4 py-20 sm:px-7 lg:grid-cols-[.8fr_1.2fr] lg:py-32"
        >
          <div>
            <Heading
              eyebrow="Bezpieczeństwo i odpowiedzialność"
              title="Bezpieczny proces zaczyna się od właściwych uprawnień"
              copy="Architektura EduNex jest rozwijana z uwzględnieniem kontroli dostępu, minimalizacji danych i rozdzielenia odpowiedzialności. Formalna zgodność wymaga niezależnej oceny."
            />
            <div className="mt-8 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0869c7]" />
              <span>
                <strong className="block text-sm text-slate-900">Przygotowywany do audytu</strong>
                <small className="mt-1 block leading-5 text-slate-600">
                  Bez fałszywych certyfikatów i deklaracji niepotwierdzonych dokumentacją.
                </small>
              </span>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {security.map(([Icon, title, copy]) => (
              <article key={title} className="min-h-48 rounded-2xl border border-slate-200 p-6">
                <Icon className="h-5 w-5 text-[#0869c7]" />
                <h3 className="mt-5 font-bold text-[#07182e]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="dostepnosc" className="mx-auto max-w-[1440px] scroll-mt-24 px-4 sm:px-7">
          <div className="grid gap-10 rounded-2xl border border-blue-200 bg-[#f3f8fc] p-7 sm:p-10 lg:grid-cols-[1.15fr_.85fr]">
            <div className="flex items-start gap-5">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#0869c7] !text-[#fff]">
                <Accessibility className="h-6 w-6" />
              </span>
              <Heading
                eyebrow="Dostępność cyfrowa"
                title="Interfejs ma wspierać różne sposoby korzystania, nie tworzyć barier"
                copy="Dostępność jest częścią projektu komponentów i formularzy. Formalne potwierdzenie zgodności wymaga pełnego audytu i testów z użytkownikami."
              />
            </div>
            <ul className="grid content-center gap-3 text-sm text-slate-700">
              {[
                "Obsługa klawiatury i widoczny fokus",
                "Czytelne etykiety i błędy",
                "Kontrast dla długiej pracy",
                "Skalowanie tekstu bez utraty funkcji",
                "Ograniczanie animacji",
                "Semantyka dla technologii asystujących",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="h-4 w-4 shrink-0 text-emerald-700" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="pilotaz"
          className="mx-auto grid max-w-[1440px] scroll-mt-24 gap-12 px-4 py-20 sm:px-7 lg:grid-cols-2 lg:py-32"
        >
          <div>
            <Heading
              eyebrow="Program pilotażowy EduNex"
              title="Małe, kontrolowane wdrożenie przed decyzją o szerszym użyciu"
              copy="Pilotaż służy sprawdzeniu procesów, dostępności, bezpieczeństwa i rzeczywistej wartości dla placówki. Jego zakres powinien być mierzalny i możliwy do bezpiecznego zakończenia."
            />
            <Link to="/auth/register" className={`${buttonPrimary} mt-8`}>
              Zgłoś szkołę do pilotażu
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ol className="border-t border-slate-300">
            {[
              ["1", "Rozpoznanie", "Ustalenie procesów, ról i kryteriów powodzenia."],
              ["2", "Konfiguracja", "Przygotowanie środowiska, kont i scenariuszy."],
              ["3", "Pilotaż", "Praca wybranej grupy przy wsparciu technicznym."],
              ["4", "Ewaluacja", "Opinie, analiza wyników i raport z rekomendacjami."],
            ].map(([number, title, copy]) => (
              <li
                key={number}
                className="grid min-h-28 grid-cols-[48px_1fr] gap-4 border-b border-slate-300 py-5"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#07182e] text-xs font-bold !text-[#fff]">
                  {number}
                </span>
                <div>
                  <h3 className="font-bold text-[#07182e]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="cennik" className="pricing-section scroll-mt-24 bg-[#f3f6fa]">
          <div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-7 lg:py-28">
            <div className="liquid-panel grid overflow-hidden rounded-[32px] border border-white/60 lg:grid-cols-[1.1fr_.9fr]">
              <div className="p-7 sm:p-10 lg:p-14">
                <span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#0869c7]">
                  Pakiety EduNex
                </span>
                <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-.045em] text-[#07182e] sm:text-5xl">
                  Jeden punkt startu. Pełna ścieżka rozwoju szkoły.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                  Porównaj zakres dla klasy, nauczyciela, szkoły i instytucji. Bez ukrywania
                  bezpieczeństwa, wsparcia ani funkcji administracyjnych za niejasnymi nazwami.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/cennik" className={buttonPrimary}>
                    Zobacz pełny cennik
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href="#kontakt" className={buttonSecondary}>
                    Porozmawiaj o wdrożeniu
                  </a>
                </div>
              </div>
              <div className="grid content-center gap-3 border-t border-white/60 bg-[#07182e] p-7 text-white lg:border-l lg:border-t-0 sm:p-10">
                {[
                  ["Klasa", "Bezpłatny start"],
                  ["Nauczyciel", "Zakres dopasowany"],
                  ["Szkoła", "Wspólne środowisko"],
                  ["Instytucja", "Wycena indywidualna"],
                ].map(([name, value]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 backdrop-blur-xl"
                  >
                    <span className="text-sm font-semibold !text-white">{name}</span>
                    <span className="text-xs !text-[#a9c4df]">{value}</span>
                  </div>
                ))}
                <p className="mt-2 text-xs leading-6 !text-[#a9c4df]">
                  Warunki płatnego wdrożenia potwierdzamy przed aktywacją. Sam formularz nie
                  uruchamia żadnych opłat.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1440px] gap-12 px-4 py-20 sm:px-7 lg:grid-cols-[.8fr_1.2fr] lg:py-32">
          <Heading
            eyebrow="Pytania przed pilotażem"
            title="Konkretnie o bezpieczeństwie, wdrożeniu i ograniczeniach"
            copy="Odpowiadamy bez marketingowych skrótów i bez deklaracji, których projekt nie może jeszcze formalnie potwierdzić."
          />
          <div className="border-t border-slate-300">
            {faq.map(([question, answer]) => (
              <details key={question} className="group border-b border-slate-300">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-3 text-sm font-bold text-slate-800">
                  {question}
                  <ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" />
                </summary>
                <p className="mb-5 max-w-3xl text-sm leading-7 text-slate-600">{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="kontakt" className="contact-section scroll-mt-24 border-y border-slate-200">
          <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-20 sm:px-7 lg:grid-cols-[.82fr_1.18fr] lg:py-32">
            <div>
              <Heading
                eyebrow="Kontakt i wdrożenie"
                title="Zacznijmy od realnego procesu Twojej szkoły"
                copy="Napisz, ilu użytkowników obejmuje projekt i co dziś zajmuje najwięcej czasu. Odpowiemy konkretnym zakresem kolejnego kroku."
              />
              <div className="mt-8 grid gap-3">
                {[
                  "Analiza potrzeb bez zobowiązań",
                  "Zakres pilotażu i kryteria powodzenia",
                  "Role, bezpieczeństwo i integracje",
                  "Plan wdrożenia bez przerywania pracy szkoły",
                ].map((item) => (
                  <div
                    key={item}
                    className="liquid-chip flex items-center gap-3 rounded-xl border border-white/55 px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    <Check className="h-4 w-4 text-emerald-700" />
                    {item}
                  </div>
                ))}
              </div>
              <a
                href="mailto:kontakt@edunex.pl"
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#0869c7] hover:underline"
              >
                <Mail className="h-4 w-4" />
                kontakt@edunex.pl
              </a>
            </div>
            <ContactForm />
          </div>
        </section>

        <section className="mx-auto mb-20 flex max-w-[1390px] flex-col justify-between gap-8 rounded-2xl bg-[#07182e] p-7 !text-[#fff] sm:p-12 lg:flex-row lg:items-end">
          <div className="max-w-4xl">
            <span className="text-[10px] font-extrabold uppercase tracking-[.14em] !text-[#8bd7f5]">
              Następny krok
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.045em] !text-[#fff] sm:text-5xl">
              Sprawdźmy EduNex w realnym, kontrolowanym scenariuszu szkoły.
            </h2>
            <p className="mt-4 max-w-3xl leading-7 !text-[#b9c7d8]">
              Wejdź do swojego panelu albo utwórz konto dopasowane do roli w szkole.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <a
              href="/student/dashboard"
              className="inline-flex min-h-12 items-center rounded-lg border border-white/30 bg-white/5 px-5 text-sm font-bold !text-[#fff] hover:bg-white/10"
            >
              Panel ucznia
            </a>
            <Link to="/auth" className={buttonPrimary}>
              Logowanie i rejestracja
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1e324c] bg-[#061325] !text-[#fff]">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-14 sm:grid-cols-2 sm:px-7 lg:grid-cols-[1.7fr_1fr_1fr_1fr]">
          <div>
            <Brand />
            <p className="mt-5 max-w-sm text-sm leading-7 !text-[#a9b7c8]">
              Platforma egzaminacyjna i operacyjna rozwijana dla szkół oraz instytucji edukacyjnych.
            </p>
            <span className="mt-5 inline-block rounded-full border border-[#29415f] px-2 py-1 text-[10px] !text-[#8fa3bb]">
              Wersja rozwojowa · 2026
            </span>
          </div>
          <div className="grid content-start gap-3 text-sm">
            <strong className="text-xs uppercase tracking-wider !text-[#fff]">Produkt</strong>
            <a href="#produkt" className="!text-[#a9b7c8] hover:underline">
              Jak działa
            </a>
            <a href="#odbiorcy" className="!text-[#a9b7c8] hover:underline">
              Dla instytucji
            </a>
            <Link to="/cennik" className="!text-[#a9b7c8] hover:underline">
              Cennik
            </Link>
            <Link to="/moduly" className="!text-[#a9b7c8] hover:underline">
              Moduły
            </Link>
          </div>
          <div className="grid content-start gap-3 text-sm">
            <strong className="text-xs uppercase tracking-wider !text-[#fff]">Zaufanie</strong>
            <a href="#bezpieczenstwo" className="!text-[#a9b7c8] hover:underline">
              Bezpieczeństwo
            </a>
            <a href="#dostepnosc" className="!text-[#a9b7c8] hover:underline">
              Dostępność
            </a>
            <Link to="/centrum-dokumentow" className="!text-[#a9b7c8] hover:underline">
              Dokumentacja
            </Link>
            <Link to="/pomoc" className="!text-[#a9b7c8] hover:underline">
              Zgłoszenie problemu
            </Link>
            <a href="#kontakt" className="!text-[#a9b7c8] hover:underline">
              Kontakt
            </a>
          </div>
          <div className="grid content-start gap-3 text-sm">
            <strong className="text-xs uppercase tracking-wider !text-[#fff]">Dostęp</strong>
            <Link to="/auth" className="!text-[#a9b7c8] hover:underline">
              Logowanie pracownika
            </Link>
            <Link to="/auth" className="!text-[#a9b7c8] hover:underline">
              Dołącz do egzaminu
            </Link>
            <Link to="/auth/register" className="!text-[#a9b7c8] hover:underline">
              Rejestracja konta
            </Link>
            <Link to="/pomoc" className="!text-[#a9b7c8] hover:underline">
              Centrum pomocy
            </Link>
          </div>
        </div>
        <div className="mx-auto flex min-h-16 max-w-[1390px] flex-wrap items-center justify-between gap-3 border-t border-[#1e324c] px-4 text-[10px] !text-[#8193aa] sm:px-7">
          <span>© 2026 EduNex. Niezależny projekt edukacyjny.</span>
          <span>Projektowany z uwzględnieniem prywatności i dostępności.</span>
        </div>
      </footer>
      <Link
        to="/pomoc"
        className="fixed bottom-5 right-5 z-40 inline-flex h-12 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 text-xs font-bold text-slate-800 shadow-xl"
        aria-label="Otwórz Centrum Pomocy"
      >
        <LifeBuoy className="h-4 w-4 text-[#0869c7]" />
        <span className="hidden sm:inline">Pomoc</span>
      </Link>
    </div>
  );
}
