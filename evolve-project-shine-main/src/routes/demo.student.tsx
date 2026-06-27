import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Award, BarChart3, BookOpen, Brain, CalendarDays, CheckCircle2, GraduationCap, Sparkles, Target, Timer, Trophy } from "lucide-react";

export const Route = createFileRoute("/demo/student")({
  component: DemoStudentDashboard,
  head: () => ({ meta: [{ title: "Demo uczeń | EduNex" }] }),
});

const exams = [
  ["Matematyka", "Ułamki i procenty", "92%", "ukończony"],
  ["Biologia", "Komórka i tkanki", "81%", "ukończony"],
  ["Historia", "II wojna światowa", "—", "zaplanowany"],
];

function DemoStudentDashboard() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.16),transparent_32%),linear-gradient(135deg,#020617,#07111f_46%,#020617)]" />
      <main className="relative z-10 mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-200">
              <GraduationCap className="h-3.5 w-3.5" /> Demo uczeń
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-[-0.055em]">Panel ucznia premium</h1>
            <p className="mt-2 text-sm text-white/55">Egzaminy, wyniki, certyfikaty, plan nauki i AI Tutor w jednym widoku.</p>
          </div>
          <Link to="/demo" className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 hover:bg-white/[0.08]">Zmień konto demo</Link>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Stat icon={Trophy} label="Średnia" value="86%" />
          <Stat icon={Award} label="Certyfikaty" value="4" />
          <Stat icon={Timer} label="Czas nauki" value="12h" />
          <Stat icon={Target} label="Cel tygodnia" value="72%" />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-[-0.03em]">Najbliższe sprawdziany</h2>
                <p className="mt-1 text-sm text-white/45">Widok przygotowany pod realne sesje PIN.</p>
              </div>
              <CalendarDays className="h-5 w-5 text-cyan-300" />
            </div>
            <div className="grid gap-3">
              {exams.map(([subject, title, score, status]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold">{title}</div>
                      <div className="mt-1 text-xs text-white/45">{subject} · {status}</div>
                    </div>
                    <div className="font-mono text-cyan-200">{score}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-[28px] border border-cyan-300/20 bg-cyan-400/[0.055] p-6 backdrop-blur-2xl">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-cyan-200"><Brain className="h-4 w-4" /> AI Tutor</div>
            <h2 className="text-2xl font-bold tracking-[-0.04em]">Plan nauki na dziś</h2>
            <div className="mt-5 grid gap-3">
              {["Powtórz ułamki zwykłe", "Zrób 10 pytań z biologii", "Sprawdź błędne odpowiedzi"].map((x) => (
                <div key={x} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/15 p-3 text-sm text-white/70">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" /> {x}
                </div>
              ))}
            </div>
          </motion.div>
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
