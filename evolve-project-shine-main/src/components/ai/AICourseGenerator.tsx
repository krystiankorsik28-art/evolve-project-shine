import { useState } from "react";
import { Sparkles, Loader2, BookOpen, FileText, Clock, Award, Target, CheckCircle2, ChevronRight, Download, Eye, Globe2, GraduationCap, BarChart3 } from "lucide-react";
import { toast } from "sonner";

type Course = {
  title: string;
  description: string;
  level: string;
  duration: string;
  modules: { title: string; lessons: { title: string; duration: string; type: string }[] }[];
  skills: string[];
  prerequisites: string[];
};

const DEMO_COURSES: Record<string, Course> = {
  "matematyka-1": {
    title: "Matematyka Dyskretna — Poziom Podstawowy",
    description: "Kurs obejmujący logikę matematyczną, teorię mnogości, kombinatorykę i podstawy rachunku prawdopodobieństwa. Idealny dla studentów kierunków ścisłych.",
    level: "Średniozaawansowany", duration: "8 tygodni",
    modules: [
      { title: "Logika matematyczna", lessons: [
        { title: "Rachunek zdań — podstawy", duration: "45 min", type: "wideo" },
        { title: "Kwantyfikatory i formy zdaniowe", duration: "50 min", type: "wideo" },
        { title: "Tabele prawdy — ćwiczenia", duration: "30 min", type: "interaktywny" },
        { title: "Sprawdzian — Logika", duration: "20 min", type: "test" },
      ]},
      { title: "Teoria mnogości", lessons: [
        { title: "Zbiory, podzbiory, operacje", duration: "45 min", type: "wideo" },
        { title: "Relacje i funkcje", duration: "50 min", type: "wideo" },
        { title: "Zadania z teorią mnogości", duration: "35 min", type: "interaktywny" },
      ]},
      { title: "Kombinatoryka", lessons: [
        { title: "Reguła mnożenia i dodawania", duration: "40 min", type: "wideo" },
        { title: "Permutacje, kombinacje, wariacje", duration: "55 min", type: "wideo" },
        { title: "Dwumian Newtona — zastosowania", duration: "30 min", type: "wideo" },
        { title: "Egzamin końcowy", duration: "60 min", type: "test" },
      ]},
    ],
    skills: ["Logika matematyczna", "Operacje na zbiorach", "Obliczenia kombinatoryczne", "Dowodzenie twierdzeń"],
    prerequisites: ["Znajomość matematyki na poziomie liceum", "Podstawy algebry"],
  },
  "python-1": {
    title: "Python od Podstaw — Programowanie dla Każdego",
    description: "Kompleksowy kurs programowania w Pythonie. Od pierwszych linii kodu po własne aplikacje. Praktyczne projekty i AI Code Mentor w każdej lekcji.",
    level: "Początkujący", duration: "10 tygodni",
    modules: [
      { title: "Wprowadzenie do Pythona", lessons: [
        { title: "Instalacja i pierwsze uruchomienie", duration: "20 min", type: "wideo" },
        { title: "Zmienne, typy danych, operatory", duration: "45 min", type: "wideo" },
        { title: "Stringi i formatowanie", duration: "30 min", type: "interaktywny" },
      ]},
      { title: "Struktury danych", lessons: [
        { title: "Listy, tuple, słowniki, zbiory", duration: "50 min", type: "wideo" },
        { title: "List comprehension — pętle w jednej linii", duration: "35 min", type: "wideo" },
        { title: "Praktyczny projekt: Analiza danych", duration: "60 min", type: "projekt" },
      ]},
    ],
    skills: ["Python 3", "Struktury danych", "Funkcje i moduły", "Podstawy OOP"],
    prerequisites: ["Umiejętność obsługi komputera", "Brak wymagań programistycznych"],
  },
};

const LEVELS = ["Początkujący", "Średniozaawansowany", "Zaawansowany", "Ekspert"];
const SUBJECTS = [
  "Matematyka", "Fizyka", "Chemia", "Biologia", "Informatyka",
  "Język angielski", "Język polski", "Historia", "Geografia",
  "Programowanie", "Bazy danych", "AI / ML", "Biznes", "Sztuka",
];

export function AICourseGenerator() {
  const [step, setStep] = useState<"form" | "generating" | "result">("form");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("Średniozaawansowany");
  const [duration, setDuration] = useState("8");
  const [course, setCourse] = useState<Course | null>(null);
  const [customTopic, setCustomTopic] = useState("");

  const generate = async () => {
    const topic = subject === "other" ? customTopic : subject;
    if (!topic) { toast.error("Wybierz lub wpisz temat kursu"); return; }
    setStep("generating");
    setTimeout(() => {
      const demo = DEMO_COURSES[topic.toLowerCase().includes("matemat") ? "matematyka-1" : "python-1"] || {
        title: `Kurs: ${topic} — poziom ${level}`,
        description: `Automatycznie wygenerowany kurs z zakresu ${topic} na poziomie ${level}. Kurs obejmuje ${duration} tygodni intensywnej nauki z materiałami wideo, ćwiczeniami interaktywnymi i testami.`,
        level, duration: `${duration} tygodni`,
        modules: Array.from({ length: 4 }, (_, i) => ({
          title: `Moduł ${i + 1}: ${["Podstawy", "Rozwinięcie", "Zaawansowane tematy", "Projekt końcowy"][i]}`,
          lessons: Array.from({ length: 4 }, (_, j) => ({
            title: `Lekcja ${j + 1}: ${["Wprowadzenie", "Teoria", "Praktyka", "Podsumowanie"][j]}`,
            duration: `${30 + Math.floor(Math.random() * 30)} min`,
            type: ["wideo", "interaktywny", "test", "projekt"][j],
          })),
        })),
        skills: [`${topic} — podstawy`, `Analityczne myślenie`, `Rozwiązywanie problemów`, `Praca z materiałami ${topic}`],
        prerequisites: [`Podstawowa znajomość ${topic.toLowerCase()}`, `Gotowość do nauki`],
      };
      setCourse(demo);
      setStep("result");
      toast.success("Kurs wygenerowany!");
    }, 2500);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue-500 grid place-items-center">
          <BookOpen className="w-5 h-5 text-black" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">AI Course Generator</h2>
          <p className="text-xs text-white/40">Stwórz pełny kurs z dowolnego tematu w 30 sekund</p>
        </div>
      </div>

      {step === "form" && (
        <div className="card-premium rounded-2xl p-6 space-y-5">
          <div>
            <label className="auth-label">Wybierz przedmiot</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
              {SUBJECTS.map(s => (
                <button key={s} onClick={() => { setSubject(s); setCustomTopic(""); }}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all text-left
                    ${subject === s ? 'bg-accent/15 text-accent border border-accent/20' : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:border-white/20 hover:text-white/70'}`}>
                  {s}
                </button>
              ))}
            </div>
            {subject === "other" && (
              <input value={customTopic} onChange={e => setCustomTopic(e.target.value)} placeholder="Wpisz własny temat kursu..." className="auth-input mt-2" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="auth-label">Poziom trudności</label>
              <div className="flex gap-2 mt-1.5">
                {LEVELS.map(l => (
                  <button key={l} onClick={() => setLevel(l)}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all
                      ${level === l ? 'bg-accent/15 text-accent border border-accent/20' : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:border-white/20'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="auth-label">Czas trwania (tygodnie)</label>
              <div className="flex gap-2 mt-1.5">
                {["4", "8", "12", "16"].map(d => (
                  <button key={d} onClick={() => setDuration(d)}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all
                      ${duration === d ? 'bg-accent/15 text-accent border border-accent/20' : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:border-white/20'}`}>
                    {d} tyg
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={generate} className="auth-submit flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> Generuj kurs z AI
          </button>
        </div>
      )}

      {step === "generating" && (
        <div className="card-premium rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-blue-500 grid place-items-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-black floating-3" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-accent mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">AI tworzy Twój kurs...</h3>
          <div className="mt-2 space-y-1 text-xs text-white/40">
            <p>Analizowanie tematu</p>
            <p>Dobieranie materiałów</p>
            <p>Generowanie struktury lekcji</p>
          </div>
          <div className="mt-6 w-48 h-1 rounded-full bg-white/[0.06] mx-auto overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-accent to-blue-500" style={{ animation: "splashLoad 2.5s cubic-bezier(0.16,1,0.3,1) forwards" }} />
          </div>
        </div>
      )}

      {step === "result" && course && (
        <div className="space-y-4">
          <div className="card-premium rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-5 h-5 text-accent" />
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium uppercase tracking-wider">{course.level}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-300 font-medium">{course.duration}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{course.title}</h3>
                <p className="mt-2 text-sm text-white/50 max-w-2xl">{course.description}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/70 transition-all" title="Podgląd"><Eye className="w-4 h-4" /></button>
                <button className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/70 transition-all" title="Eksport PDF"><Download className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-white/40"><Award className="w-3.5 h-3.5 text-accent" />{course.skills.length} umiejętności</div>
              <div className="flex items-center gap-1.5 text-xs text-white/40"><FileText className="w-3.5 h-3.5 text-accent" />{course.modules.reduce((a, m) => a + m.lessons.length, 0)} lekcji</div>
              <div className="flex items-center gap-1.5 text-xs text-white/40"><Clock className="w-3.5 h-3.5 text-accent" />{course.duration}</div>
            </div>

            {course.prerequisites.length > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <div className="text-xs text-amber-300/80 font-medium mb-1">Wymagania wstępne:</div>
                <div className="flex flex-wrap gap-2">
                  {course.prerequisites.map(p => (
                    <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300/70">{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {course.modules.map((mod, i) => (
            <div key={i} className="card-premium rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-accent/10 grid place-items-center text-accent text-sm font-bold">{i + 1}</div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{mod.title}</h4>
                  <span className="text-[10px] text-white/30">{mod.lessons.length} lekcji</span>
                </div>
              </div>
              <div className="space-y-2">
                {mod.lessons.map((l, j) => (
                  <div key={j} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg grid place-items-center text-[10px] font-mono
                        ${l.type === "wideo" ? 'bg-rose-500/10 text-rose-300' : l.type === "interaktywny" ? 'bg-accent/10 text-accent' : l.type === "test" ? 'bg-amber-500/10 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
                        {l.type === "wideo" ? "V" : l.type === "interaktywny" ? "I" : l.type === "test" ? "T" : "P"}
                      </div>
                      <span className="text-xs text-white/70">{l.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-white/30">
                      <Clock className="w-3 h-3" />{l.duration}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Target className="w-3.5 h-3.5 text-accent" />
              Umiejętności zdobywane w kursie:
            </div>
            {course.skills.map(s => (
              <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[10px] text-white/50">
                <CheckCircle2 className="w-3 h-3 text-accent/60" />{s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
