import { useRef, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import {
  FileText,
  Sparkles,
  Users,
  Activity,
  BarChart3,
  Brain,
  ScrollText,
  ShieldCheck,
  Radio,
  Clock,
  Calendar,
  BookOpen,
  Zap,
  CheckCircle2,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Plus,
  Library,
  ClipboardList,
  Award,
  Target,
  Gauge,
  TimerReset,
  BellRing,
  Layers,
  Lightbulb,
  MessageCircle,
  CircleCheck,
  PlayCircle,
  Send,
} from "lucide-react";
import { Exam } from "@/routes/_authenticated.teacher";

type TabKey =
  | "pulpit"
  | "egzaminy"
  | "ai"
  | "aiocen"
  | "tutor"
  | "plan"
  | "bank"
  | "klasy"
  | "zadania"
  | "kalendarz"
  | "live"
  | "monitoring"
  | "analityka"
  | "ranking"
  | "materialy"
  | "forum"
  | "ustawienia"
  | "ogloszenia"
  | "wiadomosci"
  | "eksport"
  | "edziennik"
  | "sprawdziany"
  | "certyfikaty";

function KPI({
  icon: Icon,
  label,
  value,
  delta,
  trend,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  delta: string;
  trend: "up" | "down" | "flat";
  color: string;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Activity;
  const trendColor =
    trend === "up"
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-400/20"
      : trend === "down"
        ? "text-pink-400 bg-pink-500/10 border-pink-400/20"
        : "text-[var(--color-fg-muted)] bg-[var(--surface)] border-[var(--border)]";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-white/[0.02] backdrop-blur p-5 group hover:border-[var(--accent)]/20 transition">
      <div
        className={`absolute -right-8 -top-8 w-28 h-28 rounded-full bg-gradient-to-br ${color} opacity-20 blur-2xl group-hover:opacity-30 transition`}
      />
      <div className="flex items-start justify-between relative">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} grid place-items-center shadow-lg`}
        >
          <Icon className="w-5 h-5 text-[var(--color-fg)]" />
        </div>
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border ${trendColor}`}
        >
          <TrendIcon className="w-3 h-3" />
          {delta}
        </span>
      </div>
      <div className="mt-4 text-3xl font-display font-bold text-[var(--color-fg)] tracking-tight">
        {value}
      </div>
      <div className="text-xs text-[var(--color-fg-muted)] mt-0.5">{label}</div>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const w = 280,
    h = 90,
    pad = 6;
  const max = Math.max(...values, 1);
  const step = (w - pad * 2) / (values.length - 1);
  const pts = values.map((v, i) => [pad + i * step, h - pad - (v / max) * (h - pad * 2)] as const);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  const area = `${d} L ${pts[pts.length - 1][0]} ${h - pad} L ${pts[0][0]} ${h - pad} Z`;
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white/[0.03] p-4 backdrop-blur">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono tracking-wider text-[var(--accent)]">
          TWORZENIE EGZAMINÓW · 12D
        </span>
        <span className="text-[10px] font-mono text-[var(--color-fg-muted)]">
          {values.reduce((a, b) => a + b, 0)} total
        </span>
      </div>
      <svg width={w} height={h} className="block">
        <defs>
          <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(34 211 238)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="rgb(34 211 238)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#spark)" />
        <path d={d} fill="none" stroke="rgb(34 211 238)" strokeWidth="1.75" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="2" fill="rgb(167 139 250)" />
        ))}
      </svg>
    </div>
  );
}

function BarChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-2 h-40">
      {values.map((v, i) => {
        const h = Math.max(6, (v / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-accent/60 to-accent/40 hover:from-accent hover:to-blue-500 transition-all relative"
              style={{ height: `${h}%` }}
            >
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-[var(--color-fg-muted)] opacity-0 group-hover:opacity-100 transition">
                {v}
              </span>
            </div>
            <span className="text-[9px] font-mono text-[var(--color-fg-subtle)]">
              d-{values.length - i}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-2 p-3 rounded-xl bg-white/[0.03] hover:bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition group"
    >
      <Icon className="w-4 h-4 text-accent group-hover:scale-110 transition" />
      <span className="text-xs text-[var(--color-fg)] font-medium">{label}</span>
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const s =
    status === "published"
      ? { l: "Opublikowany", c: "text-emerald-300 bg-emerald-500/10 border-emerald-400/25" }
      : status === "archived"
        ? {
            l: "Zarchiwizowany",
            c: "text-[var(--color-fg-muted)] bg-[var(--surface)] border-[var(--border)]",
          }
        : { l: "Szkic", c: "text-amber-300 bg-amber-500/10 border-amber-400/25" };
  return (
    <span className={`text-[10px] font-mono tracking-wider px-2 py-0.5 rounded border ${s.c}`}>
      {s.l}
    </span>
  );
}

function EmptyState({
  icon: Icon,
  title,
  desc,
  cta,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div className="py-10 text-center">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-accent/20 to-accent/20 border border-[var(--border)] grid place-items-center mb-3">
        <Icon className="w-5 h-5 text-[var(--accent)]" />
      </div>
      <div className="text-sm font-semibold text-[var(--color-fg)]">{title}</div>
      <div className="text-xs text-[var(--color-fg-muted)] mt-1 max-w-sm mx-auto">{desc}</div>
      <button
        onClick={onClick}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-xs font-semibold transition"
      >
        <Sparkles className="w-3.5 h-3.5" />
        {cta}
      </button>
    </div>
  );
}

function ReadinessRing({ value, label, hint }: { value: number; label: string; hint: string }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <div className="relative grid place-items-center">
      <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#readinessGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="readinessGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="52%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-display font-bold text-[var(--color-fg)]">{value}%</div>
        <div className="text-[10px] font-mono uppercase text-[var(--color-fg-muted)]">{label}</div>
      </div>
      <div className="mt-3 text-center text-xs text-[var(--color-fg-muted)]">{hint}</div>
    </div>
  );
}

function SignalCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
  tone: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-fg-muted)]">
          {label}
        </div>
        <Icon className="h-4 w-4 shrink-0" />
      </div>
      <div className="mt-3 text-2xl font-display font-bold text-[var(--color-fg)]">{value}</div>
      <div className="mt-1 text-xs text-[var(--color-fg-muted)]">{detail}</div>
    </div>
  );
}

function SubjectBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="truncate text-[var(--color-fg-muted)]">{label}</span>
        <span className="font-mono text-[var(--color-fg-subtle)]">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  detail,
  tone,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  tone: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex min-h-28 flex-col justify-between rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.05] ${tone}`}
    >
      <div className="flex items-center justify-between gap-3">
        <Icon className="h-5 w-5" />
        <ChevronRight className="h-4 w-4 opacity-35 transition group-hover:translate-x-0.5 group-hover:opacity-80" />
      </div>
      <div>
        <div className="text-sm font-semibold text-[var(--color-fg)]">{title}</div>
        <div className="mt-1 text-xs text-[var(--color-fg-muted)]">{detail}</div>
      </div>
    </button>
  );
}

function TimelineRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white/[0.025] px-3 py-2.5">
      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tone}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-[var(--color-fg)]">{label}</div>
        <div className="text-[11px] text-[var(--color-fg-muted)]">{value}</div>
      </div>
    </div>
  );
}

export function Pulpit({
  exams,
  published,
  attempts,
  go,
  email,
}: {
  exams: Exam[];
  published: number;
  attempts: number;
  go: (t: TabKey) => void;
  email: string;
}) {
  const drafts = exams.length - published;
  const recent = exams.slice(0, 6);

  const spark = useMemo(() => {
    const days = 12;
    const buckets = new Array(days).fill(0);
    const now = Date.now();
    exams.forEach((e) => {
      const d = Math.floor((now - new Date(e.created_at).getTime()) / (1000 * 60 * 60 * 24));
      if (d >= 0 && d < days) buckets[days - 1 - d] += 1;
    });
    if (buckets.every((b) => b === 0)) return [1, 2, 1, 3, 2, 4, 3, 5, 4, 6, 5, 7];
    return buckets;
  }, [exams]);

  const readiness = Math.min(98, Math.max(58, 62 + published * 4 + Math.floor(attempts / 8)));
  const todayActivity = spark.at(-1) ?? 0;
  const reviewQueue = Math.max(0, attempts - published * 2);
  const activeDrafts = Math.max(0, drafts);

  const subjectMix = useMemo(() => {
    const colors = [
      "bg-cyan-400",
      "bg-emerald-400",
      "bg-amber-400",
      "bg-violet-400",
      "bg-rose-400",
    ];
    const counts = exams.reduce<Record<string, number>>((acc, exam) => {
      const key = exam.subject?.trim() || "Bez przedmiotu";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

    if (!total) {
      return [
        { label: "Matematyka", value: 34, color: "bg-cyan-400" },
        { label: "Jezyk polski", value: 26, color: "bg-emerald-400" },
        { label: "Angielski", value: 21, color: "bg-amber-400" },
        { label: "Historia", value: 19, color: "bg-violet-400" },
      ];
    }

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count], index) => ({
        label,
        value: Math.max(8, Math.round((count / total) * 100)),
        color: colors[index % colors.length],
      }));
  }, [exams]);

  const signalCards = [
    {
      icon: Gauge,
      label: "Gotowosc",
      value: `${readiness}%`,
      detail:
        readiness > 84
          ? "Panel gotowy na dzisiejsze zajecia"
          : "Warto dopiac materialy i sprawdziany",
      tone: "border-cyan-400/20 bg-cyan-400/5 text-cyan-300",
    },
    {
      icon: TimerReset,
      label: "Do sprawdzenia",
      value: String(reviewQueue),
      detail: reviewQueue ? "podejscia czekaja na przeglad" : "brak zaleglych podejsc",
      tone: "border-amber-400/20 bg-amber-400/5 text-amber-300",
    },
    {
      icon: Layers,
      label: "Szkice",
      value: String(activeDrafts),
      detail: activeDrafts ? "materialy do publikacji" : "wszystko opublikowane",
      tone: "border-violet-400/20 bg-violet-400/5 text-violet-300",
    },
  ];

  const actionCards = [
    {
      icon: Sparkles,
      title: "Nowy egzamin AI",
      detail: "Start od tematu lekcji i poziomu klasy",
      tone: "border-cyan-400/20 bg-cyan-400/5 text-cyan-300",
      onClick: () => go("ai"),
    },
    {
      icon: Radio,
      title: "Sesja live",
      detail: "Quiz, ranking i szybki feedback",
      tone: "border-pink-400/20 bg-pink-400/5 text-pink-300",
      onClick: () => go("live"),
    },
    {
      icon: MessageCircle,
      title: "Wiadomosc",
      detail: "Komunikat do klasy lub rodzicow",
      tone: "border-emerald-400/20 bg-emerald-400/5 text-emerald-300",
      onClick: () => go("wiadomosci"),
    },
    {
      icon: ScrollText,
      title: "Sprawdzian",
      detail: "Krotka forma na najblizsza lekcje",
      tone: "border-amber-400/20 bg-amber-400/5 text-amber-300",
      onClick: () => go("sprawdziany"),
    },
  ];

  const timelineRows = [
    {
      icon: PlayCircle,
      label: "Start lekcji",
      value: "08:00 · szybki quiz diagnostyczny",
      tone: "bg-cyan-400/12 text-cyan-300",
    },
    {
      icon: CircleCheck,
      label: "Przeglad wynikow",
      value: `${Math.max(3, reviewQueue || 4)} prac do omowienia`,
      tone: "bg-emerald-400/12 text-emerald-300",
    },
    {
      icon: Send,
      label: "Komunikacja",
      value: "Podsumowanie dnia dla uczniow",
      tone: "bg-violet-400/12 text-violet-300",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[linear-gradient(135deg,rgba(8,13,30,.96),rgba(8,19,33,.9),rgba(6,10,20,.98))] p-6 lg:p-7">
          <div className="absolute inset-0 grid-pattern opacity-40" />
          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-cyan-200">
                  <ShieldCheck className="h-3 w-3" /> Panel nauczyciela
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold leading-tight text-[var(--color-fg)] lg:text-3xl">
                    Centrum dowodzenia lekcja jest gotowe.
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--color-fg-muted)]">
                    Najwazniejsze akcje, aktywnosc klasy i materialy do publikacji masz teraz w
                    jednym widoku.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-right">
                <div className="text-[10px] font-mono uppercase text-[var(--color-fg-subtle)]">
                  Dzisiaj
                </div>
                <div className="text-sm font-semibold text-[var(--color-fg)]">
                  {new Date().toLocaleDateString("pl-PL", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                  })}
                </div>
                <div className="mt-1 text-[11px] text-[var(--color-fg-muted)]">
                  {email ? email.split("@")[0] : "nauczyciel"}
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {signalCards.map((card) => (
                <SignalCard key={card.label} {...card} />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white/[0.025] p-5 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-fg-subtle)]">
                Puls klasy
              </div>
              <h3 className="mt-1 text-base font-display font-bold text-[var(--color-fg)]">
                Gotowosc operacyjna
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-mono text-emerald-300">
              <Activity className="h-3 w-3" /> LIVE
            </span>
          </div>
          <div className="mt-5 flex justify-center">
            <ReadinessRing
              value={readiness}
              label="ready"
              hint={`${todayActivity} aktywnosci dzisiaj`}
            />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-[var(--border)] bg-white/[0.03] p-2">
              <div className="text-sm font-semibold text-cyan-300">{exams.length}</div>
              <div className="text-[10px] text-[var(--color-fg-muted)]">egzaminy</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-white/[0.03] p-2">
              <div className="text-sm font-semibold text-emerald-300">{published}</div>
              <div className="text-[10px] text-[var(--color-fg-muted)]">publiczne</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-white/[0.03] p-2">
              <div className="text-sm font-semibold text-amber-300">{attempts}</div>
              <div className="text-[10px] text-[var(--color-fg-muted)]">podejscia</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.62fr)]">
        <div className="rounded-2xl border border-[var(--border)] bg-white/[0.02] p-5 backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-base font-display font-bold text-[var(--color-fg)]">
                <Target className="h-4 w-4 text-cyan-300" /> Szybkie decyzje
              </h3>
              <p className="mt-1 text-xs text-[var(--color-fg-muted)]">
                Najczestsze ruchy nauczyciela w jednym rzedzie.
              </p>
            </div>
            <button
              onClick={() => go("egzaminy")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white/[0.03] px-3 py-2 text-xs text-[var(--color-fg-muted)] transition hover:text-[var(--color-fg)]"
            >
              <Plus className="h-3.5 w-3.5" /> Manualnie
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {actionCards.map((card) => (
              <ActionCard key={card.title} {...card} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white/[0.02] p-5 backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-base font-display font-bold text-[var(--color-fg)]">
              <BellRing className="h-4 w-4 text-amber-300" /> Plan dnia
            </h3>
            <span className="text-[10px] font-mono text-[var(--color-fg-subtle)]">3 kroki</span>
          </div>
          <div className="space-y-2">
            {timelineRows.map((row) => (
              <TimelineRow key={row.label} {...row} />
            ))}
          </div>
        </div>
      </div>

      <div className="hidden">
        <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(167,139,250,0.18),transparent_55%)]" />
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[var(--accent)]/10 blur-3xl" />
        <div className="absolute -top-4 -right-4 w-20 h-24 opacity-[0.08] pointer-events-none">
          <svg viewBox="0 0 400 500" fill="white" className="w-full h-full">
            <path d="M200 20C180 20 160 35 155 55L150 70C145 80 140 85 130 90L120 95C110 100 105 110 105 120L105 135C105 145 110 150 120 150L125 150C130 150 135 145 140 140L145 135C150 130 155 130 160 135L165 140C170 145 175 145 180 140L185 135C190 130 195 130 200 135C205 130 210 130 215 135L220 140C225 145 230 145 235 140L240 135C245 130 250 130 255 135L260 140C265 145 270 150 275 150L280 150C290 150 295 145 295 135L295 120C295 110 290 100 280 95L270 90C260 85 255 80 250 70L245 55C240 35 220 20 200 20Z" />
            <path d="M170 160L175 155C180 150 185 150 190 155L195 160C200 165 200 175 195 180L190 185C185 190 180 190 175 185L170 180C165 175 165 165 170 160Z" />
            <path d="M210 160L215 155C220 150 225 150 230 155L235 160C240 165 240 175 235 180L230 185C225 190 220 190 215 185L210 180C205 175 205 165 210 160Z" />
            <path d="M185 200L190 195C195 190 205 190 210 195L215 200C220 205 220 215 215 220L210 225C205 230 195 230 190 225L185 220C180 215 180 205 185 200Z" />
            <path d="M160 230L165 225C170 220 180 220 185 225L190 230C195 235 195 245 190 250L185 255C180 260 170 260 165 255L160 250C155 245 155 235 160 230Z" />
            <path d="M220 230L225 225C230 220 240 220 245 225L250 230C255 235 255 245 250 250L245 255C240 260 230 260 225 255L220 250C215 245 215 235 220 230Z" />
            <path d="M175 265L180 260C185 255 195 255 200 260L205 265C210 270 210 280 205 285L200 290C195 295 185 295 180 290L175 285C170 280 170 270 175 265Z" />
            <path d="M195 295L200 290C205 290 210 295 210 300L210 310C210 315 205 320 200 320C195 320 190 315 190 310L190 300C190 295 195 295 195 295Z" />
            <path d="M120 310C120 310 130 330 150 340C160 345 170 345 180 340L185 335C190 330 195 330 200 335C205 330 210 330 215 335L220 340C230 345 240 345 250 340C270 330 280 310 280 310L275 315C270 325 260 335 250 340C240 345 230 348 220 348L215 350C210 352 205 352 200 350L185 350C180 352 175 352 170 350L160 348C145 345 135 340 125 330C120 320 120 310 120 310Z" />
            <path d="M140 350C140 350 155 365 175 375C185 380 195 382 200 380C205 382 215 380 225 375C245 365 260 350 260 350L255 355C245 368 230 378 215 385C210 388 205 388 200 385C195 388 190 388 185 385C170 378 155 368 145 355L140 350Z" />
            <rect x="160" y="30" width="80" height="8" rx="2" />
          </svg>
        </div>
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[10px] font-mono tracking-[0.2em] text-red-300 uppercase">
              <ShieldCheck className="w-3 h-3" /> Panel Nauczyciela · EduNex
            </div>
            <h2 className="text-2xl lg:text-3xl font-display font-bold text-[var(--color-fg)] leading-tight">
              Twoja klasa czeka.{" "}
              <span className="bg-gradient-to-r from-accent via-white to-accent bg-clip-text text-transparent">
                Zacznijmy nową lekcję.
              </span>
            </h2>
            <p className="text-sm text-[var(--color-fg-muted)]">
              Wygeneruj egzamin AI w 60 sekund, uruchom Live Quiz w czasie rzeczywistym lub przejdź
              do analityki postępów uczniów.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => go("ai")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-blue-500 hover:brightness-110 text-slate-900 font-semibold text-sm transition shadow-lg shadow-accent/20"
              >
                <Sparkles className="w-4 h-4" /> Nowy egzamin AI
              </button>
              <button
                onClick={() => go("live")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface)] border border-[var(--border)] text-sm transition"
              >
                <Radio className="w-4 h-4 text-pink-300" /> Uruchom Live Quiz
              </button>
              <button
                onClick={() => go("monitoring")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface)] border border-[var(--border)] text-sm transition"
              >
                <Activity className="w-4 h-4 text-emerald-300" /> Monitoring
              </button>
            </div>
          </div>
          <div className="hidden lg:block">
            <Sparkline values={spark} />
          </div>
        </div>
      </div>

      <div className="hidden">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-fg-muted)] self-center mr-2">
          Szybkie tworzenie:
        </span>
        <button
          onClick={() => go("ai")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)]/15 hover:bg-[var(--accent)]/25 text-[var(--accent)] text-xs transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Egzamin AI
        </button>
        <button
          onClick={() => go("egzaminy")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 text-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Nowy egzamin
        </button>
        <button
          onClick={() => go("sprawdziany")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs transition"
        >
          <ScrollText className="w-3.5 h-3.5" />
          Nowy sprawdzian
        </button>
        <button
          onClick={() => go("klasy")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs transition"
        >
          <Users className="w-3.5 h-3.5" />
          Dodaj klasę
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPI
          icon={FileText}
          label="Moje egzaminy"
          value={exams.length}
          delta="+2"
          trend="up"
          color="from-accent to-blue-600"
        />
        <KPI
          icon={CheckCircle2}
          label="Opublikowane"
          value={published}
          delta={`${exams.length ? Math.round((published / exams.length) * 100) : 0}%`}
          trend="up"
          color="from-accent to-blue-600"
        />
        <KPI
          icon={Users}
          label="Podejścia uczniów"
          value={attempts}
          delta="+12"
          trend="up"
          color="from-accent to-blue-600"
        />
        <KPI
          icon={Zap}
          label="Aktywność"
          value={`${spark.reduce((a, b) => a + b, 0)}/12d`}
          delta="stabilnie"
          trend="flat"
          color="from-accent to-blue-600"
        />
        <KPI
          icon={ScrollText}
          label="Sprawdziany"
          value={0}
          delta="nowość"
          trend="flat"
          color="from-accent to-blue-600"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
        <div className="rounded-2xl border border-[var(--border)] bg-white/[0.02] p-5 backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-base font-display font-bold text-[var(--color-fg)]">
              <BarChart3 className="h-4 w-4 text-cyan-300" /> Rozklad przedmiotow
            </h3>
            <span className="text-[10px] font-mono text-[var(--color-fg-subtle)]">
              {subjectMix.length} grup
            </span>
          </div>
          <div className="space-y-3">
            {subjectMix.map((subject) => (
              <SubjectBar key={subject.label} {...subject} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white/[0.02] p-5 backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-base font-display font-bold text-[var(--color-fg)]">
                <Lightbulb className="h-4 w-4 text-amber-300" /> Fokus klasy
              </h3>
              <p className="mt-1 text-xs text-[var(--color-fg-muted)]">
                Szybki obraz tego, co warto zrobic w najblizszej lekcji.
              </p>
            </div>
            <button
              onClick={() => go("analityka")}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-white/[0.03] px-3 py-2 text-xs text-[var(--color-fg-muted)] transition hover:text-[var(--color-fg)]"
            >
              Analityka <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
              <BookOpen className="h-5 w-5 text-cyan-300" />
              <div className="mt-3 text-sm font-semibold text-[var(--color-fg)]">
                Powtorka tematu
              </div>
              <div className="mt-1 text-xs text-[var(--color-fg-muted)]">
                Wybierz ostatni egzamin i omow bledy.
              </div>
            </div>
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
              <Award className="h-5 w-5 text-emerald-300" />
              <div className="mt-3 text-sm font-semibold text-[var(--color-fg)]">Docen postep</div>
              <div className="mt-1 text-xs text-[var(--color-fg-muted)]">
                {published} materialow gotowych dla uczniow.
              </div>
            </div>
            <div className="rounded-xl border border-violet-400/20 bg-violet-400/5 p-4">
              <Brain className="h-5 w-5 text-violet-300" />
              <div className="mt-3 text-sm font-semibold text-[var(--color-fg)]">Scenariusz AI</div>
              <div className="mt-1 text-xs text-[var(--color-fg-muted)]">
                Przygotuj plan 45 minut z zadaniami.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-white/[0.02] backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-display font-bold text-[var(--color-fg)]">
                <FileText className="w-5 h-5 text-sky-400" />
                Ostatnie egzaminy
              </h3>
              <p className="text-xs text-[var(--color-fg-muted)]">
                {exams.length} egzaminów · {published} opublikowanych · {drafts} szkiców
              </p>
            </div>
            <button
              onClick={() => go("egzaminy")}
              className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:text-[var(--accent)] transition"
            >
              Zobacz wszystkie <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {recent.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Brak egzaminów"
              desc="Wygeneruj pierwszy egzamin za pomocą AI — wystarczy temat i 30 sekund."
              cta="Stwórz z AI"
              onClick={() => go("ai")}
            />
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {recent.map((e) => (
                <button
                  key={e.id}
                  onClick={() => go("egzaminy")}
                  className="w-full flex items-center gap-4 py-3 text-left hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 border border-[var(--border)] grid place-items-center text-[var(--accent)] shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--color-fg)] truncate">
                      {e.title}
                    </div>
                    <div className="text-[11px] text-[var(--color-fg-muted)] font-mono mt-0.5 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {new Date(e.created_at).toLocaleString("pl-PL", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                      {e.subject && (
                        <>
                          <span>·</span>
                          <span>{e.subject}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <StatusPill status={e.status} />
                  <ChevronRight className="w-4 h-4 text-[var(--color-fg-subtle)] group-hover:text-[var(--color-fg-muted)] transition" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-[var(--accent)]/20 bg-gradient-to-br from-accent/15 via-accent/5 to-accent/5 backdrop-blur p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="flex items-center gap-2 text-base font-display font-bold text-[var(--accent)]">
                <Activity className="w-4 h-4" />
                Live monitoring
              </h3>
              <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-[var(--color-fg-muted)] mb-4">
              Obserwuj uczniów w trakcie egzaminu w czasie rzeczywistym — postęp i wykrywanie
              nieuczciwych zachowań.
            </p>
            <button
              onClick={() => go("monitoring")}
              className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-slate-900 font-semibold text-sm transition"
            >
              Otwórz monitoring <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white/[0.02] backdrop-blur p-6">
            <h3 className="flex items-center gap-2 text-base font-display font-bold text-[var(--color-fg)] mb-3">
              <Zap className="w-4 h-4 text-amber-300" />
              Szybkie akcje
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction icon={Brain} label="AI Tutor" onClick={() => go("tutor")} />
              <QuickAction icon={Library} label="Bank pytań" onClick={() => go("bank")} />
              <QuickAction icon={ClipboardList} label="Zadania" onClick={() => go("zadania")} />
              <QuickAction icon={Calendar} label="Kalendarz" onClick={() => go("kalendarz")} />
              <QuickAction icon={Users} label="Klasy" onClick={() => go("klasy")} />
              <QuickAction icon={BookOpen} label="Materiały" onClick={() => go("materialy")} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-white/[0.02] backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-base font-display font-bold text-[var(--color-fg)]">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              Aktywność (ostatnie 12 dni)
            </h3>
            <span className="text-[10px] font-mono text-[var(--color-fg-muted)]">
              UPDATED ·{" "}
              {new Date().toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <BarChart values={spark} />
        </div>
        <div className="rounded-2xl border border-[var(--accent)]/20 bg-gradient-to-br from-accent/15 via-accent/10 to-accent/5 p-6">
          <h3 className="flex items-center gap-2 text-base font-display font-bold text-[var(--color-fg)] mb-2">
            <Brain className="w-4 h-4 text-[var(--accent)]" />
            AI Tutor 24/7
          </h3>
          <p className="text-xs text-[var(--color-fg-muted)] mb-4">
            Twój asystent dostępny w każdej chwili — pomaga generować scenariusze lekcji, wyjaśnia
            trudne tematy i przygotowuje uczniów.
          </p>
          <button
            onClick={() => go("tutor")}
            className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-accent to-blue-500 hover:brightness-110 text-slate-900 font-semibold text-sm transition"
          >
            Porozmawiaj z AI <ChevronRight className="w-4 h-4" />
          </button>
          <div className="mt-4 text-[10px] font-mono text-[var(--color-fg-subtle)] tracking-wider">
            {email ? `ID · ${email}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
