import { useMemo, type ComponentType } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Layers,
  MessageCircle,
  MonitorDot,
  Radio,
  RefreshCw,
  ScrollText,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";
import type { Exam, TabKey } from "@/routes/_authenticated.teacher";

type IconType = ComponentType<{ className?: string }>;

type PulpitProps = {
  exams: Exam[];
  published: number;
  attempts: number;
  pendingReview: number;
  activePins: number;
  loading: boolean;
  lastUpdated: Date | null;
  go: (tab: TabKey) => void;
  email: string;
  onRefresh: () => void;
};

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  loading,
  onClick,
}: {
  icon: IconType;
  label: string;
  value: string | number;
  hint: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className="group rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] focus:outline-none focus:ring-2 focus:ring-[#0067b8]/25"
    >
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-slate-50 text-slate-800 transition group-hover:bg-slate-950 group-hover:text-white">
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600" />
      </div>
      {loading ? (
        <div className="mt-5 h-9 w-20 animate-pulse rounded bg-slate-100" />
      ) : (
        <div className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
      )}
      <div className="mt-1 font-medium text-slate-800">{label}</div>
      <div className="mt-2 text-sm leading-6 text-slate-500">{hint}</div>
    </motion.button>
  );
}

function ActionCard({
  icon: Icon,
  title,
  text,
  onClick,
}: {
  icon: IconType;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className="group rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-[#0067b8]/40 hover:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-[#0067b8]/25"
    >
      <div className="grid h-10 w-10 place-items-center rounded-md bg-slate-950 text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 font-semibold text-slate-950">{title}</div>
      <div className="mt-2 text-sm leading-6 text-slate-500">{text}</div>
      <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0067b8] opacity-0 transition group-hover:opacity-100">
        Otwórz
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </motion.button>
  );
}

function ProgressRow({ label, value, color }: { label: string; value: number; color: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-800">{label}</span>
        <span className="text-slate-500">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <motion.div
          initial={reduceMotion ? false : { width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: reduceMotion ? 0.08 : 0.55, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

export function Pulpit({
  exams,
  published,
  attempts,
  pendingReview,
  activePins,
  loading,
  lastUpdated,
  go,
  email,
  onRefresh,
}: PulpitProps) {
  const drafts = exams.filter((exam) => exam.status === "draft").length;
  const recent = useMemo(() => exams.slice(0, 5), [exams]);

  const scheduled = useMemo(
    () =>
      exams
        .filter((exam) => exam.available_from && new Date(exam.available_from).getTime() > Date.now())
        .sort(
          (a, b) =>
            new Date(a.available_from ?? 0).getTime() - new Date(b.available_from ?? 0).getTime(),
        )
        .slice(0, 3),
    [exams],
  );

  const subjectRows = useMemo(() => {
    const counts = exams.reduce<Record<string, number>>((accumulator, exam) => {
      const key = exam.subject?.trim() || "Bez przedmiotu";
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {});
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count], index) => ({
        label,
        value: total ? Math.round((count / total) * 100) : 0,
        color: ["bg-slate-950", "bg-[#0067b8]", "bg-emerald-700", "bg-amber-600", "bg-indigo-700"][index % 5],
      }));
  }, [exams]);

  return (
    <div className="space-y-6 text-slate-950">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-7 p-6 lg:grid-cols-[1.14fr_0.86fr] lg:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#0067b8]">
              <ShieldCheck className="h-4 w-4" />
              Centrum pracy nauczyciela
            </div>
            <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 lg:text-5xl">
              Najważniejsze działania bez przechodzenia między przypadkowymi narzędziami.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 lg:text-base">
              Twórz egzaminy, uruchamiaj sesje PIN, sprawdzaj odpowiedzi i przekazuj wyniki z jednego uporządkowanego pulpitu.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => go("egzaminy")}
                className="inline-flex h-11 items-center gap-2 rounded-md bg-[#0067b8] px-4 text-sm font-semibold text-white transition hover:bg-[#005a9e]"
              >
                <FileText className="h-4 w-4" />
                Utwórz egzamin
              </button>
              <button
                type="button"
                onClick={() => go("live")}
                className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                <Radio className="h-4 w-4" />
                Uruchom sesję PIN
              </button>
              <button
                type="button"
                onClick={() => go("ai")}
                className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                <Sparkles className="h-4 w-4" />
                Otwórz NexAi
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-[#f7f7f8] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Stan operacyjny</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {activePins > 0 ? "Trwa aktywna praca" : "Panel gotowy do działania"}
                </div>
              </div>
              <div className={`grid h-10 w-10 place-items-center rounded-md ${activePins > 0 ? "bg-emerald-100 text-emerald-800" : "bg-white text-slate-700"}`}>
                {activePins > 0 ? <Activity className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <button type="button" onClick={() => go("live")} className="rounded-lg border border-slate-200 bg-white p-3 transition hover:border-slate-300">
                <div className="text-xl font-semibold text-slate-950">{loading ? "—" : activePins}</div>
                <div className="mt-1 text-[10px] leading-4 text-slate-500">aktywne PIN-y</div>
              </button>
              <button type="button" onClick={() => go("aiocen")} className="rounded-lg border border-slate-200 bg-white p-3 transition hover:border-slate-300">
                <div className="text-xl font-semibold text-slate-950">{loading ? "—" : pendingReview}</div>
                <div className="mt-1 text-[10px] leading-4 text-slate-500">do oceny</div>
              </button>
              <button type="button" onClick={() => go("analityka")} className="rounded-lg border border-slate-200 bg-white p-3 transition hover:border-slate-300">
                <div className="text-xl font-semibold text-slate-950">{loading ? "—" : attempts}</div>
                <div className="mt-1 text-[10px] leading-4 text-slate-500">podejścia</div>
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-500">
              <div className="min-w-0">
                <div className="truncate font-medium text-slate-800">{email || "Ładowanie konta..."}</div>
                <div className="mt-1">
                  {lastUpdated
                    ? `Synchronizacja: ${lastUpdated.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}`
                    : "Synchronizacja danych..."}
                </div>
              </div>
              <button
                type="button"
                onClick={onRefresh}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
                aria-label="Odśwież dane"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileText} label="Moje egzaminy" value={exams.length} hint="utworzone przez Twoje konto" loading={loading} onClick={() => go("egzaminy")} />
        <StatCard icon={CheckCircle2} label="Opublikowane" value={published} hint="dostępne zgodnie z ustawieniami" loading={loading} onClick={() => go("egzaminy")} />
        <StatCard icon={TimerReset} label="Do sprawdzenia" value={pendingReview} hint="prace ze statusem przesłane" loading={loading} onClick={() => go("aiocen")} />
        <StatCard icon={Layers} label="Szkice" value={drafts} hint="materiały oczekujące na publikację" loading={loading} onClick={() => go("egzaminy")} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Szybkie działania</div>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Najczęstsze procesy</h3>
            </div>
            <BookOpen className="h-6 w-6 text-slate-400" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ActionCard icon={Sparkles} title="Egzamin NexAi" text="Przygotuj pierwszą wersję pytań na podstawie tematu." onClick={() => go("ai")} />
            <ActionCard icon={MonitorDot} title="Sesja PIN" text="Uruchom wejście uczniów i obserwuj status sesji." onClick={() => go("live")} />
            <ActionCard icon={MessageCircle} title="Wiadomość" text="Przekaż komunikat klasie, uczniowi lub rodzicowi." onClick={() => go("wiadomosci")} />
            <ActionCard icon={ScrollText} title="Sprawdzian" text="Przygotuj krótszą formę na najbliższą lekcję." onClick={() => go("sprawdziany")} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Najbliższe terminy</div>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Zaplanowane egzaminy</h3>
            </div>
            <CalendarDays className="h-6 w-6 text-slate-400" />
          </div>
          {scheduled.length ? (
            <div className="space-y-3">
              {scheduled.map((exam) => (
                <button
                  key={exam.id}
                  type="button"
                  onClick={() => go("egzaminy")}
                  className="grid w-full grid-cols-[auto_1fr] gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-slate-300"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-white text-[#0067b8]">
                    <Clock3 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-950">{exam.title || "Bez nazwy"}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {new Date(exam.available_from ?? "").toLocaleString("pl-PL", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
              <CalendarDays className="mx-auto h-6 w-6 text-slate-400" />
              <div className="mt-3 text-sm font-semibold text-slate-800">Brak zaplanowanych egzaminów</div>
              <p className="mt-1 text-xs leading-5 text-slate-500">Ustaw termin w module Egzaminy, aby pojawił się w tym miejscu.</p>
              <button type="button" onClick={() => go("egzaminy")} className="mt-4 text-xs font-semibold text-[#0067b8]">
                Przejdź do egzaminów
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Struktura materiałów</div>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Przedmioty</h3>
            </div>
            <BarChart3 className="h-6 w-6 text-slate-400" />
          </div>
          {subjectRows.length ? (
            <div className="space-y-4">
              {subjectRows.map((row) => (
                <ProgressRow key={row.label} {...row} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
              <BarChart3 className="mx-auto h-6 w-6 text-slate-400" />
              <div className="mt-3 text-sm font-semibold text-slate-800">Brak danych do analizy</div>
              <p className="mt-1 text-xs leading-5 text-slate-500">Po utworzeniu egzaminów zobaczysz tutaj podział według przedmiotów.</p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Ostatnia aktywność</div>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Najnowsze egzaminy</h3>
            </div>
            <button
              type="button"
              onClick={() => go("egzaminy")}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Zobacz wszystko
            </button>
          </div>

          {recent.length ? (
            <div className="space-y-3">
              {recent.map((exam) => (
                <button
                  key={exam.id}
                  type="button"
                  onClick={() => go("egzaminy")}
                  className="grid w-full gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-950">{exam.title || "Bez nazwy"}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{exam.subject || "Bez przedmiotu"}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span className="capitalize">{exam.status}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">{new Date(exam.created_at).toLocaleDateString("pl-PL")}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <FileText className="mx-auto h-7 w-7 text-slate-400" />
              <div className="mt-3 text-sm font-semibold text-slate-800">Nie masz jeszcze egzaminów</div>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">Utwórz pierwszy materiał ręcznie albo rozpocznij od propozycji przygotowanej przez NexAi.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button type="button" onClick={() => go("egzaminy")} className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white">
                  Utwórz egzamin
                </button>
                <button type="button" onClick={() => go("ai")} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                  Użyj NexAi
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Eksport i dokumentacja</div>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Raporty gotowe do dalszej pracy</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Pobieraj wyniki, przygotowuj zestawienia i zachowuj ślad decyzji w jednym procesie.
            </p>
          </div>
          <button
            type="button"
            onClick={() => go("eksport")}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            Przejdź do eksportu
          </button>
        </div>
      </section>
    </div>
  );
}
