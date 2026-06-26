import { useEffect, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileAudio,
  FileCode2,
  FileImage,
  FileText,
  FileVideo,
  Gauge,
  GraduationCap,
  LayoutTemplate,
  Lock,
  MonitorUp,
  MousePointer2,
  PlayCircle,
  Radio,
  ScreenShare,
  ShieldCheck,
  Sparkles,
  Timer,
  Wand2,
} from "lucide-react";

type MountState = {
  exams: HTMLElement | null;
  monitoring: HTMLElement | null;
};

type Icon = ComponentType<{ className?: string }>;

const questionTypes: { icon: Icon; label: string }[] = [
  { icon: CheckCircle2, label: "Jednokrotny wybór" },
  { icon: ClipboardList, label: "Wielokrotny wybór" },
  { icon: FileText, label: "Pytanie otwarte" },
  { icon: Sparkles, label: "Esej z rubryką" },
  { icon: FileImage, label: "Obraz" },
  { icon: FileAudio, label: "Audio" },
  { icon: FileVideo, label: "Wideo" },
  { icon: FileCode2, label: "Kod / LaTeX" },
];

const examModes = ["Standardowy", "Sprawdzian szybki", "Kartkówka", "Live Quiz", "Praca domowa", "Próbny", "Adaptacyjny AI", "Monitoring"];
const publishSteps = ["Przypisz klasę", "Wygeneruj PIN", "Wyślij link", "Zaplanuj", "Powiadom e-mail", "Raport po egzaminie"];
const safetyRules = ["Losowanie pytań", "Losowanie odpowiedzi", "Limit czasu", "Blokada cofania", "Pełny ekran", "Alert zmiany karty", "Limit opuszczeń", "Log aktywności"];

const consentFlow = [
  { icon: ShieldCheck, label: "Ekran zgody", text: "Uczeń widzi jasny komunikat, czego wymaga egzamin i kto ma dostęp." },
  { icon: ScreenShare, label: "getDisplayMedia()", text: "Uczeń sam wybiera kartę, okno lub ekran. Brak ukrytego monitoringu." },
  { icon: Camera, label: "getUserMedia()", text: "Kamera tylko opcjonalnie i tylko po kliknięciu zgody przez ucznia." },
  { icon: Radio, label: "WebRTC + Realtime", text: "Sygnalizacja przez Supabase Realtime/WebSocket, stream stop po egzaminie." },
];

const monitoringViews = [
  ["Lista uczniów", "status, postęp, czas, ostrzeżenia"],
  ["Siatka live", "miniaturki tylko po zgodzie"],
  ["Widok ucznia", "pytanie, odpowiedzi, logi, notatki"],
  ["Alerty", "karta, okno, brak aktywności, stream stop"],
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

export function TeacherOperationalEnhancements() {
  const [mounts, setMounts] = useState<MountState>({ exams: null, monitoring: null });

  useEffect(() => {
    if (!location.pathname.includes("/teacher")) return;

    const attach = () => {
      const examsTarget = findSectionByHeading("Egzaminy");
      const monitoringTarget = findSectionByHeading("Monitoring");
      setMounts({
        exams: ensureMount(examsTarget, "data-edunex-exam-builder-shell"),
        monitoring: ensureMount(monitoringTarget, "data-edunex-monitoring-consent-center"),
      });
    };

    const timer = window.setTimeout(attach, 120);
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      document.querySelector("[data-edunex-exam-builder-shell]")?.remove();
      document.querySelector("[data-edunex-monitoring-consent-center]")?.remove();
    };
  }, []);

  return (
    <>
      {mounts.exams && createPortal(<ExamBuilderShell />, mounts.exams)}
      {mounts.monitoring && createPortal(<MonitoringConsentCenter />, mounts.monitoring)}
    </>
  );
}

function ExamBuilderShell() {
  return (
    <section className="mb-5 overflow-hidden rounded-[28px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(56,189,248,0.12),rgba(167,139,250,0.08),rgba(15,23,42,0.05))] p-5 backdrop-blur-2xl lg:p-6">
      <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-sky-200">
            <LayoutTemplate className="h-3.5 w-3.5" /> Exam Builder Shell
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-[-0.04em] text-[var(--color-fg)] lg:text-3xl">
            Kreator egzaminu gotowy pod drag & drop
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-fg-muted)]">
            To bezpieczna warstwa architektury nad obecnym modułem Egzaminy. Nie zmienia zapisu Supabase, nie usuwa edytora i nie psuje istniejącego tworzenia egzaminów.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <WorkflowCard icon={MousePointer2} title="Drag & drop layout" text="Sekcje, pytania i media jako bloki do przyszłego edytora." />
            <WorkflowCard icon={Wand2} title="AI first draft" text="Generator może przygotować pytania, klucz i rubrykę oceny." />
            <WorkflowCard icon={Timer} title="Tryby egzaminu" text="Standard, kartkówka, live quiz, zadanie, monitoring." />
            <WorkflowCard icon={ShieldCheck} title="Security rules" text="Losowanie, fullscreen, alert zmiany karty i logi ucznia." />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--color-fg)]">Typy pytań</h3>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-mono text-cyan-200">8 bloków</span>
            </div>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {questionTypes.map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-xl border border-white/8 bg-white/[0.035] p-3">
                  <Icon className="mb-2 h-4 w-4 text-cyan-300" />
                  <div className="text-[11px] font-medium text-[var(--color-fg-muted)]">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <TagPanel title="Tryby" items={examModes} icon={GraduationCap} />
            <TagPanel title="Publikowanie" items={publishSteps} icon={PlayCircle} />
            <TagPanel title="Bezpieczeństwo" items={safetyRules} icon={Lock} />
          </div>
        </div>
      </div>
    </section>
  );
}

function MonitoringConsentCenter() {
  return (
    <section className="mb-5 overflow-hidden rounded-[28px] border border-emerald-300/20 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(14,165,233,0.08),rgba(15,23,42,0.05))] p-5 backdrop-blur-2xl lg:p-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5" /> Privacy-first monitoring
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-[-0.04em] text-[var(--color-fg)] lg:text-3xl">
            Monitoring tylko jawnie, legalnie i za zgodą ucznia
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-fg-muted)]">
            Ten moduł porządkuje przyszły WebRTC: brak ukrytego podglądu, brak przejmowania komputera, brak kamery bez pytania. Uczeń zawsze widzi status udostępniania.
          </p>
          <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-xs leading-6 text-amber-100">
            <AlertTriangle className="mb-2 h-4 w-4" /> Nagrywanie ekranu lub kamery nie jest domyślne. Może istnieć tylko jako osobna opcja z osobną zgodą i logiem audytu.
          </div>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {consentFlow.map(({ icon: Icon, label, text }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                <Icon className="mb-3 h-5 w-5 text-emerald-300" />
                <div className="text-sm font-bold text-[var(--color-fg)]">{label}</div>
                <p className="mt-1 text-xs leading-5 text-[var(--color-fg-muted)]">{text}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:grid-cols-2">
            {monitoringViews.map(([title, text]) => (
              <div key={title} className="flex items-start gap-3 rounded-xl bg-black/10 p-3">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                <div>
                  <div className="text-xs font-bold text-[var(--color-fg)]">{title}</div>
                  <div className="mt-1 text-[11px] text-[var(--color-fg-muted)]">{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowCard({ icon: Icon, title, text }: { icon: Icon; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <Icon className="mb-3 h-5 w-5 text-cyan-300" />
      <div className="text-sm font-bold text-[var(--color-fg)]">{title}</div>
      <p className="mt-1 text-xs leading-5 text-[var(--color-fg-muted)]">{text}</p>
    </div>
  );
}

function TagPanel({ title, items, icon: Icon }: { title: string; items: string[]; icon: Icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--color-fg)]"><Icon className="h-4 w-4 text-cyan-300" /> {title}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-mono text-[var(--color-fg-muted)]">{item}</span>
        ))}
      </div>
    </div>
  );
}
