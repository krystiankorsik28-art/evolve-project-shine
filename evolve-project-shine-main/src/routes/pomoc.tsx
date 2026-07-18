import { useDeferredValue, useMemo, useState, type ComponentType } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpenCheck,
  Bot,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ExternalLink,
  FileText,
  GraduationCap,
  HelpCircle,
  KeyRound,
  Layers3,
  LifeBuoy,
  LockKeyhole,
  Mail,
  MessageCircleQuestion,
  Search,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";

export const Route = createFileRoute("/pomoc")({
  component: HelpCenter,
  head: () => ({
    meta: [
      { title: "Centrum Pomocy | EduNex" },
      {
        name: "description",
        content:
          "Pomoc EduNex: pierwsze kroki, konta i role, NexDziennik, egzaminy PIN, NexAI i bezpieczeństwo.",
      },
    ],
  }),
});

type CategoryId = "start" | "account" | "journal" | "exams" | "ai" | "security";
type IconType = ComponentType<{ className?: string }>;

type HelpArticle = {
  id: string;
  category: CategoryId;
  title: string;
  summary: string;
  answer: string;
  popular?: boolean;
};

const CATEGORIES: Array<{
  id: CategoryId;
  label: string;
  description: string;
  icon: IconType;
}> = [
  {
    id: "start",
    label: "Pierwsze kroki",
    description: "Start konta i konfiguracja",
    icon: Sparkles,
  },
  {
    id: "account",
    label: "Konto i role",
    description: "Logowanie, dostęp i akceptacja",
    icon: UserRoundCheck,
  },
  {
    id: "journal",
    label: "NexDziennik",
    description: "Oceny, plan i frekwencja",
    icon: BookOpenCheck,
  },
  {
    id: "exams",
    label: "Egzaminy i PIN",
    description: "Testy, sesje i wyniki",
    icon: ClipboardCheck,
  },
  { id: "ai", label: "NexAI", description: "Bezpieczna pomoc AI", icon: Bot },
  {
    id: "security",
    label: "Dane i bezpieczeństwo",
    description: "RODO, dokumenty i dostęp",
    icon: ShieldCheck,
  },
];

const ARTICLES: HelpArticle[] = [
  {
    id: "after-registration",
    category: "start",
    title: "Co dzieje się po utworzeniu konta?",
    summary: "Potwierdzenie e-maila, krótki start i sprawdzenie roli.",
    answer:
      "Po kliknięciu linku z wiadomości EduNex uruchomi krótką konfigurację. Odpowiedzi dopasują skróty i podpowiedzi, ale nie nadają uprawnień. Na końcu system sprawdzi rolę zatwierdzoną przez placówkę i otworzy właściwy panel.",
    popular: true,
  },
  {
    id: "first-setup",
    category: "start",
    title: "Czy mogę później zmienić odpowiedzi ze startu?",
    summary: "Preferencje modułów i styl pracy nie są stałe.",
    answer:
      "Tak. Priorytety modułów, sposób prowadzenia i powiadomienia są ustawieniami profilu. Możesz je zmienić bez ponownej weryfikacji konta.",
  },
  {
    id: "role-approval",
    category: "account",
    title: "Dlaczego moja rola oczekuje na akceptację?",
    summary: "Wybranie roli nie daje automatycznie dostępu do danych szkoły.",
    answer:
      "Rolę nauczyciela, dyrekcji, administratora lub rodzica potwierdza placówka. Chroni to dane uczniów przed dostępem osoby, która jedynie wybrała daną rolę podczas rejestracji.",
    popular: true,
  },
  {
    id: "login-methods",
    category: "account",
    title: "Jak mogę zalogować się do EduNex?",
    summary: "E-mail, konto organizacji oraz wejście ucznia kodem PIN.",
    answer:
      "Dorośli użytkownicy mogą użyć e-maila i hasła albo logowania organizacyjnego, jeśli szkoła je skonfigurowała. Uczeń może wejść również przez sesję PIN utworzoną przez nauczyciela.",
  },
  {
    id: "password-reset",
    category: "account",
    title: "Nie pamiętam hasła — co zrobić?",
    summary: "Uruchom bezpieczne odzyskiwanie na stronie logowania.",
    answer:
      "Na stronie logowania wybierz opcję odzyskiwania hasła i wpisz adres konta. Jeśli korzystasz z logowania organizacji, skontaktuj się z administratorem Microsoft 365 lub Google Workspace w swojej placówce.",
  },
  {
    id: "journal-intro",
    category: "journal",
    title: "Czym jest NexDziennik?",
    summary: "To własny e-dziennik w ekosystemie EduNex.",
    answer:
      "NexDziennik łączy klasy, plan lekcji, frekwencję, oceny, zadania, wydarzenia, ogłoszenia i wiadomości. Każda rola otrzymuje inny, ograniczony zakres widoku.",
    popular: true,
  },
  {
    id: "journal-attendance",
    category: "journal",
    title: "Jak uzupełnić frekwencję?",
    summary: "Otwórz bieżącą lekcję i oznacz status każdego ucznia.",
    answer:
      "W NexDzienniku wybierz lekcję z planu dnia, otwórz listę obecności i zaznacz statusy. Zmiany są przypisane do konkretnej lekcji oraz osoby, która je wprowadziła.",
  },
  {
    id: "journal-import",
    category: "journal",
    title: "Czy NexDziennik współpracuje z innym e-dziennikiem?",
    summary: "Zewnętrzny system może pozostać źródłem migracji lub eksportu.",
    answer:
      "W panelu nauczyciela znajdziesz sekcję integracji i eksportów. NexDziennik jest głównym widokiem EduNex, a starszy system może służyć jako opcjonalne źródło danych lub miejsce przekazania raportu.",
  },
  {
    id: "student-pin",
    category: "exams",
    title: "Jak uczeń dołącza do egzaminu kodem PIN?",
    summary: "Nauczyciel uruchamia sesję i udostępnia krótki kod.",
    answer:
      "Uczeń wybiera wejście kodem PIN, podaje kod sesji oraz wymagane dane identyfikacyjne. Kod działa wyłącznie dla konkretnej, aktywnej sesji egzaminacyjnej.",
    popular: true,
  },
  {
    id: "exam-results",
    category: "exams",
    title: "Kiedy pojawiają się wyniki egzaminu?",
    summary: "Zależy od ustawień publikacji i pytań wymagających oceny.",
    answer:
      "Pytania zamknięte mogą zostać przeliczone od razu. Jeśli praca zawiera odpowiedzi otwarte, nauczyciel najpierw zatwierdza punktację i dopiero potem publikuje wynik.",
  },
  {
    id: "ai-control",
    category: "ai",
    title: "Czy NexAI sam publikuje oceny lub materiały?",
    summary: "Nie — ostateczna decyzja należy do nauczyciela.",
    answer:
      "NexAI może przygotować propozycję, podsumować dane lub pomóc w wyjaśnieniu tematu. Publikacja materiału, kryteriów i ocen wymaga działania uprawnionej osoby.",
    popular: true,
  },
  {
    id: "ai-personalization",
    category: "ai",
    title: "Jak działa personalizacja NexAI?",
    summary: "Zmienia styl podpowiedzi, nie zakres uprawnień.",
    answer:
      "Ustawienie ze startu może wpłynąć na długość i sposób prezentacji odpowiedzi. Nie zmienia dostępu do danych ani nie pozwala modelowi wykonywać działań zarezerwowanych dla nauczyciela lub administratora.",
  },
  {
    id: "data-access",
    category: "security",
    title: "Kto widzi dane ucznia?",
    summary: "Widok zależy od zatwierdzonej roli i relacji z placówką.",
    answer:
      "Dostęp jest ograniczony rolą oraz kontekstem organizacji. Sam wybór roli w przeglądarce nie wystarcza. Szczegółowe zasady znajdują się w publicznym Centrum dokumentów.",
    popular: true,
  },
  {
    id: "legal-documents",
    category: "security",
    title: "Gdzie znajdę regulamin, prywatność i informacje RODO?",
    summary: "Dokumenty formalne są dostępne publicznie, bez logowania.",
    answer:
      "Otwórz Centrum dokumentów EduNex. Znajdziesz tam regulamin, politykę prywatności, informacje RODO, zasady dostępności i materiały dla administratora danych.",
  },
];

const QUICK_LINKS = [
  {
    title: "Pierwsze uruchomienie",
    description: "Zobacz, jak wygląda start po rejestracji",
    icon: Sparkles,
    to: "/auth/register" as const,
  },
  {
    title: "NexDziennik",
    description: "Poznaj własny e-dziennik EduNex",
    icon: BookOpenCheck,
    to: "/edziennik" as const,
  },
  {
    title: "Portal dostępu",
    description: "Logowanie, PIN i role użytkowników",
    icon: KeyRound,
    to: "/auth" as const,
  },
  {
    title: "Centrum dokumentów",
    description: "Regulamin, RODO i prywatność",
    icon: FileText,
    to: "/dokumenty" as const,
  },
] as const;

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function HelpCenter() {
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const deferredQuery = useDeferredValue(normalizeSearch(query.trim()));

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter((article) => {
      const matchesCategory = category === "all" || article.category === category;
      const haystack = normalizeSearch(`${article.title} ${article.summary} ${article.answer}`);
      const matchesQuery =
        !deferredQuery ||
        deferredQuery.split(/\s+/).every((term) => {
          const stem = term.length > 5 ? term.slice(0, -2) : term;
          return haystack.includes(term) || haystack.includes(stem);
        });
      return matchesCategory && matchesQuery;
    });
  }, [category, deferredQuery]);

  const popularArticles = ARTICLES.filter((article) => article.popular);

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f6cbd]/35"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-white">
              <Layers3 className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-4">EduNex</span>
              <span className="text-[11px] text-slate-500">Centrum Pomocy</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/dokumenty"
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
            >
              Dokumenty
            </Link>
            <Link
              to="/auth"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Zaloguj się
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-slate-200 bg-[#0b1728] text-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(59,130,246,.24),transparent_34%),radial-gradient(circle_at_82%_80%,rgba(34,211,238,.12),transparent_30%)]" />
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs font-semibold text-blue-100">
              <LifeBuoy className="h-4 w-4" />
              Pomoc dostępna bez logowania
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">
              Jak możemy Ci pomóc?
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Znajdź odpowiedź o koncie, roli, NexDzienniku, egzaminach lub bezpieczeństwie danych.
            </p>
            <label className="mx-auto mt-8 flex h-14 max-w-2xl items-center gap-3 rounded-xl border border-white/15 bg-white px-4 text-slate-950 shadow-[0_24px_70px_rgba(0,0,0,.25)] focus-within:ring-4 focus-within:ring-blue-300/30">
              <Search className="h-5 w-5 shrink-0 text-slate-400" />
              <span className="sr-only">Szukaj w Centrum Pomocy</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Wpisz pytanie, np. „jak działa kod PIN?”"
                className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 sm:text-base"
              />
              {query && (
                <span className="hidden text-xs font-medium text-slate-400 sm:inline">
                  {filteredArticles.length} wyników
                </span>
              )}
            </label>
            <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-slate-400">
              <span>Popularne:</span>
              {popularArticles.slice(0, 3).map((article) => (
                <button
                  key={article.id}
                  type="button"
                  onClick={() => setQuery(article.title)}
                  className="font-medium text-blue-200 hover:text-white"
                >
                  {article.title}
                </button>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  to={item.to}
                  className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-[#0f6cbd]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600" />
                  </div>
                  <h2 className="mt-5 text-sm font-semibold">{item.title}</h2>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{item.description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#0f6cbd]">
                  Baza wiedzy
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">Wybierz temat</h2>
              </div>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Materiały zebrane w jednym miejscu
              </span>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((item) => {
                const Icon = item.icon;
                const selected = category === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(selected ? "all" : item.id)}
                    className={`flex items-center gap-4 rounded-xl border p-4 text-left transition ${selected ? "border-[#0f6cbd] bg-blue-50 ring-1 ring-[#0f6cbd]" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${selected ? "bg-[#0f6cbd] text-white" : "bg-slate-100 text-slate-600"}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="mt-1 block text-xs text-slate-500">{item.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#0f6cbd]">
                  Odpowiedzi
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                  {query
                    ? `Wyniki dla „${query}”`
                    : category === "all"
                      ? "Najczęściej zadawane pytania"
                      : CATEGORIES.find((item) => item.id === category)?.label}
                </h2>
              </div>
              {(query || category !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCategory("all");
                  }}
                  className="text-sm font-semibold text-[#0f6cbd] hover:text-[#094f8a]"
                >
                  Wyczyść filtry
                </button>
              )}
            </div>
            {filteredArticles.length ? (
              <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {filteredArticles.map((article) => (
                  <details key={article.id} className="group p-5 sm:p-6">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-5">
                      <span>
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-semibold text-slate-950">
                            {article.title}
                          </span>
                          {article.popular && (
                            <span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#0f6cbd]">
                              Popularne
                            </span>
                          )}
                        </span>
                        <span className="mt-2 block text-sm leading-6 text-slate-500">
                          {article.summary}
                        </span>
                      </span>
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 transition group-open:rotate-90">
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </summary>
                    <div className="mt-5 border-l-2 border-blue-200 pl-4 text-sm leading-7 text-slate-700">
                      {article.answer}
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <MessageCircleQuestion className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-4 text-lg font-semibold">Nie znaleźliśmy takiej odpowiedzi</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Spróbuj krótszego hasła albo napisz do zespołu wsparcia.
                </p>
              </div>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-slate-200 bg-[#0b1728] p-6 text-white shadow-lg">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-blue-200">
                <MessageCircleQuestion className="h-5 w-5" />
              </span>
              <h2 className="mt-5 text-xl font-semibold">Nadal potrzebujesz pomocy?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Opisz problem, rolę użytkownika i ekran, na którym się pojawił.
              </p>
              <a
                href="mailto:kontakt@edunex.pl?subject=Pomoc%20EduNex"
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-blue-50"
              >
                <Mail className="h-4 w-4" />
                Napisz do wsparcia
              </a>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Systemy operacyjne
              </div>
              <p className="mt-2 text-xs leading-5 text-emerald-800/80">
                Logowanie, NexDziennik, egzaminy i publiczne dokumenty są dostępne.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <LockKeyhole className="h-4 w-4 text-[#0f6cbd]" />
                Bezpieczeństwo konta
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Nigdy nie przesyłaj hasła ani kodu sesji w wiadomości do pomocy.
              </p>
            </div>
          </aside>
        </section>

        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#0f6cbd]">Dalej</p>
              <h2 className="mt-3 text-2xl font-semibold">Poznaj pełne środowisko EduNex.</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/edziennik"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                NexDziennik <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/auth/register"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0f6cbd] px-4 text-sm font-semibold text-white transition hover:bg-[#0c5d9f]"
              >
                Utwórz konto <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-[#f6f8fb]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} EduNex · Centrum Pomocy</span>
          <span className="inline-flex items-center gap-2">
            <HelpCircle className="h-3.5 w-3.5" />
            Pomoc dla ucznia, nauczyciela, rodzica i administracji
          </span>
        </div>
      </footer>
    </div>
  );
}
