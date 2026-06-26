import { type ComponentType, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  GraduationCap,
  Layers3,
  LineChart,
  LockKeyhole,
  MessageSquareText,
  Radio,
  Route,
  School,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

const COMMAND_MODES = [
  {
    id: "school",
    label: "Dyrekcja",
    icon: School,
    title: "Cała szkoła w jednym, spokojnym widoku",
    text: "Dyrektor widzi frekwencję, ryzyka, tempo realizacji podstawy i jakość oceniania bez proszenia zespołu o ręczne raporty.",
    accent: "from-cyan-400 to-sky-500",
    kpis: [
      ["94%", "realizacji planu"],
      ["18", "klas aktywnych"],
      ["7 min", "do raportu rady"],
    ],
    alerts: ["Klasa 7B ma spadek aktywności z matematyki", "3 sprawdziany czekają na publikację", "Raport RODO gotowy do eksportu"],
  },
  {
    id: "teacher",
    label: "Nauczyciel",
    icon: GraduationCap,
    title: "Lekcja, egzamin i feedback bez chaosu",
    text: "Nauczyciel planuje zajęcia, generuje materiały AI, prowadzi quiz live i od razu dostaje listę uczniów wymagających wsparcia.",
    accent: "from-emerald-400 to-teal-500",
    kpis: [
      ["12", "zadań AI"],
      ["81%", "średnia klasy"],
      ["4", "uczniów do wsparcia"],
    ],
    alerts: ["AI proponuje powtórkę z równań", "Live Quiz gotowy dla 24 uczniów", "5 odpowiedzi otwartych ocenionych automatycznie"],
  },
  {
    id: "student",
    label: "Uczeń",
    icon: BookOpenCheck,
    title: "Osobista ścieżka nauki zamiast zgadywania",
    text: "Uczeń widzi plan dnia, korekty po egzaminie, rekomendowane fiszki i rozmowę z AI Tutorem dopasowaną do jego braków.",
    accent: "from-amber-300 to-orange-400",
    kpis: [
      ["+16%", "postępu"],
      ["42", "fiszki"],
      ["3 dni", "streak"],
    ],
    alerts: ["Powtórz funkcję liniową przed piątkiem", "AI Tutor ma 6 nowych ćwiczeń", "Certyfikat z biologii gotowy"],
  },
  {
    id: "parent",
    label: "Rodzic",
    icon: MessageSquareText,
    title: "Jasny obraz postępów bez nadmiaru powiadomień",
    text: "Rodzic dostaje krótkie podsumowania, widzi terminy, sukcesy i konkretne zalecenia, które może omówić z dzieckiem.",
    accent: "from-rose-300 to-pink-500",
    kpis: [
      ["5", "ważnych terminów"],
      ["2", "nowe sukcesy"],
      ["1", "zalecenie"],
    ],
    alerts: ["Nowa wiadomość od wychowawcy", "Zadanie z historii oddane terminowo", "Plan nauki na weekend gotowy"],
  },
];

const WORKFLOW = [
  { icon: BrainCircuit, label: "Diagnoza AI", text: "Analiza wyników, braków i tempa klasy." },
  { icon: Route, label: "Plan działania", text: "Gotowa ścieżka lekcji, ćwiczeń i powtórek." },
  { icon: Radio, label: "Sesja live", text: "Quiz, monitoring i reakcje w czasie rzeczywistym." },
  { icon: ClipboardCheck, label: "Ocena", text: "Rubryki, odpowiedzi otwarte i feedback." },
  { icon: LineChart, label: "Raport", text: "Wnioski dla ucznia, rodzica i dyrekcji." },
];

const HEATMAP = [
  72, 88, 64, 91, 57, 83, 76, 69, 95, 61, 84, 79,
  68, 73, 89, 52, 92, 86, 71, 67, 98, 74, 63, 81,
];

function modeById(id: string) {
  return COMMAND_MODES.find((mode) => mode.id === id) ?? COMMAND_MODES[0];
}

function HeatCell({ value, index }: { value: number; index: number }) {
  const tone =
    value >= 88
      ? "bg-emerald-400/80"
      : value >= 76
        ? "bg-cyan-400/70"
        : value >= 65
          ? "bg-amber-300/70"
          : "bg-rose-400/70";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.015, duration: 0.25 }}
      className={`h-8 rounded-md ${tone} border border-white/10`}
      title={`${value}%`}
    />
  );
}

function StatusLine({ label, value, icon: Icon }: { label: string; value: string; icon: ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-3 last:border-b-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="grid h-8 w-8 place-items-center rounded-md border border-white/[0.08] bg-white/[0.04]">
          <Icon className="h-4 w-4 text-cyan-200" />
        </div>
        <span className="truncate text-sm text-white/70">{label}</span>
      </div>
      <span className="shrink-0 font-mono text-xs text-white/45">{value}</span>
    </div>
  );
}

export default function CommandCenterSection() {
  const [active, setActive] = useState(COMMAND_MODES[0].id);
  const mode = modeById(active);

  const readiness = useMemo(() => {
    const base = mode.kpis.reduce((sum, item) => sum + item[0].charCodeAt(0), 0);
    return 82 + (base % 14);
  }, [mode]);

  return (
    <section id="centrum" className="relative overflow-hidden py-28 sm:py-36">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.025),transparent)]" />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-xs text-white/55"
          >
            <Layers3 className="h-3.5 w-3.5 text-cyan-300" />
            Centrum dowodzenia
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl"
          >
            EduNex jako operacyjny system dla całej szkoły
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
            className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/45 sm:text-base"
          >
            Nie tylko landing i logowanie. Platforma łączy dane, AI, egzaminy, komunikację, bezpieczeństwo i codzienne decyzje w jednym rytmie pracy.
          </motion.p>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-4">
          {COMMAND_MODES.map((item) => {
            const selected = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`group flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${
                  selected
                    ? "border-cyan-300/35 bg-white/[0.08] text-white shadow-[0_16px_50px_rgba(8,145,178,0.18)]"
                    : "border-white/[0.07] bg-white/[0.025] text-white/50 hover:border-white/[0.14] hover:bg-white/[0.05]"
                }`}
              >
                <span className={`grid h-9 w-9 place-items-center rounded-md bg-gradient-to-br ${item.accent}`}>
                  <item.icon className="h-4 w-4 text-slate-950" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="block truncate text-[11px] text-white/35">tryb pracy</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.35fr]">
          <motion.div
            layout
            className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-xl"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <div className={`inline-flex rounded-md bg-gradient-to-r ${mode.accent} p-2`}>
                  <mode.icon className="h-5 w-5 text-slate-950" />
                </div>
                <h3 className="mt-5 text-2xl font-bold leading-tight text-white">{mode.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/45">{mode.text}</p>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {mode.kpis.map(([value, label]) => (
                    <div key={label} className="rounded-lg border border-white/[0.07] bg-black/20 p-3">
                      <div className="font-mono text-lg font-semibold text-white">{value}</div>
                      <div className="mt-1 text-[11px] leading-4 text-white/35">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-lg border border-white/[0.07] bg-black/20 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/80">
                      <Sparkles className="h-4 w-4 text-cyan-300" />
                      Alerty AI
                    </span>
                    <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] text-emerald-200">
                      {readiness}% ready
                    </span>
                  </div>
                  <div className="space-y-2">
                    {mode.alerts.map((alert, index) => (
                      <motion.div
                        key={alert}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-2 rounded-md bg-white/[0.035] px-3 py-2 text-xs leading-5 text-white/55"
                      >
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                        {alert}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <Link
                  to="/auth/teacher"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
                >
                  Uruchom panel
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <div className="rounded-lg border border-white/[0.08] bg-[#071016]/90 p-4 shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] pb-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/70">Live operations</div>
                <div className="mt-1 text-lg font-semibold text-white">Panel szkoły: dzisiaj</div>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                online
              </div>
            </div>

            <div className="grid gap-4 py-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/80">
                    <Gauge className="h-4 w-4 text-amber-200" />
                    Mapa gotowości klas
                  </span>
                  <span className="font-mono text-xs text-white/35">24 grupy</span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {HEATMAP.map((value, index) => (
                    <HeatCell key={`${value}-${index}`} value={value} index={index} />
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2 text-[10px] text-white/35">
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-400" />mocne</span>
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-cyan-400" />stabilne</span>
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-amber-300" />uwaga</span>
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-rose-400" />ryzyko</span>
                </div>
              </div>

              <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
                  <AlertTriangle className="h-4 w-4 text-amber-200" />
                  Priorytety
                </div>
                <StatusLine icon={Target} label="Powtórka: równania i funkcje" value="7B" />
                <StatusLine icon={UsersRound} label="Konsultacje dla 4 uczniów" value="14:30" />
                <StatusLine icon={CalendarClock} label="Publikacja sprawdzianu" value="jutro" />
                <StatusLine icon={ShieldCheck} label="Audyt dostępu i RODO" value="OK" />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-5">
              {WORKFLOW.map((step, index) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-3"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <step.icon className="h-4 w-4 text-cyan-200" />
                    <span className="font-mono text-[10px] text-white/25">0{index + 1}</span>
                  </div>
                  <div className="text-sm font-semibold text-white/80">{step.label}</div>
                  <p className="mt-1 text-[11px] leading-5 text-white/35">{step.text}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <StatusLine icon={Activity} label="Sesje live" value="6 aktywnych" />
              <StatusLine icon={LockKeyhole} label="Bezpieczeństwo" value="TLS 1.3" />
              <StatusLine icon={BarChart3} label="Raporty" value="gotowe" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
