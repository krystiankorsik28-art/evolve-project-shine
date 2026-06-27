import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Bell, Eye, School, Users } from "lucide-react";

export const Route = createFileRoute("/demo/parent")({
  component: DemoParentDashboard,
  head: () => ({ meta: [{ title: "Demo rodzic | EduNex" }] }),
});

const rows = [
  { name: "Kacper Demo", className: "8A", avg: "78%", attendance: "94%", trend: "+6%" },
  { name: "Zuzanna Demo", className: "5B", avg: "92%", attendance: "98%", trend: "+12%" },
];

function DemoParentDashboard() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.12),transparent_30%),linear-gradient(135deg,#020617,#08111f_48%,#020617)]" />
      <main className="relative z-10 mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-blue-200">
              <School className="h-3.5 w-3.5" /> Demo rodzic
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-[-0.055em]">Panel rodzica premium</h1>
            <p className="mt-2 text-sm text-white/55">Postępy, wyniki, frekwencja i komunikaty szkoły w jednym widoku.</p>
          </div>
          <Link to="/demo" className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 hover:bg-white/[0.08]">Zmień konto demo</Link>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Stat icon={Users} label="Profile" value="2" />
          <Stat icon={BarChart3} label="Średnia" value="85%" />
          <Stat icon={Bell} label="Komunikaty" value="3" />
        </section>

        <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-[-0.03em]">Podgląd postępów</h2>
            <Eye className="h-5 w-5 text-cyan-300" />
          </div>
          <div className="grid gap-3">
            {rows.map((row) => (
              <div key={row.name} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-bold">{row.name}</div>
                    <div className="mt-1 text-xs text-white/45">Klasa {row.className} · frekwencja {row.attendance}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-xl bg-white/[0.04] px-4 py-2"><div className="font-mono text-cyan-200">{row.avg}</div><div className="text-[10px] text-white/40">średnia</div></div>
                    <div className="rounded-xl bg-white/[0.04] px-4 py-2"><div className="font-mono text-emerald-200">{row.trend}</div><div className="text-[10px] text-white/40">trend</div></div>
                  </div>
                </div>
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
