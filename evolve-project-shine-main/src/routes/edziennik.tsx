import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  Megaphone,
  MessageSquareText,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/edziennik")({
  component: Edziennik,
  head: () => ({
    meta: [
      { title: "NexDziennik — e-dziennik od EduNex" },
      {
        name: "description",
        content:
          "NexDziennik to własny e-dziennik EduNex: klasy, lekcje, frekwencja, oceny, zadania i komunikacja szkoły.",
      },
    ],
  }),
});

const metrics = [
  { table: "classes", label: "Klasy", description: "Oddziały i grupy uczniów", icon: Users },
  {
    table: "class_students",
    label: "Uczniowie",
    description: "Przypisania uczniów do klas",
    icon: GraduationCap,
  },
  {
    table: "journal_lessons",
    label: "Lekcje",
    description: "Tematy, terminy i sale lekcyjne",
    icon: BookOpenCheck,
  },
  {
    table: "journal_attendance",
    label: "Frekwencja",
    description: "Obecności i usprawiedliwienia",
    icon: UserCheck,
  },
  {
    table: "journal_grades",
    label: "Oceny",
    description: "Oceny cząstkowe i wyniki uczniów",
    icon: TrendingUp,
  },
  {
    table: "assignments",
    label: "Zadania",
    description: "Prace, sprawdziany i terminy",
    icon: ClipboardList,
  },
  {
    table: "assignment_submissions",
    label: "Oddania",
    description: "Prace przesłane przez uczniów",
    icon: CheckCircle2,
  },
  {
    table: "calendar_events",
    label: "Kalendarz",
    description: "Lekcje, sprawdziany i wydarzenia",
    icon: CalendarDays,
  },
  {
    table: "announcements",
    label: "Ogłoszenia",
    description: "Komunikaty dla klas i szkoły",
    icon: Megaphone,
  },
  {
    table: "direct_messages",
    label: "Wiadomości",
    description: "Komunikacja wewnętrzna",
    icon: Bell,
  },
  {
    table: "grade_exports",
    label: "Eksporty ocen",
    description: "Pliki i raporty ocen",
    icon: FileSpreadsheet,
  },
  {
    table: "journal_notes",
    label: "Uwagi i pochwały",
    description: "Wpisy wychowawcze i osiągnięcia",
    icon: ShieldCheck,
  },
] as const;

type TableName = (typeof metrics)[number]["table"];
type CountResult = { count: number | null; error: { message: string } | null };
const countClient = supabase as unknown as {
  from: (table: string) => {
    select: (columns: string, options: { count: "exact"; head: true }) => PromiseLike<CountResult>;
  };
};
const initialCounts = Object.fromEntries(metrics.map((metric) => [metric.table, null])) as Record<
  TableName,
  number | null
>;

const PRODUCT_VALUES = [
  {
    icon: Activity,
    title: "Jeden rytm dnia",
    description: "Plan lekcji, obecności, oceny i zadania układają się w czytelną oś pracy.",
  },
  {
    icon: MessageSquareText,
    title: "Komunikacja z kontekstem",
    description: "Wiadomość zawsze dotyczy właściwej klasy, ucznia albo wydarzenia.",
  },
  {
    icon: Smartphone,
    title: "Działa na każdym ekranie",
    description: "Nauczyciel, uczeń i rodzic widzą dokładnie to, czego potrzebują.",
  },
] as const;

function Edziennik() {
  const [counts, setCounts] = useState<Record<TableName, number | null>>(initialCounts);
  const [loading, setLoading] = useState(true);
  const [failedModules, setFailedModules] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    async function load() {
      const results = await Promise.all(
        metrics.map(async (metric) => {
          const { count, error } = await countClient
            .from(metric.table)
            .select("id", { count: "exact", head: true });
          return { metric, count: count ?? 0, error };
        }),
      );

      if (!active) return;

      const next = { ...initialCounts };
      const failed: string[] = [];
      for (const result of results) {
        if (result.error) {
          failed.push(result.metric.label);
          continue;
        }
        next[result.metric.table] = result.count;
      }

      setCounts(next);
      setFailedModules(failed);
      setLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const readyModules = useMemo(
    () => metrics.filter((metric) => (counts[metric.table] ?? 0) > 0).length,
    [counts],
  );
  const availableModules = metrics.length - failedModules.length;

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-slate-950 transition-colors dark:bg-[#111214] dark:text-slate-100">
      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-[#202123] dark:text-slate-200 dark:hover:bg-[#2a2b32]"
          >
            <ArrowLeft className="h-4 w-4" />
            EduNex
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 sm:inline-flex dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              Własny produkt EduNex
            </span>
            <ThemeSwitcher />
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)] dark:border-white/10 dark:bg-[#17181b] dark:shadow-[0_28px_90px_rgba(0,0,0,0.35)]">
          <div className="grid lg:grid-cols-[1fr_340px]">
            <div className="p-7 sm:p-9 lg:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0067b8] dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200">
                <Sparkles className="h-3.5 w-3.5" />
                NexDziennik · by EduNex
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                E-dziennik, który nie przeszkadza w prowadzeniu szkoły.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
                NexDziennik łączy plan, klasy, frekwencję, oceny, zadania, wydarzenia i komunikację.
                Mniej przełączania kart, więcej spokojnej pracy z uczniem.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/teacher"
                  search={{ tab: "edziennik" }}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#0067b8] px-5 text-sm font-semibold text-white transition hover:bg-[#005a9e]"
                >
                  Otwórz NexDziennik
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/auth"
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-white/10 dark:bg-[#202123] dark:text-slate-100 dark:hover:bg-[#2a2b32]"
                >
                  Zaloguj się
                </Link>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 p-7 dark:border-white/10 dark:bg-[#202123] lg:border-l lg:border-t-0">
              <div className="flex items-center justify-between">
                <LayoutDashboard className="h-5 w-5 text-[#0067b8] dark:text-[#10a37f]" />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Online
                </span>
              </div>
              <div className="mt-7 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Moduły z danymi
              </div>
              <div className="mt-3 flex items-end gap-3">
                <div className="text-5xl font-semibold tracking-[-0.06em]">
                  {loading ? "…" : readyModules}
                </div>
                <div className="pb-2 text-sm text-slate-500 dark:text-slate-400">
                  / {availableModules} aktywnych
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Każdy moduł działa w tym samym modelu ról EduNex. Pusty widok jest gotowy do pracy
                po dodaniu klas, lekcji lub ocen.
              </p>
            </div>
          </div>
        </section>

        {failedModules.length > 0 && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
            Część danych jest chwilowo niedostępna: {failedModules.join(", ")}. Pozostałe moduły
            nadal działają.
          </div>
        )}

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {PRODUCT_VALUES.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm dark:border-white/10"
            >
              <Icon className="h-5 w-5 text-blue-300" />
              <h2 className="mt-5 text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
            </article>
          ))}
        </section>

        <div className="mb-4 mt-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#0067b8] dark:text-blue-300">
              Moduły NexDziennika
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
              Cała szkoła w jednym spójnym systemie.
            </h2>
          </div>
          <Link
            to="/pomoc"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0067b8] hover:text-[#004f8b] dark:text-blue-300"
          >
            Zobacz pomoc do NexDziennika
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const value = counts[metric.table];
            const unavailable = !loading && value === null;
            const active = !loading && !unavailable && (value ?? 0) > 0;

            return (
              <article
                key={metric.table}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[#17181b]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-[#0067b8] dark:bg-[#2a2b32] dark:text-[#10a37f]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                      unavailable
                        ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200"
                        : active
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200"
                          : "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-[#202123] dark:text-slate-400"
                    }`}
                  >
                    {unavailable ? "offline" : active ? "aktywne" : "gotowe"}
                  </span>
                </div>
                <div className="mt-6 text-4xl font-semibold tracking-[-0.05em]">
                  {loading ? (
                    <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
                  ) : unavailable ? (
                    "—"
                  ) : (
                    (value ?? 0)
                  )}
                </div>
                <h2 className="mt-3 text-base font-semibold">{metric.label}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {metric.description}
                </p>
              </article>
            );
          })}
        </section>

        <section className="my-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#17181b]">
          <div className="grid lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="p-7 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#0067b8] dark:text-blue-300">
                Gotowy na spokojniejszy dzień?
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                Uruchom NexDziennik w panelu nauczyciela.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                Zacznij od klas i planu, a później dołącz oceny, frekwencję, komunikację oraz
                raporty — bez zmiany środowiska.
              </p>
            </div>
            <div className="border-t border-slate-200 p-7 dark:border-white/10 lg:border-l lg:border-t-0 lg:p-9">
              <Link
                to="/auth/teacher"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#0067b8] px-5 text-sm font-semibold text-white transition hover:bg-[#005a9e]"
              >
                Zacznij jako nauczyciel
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
