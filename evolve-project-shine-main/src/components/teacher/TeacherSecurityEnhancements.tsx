import { useEffect, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { BadgeCheck, Camera, Database, FileText, Fingerprint, KeyRound, MonitorUp, ShieldCheck, Smartphone, UserCheck } from "lucide-react";

type Icon = ComponentType<{ className?: string }>;

const securityTiles: { icon: Icon; title: string; text: string; state: string }[] = [
  { icon: KeyRound, title: "2FA", text: "Konta nauczyciela i admina mogą wymagać dodatkowego potwierdzenia.", state: "core" },
  { icon: Fingerprint, title: "Passkeys", text: "Klucze dostępu dla nowoczesnego i wygodnego logowania.", state: "ready" },
  { icon: Smartphone, title: "Urządzenia", text: "Lista aktywnych urządzeń i sesji użytkownika.", state: "active" },
  { icon: Database, title: "Retencja danych", text: "Polityka przechowywania wyników, logów i zgód egzaminacyjnych.", state: "policy" },
];

const compliance = [
  ["Zgoda na ekran", "osobny komunikat przed egzaminem"],
  ["Zgoda na kamerę", "tylko opcjonalnie i jawnie"],
  ["Log start/stop", "audyt zdarzeń monitoringu"],
  ["Status ucznia", "widoczny komunikat podczas udostępniania"],
  ["Eksport logów", "pod przyszłe RODO/GDPR center"],
  ["Retencja", "czas przechowywania danych szkoły"],
];

function findSettingsMount() {
  const headings = Array.from(document.querySelectorAll<HTMLElement>("h1,h2,h3"));
  const heading = headings.find((node) => ["Profil", "Zmiana hasła", "Bezpieczeństwo"].some((x) => node.textContent?.includes(x)));
  return heading?.closest("div.space-y-5, div.max-w-3xl, section, div") as HTMLElement | null;
}

export function TeacherSecurityEnhancements() {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!location.pathname.includes("/teacher")) return;

    const attach = () => {
      const target = findSettingsMount();
      if (!target?.parentElement) return;
      const existing = document.querySelector<HTMLElement>("[data-edunex-security-center]");
      if (existing) {
        setHost(existing);
        return;
      }
      const mount = document.createElement("div");
      mount.setAttribute("data-edunex-security-center", "true");
      target.parentElement.insertBefore(mount, target);
      setHost(mount);
    };

    const timer = window.setTimeout(attach, 120);
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      document.querySelector("[data-edunex-security-center]")?.remove();
    };
  }, []);

  if (!host) return null;

  return createPortal(
    <section className="mb-5 overflow-hidden rounded-[28px] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(16,185,129,0.08),rgba(15,23,42,0.05))] p-5 backdrop-blur-2xl lg:p-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-200">
            <ShieldCheck className="h-3.5 w-3.5" /> Security Center
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-[-0.04em] text-[var(--color-fg)] lg:text-3xl">
            Centrum bezpieczeństwa nauczyciela
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-fg-muted)]">
            Ten moduł porządkuje istniejące 2FA, passkeys, sesje i urządzenia oraz dodaje mapę zgodności pod monitoring egzaminów, RODO i retencję danych.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {securityTiles.map(({ icon: Icon, title, text, state }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between gap-3">
                  <Icon className="h-5 w-5 text-cyan-300" />
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-mono uppercase text-[var(--color-fg-muted)]">{state}</span>
                </div>
                <div className="mt-3 text-sm font-bold text-[var(--color-fg)]">{title}</div>
                <p className="mt-1 text-xs leading-5 text-[var(--color-fg-muted)]">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-200"><UserCheck className="h-4 w-4" /> Checklista zgodności</div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {compliance.map(([title, text]) => (
                <div key={title} className="rounded-xl border border-white/10 bg-black/10 p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-fg)]"><BadgeCheck className="h-3.5 w-3.5 text-emerald-300" /> {title}</div>
                  <div className="mt-1 text-[11px] leading-5 text-[var(--color-fg-muted)]">{text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Mini icon={MonitorUp} label="Ekran" text="jawne udostępnianie" />
            <Mini icon={Camera} label="Kamera" text="osobna zgoda" />
            <Mini icon={FileText} label="Audyt" text="log zdarzeń" />
          </div>
        </div>
      </div>
    </section>,
    host,
  );
}

function Mini({ icon: Icon, label, text }: { icon: Icon; label: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <Icon className="mb-3 h-5 w-5 text-cyan-300" />
      <div className="text-sm font-bold text-[var(--color-fg)]">{label}</div>
      <div className="mt-1 text-xs text-[var(--color-fg-muted)]">{text}</div>
    </div>
  );
}
