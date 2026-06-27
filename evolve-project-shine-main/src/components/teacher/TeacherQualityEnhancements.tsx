import { useEffect, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { Activity, BarChart3, BrainCircuit, CheckCircle2, ClipboardCheck, Gauge, Lightbulb, Medal, Radar, Sparkles, Target, TrendingUp, Trophy, Users } from "lucide-react";

type Icon = ComponentType<{ className?: string }>;

type MountState = {
  analytics: HTMLElement | null;
  ranking: HTMLElement | null;
};

const insightCards: { icon: Icon; title: string; text: string; tag: string }[] = [
  { icon: BrainCircuit, title: "AI analiza wyników", text: "Miejsce pod automatyczne wnioski: które pytania były najtrudniejsze i co powtórzyć na lekcji.", tag: "AI" },
  { icon: Target, title: "Cele klasy", text: "Widok gotowy pod próg zdawalności, średnią klasy i indywidualne cele uczniów.", tag: "GOALS" },
  { icon: Gauge, title: "Ryzyko spadku", text: "Warstwa pod wykrywanie uczniów, którzy nagle pogorszyli wyniki lub nie kończą sprawdzianów.", tag: "RISK" },
  { icon: ClipboardCheck, title: "Rekomendacje", text: "Plan kolejnych zadań, powtórek i materiałów na podstawie wyników egzaminów.", tag: "NEXT" },
];

const rankingLayers = [
  ["Top uczniowie", "wynik, liczba podejść, najlepszy rezultat"],
  ["Postęp", "trend z ostatnich podejść"],
  ["Klasyfikacja", "klasa, przedmiot, okres"],
  ["Fair play", "ranking bez danych wrażliwych"],
];

function findSectionByHeading(text: string) {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>("h1,h2,h3"));
  const heading = nodes.find((node) => node.textContent?.trim().toLowerCase().includes(text.toLowerCase()));
  return heading?.closest("div.space-y-5, div.space-y-6, section, div") as HTMLElement | null;
}

function ensureMount(target: HTMLElement | null, attr: string) {
  if (!target?.parentElement) return null;
  const existing = document.querySelector<HTMLElement>(`[${attr}]`);
  if (existing) return existing;
  const mount = document.createElement("div");
  mount.setAttribute(attr, "true");
  target.parentElement.insertBefore(mount, target);
  return mount;
}

export function TeacherQualityEnhancements() {
  const [mounts, setMounts] = useState<MountState>({ analytics: null, ranking: null });

  useEffect(() => {
    if (!location.pathname.includes("/teacher")) return;

    const attach = () => {
      const analyticsTarget = findSectionByHeading("Średnia % wg egzaminu") ?? findSectionByHeading("Analityka");
      const rankingTarget = findSectionByHeading("Ranking uczniów");
      setMounts({
        analytics: ensureMount(analyticsTarget, "data-edunex-quality-analytics"),
        ranking: ensureMount(rankingTarget, "data-edunex-quality-ranking"),
      });
    };

    const timer = window.setTimeout(attach, 140);
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      document.querySelector("[data-edunex-quality-analytics]")?.remove();
      document.querySelector("[data-edunex-quality-ranking]")?.remove();
    };
  }, []);

  return (
    <>
      {mounts.analytics && createPortal(<QualityAnalyticsHeader />, mounts.analytics)}
      {mounts.ranking && createPortal(<QualityRankingHeader />, mounts.ranking)}
    </>
  );
}

function QualityAnalyticsHeader() {
  return (
    <section className="mb-5 overflow-hidden rounded-[28px] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(59,130,246,0.08),rgba(15,23,42,0.05))] p-5 backdrop-blur-2xl lg:p-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-200">
            <Radar className="h-3.5 w-3.5" /> Quality Intelligence
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-[-0.04em] text-[var(--color-fg)] lg:text-3xl">
            Centrum jakości nauczania
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-fg-muted)]">
            Warstwa premium nad istniejącą analityką. Obecne wykresy zostają, a tutaj dochodzi miejsce na wnioski AI, trendy klasy i rekomendacje kolejnych działań.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {insightCards.map(({ icon: Icon, title, text, tag }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3">
                <Icon className="h-5 w-5 text-cyan-300" />
                <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px] font-mono text-[var(--color-fg-muted)]">{tag}</span>
              </div>
              <div className="mt-3 text-sm font-bold text-[var(--color-fg)]">{title}</div>
              <p className="mt-1 text-xs leading-5 text-[var(--color-fg-muted)]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QualityRankingHeader() {
  return (
    <section className="mb-5 overflow-hidden rounded-[28px] border border-amber-300/20 bg-[linear-gradient(135deg,rgba(251,191,36,0.12),rgba(168,85,247,0.07),rgba(15,23,42,0.05))] p-5 backdrop-blur-2xl lg:p-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-amber-200">
            <Trophy className="h-3.5 w-3.5" /> Ranking premium
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-[-0.04em] text-[var(--color-fg)] lg:text-3xl">
            Ranking, który pokazuje postęp, nie tylko wynik
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-fg-muted)]">
            Obecny ranking zostaje. Ta warstwa przygotowuje panel pod trend rozwoju, uczciwe porównania i wyróżnienia klasowe.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {rankingLayers.map(([title, text]) => (
            <div key={title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <Medal className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
              <div>
                <div className="text-sm font-bold text-[var(--color-fg)]">{title}</div>
                <div className="mt-1 text-xs leading-5 text-[var(--color-fg-muted)]">{text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
