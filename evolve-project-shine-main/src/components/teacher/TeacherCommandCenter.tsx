import { useEffect, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import {
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  Radio,
  Sparkles,
  Users,
  Wand2,
  Zap,
} from "lucide-react";

type Icon = ComponentType<{ className?: string }>;

type CommandTarget =
  | "AI Generator"
  | "Sprawdziany"
  | "Monitoring"
  | "Klasy"
  | "Analityka"
  | "Egzaminy";

const quickActions: { label: string; desc: string; icon: Icon; target: CommandTarget; accent: string }[] = [
  { label: "Egzamin", desc: "Otwórz bibliotekę i kreator", icon: FileText, target: "Egzaminy", accent: "from-cyan-300 to-blue-500" },
  { label: "AI Generator", desc: "Pytania, klucz i rubryka", icon: Sparkles, target: "AI Generator", accent: "from-violet-300 to-fuchsia-500" },
  { label: "Sprawdzian", desc: "Szybka sesja dla klasy", icon: ClipboardList, target: "Sprawdziany", accent: "from-amber-300 to-orange-500" },
  { label: "Klasy", desc: "Uczniowie i grupy", icon: Users, target: "Klasy", accent: "from-emerald-300 to-cyan-500" },
];

const insights: { icon: Icon; label: string; value: string }[] = [
  { icon: CheckCircle2, label: "Status", value: "gotowy" },
  { icon: BrainCircuit, label: "AI", value: "włączone" },
  { icon: Radio, label: "Live", value: "online" },
];

const nextSteps = [
  "Sprawdź ostatnie wyniki klasy",
  "Przygotuj krótki sprawdzian",
  "Wygeneruj pytania AI",
];

function clickTeacherTab(target: CommandTarget) {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("button"));
  const found = buttons.find((button) => button.textContent?.toLowerCase().includes(target.toLowerCase()));
  found?.click();
}

function findPulpitMount() {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>("main > div, main section, main .space-y-6, main .space-y-5"));
  return candidates.find((node) => {
    const text = node.textContent ?? "";
    return text.includes("Twoja klasa czeka") || text.includes("Pulpit") || text.includes("Ostatnie aktywności");
  }) ?? null;
}

export function TeacherCommandCenter() {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const attach = () => {
      if (!location.pathname.includes("/teacher")) return;

      const existing = document.querySelector<HTMLElement>("[data-edunex-teacher-command-center]");
      const target = findPulpitMount();

      if (!target?.parentElement) {
        existing?.remove();
        setHost(null);
        return;
      }

      if (existing?.isConnected) {
        setHost(existing);
        return;
      }

      const mount = document.createElement("div");
      mount.setAttribute("data-edunex-teacher-command-center", "true");
      target.parentElement.insertBefore(mount, target);
      setHost(mount);
    };

    attach();
    const timer = window.setTimeout(attach, 160);
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      document.querySelector("[data-edunex-teacher-command-center]")?.remove();
    };
  }, []);

  if (!host) return null;

  return createPortal(
    <section className="mb-5 overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(10,18,32,0.92),rgba(8,13,24,0.76))] p-4 shadow-[0_22px_80px_rgba(0,0,0,0.24)] backdrop-blur-2xl lg:p-5">
      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[20px] border border-cyan-300/15 bg-cyan-400/[0.035] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-cyan-200">
              <Zap className="h-3.5 w-3.5" /> Pulpit operacyjny
            </div>
            <div className="flex gap-2">
              {insights.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center">
                  <Icon className="mx-auto mb-1 h-3.5 w-3.5 text-cyan-300" />
                  <div className="text-[8px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-subtle)]">{label}</div>
                  <div className="text-[11px] font-bold text-[var(--color-fg)]">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-[-0.04em] text-[var(--color-fg)] lg:text-3xl">
            Szybki start nauczyciela
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-fg-muted)]">
            Krótki panel startowy tylko na Pulpicie. Zakładki, logowanie i Supabase zostają bez zmian.
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {quickActions.map(({ label, desc, icon: Icon, target, accent }) => (
              <button
                key={label}
                onClick={() => clickTeacherTab(target)}
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.07]"
              >
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${accent} text-slate-950 shadow-lg`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--color-fg)]">{label}</div>
                  <div className="mt-0.5 text-xs text-[var(--color-fg-muted)]">{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[20px] border border-white/10 bg-white/[0.035] p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--color-fg)]">
              <BrainCircuit className="h-4 w-4 text-cyan-300" /> AI podpowiedzi
            </h3>
            <div className="mt-3 grid gap-2">
              {nextSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/10 px-3 py-2 text-xs text-[var(--color-fg-muted)]">
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-cyan-400/10 font-mono text-cyan-200">{index + 1}</span>
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] border border-white/10 bg-white/[0.035] p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--color-fg)]">
              <BarChart3 className="h-4 w-4 text-emerald-300" /> Mini raport
            </h3>
            <div className="mt-3 grid gap-3">
              <MiniBar label="Gotowość klasy" value="82%" width="82%" />
              <MiniBar label="Materiały" value="64%" width="64%" />
              <MiniBar label="Aktywność" value="71%" width="71%" />
            </div>
          </div>
        </div>
      </div>
    </section>,
    host,
  );
}

function MiniBar({ label, value, width }: { label: string; value: string; width: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-[var(--color-fg-muted)]">{label}</span>
        <span className="font-mono text-cyan-200">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-500" style={{ width }} />
      </div>
    </div>
  );
}
