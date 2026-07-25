import { createFileRoute, Link } from "@tanstack/react-router";
import type { ComponentType } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  GraduationCap,
  Headphones,
  Layers3,
  LockKeyhole,
  School,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export const Route = createFileRoute("/cennik")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Cennik EduNex — pakiety dla klas, szkół i instytucji" },
      {
        name: "description",
        content:
          "Porównaj pakiety EduNex dla nauczycieli, szkół i instytucji. Przejrzysty zakres, bezpieczeństwo i plan wdrożenia.",
      },
    ],
  }),
});

type Plan = {
  name: string;
  audience: string;
  price: string;
  period: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  features: string[];
  cta: string;
  featured?: boolean;
};

const plans: Plan[] = [
  {
    name: "Klasa",
    audience: "Na dobry początek",
    price: "Bezpłatny start",
    period: "podstawowy zakres",
    description: "Dla nauczyciela, który chce rozpocząć pracę z jedną klasą i poznać EduNex.",
    icon: GraduationCap,
    features: [
      "Konta nauczyciela i uczniów",
      "Egzaminy i sesje PIN",
      "Podstawowe wyniki",
      "Wsparcie centrum pomocy",
    ],
    cta: "Rozpocznij",
  },
  {
    name: "Nauczyciel",
    audience: "Samodzielna pracownia",
    price: "Wycena zakresu",
    period: "dopasowana do pracy",
    description: "Rozszerzony warsztat do przygotowania, prowadzenia i analizowania egzaminów.",
    icon: Sparkles,
    features: [
      "Rozszerzony bank pytań",
      "NexAI pod kontrolą nauczyciela",
      "Monitoring sesji",
      "Eksport wyników",
    ],
    cta: "Dobierz zakres",
    featured: true,
  },
  {
    name: "Szkoła",
    audience: "Wspólne środowisko",
    price: "Wycena wdrożenia",
    period: "według potrzeb placówki",
    description: "Jedno uporządkowane środowisko dla nauczycieli, dyrekcji i administracji.",
    icon: School,
    features: [
      "Role i uprawnienia placówki",
      "NexDziennik",
      "Panel dyrekcji",
      "Wsparcie wdrożeniowe",
    ],
    cta: "Porozmawiaj z nami",
  },
  {
    name: "Instytucja",
    audience: "Program wieloplacówkowy",
    price: "Oferta indywidualna",
    period: "uzgodniony model",
    description: "Dla organów prowadzących i programów obejmujących wiele szkół lub regionów.",
    icon: Building2,
    features: [
      "Wiele placówek",
      "Dane zagregowane",
      "Integracje i eksport",
      "Plan bezpieczeństwa i SLA",
    ],
    cta: "Skontaktuj się",
  },
];

const comparison = [
  {
    title: "Nauczanie i egzaminy",
    icon: Layers3,
    rows: [
      ["Konta nauczyciela i uczniów", "Tak", "Tak", "Tak", "Tak"],
      [
        "Egzaminy, sprawdziany i sesje PIN",
        "Podstawowe",
        "Rozszerzone",
        "Rozszerzone",
        "Konfigurowalne",
      ],
      ["Bank pytań i materiały", "Podstawowy", "Rozszerzony", "Współdzielony", "Współdzielony"],
      ["NexAI", "—", "Dostępny", "Z polityką szkoły", "Z polityką instytucji"],
    ],
  },
  {
    title: "Zarządzanie i bezpieczeństwo",
    icon: LockKeyhole,
    rows: [
      ["Role i uprawnienia", "Podstawowe", "Podstawowe", "Pełne", "Zaawansowane"],
      ["Panel dyrekcji", "—", "—", "Tak", "Tak"],
      ["NexDziennik", "—", "Opcjonalnie", "Tak", "Tak"],
      ["Plan wdrożenia i wsparcie", "Centrum pomocy", "Standard", "Wdrożeniowe", "Indywidualne"],
    ],
  },
] as const;

const faqs = [
  [
    "Czy bezpłatny start wymaga karty płatniczej?",
    "Nie. Samo założenie konta i uruchomienie podstawowego zakresu nie wymaga podania karty płatniczej.",
  ],
  [
    "Dlaczego część pakietów nie ma jednej stałej kwoty?",
    "Szkoły różnią się liczbą użytkowników, zakresem modułów, integracjami i wymaganym wsparciem. Cenę potwierdzamy dopiero po ustaleniu rzeczywistego zakresu.",
  ],
  [
    "Czy wysłanie formularza uruchamia opłatę?",
    "Nie. Formularz rozpoczyna rozmowę o zakresie. Żadna płatna usługa nie jest aktywowana bez osobnego potwierdzenia warunków.",
  ],
  [
    "Czy uczeń może utworzyć własne konto?",
    "Tak. Rejestracja obejmuje konto ucznia, a zakres dostępu jest oddzielony od uprawnień nauczyciela, dyrekcji i administracji.",
  ],
] as const;

const primaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#168cff] px-5 text-sm font-bold text-white shadow-[0_14px_35px_rgba(22,140,255,.24)] transition hover:-translate-y-0.5 hover:bg-[#087be6] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#168cff]/30";
const secondaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/75 px-5 text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#168cff]/20 dark:border-white/15 dark:bg-white/[.06] dark:text-white dark:hover:bg-white/[.1]";

function PricingPage() {
  return (
    <div className="institutional-landing pricing-page min-h-screen overflow-x-clip text-slate-950">
      <a
        href="#main-content"
        className="fixed left-4 top-[-100px] z-[200] rounded-lg bg-white px-4 py-3 font-bold shadow-xl focus:top-4"
      >
        Przejdź do treści
      </a>

      <header className="liquid-nav sticky top-0 z-50 border-b border-white/60 bg-white/75 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-7">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#07182e] text-white shadow-lg">
              <Layers3 className="h-5 w-5" />
            </span>
            <span>
              <strong className="block text-sm tracking-tight text-[#07182e]">EduNex</strong>
              <small className="block text-[9px] font-semibold uppercase tracking-[.16em] text-slate-500">
                System operacyjny szkoły
              </small>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeSwitcher compact />
            <Link to="/" className={`${secondaryButton} hidden sm:inline-flex`}>
              <ArrowLeft className="h-4 w-4" />
              Strona główna
            </Link>
            <Link to="/auth" className={primaryButton}>
              Zaloguj się
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className="relative overflow-hidden border-b border-slate-200 px-4 py-20 sm:px-7 lg:py-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(75,197,242,.20),transparent_30rem),radial-gradient(circle_at_85%_30%,rgba(60,116,255,.12),transparent_34rem)]" />
          <div className="relative mx-auto max-w-[1180px] text-center">
            <span className="liquid-chip inline-flex items-center gap-2 rounded-full border border-white/60 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[.15em] text-[#0869c7]">
              <ShieldCheck className="h-4 w-4" />
              Przejrzyste pakiety EduNex
            </span>
            <h1 className="mx-auto mt-7 max-w-5xl text-5xl font-semibold tracking-[-.06em] text-[#07182e] sm:text-6xl lg:text-7xl">
              Cennik, który rośnie razem ze szkołą.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              Zacznij od jednej klasy. Dodawaj moduły, role i wsparcie wtedy, gdy placówka jest na
              to gotowa. Zakres zawsze potwierdzamy przed aktywacją płatnej usługi.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/auth/register" className={primaryButton}>
                Rozpocznij bezpłatnie
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="/#kontakt" className={secondaryButton}>
                Zapytaj o wdrożenie
              </a>
            </div>
          </div>
        </section>

        <section
          className="mx-auto max-w-[1440px] px-4 py-16 sm:px-7 lg:py-24"
          aria-labelledby="plans-title"
        >
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-[.15em] text-[#0869c7]">
                Wybierz skalę
              </span>
              <h2
                id="plans-title"
                className="mt-3 text-3xl font-semibold tracking-[-.045em] text-[#07182e] sm:text-4xl"
              >
                Cztery czytelne punkty startu
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              Nie publikujemy pozornie precyzyjnej ceny tam, gdzie o koszcie decydują liczba kont,
              integracje i poziom wsparcia.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <article
                  key={plan.name}
                  className={`pricing-card liquid-panel relative flex min-h-[470px] flex-col rounded-[28px] border p-6 ${plan.featured ? "pricing-card-featured border-[#168cff]/50" : "border-white/60"}`}
                >
                  {plan.featured && (
                    <span className="absolute right-4 top-4 rounded-full bg-[#168cff] px-3 py-1 text-[9px] font-extrabold uppercase tracking-[.12em] text-white">
                      Rekomendowany
                    </span>
                  )}
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#07182e] text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="mt-6 text-[10px] font-bold uppercase tracking-[.14em] text-[#0869c7]">
                    {plan.audience}
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-[#07182e]">{plan.name}</h3>
                  <div className="mt-5 text-3xl font-semibold tracking-[-.05em] text-[#07182e]">
                    {plan.price}
                  </div>
                  <span className="mt-1 text-xs text-slate-500">{plan.period}</span>
                  <p className="mt-5 text-sm leading-6 text-slate-600">{plan.description}</p>
                  <ul className="mt-6 grid gap-3 text-sm text-slate-700">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={plan.name === "Klasa" ? "/auth/register" : "/#kontakt"}
                    className={`${plan.featured ? primaryButton : secondaryButton} mt-auto`}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </article>
              );
            })}
          </div>
          <p className="mt-6 text-center text-xs leading-6 text-slate-500">
            Bezpłatny start nie wymaga karty. Warunki płatnych wdrożeń są przedstawiane i
            potwierdzane przed uruchomieniem.
          </p>
        </section>

        <section className="pricing-section border-y border-slate-200 bg-[#f3f6fa] px-4 py-16 sm:px-7 lg:py-24">
          <div className="mx-auto max-w-[1280px]">
            <div className="max-w-3xl">
              <span className="text-[10px] font-extrabold uppercase tracking-[.15em] text-[#0869c7]">
                Porównaj możliwości
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-.045em] text-[#07182e] sm:text-4xl">
                Zakres widoczny przed decyzją
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Najważniejsze różnice zebrane w jednym miejscu — od pracy w klasie po zarządzanie
                wieloma placówkami.
              </p>
            </div>

            <div className="pricing-compare mt-10 overflow-x-auto rounded-[28px] border border-slate-200 bg-white/80 shadow-[0_24px_70px_rgba(7,24,46,.08)]">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="w-[31%] p-5 font-semibold text-slate-600">Funkcja</th>
                    {plans.map((plan) => (
                      <th key={plan.name} className="p-5 font-bold text-[#07182e]">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.flatMap((group) => {
                    const GroupIcon = group.icon;
                    return [
                      <tr
                        key={`${group.title}-heading`}
                        className="border-b border-slate-200 bg-[#07182e] text-white"
                      >
                        <th
                          colSpan={5}
                          className="p-4 text-xs font-bold uppercase tracking-[.12em] !text-white"
                        >
                          <span className="inline-flex items-center gap-2">
                            <GroupIcon className="h-4 w-4" />
                            {group.title}
                          </span>
                        </th>
                      </tr>,
                      ...group.rows.map((row) => (
                        <tr key={row[0]} className="border-b border-slate-200 last:border-b-0">
                          {row.map((cell, index) => (
                            <td
                              key={`${row[0]}-${index}`}
                              className={`p-5 ${index === 0 ? "font-semibold text-slate-800" : "text-slate-600"}`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      )),
                    ];
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1280px] gap-12 px-4 py-20 sm:px-7 lg:grid-cols-[.8fr_1.2fr] lg:py-28">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-[.15em] text-[#0869c7]">
              Pytania i odpowiedzi
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.045em] text-[#07182e] sm:text-4xl">
              Bez drobnego druku
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Najważniejsze informacje przed rejestracją lub rozmową o wdrożeniu.
            </p>
          </div>
          <div className="border-t border-slate-300">
            {faqs.map(([question, answer]) => (
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

        <section className="mx-auto mb-20 max-w-[1280px] px-4 sm:px-7">
          <div className="relative overflow-hidden rounded-[32px] bg-[#07182e] p-7 text-white shadow-[0_34px_110px_rgba(7,24,46,.28)] sm:p-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(92,207,250,.24),transparent_25rem)]" />
            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.15em] !text-[#8bd7f5]">
                  <BadgeCheck className="h-4 w-4" />
                  Wdrożenie kontrolowane
                </span>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-.045em] !text-white sm:text-5xl">
                  Ustalmy zakres, który ma sens dla Twojej placówki.
                </h2>
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs !text-[#b9c7d8]">
                  <span className="inline-flex items-center gap-2">
                    <Users className="h-4 w-4" /> Role i użytkownicy
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Bezpieczeństwo
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Headphones className="h-4 w-4" /> Plan wsparcia
                  </span>
                </div>
              </div>
              <a href="/#kontakt" className={primaryButton}>
                Skontaktuj się
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
