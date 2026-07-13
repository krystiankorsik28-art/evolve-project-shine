import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
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
  ShieldCheck,
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
      { title: "E-dziennik — EduNex" },
      {
        name: "description",
        content:
          "Centrum E-dziennika EduNex: klasy, lekcje, frekwencja, oceny, zadania i komunikacja szkoły.",
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
    table: "lessons",
    label: "Lekcje",
    description: "Tematy, terminy i sale lekcyjne",
    icon: BookOpenCheck,
  },
  {
    table: "lesson_attendance",
    label: "Frekwencja",
    description: "Obecności i usprawiedliwienia",
    icon: UserCheck,
  },
  {
    table: "grade_entries",
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
            Strona główna
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 sm:inline-flex dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              Moduł operacyjny EduNex
            </span>
            <ThemeSwitcher />
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)] dark:border-white/10 dark:bg-[#17181b] dark:shadow-[0_28px_90px_rgba(0,0,0,0.35)]">
          <div className="grid lg:grid-cols-[1fr_340px]">
            <div className="p-7 sm:p-9 lg:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0067b8] dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200">
                <GraduationCap className="h-3.5 w-3.5" />
                E-dziennik
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                Centrum codziennej pracy szkoły.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
                Jeden widok dla klas, lekcji, frekwencji, ocen, zadań, wydarzeń i komunikacji — z
                bezpośrednim przejściem do narzędzi nauczyciela.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/teacher"
                  search={{ tab: "edziennik" }}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#0067b8] px-5 text-sm font-semibold text-white transition hover:bg-[#005a9e]"
                >
                  Otwórz E-dziennik
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
              <LayoutDashboard className="h-5 w-5 text-[#0067b8] dark:text-[#10a37f]" />
              <div className="mt-7 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Status danych
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
                Pusty moduł jest gotowy do pracy — pojawią się w nim dane po dodaniu klas, lekcji
                lub ocen.
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

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      </main>
    </div>
  );
}
