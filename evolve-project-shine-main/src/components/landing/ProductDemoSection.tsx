import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BarChart3, CheckCircle2, ClipboardList, GraduationCap, Hash, Sparkles, Timer, Users } from "lucide-react";

const demoSteps = [
  {
    key: "teacher",
    label: "Nauczyciel",
    title: "Tworzenie sprawdzianu",
    text: "Nauczyciel wybiera typ pytań, limit czasu, punktację i uruchamia sesję dla klasy.",
    icon: ClipboardList,
    stats: ["12 pytań", "45 minut", "24 uczniów"],
  },
  {
    key: "student",
    label: "Uczeń",
    title: "Wejście kodem PIN",
    text: "Uczeń wpisuje imię, nazwisko i kod sesji. Interfejs prowadzi go przez egzamin krok po kroku.",
    icon: GraduationCap,
    stats: ["PIN 482 913", "Timer", "Postęp 68%"],
  },
  {
    key: "report",
    label: "Raport",
    title: "Analiza wyników live",
    text: "System pokazuje średnią klasy, oddane prace, czas pracy i pytania wymagające powtórki.",
    icon: BarChart3,
    stats: ["Średnia 84%", "18/24 prac", "AI analiza"],
  },
];

const questionRows = [
  ["Pytanie zamknięte", "4 odp.", "2 pkt"],
  ["Prawda / fałsz", "6 tez", "3 pkt"],
  ["Esej krótki", "AI pomoc", "5 pkt"],
];

export function ProductDemoSection({ isLight }: { isLight: boolean }) {
  const [active, setActive] = useState(0);
  const step = demoSteps[active];
  const Icon = step.icon;

  return (
    <section id="demo" className="relative z-10 mx-auto max-w-7xl px-5 py-28 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0078d4]/25 bg-[#0078d4]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0078d4]">
            <Sparkles className="h-4 w-4" /> Demo produktu
          </div>
          <h2 className="mt-6 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
            Zobacz cały egzamin w jednej, płynnej ścieżce.
          </h2>
          <p className={`mt-5 max-w-2xl text-lg leading-8 ${isLight ? "text-slate-600" : "text-white/62"}`}>
            Ta sekcja pokazuje EduNex jak prawdziwy produkt SaaS: od przygotowania sprawdzianu, przez wejście ucznia kodem PIN, po raport nauczyciela w czasie rzeczywistym.
          </p>

          <div className="mt-8 grid gap-3">
            {demoSteps.map((item, index) => {
              const ItemIcon = item.icon;
              const selected = active === index;
              return (
                <button
                  key={item.key}
                  onClick={() => setActive(index)}
                  className={`group flex items-center gap-4 rounded-[26px] border p-4 text-left transition ${
                    selected
                      ? "border-[#0078d4] bg-[#0078d4] text-white shadow-[0_24px_70px_rgba(0,120,212,0.25)]"
                      : isLight
                        ? "border-white/80 bg-white/78 text-slate-900 shadow-[0_18px_60px_rgba(15,23,42,0.08)] hover:-translate-y-0.5"
                        : "border-white/10 bg-white/[0.05] text-white hover:-translate-y-0.5 hover:bg-white/[0.075]"
                  }`}
                >
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${selected ? "bg-white/16" : "bg-[#0078d4]/12 text-[#0078d4]"}`}>
                    <ItemIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-black uppercase tracking-[0.18em] opacity-70">{item.label}</div>
                    <div className="mt-1 text-lg font-bold tracking-[-0.03em]">{item.title}</div>
                  </div>
                  <ArrowRight className="ml-auto h-5 w-5 opacity-55 transition group-hover:translate-x-1" />
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          className={`edunex-holo-border overflow-hidden rounded-[38px] border p-4 backdrop-blur-2xl ${isLight ? "border-white/80 bg-white/76 shadow-[0_40px_110px_rgba(15,23,42,0.14)]" : "border-white/10 bg-white/[0.055] shadow-[0_40px_120px_rgba(0,0,0,0.45)]"}`}
          initial={{ opacity: 0, x: 32, scale: 0.97 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="rounded-[30px] border border-white/10 bg-[#020617] p-5 text-white sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.24em] text-[#50e6ff]">EduNex Live Demo</div>
                <div className="mt-2 text-3xl font-black tracking-[-0.05em]">Sesja matematyki</div>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#0078d4] shadow-[0_0_50px_rgba(0,120,212,0.55)]">
                <Icon className="h-7 w-7" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="mt-7"
              >
                <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5">
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#50e6ff]/12 text-[#50e6ff]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold tracking-[-0.04em]">{step.title}</h3>
                      <p className="mt-2 leading-7 text-white/62">{step.text}</p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {step.stats.map((stat) => (
                      <div key={stat} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 text-sm font-bold text-white/78">
                        {stat}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-5 grid gap-3">
              {questionRows.map(([name, meta, points], index) => (
                <motion.div
                  key={name}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-sm"
                  animate={{ x: active === index ? 6 : 0, borderColor: active === index ? "rgba(80,230,255,0.36)" : "rgba(255,255,255,0.10)" }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="flex items-center gap-3 font-bold"><CheckCircle2 className="h-4 w-4 text-[#50e6ff]" /> {name}</div>
                  <div className="text-white/45">{meta}</div>
                  <div className="rounded-full bg-[#0078d4] px-3 py-1 text-xs font-bold">{points}</div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <LiveMiniCard icon={Hash} label="PIN" value="482 913" />
              <LiveMiniCard icon={Timer} label="Czas" value="31:24" />
              <LiveMiniCard icon={Users} label="Online" value="24" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function LiveMiniCard({ icon: Icon, label, value }: { icon: typeof Hash; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
      <Icon className="mb-3 h-5 w-5 text-[#50e6ff]" />
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/42">{label}</div>
      <div className="mt-1 text-xl font-black tracking-[-0.04em]">{value}</div>
    </div>
  );
}
