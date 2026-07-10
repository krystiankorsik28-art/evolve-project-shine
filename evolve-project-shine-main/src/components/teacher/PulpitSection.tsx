import { useMemo, type ComponentType } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  Gauge,
  Layers,
  MessageCircle,
  MonitorDot,
  Radio,
  ScrollText,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";
import type { Exam, TabKey } from "@/routes/_authenticated.teacher";

type IconType = ComponentType<{ className?: string }>;

function StatCard({ icon: Icon, label, value, hint }: { icon: IconType; label: string; value: string | number; hint: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-800">
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight className="h-4 w-4 text-slate-300" />
      </div>
      <div className="mt-5 text-3xl font-semibold text-slate-950">{value}</div>
      <div className="mt-1 font-medium text-slate-800">{label}</div>
      <div className="mt-2 text-sm leading-6 text-slate-500">{hint}</div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, text, onClick }: { icon: IconType; title: string; text: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 font-semibold text-slate-950">{title}</div>
      <div className="mt-2 text-sm leading-6 text-slate-500">{text}</div>
    </button>
  );
}

function ProgressRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-800">{label}</span>
        <span className="text-slate-500">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function Pulpit({ exams, published, attempts, go, email }: { exams: Exam[]; published: number; attempts: number; go: (tab: TabKey) => void; email: string }) {
  const drafts = Math.max(0, exams.length - published);
  const reviewQueue = Math.max(0, attempts - published * 2);
  const readiness = Math.min(98, Math.max(62, 64 + published * 4 + Math.floor(attempts / 8)));
  const recent = useMemo(() => exams.slice(0, 5), [exams]);

  const subjectRows = useMemo(() => {
    const counts = exams.reduce<Record<string, number>>((acc, exam) => {
      const key = exam.subject?.trim() || "Bez przedmiotu";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const total = Math.max(1, Object.values(counts).reduce((sum, count) => sum + count, 0));
    const rows = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([label, count], index) => ({
        label,
        value: Math.max(12, Math.round((count / total) * 100)),
        color: ["bg-slate-950", "bg-blue-700", "bg-emerald-700", "bg-amber-600"][index % 4],
      }));

    return rows.length
      ? rows
      : [
          { label: "Matematyka", value: 84, color: "bg-slate-950" },
          { label: "Język polski", value: 66, color: "bg-blue-700" },
          { label: "Angielski", value: 58, color: "bg-emerald-700" },
        ];
  }, [exams]);

  return (
    <div className="space-y-6 text-slate-950">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase text-blue-800">
              <ShieldCheck className="h-4 w-4" />
              Panel nauczyciela
            </div>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight text-slate-950 lg:text-5xl">
              Dzień pracy uporządkowany pod decyzje.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 lg:text-base">
              Najważniejsze akcje, aktywność klasy, materiały do publikacji i sygnały ryzyka są zebrane w jednym operacyjnym widoku.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => go("ai")} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                <Sparkles className="h-4 w-4" />
                Nowy egzamin NexAi
              </button>
              <button type="button" onClick={() => go("live")} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                <Radio className="h-4 w-4" />
                Uruchom sesję PIN
              </button>
              <button type="button" onClick={() => go("monitoring")} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                <Activity className="h-4 w-4" />
                Monitoring
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase text-slate-500">Gotowość operacyjna</div>
                <div className="mt-1 text-4xl font-semibold text-slate-950">{readiness}%</div>
              </div>
              <Gauge className="h-9 w-9 text-slate-700" />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-lg bg-white p-3">
                <div className="font-semibold text-slate-950">{exams.length}</div>
                <div className="mt-1 text-xs text-slate-500">egzaminy</div>
              </div>
              <div className="rounded-lg bg-white p-3">
                <div className="font-semibold text-slate-950">{published}</div>
                <div className="mt-1 text-xs text-slate-500">publiczne</div>
              </div>
              <div className="rounded-lg bg-white p-3">
                <div className="font-semibold text-slate-950">{attempts}</div>
                <div className="mt-1 text-xs text-slate-500">podejścia</div>
              </div>
            </div>
            <div className="mt-5 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
              Konto: <span className="font-medium text-slate-950">{email || "teacher@edunex.pl"}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileText} label="Moje egzaminy" value={exams.length} hint="wszystkie materiały" />
        <StatCard icon={CheckCircle2} label="Opublikowane" value={published} hint="gotowe dla uczniów" />
        <StatCard icon={TimerReset} label="Do sprawdzenia" value={reviewQueue} hint="kolejka decyzji" />
        <StatCard icon={Layers} label="Szkice" value={drafts} hint="do publikacji" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase text-slate-500">Szybkie decyzje</div>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">Najczęstsze ruchy nauczyciela</h2>
            </div>
            <BookOpen className="h-6 w-6 text-slate-400" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ActionCard icon={Sparkles} title="Egzamin NexAi" text="Start od tematu lekcji i poziomu klasy." onClick={() => go("ai")} />
            <ActionCard icon={MonitorDot} title="Sesja PIN" text="Kod, tempo klasy i status oddania." onClick={() => go("live")} />
            <ActionCard icon={MessageCircle} title="Wiadomość" text="Komunikat do klasy lub rodziców." onClick={() => go("wiadomosci")} />
            <ActionCard icon={ScrollText} title="Sprawdzian" text="Krótka forma na najbliższą lekcję." onClick={() => go("sprawdziany")} />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase text-slate-500">Plan dnia</div>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">Priorytety</h2>
            </div>
            <CalendarDays className="h-6 w-6 text-slate-400" />
          </div>
          <div className="space-y-3">
            {[
              ["08:00", "Szybki quiz diagnostyczny"],
              ["10:45", "Przegląd wyników i prac opisowych"],
              ["14:00", "Eksport raportu dla klasy"],
            ].map(([time, label]) => (
              <div key={time} className="grid grid-cols-[4.2rem_1fr] gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="font-semibold text-slate-950">{time}</div>
                <div className="text-sm text-slate-600">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-950">Zakres materiałów</h2>
            <BarChart3 className="h-6 w-6 text-slate-400" />
          </div>
          <div className="space-y-4">
            {subjectRows.map((row) => (
              <ProgressRow key={row.label} {...row} />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-950">Ostatnie materiały</h2>
            <button type="button" onClick={() => go("egzaminy")} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              Zobacz wszystko
            </button>
          </div>
          <div className="space-y-3">
            {(recent.length ? recent : [{ title: "Przykładowy egzamin", subject: "Matematyka", created_at: new Date().toISOString() } as Exam]).map((exam, index) => (
              <div key={`${exam.title}-${index}`} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <div className="font-semibold text-slate-950">{exam.title || "Bez nazwy"}</div>
                  <div className="mt-1 text-sm text-slate-500">{exam.subject || "Bez przedmiotu"}</div>
                </div>
                <div className="text-sm text-slate-500">{new Date(exam.created_at).toLocaleDateString("pl-PL")}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">Eksport i zgodność</div>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Raporty gotowe do przekazania dalej</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Eksporty, dokumenty i audyt decyzji NexAi są prezentowane jako część procesu pracy, nie jako dodatek.
            </p>
          </div>
          <button type="button" onClick={() => go("eksport")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            <Download className="h-4 w-4" />
            Przejdź do eksportu
          </button>
        </div>
      </section>
    </div>
  );
}
