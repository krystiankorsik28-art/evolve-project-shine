import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  Megaphone,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/edziennik")({
  component: Edziennik,
  head: () => ({
    meta: [
      { title: "E-dziennik — EduNex" },
      { name: "description", content: "Kokpit E-dziennika EduNex: klasy, zadania, kalendarz, ogłoszenia i eksporty ocen." },
    ],
  }),
});

type TableKey = "classes" | "class_students" | "assignments" | "assignment_submissions" | "calendar_events" | "announcements" | "direct_messages" | "grade_exports";

type Metric = {
  table: TableKey;
  label: string;
  description: string;
  icon: typeof Users;
};

const metrics: Metric[] = [
  { table: "classes", label: "Klasy", description: "Oddziały i grupy uczniów", icon: Users },
  { table: "class_students", label: "Uczniowie", description: "Przypisania uczniów do klas", icon: GraduationCap },
  { table: "assignments", label: "Zadania", description: "Prace, sprawdziany i terminy", icon: ClipboardList },
  { table: "assignment_submissions", label: "Oddania", description: "Prace przesłane przez uczniów", icon: CheckCircle2 },
  { table: "calendar_events", label: "Kalendarz", description: "Lekcje, sprawdziany i wydarzenia", icon: CalendarDays },
  { table: "announcements", label: "Ogłoszenia", description: "Komunikaty dla klas i szkoły", icon: Megaphone },
  { table: "direct_messages", label: "Wiadomości", description: "Komunikacja wewnętrzna", icon: Bell },
  { table: "grade_exports", label: "Eksporty ocen", description: "Pliki i raporty ocen", icon: FileSpreadsheet },
];

function Edziennik() {
  const [counts, setCounts] = useState<Record<TableKey, number | null>>({
    classes: null,
    class_students: null,
    assignments: null,
    assignment_submissions: null,
    calendar_events: null,
    announcements: null,
    direct_messages: null,
    grade_exports: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      const next = { ...counts };
      try {
        for (const metric of metrics) {
          const { count, error: countError } = await supabase
            .from(metric.table)
            .select("id", { count: "exact", head: true });
          if (countError) throw countError;
          next[metric.table] = count ?? 0;
        }
        if (alive) setCounts(next);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "Nie udało się wczytać danych E-dziennika");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const readyModules = useMemo(() => metrics.filter((metric) => (counts[metric.table] ?? 0) > 0).length, [counts]);

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_16%_12%,rgba(0,120,212,.34),transparent_32%),radial-gradient(circle_at_84%_8%,rgba(80,230,255,.16),transparent_28%),linear-gradient(135deg,#020617,#07111f_48%,#0f172a)]" />
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[.07] px-4 py-2 text-sm font-semibold text-white/75 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Strona główna
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/10 px-4 py-2 text-xs font-semibold text-sky-100">
            <LayoutDashboard className="h-4 w-4" /> Moduł operacyjny EduNex
          </span>
        </div>

        <section className="rounded-[32px] border border-white/10 bg-white/[.055] p-6 shadow-[0_32px_120px_rgba(0,0,0,.38)] backdrop-blur-xl lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[.07] px-3 py-1 text-xs font-semibold uppercase tracking-[.18em] text-sky-100">
                <GraduationCap className="h-3.5 w-3.5" /> E-dziennik
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-.055em] sm:text-5xl lg:text-6xl">
                E-dziennik EduNex jako centrum pracy szkoły.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
                Kokpit pokazuje realny stan modułów w Supabase: klasy, uczniów, zadania, oddania, wydarzenia, ogłoszenia, wiadomości i eksporty ocen. Bez atrap — od razu widać, co jest gotowe, a co wymaga uzupełnienia.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#020617]/45 p-5">
              <div className="text-sm font-semibold text-white/60">Status wdrożenia</div>
              <div className="mt-3 flex items-end gap-3">
                <div className="text-5xl font-semibold tracking-[-.06em]">{loading ? "…" : readyModules}</div>
                <div className="pb-2 text-sm text-white/55">/ {metrics.length} modułów z danymi</div>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/58">
                Puste moduły nie są błędem — oznaczają, że trzeba dodać klasy, zadania, wydarzenia albo ogłoszenia w panelu nauczyciela/admina.
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
            Nie udało się pobrać części danych: {error}
          </div>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const value = counts[metric.table];
            const empty = !loading && (value ?? 0) === 0;
            return (
              <article key={metric.table} className="rounded-[26px] border border-white/10 bg-white/[.048] p-5 shadow-[0_24px_80px_rgba(0,0,0,.22)] backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#0067b8] shadow-lg">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.12em] ${empty ? "border-amber-300/30 bg-amber-300/10 text-amber-100" : "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"}`}>
                    {empty ? "puste" : "aktywne"}
                  </span>
                </div>
                <div className="mt-6 text-4xl font-semibold tracking-[-.05em]">
                  {loading ? <Loader2 className="h-8 w-8 animate-spin text-white/50" /> : value ?? 0}
                </div>
                <h2 className="mt-3 text-lg font-semibold">{metric.label}</h2>
                <p className="mt-2 text-sm leading-6 text-white/55">{metric.description}</p>
              </article>
            );
          })}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-white/[.045] p-5 backdrop-blur-xl">
            <h2 className="text-lg font-semibold">Co działa jako baza</h2>
            <p className="mt-3 text-sm leading-6 text-white/58">Struktura danych pod klasy, zadania, kalendarz, ogłoszenia i eksport ocen istnieje w Supabase. Ten ekran pokazuje ją w jednym miejscu.</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/[.045] p-5 backdrop-blur-xl">
            <h2 className="text-lg font-semibold">Czego jeszcze brakuje</h2>
            <p className="mt-3 text-sm leading-6 text-white/58">Pełnego modułu ocen/frekwencji z osobnymi tabelami ocen cząstkowych, lekcji i obecności. To kolejny etap, a nie błąd obecnego kokpitu.</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/[.045] p-5 backdrop-blur-xl">
            <h2 className="text-lg font-semibold">Następny krok</h2>
            <p className="mt-3 text-sm leading-6 text-white/58">Dodać formularze tworzenia klasy, zadania, wydarzenia i ogłoszenia oraz powiązać je z panelem nauczyciela i administratora.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
