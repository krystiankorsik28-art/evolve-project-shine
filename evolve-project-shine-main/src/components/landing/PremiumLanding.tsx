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
  ["Panele", "#panele"],
  ["Bezpieczeństwo", "#bezpieczenstwo"],
  ["Cennik", "#cennik"],
  ["Dokumenty", "#dokumenty"],
  ["Kontakt", "#kontakt"],
];

const metrics = [
  ["4 role", "uczeń, nauczyciel, dyrekcja i admin"],
  ["PIN", "egzaminy bez zakładania kont uczniowskich"],
  ["NexAi", "asystent, generator i wsparcie oceniania"],
  ["RODO", "dokumenty, role i kontrola dostępu"],
];

const roles: Record<RoleKey, { icon: IconType; label: string; title: string; copy: string; points: string[] }> = {
  teacher: {
    icon: GraduationCap,
    label: "Nauczyciel",
    title: "Pulpit pracy z egzaminami, klasami i materiałami",
    copy: "Nauczyciel widzi plan pracy, egzaminy, sesje PIN, wyniki, NexAi i eksport ocen w jednym uporządkowanym widoku.",
    points: ["Egzaminy i sprawdziany", "Sesje PIN", "NexAi Generator", "Eksport PDF/CSV"],
  },
  student: {
    icon: UserRound,
    label: "Uczeń",
    title: "Prosty panel wejścia i spokojny tryb egzaminu",
    copy: "Uczeń widzi tylko to, co potrzebne: dane, PIN, instrukcję, timer, pytania, wyniki i certyfikaty.",
    points: ["Wejście PIN", "Timer", "Historia wyników", "Certyfikaty"],
  },
  school: {
    icon: School,
    label: "Dyrekcja",
    title: "Przegląd placówki, jakości pracy i zgodności",
    copy: "Dyrekcja dostaje metryki, raporty, kontrolę ról, dokumenty i status wdrożenia bez technicznego chaosu.",
    points: ["Raporty zbiorcze", "Role", "Dokumenty", "Zgodność"],
  },
  admin: {
    icon: ServerCog,
    label: "Admin",
    title: "Zarządzanie dostępem i ustawieniami szkoły",
    copy: "Administrator zatwierdza konta, kontroluje role, dba o ustawienia placówki i utrzymuje porządek w dostępie.",
    points: ["Uprawnienia", "Weryfikacja", "Ustawienia", "Audyt"],
  },
};

const modules: Array<[IconType, string, string]> = [
  [MonitorDot, "Egzaminy PIN", "Szybkie uruchamianie sesji, lista uczestników, status oddania i monitoring przebiegu."],
  [Sparkles, "NexAi", "Pomoc uczniowi i nauczycielowi jako funkcja systemowa, z jasnym nadzorem człowieka."],
  [BookOpenCheck, "E-dziennik", "Widok ocen, eksportów, klas i połączeń z zewnętrznymi dziennikami."],
  [BarChart3, "Raporty", "Postęp klasy, wynik ucznia, średnie, ryzyka i gotowe eksporty dla szkoły."],
  [ClipboardCheck, "Bank pytań", "Kategorie, pytania, media, warianty i ponowne użycie materiałów."],
  [CalendarDays, "Plan pracy", "Lekcje, terminy, zadania, komunikaty i materiały do przygotowania."],
];

const plans = [
  {
    name: "Klasa",
    price: "99 zł",
    note: "miesięcznie",
    target: "Dla nauczyciela lub małego zespołu.",
    features: ["Egzaminy PIN", "Bank pytań", "Podstawowe raporty", "Dokumenty i zgody"],
  },
  {
    name: "Szkoła",
    price: "399 zł",
    note: "miesięcznie",
    target: "Dla placówki z wieloma klasami.",
    featured: true,
    features: ["Panel dyrekcji", "Role i zatwierdzanie", "E-dziennik", "NexAi", "Eksporty PDF/CSV"],
  },
  {
    name: "Instytucja",
    price: "Indywidualnie",
    note: "wdrożenie",
    target: "Dla sieci szkół i większych organizacji.",
    features: ["Audyt dostępu", "SLA", "Migracja danych", "Branding szkoły", "Wsparcie wdrożeniowe"],
  },
];

const documents = [
  [ReceiptText, "Regulamin", "Zasady korzystania, role użytkowników i warunki świadczenia usługi."],
  [LockKeyhole, "Polityka prywatności", "Zakres danych, podstawy prawne, prawa osób i kontakt w sprawach prywatności."],
  [FileCheck2, "Powierzenie danych", "Podział obowiązków, przetwarzanie danych uczniów i wymagania dla placówki."],
  [ShieldCheck, "RODO i bezpieczeństwo", "Role, audyt, logi, retencja, szyfrowanie i minimalizacja danych."],
  [SearchCheck, "Dostępność", "Kontrast, klawiatura, formularze, responsywność i podstawy WCAG."],
];

const workflow = [
  ["1", "Przygotuj", "Nauczyciel tworzy egzamin, wybiera klasę, ustawia czas i próg zaliczenia."],
  ["2", "Udostępnij", "System generuje PIN i prowadzi ucznia do przypisanego egzaminu."],
  ["3", "Sprawdź", "Wyniki, certyfikaty i eksporty są dostępne od razu po zakończeniu pracy."],
  ["4", "Raportuj", "Dyrekcja widzi postęp, zgodność i dane potrzebne do decyzji szkoły."],
];

const faq = [
  ["Czy EduNex wymaga kont uczniowskich?", "Nie. Uczeń może rozpocząć egzamin za pomocą PIN-u i danych wymaganych przez nauczyciela."],
  ["Czy można korzystać z Microsoft, Google i GitHub?", "Tak. Ekran logowania zachowuje istniejące ścieżki OAuth oraz logowanie e-mail/hasło."],
  ["Czy e-dziennik jest częścią produktu?", "Tak. Moduł e-dziennika działa jako widok oraz eksport ocen do popularnych systemów."],
  ["Czy dokumenty prawne są dostępne publicznie?", "Tak. Trasa /dokumenty zawiera regulamin, RODO, politykę prywatności, powierzenie danych i status systemu."],
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

function HeroProductVisual() {
  return (
    <div className="relative w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-[0_28px_90px_rgba(15,23,42,0.12)]">
      <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(37,99,235,0.08),rgba(255,255,255,0))]" />
      <div className="relative flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs font-semibold uppercase text-slate-500">EduNex</div>
          <div className="mt-1 text-sm font-semibold text-slate-950">Przegląd szkoły</div>
        </div>
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
          online
        </div>
      </div>

      <div className="relative mt-4 grid min-w-0 gap-3 sm:grid-cols-[0.85fr_1.15fr]">
        <div className="min-w-0 space-y-2">
          {["Egzaminy", "Klasy", "Wyniki", "E-dziennik", "Dokumenty"].map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className={`rounded-md px-3 py-2 text-sm ${index === 0 ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-600"}`}
            >
              {item}
            </motion.div>
          ))}
        </div>
        <div className="min-w-0 space-y-3">
          <div className="rounded-lg bg-slate-950 p-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-white/55">Aktywna sesja PIN</div>
                <div className="mt-2 text-3xl font-semibold">482 913</div>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-950">LIVE</div>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              ["28", "uczestników"],
              ["91%", "oddane"],
              ["12m", "średni czas"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xl font-semibold text-slate-950">{value}</div>
                <div className="mt-1 text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
          <span>Wyniki klasy</span>
          <span>dzisiaj</span>
        </div>
        {[82, 65, 94, 74, 88].map((width, index) => (
          <div key={index} className="mb-2 h-2 rounded-full bg-white">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${width}%` }}
              transition={{ delay: 0.25 + index * 0.08, duration: 0.6 }}
              className="h-full rounded-full bg-blue-700"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="text-xs font-semibold uppercase text-blue-800">{eyebrow}</div>
      <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-8 text-slate-600">{text}</p>
    </div>
  );
}

function SystemMockup() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-3">
        <div>
          <div className="text-xs font-semibold uppercase text-slate-500">EduNex</div>
          <div className="mt-1 text-sm font-semibold text-slate-950">Pulpit pracy</div>
        </div>
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
        </div>
      </div>
      <div className="grid min-w-0 gap-3 p-3 lg:grid-cols-[0.75fr_1fr]">
        <div className="min-w-0 space-y-2">
          {["Egzaminy", "Klasy", "Wyniki", "E-dziennik", "Dokumenty"].map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.07 }}
              className={`rounded-md px-3 py-2 text-sm ${index === 0 ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-600"}`}
            >
              {item}
            </motion.div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="rounded-lg bg-slate-950 p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-white/55">Aktywna sesja PIN</div>
                <div className="mt-2 text-3xl font-semibold">482 913</div>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-950">LIVE</div>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              ["28", "uczestników"],
              ["91%", "oddane"],
              ["12m", "średni czas"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xl font-semibold text-slate-950">{value}</div>
                <div className="mt-1 text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        <div className="min-w-0 rounded-lg border border-slate-200 p-3">
            <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
              <span>Wyniki klasy</span>
              <span>dzisiaj</span>
            </div>
            {[82, 65, 94, 74, 88].map((width, index) => (
              <div key={index} className="mb-2 h-2 rounded-full bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ delay: 0.25 + index * 0.08, duration: 0.6 }}
                  className="h-full rounded-full bg-blue-700"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
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
    if (!form.email.trim() || !form.institutionName.trim() || !form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Uzupełnij wymagane pola formularza.");
      return;
    }

    const subject = encodeURIComponent(`Kontakt EduNex: ${form.institutionName}`);
    const body = encodeURIComponent([
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
    ].join("\n"));

    window.location.href = `mailto:kontakt@edunex.pl?subject=${subject}&body=${body}`;
    toast.success("Dziękujemy, skontaktujemy się.");
  };

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.10)] sm:p-7">
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Co Cię interesuje? <span className="sr-only">*</span>
          <select value={form.interest} onChange={(event) => update("interest", event.target.value)} className="h-12 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100">
            <option>Wdrożenie w szkole</option>
            <option>Egzaminy PIN</option>
            <option>NexAi i generator</option>
            <option>E-dziennik i eksport ocen</option>
            <option>Oferta dla instytucji</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Służbowy adres e-mail *
          <input value={form.email} onChange={(event) => update("email", event.target.value)} type="email" placeholder="anna.nowak@szkola.pl" className="h-12 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100" />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Typ placówki
            <select value={form.institutionType} onChange={(event) => update("institutionType", event.target.value)} className="h-12 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100">
              <option>Szkoła podstawowa</option>
              <option>Szkoła średnia</option>
              <option>Zespół szkół</option>
              <option>Uczelnia</option>
              <option>Organ prowadzący</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Wielkość placówki
            <select value={form.institutionSize} onChange={(event) => update("institutionSize", event.target.value)} className="h-12 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100">
              <option>1-100 uczniów</option>
              <option>101-500 uczniów</option>
              <option>501-1000 uczniów</option>
              <option>1001-5000 uczniów</option>
              <option>5001+ uczniów</option>
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Nazwa placówki *
          <input value={form.institutionName} onChange={(event) => update("institutionName", event.target.value)} placeholder="Nazwa szkoły lub instytucji" className="h-12 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100" />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Imię *
            <input value={form.firstName} onChange={(event) => update("firstName", event.target.value)} placeholder="Anna" className="h-12 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Nazwisko *
            <input value={form.lastName} onChange={(event) => update("lastName", event.target.value)} placeholder="Nowak" className="h-12 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100" />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Numer telefonu
          <input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+48 000 000 000" className="h-12 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100" />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Opisz potrzeby szkoły
          <textarea value={form.needs} onChange={(event) => update("needs", event.target.value)} rows={5} placeholder="Napisz, ile klas ma placówka, jakie egzaminy chcecie obsługiwać i czego potrzebuje zespół." className="resize-none rounded-md border border-slate-300 bg-white px-3 py-3 text-sm leading-6 text-slate-950 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100" />
        </label>

        <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
          <input type="checkbox" checked={form.marketingConsent} onChange={(event) => update("marketingConsent", event.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-800" />
          <span>
            Chcę otrzymywać wiadomości o EduNex, wdrożeniach i wydarzeniach. Szczegóły są dostępne w{" "}
            <Link to="/dokumenty" className="font-semibold text-blue-800 hover:text-blue-950">dokumentach</Link>.
          </span>
        </label>

        <button className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800">
          Prześlij
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

export function PremiumLanding() {
  const [role, setRole] = useState<RoleKey>("teacher");
  const activeRole = roles[role];
  const roleEntries = useMemo(() => Object.entries(roles) as Array<[RoleKey, typeof activeRole]>, []);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f6f8fb] text-slate-950">
      <Toaster richColors />
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/88 backdrop-blur-xl">
        <div className="mx-auto grid min-h-16 w-full max-w-7xl grid-cols-1 items-center gap-3 px-4 py-3 sm:flex sm:h-16 sm:flex-nowrap sm:justify-between sm:px-6 sm:py-0 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-slate-950 text-white">
              <Layers3 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">EduNex</div>
              <div className="hidden text-xs text-slate-500 sm:block">Platforma edukacyjna</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map(([label, href]) => (
              <a key={href} href={href} className="text-sm font-medium text-slate-600 transition hover:text-slate-950">
                {label}
              </a>
            ))}
          </nav>

          <div className="grid w-full min-w-0 max-w-[calc(100vw-2rem)] grid-cols-2 gap-2 sm:flex sm:w-auto sm:max-w-none sm:shrink-0 sm:items-center">
            <Link to="/auth" className="inline-flex h-10 items-center justify-center rounded-md px-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 sm:h-auto sm:px-3 sm:py-2 sm:text-sm">
              Logowanie
            </Link>
            <Link to="/auth/register" className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:h-auto sm:px-4 sm:py-2 sm:text-sm">
              Rejestracja
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative w-full max-w-[100vw] overflow-hidden border-b border-slate-200 bg-white">
          <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(37,99,235,0.08),rgba(255,255,255,0))]" />
          <div className="mx-auto grid w-full max-w-7xl min-w-0 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-20">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="relative z-10 min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-blue-700" />
                Premium platforma dla szkół i instytucji
              </div>
              <h1 className="mt-6 max-w-[calc(100vw-2rem)] break-words text-[1.875rem] font-semibold leading-[1.12] text-slate-950 sm:max-w-4xl sm:text-7xl sm:leading-[0.96]">
                EduNex dla nowoczesnej, spokojnej i dobrze zarządzanej szkoły.
              </h1>
              <p className="mt-6 max-w-[calc(100vw-2rem)] text-base leading-8 text-slate-600 sm:max-w-2xl sm:text-lg">
                Egzaminy PIN, NexAi, e-dziennik, raporty i dokumenty prawne w jednym produkcie, który wygląda jak system wdrożony przez poważną instytucję.
              </p>
              <div className="mt-8 flex max-w-[calc(100vw-2rem)] flex-col gap-3 sm:max-w-none sm:flex-row">
                <Link to="/auth/register" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Rejestracja
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/auth" className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
                  Logowanie
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-4">
                {metrics.map(([value, label]) => (
                  <div key={value} className="bg-white p-4">
                    <div className="text-2xl font-semibold text-slate-950">{value}</div>
                    <div className="mt-1 text-xs leading-5 text-slate-500">{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.15 }} className="relative z-10 min-w-0 space-y-4">
              <HeroProductVisual />
              <SystemMockup />
            </motion.div>
          </div>
        </section>

        <section id="platforma" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Platforma"
            title="Jedna ścieżka od przygotowania egzaminu do decyzji szkoły"
            text="EduNex łączy codzienną pracę nauczyciela, prosty dostęp ucznia, raporty dla dyrekcji i dokumenty wymagane w placówce."
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-4">
            {workflow.map(([step, title, text]) => (
              <motion.div key={step} whileHover={{ y: -4 }} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-slate-950 text-sm font-semibold text-white">{step}</div>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="panele" className="border-y border-slate-200 bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Role"
              title="Każdy widzi właściwy panel, bez zbędnych warstw"
              text="System ma różne ścieżki dla nauczyciela, ucznia, dyrekcji i administratora, ale zachowuje jeden język wizualny."
            />
            <div className="mt-12 grid gap-6 lg:grid-cols-[340px_1fr]">
              <div className="space-y-2">
                {roleEntries.map(([key, item]) => {
                  const Icon = item.icon;
                  const selected = role === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setRole(key)}
                      className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition ${
                        selected ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <Icon className={`mt-0.5 h-5 w-5 ${selected ? "text-blue-800" : "text-slate-500"}`} />
                      <div>
                        <div className="text-sm font-semibold text-slate-950">{item.label}</div>
                        <div className="mt-1 text-xs leading-5 text-slate-500">{item.title}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={role}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="rounded-lg border border-slate-200 bg-slate-950 p-6 text-white shadow-sm"
                >
                  <div className="text-sm font-semibold text-blue-200">{activeRole.label}</div>
                  <h3 className="mt-3 max-w-2xl text-3xl font-semibold">{activeRole.title}</h3>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">{activeRole.copy}</p>
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {activeRole.points.map((point) => (
                      <div key={point} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85">
                        <Check className="h-4 w-4 text-blue-200" />
                        {point}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Moduły"
            title="Rozbudowany produkt, który nadal da się szybko zrozumieć"
            text="Każdy moduł ma własną funkcję, ale UI prowadzi użytkownika przez pracę bez nadmiaru ozdobników."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map(([Icon, title, text]) => (
              <motion.div key={title} whileHover={{ y: -4 }} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-blue-50 text-blue-800">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="bezpieczenstwo" className="border-y border-slate-200 bg-slate-950 py-20 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1fr] lg:px-8">
            <div>
              <div className="text-xs font-semibold uppercase text-blue-200">Bezpieczeństwo</div>
              <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">System dla danych uczniów musi wyglądać i działać poważnie.</h2>
              <p className="mt-5 text-sm leading-7 text-slate-300">
                Role, zgody, dokumenty, retencja i eksporty są częścią produktu, nie dopiskiem w stopce.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Role i zatwierdzanie", "Dostęp nauczyciela lub administratora może wymagać decyzji szkoły."],
                ["Dokumenty publiczne", "Regulamin, RODO i powierzenie danych są dostępne w aplikacji."],
                ["Minimalizacja danych", "Uczeń może pracować kodem PIN bez pełnego konta."],
                ["Eksport i ślad pracy", "Wyniki, certyfikaty i eksporty są uporządkowane w systemie."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-lg border border-white/10 bg-white/5 p-5">
                  <ShieldCheck className="h-5 w-5 text-blue-200" />
                  <h3 className="mt-4 text-sm font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="cennik" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Cennik"
            title="Plany dla nauczyciela, szkoły i większej instytucji"
            text="Cennik jest czytelny, bez agresywnego marketingu. Placówka ma szybko zobaczyć, od czego zacząć."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.name} className={`rounded-lg border p-6 shadow-sm ${plan.featured ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-950"}`}>
                <div className={plan.featured ? "text-blue-200" : "text-blue-800"}>{plan.name}</div>
                <div className="mt-4 flex items-end gap-2">
                  <div className="text-4xl font-semibold">{plan.price}</div>
                  <div className={`pb-1 text-sm ${plan.featured ? "text-slate-300" : "text-slate-500"}`}>{plan.note}</div>
                </div>
                <p className={`mt-4 text-sm leading-6 ${plan.featured ? "text-slate-300" : "text-slate-600"}`}>{plan.target}</p>
                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <Check className={`h-4 w-4 ${plan.featured ? "text-blue-200" : "text-blue-800"}`} />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="dokumenty" className="border-y border-slate-200 bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Dokumenty"
              title="Regulamin, prywatność i RODO dostępne od razu"
              text="Dokumenty otwierają się w aplikacji i są widoczną częścią produktu, a nie ukrytą formalnością."
            />
            <div className="mt-12 grid gap-4 lg:grid-cols-5">
              {documents.map(([Icon, title, text]) => (
                <Link key={title} to="/dokumenty" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md">
                  <Icon className="h-5 w-5 text-blue-800" />
                  <h3 className="mt-4 text-sm font-semibold text-slate-950">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="FAQ"
            title="Najczęstsze pytania przed wdrożeniem"
            text="Krótko i konkretnie: dostęp ucznia, logowanie, dokumenty i e-dziennik."
          />
          <div className="mx-auto mt-10 max-w-3xl divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {faq.map(([question, answer]) => (
              <details key={question} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-950">
                  {question}
                  <ChevronRight className="h-4 w-4 text-slate-400 transition group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="kontakt" className="border-t border-slate-200 bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.82fr_1fr] lg:px-8">
            <div>
              <div className="text-xs font-semibold uppercase text-blue-800">Kontakt</div>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-slate-950 sm:text-6xl">
                Porozmawiajmy o wdrożeniu EduNex w Twojej placówce.
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                Formularz zbiera tylko dane potrzebne do przygotowania rozmowy. Układ jest prosty: potrzeba, placówka, kontakt i opis wyzwania.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  "Dopasowanie planu do liczby klas i roli szkoły.",
                  "Przegląd egzaminów PIN, NexAi i e-dziennika.",
                  "Omówienie dokumentów, RODO i wdrożenia.",
                  "Kontakt bez tworzenia nowego backendu formularzy.",
                ].map((item) => (
                  <div key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-blue-800" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <Mail className="h-5 w-5 text-blue-800" />
                kontakt@edunex.pl
              </div>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-[#f6f8fb]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <div className="font-semibold text-slate-950">EduNex</div>
            <div>Platforma edukacyjna dla szkół i instytucji.</div>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/dokumenty" className="hover:text-slate-950">Dokumenty</Link>
            <Link to="/auth" className="hover:text-slate-950">Logowanie</Link>
            <Link to="/auth/register" className="hover:text-slate-950">Rejestracja</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
