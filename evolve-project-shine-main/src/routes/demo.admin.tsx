import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Building2, FileText, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/demo/admin")({
  component: DemoAdminDashboard,
  head: () => ({ meta: [{ title: "Demo admin | EduNex" }] }),
});

const modules = [
  ["Użytkownicy", "Role i klasy"],
  ["Egzaminy", "Sesje i archiwum"],
  ["Raporty", "Wyniki i eksport"],
  ["Ustawienia", "Konfiguracja szkoły"],
];

function DemoAdminDashboard() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(251,191,36,0.14),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.14),transparent_30%),linear-gradient(135deg,#020617,#08111f_48%,#020617)]" />
      <main className="relative z-10 mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-amber-200">
              <Building2 className="h-3.5 w-3.5" /> Demo admin
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-[-0.055em]">Konsola administracyjna premium</h1>
            <p className="mt-2 text-sm text-white/55">Zarządzanie szkołą, użytkownikami, egzaminami i raportami.</p>
          </div>
          <Link to="/demo" className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 hover:bg-white/[0.08]">Zmień konto demo</Link>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Stat icon={Users} label="Użytkownicy" value="1240" />
          <Stat icon={FileText} label="Egzaminy" value="86" />
          <Stat icon={Activity} label="Sesje" value="18" />
          <Stat icon={Sparkles} label="Moduły" value="24" />
        </section>

        <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl">
          <div className="mb-5 flex items-center gap-2 text-xl font-bold tracking-[-0.03em]"><Sparkles className="h-5 w-5 text-cyan-300" /> Moduły systemu</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                <div className="text-sm font-bold">{title}</div>
                <div className="mt-1 text-xs leading-5 text-white/50">{text}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
      <Icon className="mb-3 h-5 w-5 text-cyan-300" />
      <div className="text-3xl font-bold tracking-[-0.05em]">{value}</div>
      <div className="mt-1 text-xs font-mono uppercase tracking-[0.16em] text-white/40">{label}</div>
    </div>
  );
}
