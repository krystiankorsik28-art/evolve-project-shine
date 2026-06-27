import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bot,
  BrainCircuit,
  CheckCircle2,
  FileText,
  Lightbulb,
  Sparkles,
  Wand2,
} from "lucide-react";

const topics = [
  {
    label: "Matematyka",
    prompt: "Ułamki zwykłe i dziesiętne, klasa 6",
    questions: [
      "Zamień 3/4 na liczbę dziesiętną.",
      "Który ułamek jest większy: 5/8 czy 2/3?",
      "Oblicz: 1,25 + 3/5.",
    ],
    insight: "Największy problem: porównywanie ułamków o różnych mianownikach.",
    score: 82,
  },
  {
    label: "Historia",
    prompt: "II wojna światowa, poziom podstawowy",
    questions: [
      "Podaj datę rozpoczęcia II wojny światowej.",
      "Wyjaśnij pojęcie okupacja.",
      "Wymień dwa skutki wojny dla ludności cywilnej.",
    ],
    insight: "AI sugeruje dodać pytanie opisowe sprawdzające rozumienie przyczyn i skutków.",
    score: 74,
  },
  {
    label: "Biologia",
    prompt: "Układ oddechowy człowieka, klasa 7",
    questions: [
      "Jaką funkcję pełnią płuca?",
      "Wskaż drogę powietrza w organizmie.",
      "Dlaczego wymiana gazowa jest potrzebna komórkom?",
    ],
    insight: "Uczniowie dobrze znają definicje, ale potrzebują więcej zadań praktycznych.",
    score: 88,
  },
];

export function AIShowcaseSection({ isLight }: { isLight: boolean }) {
  const [active, setActive] = useState(0);
  const item = topics[active];
  const bars = useMemo(
    () => [item.score, Math.max(48, item.score - 13), Math.min(96, item.score + 7)],
    [item.score],
  );

  return (
    <section id="ai-showcase" className="relative z-10 mx-auto max-w-7xl px-5 py-28 sm:px-6">
      <div
        className={`overflow-hidden rounded-[32px] border p-5 backdrop-blur-2xl sm:p-8 lg:p-10 ${isLight ? "border-white/80 bg-white/76 shadow-[0_38px_110px_rgba(15,23,42,0.13)]" : "border-white/10 bg-white/[0.055] shadow-[0_38px_120px_rgba(0,0,0,0.42)]"}`}
      >
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0078d4]/25 bg-[#0078d4]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#0078d4]">
              <BrainCircuit className="h-4 w-4" /> AI w EduNex
            </div>
            <h2 className="mt-6 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
              Generator pytań i analiza wyników w jednym widoku.
            </h2>
            <p
              className={`mt-5 max-w-2xl text-lg leading-8 ${isLight ? "text-slate-600" : "text-white/62"}`}
            >
              Sekcja pokazuje, jak nauczyciel może zamienić temat lekcji w gotowe pytania, a potem
              dostać czytelną analizę klasy po zakończeniu sprawdzianu.
            </p>

            <div
              className={`mt-8 grid gap-1 rounded-2xl border p-1 sm:grid-cols-3 ${isLight ? "border-slate-200 bg-white/70" : "border-white/10 bg-white/[0.045]"}`}
            >
              {topics.map((topic, index) => (
                <button
                  key={topic.label}
                  onClick={() => setActive(index)}
                  className={`rounded-xl px-4 py-3 text-left transition ${active === index ? "bg-[#0078d4] text-white shadow-[0_16px_44px_rgba(0,120,212,0.24)]" : isLight ? "text-slate-700 hover:bg-white" : "text-white/68 hover:bg-white/[0.08] hover:text-white"}`}
                >
                  <Bot className="mb-3 h-5 w-5" />
                  <div className="font-black tracking-[-0.03em]">{topic.label}</div>
                  <div
                    className={`mt-1 text-xs ${active === index ? "text-white/70" : isLight ? "text-slate-500" : "text-white/45"}`}
                  >
                    kliknij, aby wygenerować
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="rounded-[26px] border border-white/12 bg-[#030a18] p-5 text-white shadow-[0_30px_90px_rgba(0,0,0,0.35)] sm:p-7"
            initial={{ opacity: 0, x: 30, scale: 0.97 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.24em] text-[#50e6ff]">
                  AI Generator
                </div>
                <div className="mt-2 text-3xl font-black tracking-[-0.05em]">{item.label}</div>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-[#0078d4] shadow-[0_0_50px_rgba(0,120,212,0.55)]">
                <Wand2 className="h-7 w-7" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="mt-7"
              >
                <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#50e6ff]">
                    <FileText className="h-4 w-4" /> Temat
                  </div>
                  <div className="mt-3 rounded-2xl bg-white/[0.06] p-4 font-semibold text-white/82">
                    {item.prompt}
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {item.questions.map((question, index) => (
                    <motion.div
                      key={question}
                      className="rounded-xl border border-white/10 bg-white/[0.045] p-4"
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#50e6ff]" />
                        <div className="font-semibold text-white/82">{question}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-[#50e6ff]/18 bg-[#50e6ff]/8 p-5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#50e6ff]">
                    <Lightbulb className="h-4 w-4" /> Wniosek AI
                  </div>
                  <p className="mt-3 leading-7 text-white/72">{item.insight}</p>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#50e6ff]">
                    <BarChart3 className="h-4 w-4" /> Prognoza wyników
                  </div>
                  <div className="mt-5 grid gap-3">
                    {bars.map((value, index) => (
                      <div key={index} className="h-3 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-[#0078d4] to-[#50e6ff]"
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          transition={{ duration: 0.65, delay: index * 0.08 }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
