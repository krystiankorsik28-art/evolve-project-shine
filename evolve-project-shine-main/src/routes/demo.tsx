import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Building2, GraduationCap, Lock, Mail, School, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

type DemoRole = "student" | "parent" | "admin";

const DEMO_PASS = ["test", "123"].join("");

const DEMO = [
  { role: "student" as const, label: "Uczeń", email: "student@test.pl", icon: GraduationCap, target: "/student/dashboard", desc: "Panel ucznia, wyniki, PIN egzaminu i AI tutor" },
  { role: "parent" as const, label: "Rodzic", email: "parent@test.pl", icon: School, target: "/demo/parent", desc: "Podgląd dziecka, wyniki, alerty i frekwencja" },
  { role: "admin" as const, label: "Admin", email: "admin@test.pl", icon: Building2, target: "/demo/admin", desc: "Konsola szkoły, bezpieczeństwo i statystyki" },
];

export const Route = createFileRoute("/demo")({
  component: DemoLauncher,
  head: () => ({ meta: [{ title: "Konta testowe | EduNex" }] }),
});

function DemoLauncher() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("student@test.pl");
  const [password, setPassword] = useState(DEMO_PASS);
  const [role, setRole] = useState<DemoRole>("student");

  const selected = DEMO.find((x) => x.role === role)!;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (password !== DEMO_PASS) {
      toast.error("Nieprawidłowe hasło demo");
      return;
    }
    if (normalized !== selected.email) {
      toast.error(`Dla tej roli użyj: ${selected.email}`);
      return;
    }
    sessionStorage.setItem("edunex_demo", JSON.stringify({ role, email: normalized, name: selected.label + " Demo" }));
    toast.success("Uruchamiam tryb demo");
    await navigate({ to: selected.target });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] px-4 py-8 text-white">
      <Toaster theme="dark" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_78%_16%,rgba(59,130,246,0.16),transparent_28%),linear-gradient(135deg,#020617,#07111f_48%,#020617)]" />
      <div className="absolute inset-0 opacity-[0.16]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl place-items-center">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="grid w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.045] shadow-[0_36px_120px_rgba(0,0,0,0.48)] backdrop-blur-2xl lg:grid-cols-[0.95fr_1.05fr]">
          <aside className="relative overflow-hidden border-b border-white/10 p-8 lg:border-b-0 lg:border-r lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" /> EduNex Demo
            </div>
            <h1 className="mt-5 max-w-xl text-4xl font-bold tracking-[-0.055em] lg:text-5xl">
              Konta testowe do szybkiego przeglądu paneli.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/62">
              To bezpieczny launcher demo. Nie zmienia prawdziwych użytkowników Supabase Auth i nie psuje normalnego logowania.
            </p>

            <div className="mt-8 grid gap-3">
              {DEMO.map(({ role: r, label, email, icon: Icon, desc }) => (
                <button key={r} onClick={() => { setRole(r); setEmail(email); }} className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${role === r ? "border-cyan-300/30 bg-cyan-400/10" : "border-white/10 bg-white/[0.035] hover:bg-white/[0.06]"}`}>
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-500 text-slate-950">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{label}</div>
                    <div className="mt-1 text-xs leading-5 text-white/55">{desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <form onSubmit={submit} className="p-8 lg:p-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#0078d4]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-[-0.03em]">Zaloguj demo</h2>
                <p className="text-sm text-white/50">Wybierz rolę i użyj danych testowych.</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-mono uppercase tracking-[0.18em] text-white/45">E-mail</span>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-3 text-sm outline-none transition focus:border-cyan-300/40" />
                </div>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-mono uppercase tracking-[0.18em] text-white/45">Hasło</span>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-3 text-sm outline-none transition focus:border-cyan-300/40" />
                </div>
              </label>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-xs leading-6 text-white/55">
              Dane: <span className="font-mono text-cyan-200">admin@test.pl</span>, <span className="font-mono text-cyan-200">student@test.pl</span>, <span className="font-mono text-cyan-200">parent@test.pl</span>. Hasło: <span className="font-mono text-cyan-200">test123</span>.
            </div>

            <button className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0078d4] text-sm font-bold text-white transition hover:bg-[#106ebe]">
              Otwórz panel {selected.label} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </motion.section>
      </main>
    </div>
  );
}
