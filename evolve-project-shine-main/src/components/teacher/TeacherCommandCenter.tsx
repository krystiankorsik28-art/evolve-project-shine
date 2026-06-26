import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Activity, AlertTriangle, BarChart3, BrainCircuit, CalendarClock, CheckCircle2, ClipboardList, FileText, GraduationCap, Radio, ShieldCheck, Sparkles, Users, Wand2, Zap } from "lucide-react";

type CommandTarget =
  | "AI Generator"
  | "Sprawdziany"
  | "Monitoring"
  | "Klasy"
  | "Analityka"
  | "Bank pytań"
  | "Zadania";

const quickActions: { label: string; desc: string; icon: typeof Sparkles; target: CommandTarget; accent: string }[] = [
  { label: "Nowy egzamin AI", desc: "Przejdź do generatora pytań i egzaminów", icon: Sparkles, target: "AI Generator", accent: "from-cyan-400 to-blue-500" },
  { label: "Nowy sprawdzian", desc: "Utwórz szybki sprawdzian dla klasy", icon: ClipboardList, target: "Sprawdziany", accent: "from-amber-300 to-orange-500" },
  { label: "Live monitoring", desc: "Otwórz centrum nadzoru sesji", icon: Radio, target: "Monitoring", accent: "from-emerald-300 to-cyan-500" },
  { label: "Dodaj klasę", desc: "Zarządzaj klasami i uczniami", icon: Users, target: "Klasy", accent: "from-violet-300 to-fuchsia-500" },
];

const aiInsights = [
  { icon: BrainCircuit, label: "AI Insights", text: "Połączone z obecnym pulpitem. Następny etap: realne rekomendacje z wyników uczniów.", tone: "text-cyan-300" },
  { icon: AlertTriangle, label: "Ryzyko zaległości", text: "Widok gotowy pod alerty: spadek wyników, brak prac, trudne pytania.", tone: "text-amber-300" },
  { icon: ShieldCheck, label: "Monitoring zgodny z zasadami", text: "Podgląd ekranu/kamery tylko po jawnej zgodzie ucznia i tylko przez oficjalne API przeglądarki.", tone: "text-emerald-300" },
];

const activity = [
  ["09:12", "Uczeń rozpoczął egzamin próbny", "live"],
  ["09:18", "AI przygotowało rekomendacje do powtórki", "ai"],
  ["09:24", "Nauczyciel opublikował sprawdzian", "exam"],
  ["09:31", "Monitoring: sesja wymaga zgody na ekran", "security"],
];

function clickTeacherTab(target: CommandTarget) {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("button"));
  const found = buttons.find((button) => button.textContent?.toLowerCase().includes(target.toLowerCase()));
  found?.click();
}

function findTeacherContentMount() {
  const main = document.querySelector("main");
  const candidates = Array.from(document.querySelectorAll<HTMLElement>("main > div, main section, main .space-y-6"));
  return candidates.find((node) => node.textContent?.includes("Twoja klasa czeka")) ?? main;
}

export function TeacherCommandCenter() {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const attach = () => {
      if (!location.pathname.includes("/teacher")) return;
      if (document.querySelector("[data-edunex-teacher-command-center]")) return;

      const target = findTeacherContentMount();
      if (!target?.parentElement) return;

      const mount = document.createElement("div");
      mount.setAttribute("data-edunex-teacher-command-center", "true");
      target.parentElement.insertBefore(mount, target);
      setHost(mount);
    };

    const timer = window.setTimeout(attach, 120);
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      const existing = document.querySelector("[data-edunex-teacher-command-center]");
      existing?.remove();
    };
  }, []);

  if (!host) return null;

  return createPortal(
    <section className="mb-6 overflow-hidden rounded-[28px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(59,130,246,0.06),rgba(167,139,250,0.08))] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.24)] backdrop-blur-2xl lg:p-6">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-200">
            <Zap className="h-3.5 w-3.5" /> Command Center
          </div>
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-[-0.04em] text-[var(--color-fg)] lg:text-3xl">
                Centrum dowodzenia klasą
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-fg-muted)]">
                Warstwa enterprise dodana bez naruszania logowania, Supabase i istniejących modułów. Szybkie akcje używają obecnych zakładek panelu.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <MiniStat icon={FileText} label="Egzaminy" value="live" />
              <MiniStat icon={GraduationCap} label="Klasy" value="ready" />
              <MiniStat icon={ShieldCheck} label="Zgody" value="planned" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map(({ label, desc, icon: Icon, target, accent }) => (
              <button
                key={label}
                onClick={() => clickTeacherTab(target)}
                className="group rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.07]"
              >
                <div className={`mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${accent} text-slate-950 shadow-lg`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-sm font-semibold text-[var(--color-fg)]">{label}</div>
                <div className="mt-1 text-xs leading-5 text-[var(--color-fg-muted)]">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--color-fg)]"><BrainCircuit className="h-4 w-4 text-cyan-300" /> AI Insights</h3>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-mono text-cyan-200">SAFE MODE</span>
            </div>
            <div className="grid gap-2">
              {aiInsights.map(({ icon: Icon, label, text, tone }) => (
                <div key={label} className="rounded-xl border border-white/8 bg-white/[0.035] p-3">
                  <div className={`flex items-center gap-2 text-xs font-semibold ${tone}`}><Icon className="h-3.5 w-3.5" /> {label}</div>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-fg-muted)]">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--color-fg)]"><Activity className="h-4 w-4 text-emerald-300" /> Live Activity Feed</h3>
              <button onClick={() => clickTeacherTab("Analityka")} className="text-[10px] font-mono text-[var(--accent)]">Otwórz analitykę</button>
            </div>
            <div className="grid gap-2">
              {activity.map(([time, text, type]) => (
                <div key={`${time}-${text}`} className="grid grid-cols-[42px_1fr] gap-3 rounded-xl border border-white/8 bg-white/[0.035] p-3 text-xs">
                  <span className="font-mono text-[var(--color-fg-subtle)]">{time}</span>
                  <span className="text-[var(--color-fg-muted)]"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-cyan-300" />{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>,
    host,
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof BarChart3; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-3">
      <Icon className="mx-auto mb-2 h-4 w-4 text-cyan-300" />
      <div className="text-[9px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-subtle)]">{label}</div>
      <div className="mt-1 text-xs font-bold text-[var(--color-fg)]">{value}</div>
    </div>
  );
}
