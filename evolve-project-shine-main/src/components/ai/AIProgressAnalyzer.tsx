import { useState } from "react";
import { Sparkles, Loader2, TrendingUp, TrendingDown, BarChart3, LineChart, PieChart, Target, Brain, Award, ChevronRight, Download, Clock, Zap, Users, BookOpen, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Student = { id: number; name: string; group: string; avatar: string; progress: number; trend: "up" | "down" | "stable"; subject: string };

type Analysis = {
  studentName: string;
  overall: number;
  predicted: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  weeklyTrend: { week: string; score: number }[];
  subjectBreakdown: { subject: string; score: number; change: number }[];
  riskLevel: "low" | "medium" | "high";
};

const DEMO_STUDENTS: Student[] = [
  { id: 1, name: "Anna Kowalska", group: "3A", avatar: "AK", progress: 92, trend: "up", subject: "Matematyka" },
  { id: 2, name: "Jan Nowak", group: "3A", avatar: "JN", progress: 68, trend: "down", subject: "Fizyka" },
  { id: 3, name: "Krzysztof Wiśniewski", group: "3B", avatar: "KW", progress: 45, trend: "down", subject: "Chemia" },
  { id: 4, name: "Marta Zielińska", group: "3A", avatar: "MZ", progress: 88, trend: "up", subject: "Angielski" },
  { id: 5, name: "Piotr Kamiński", group: "3B", avatar: "PK", progress: 73, trend: "stable", subject: "Matematyka" },
  { id: 6, name: "Aleksandra Lewandowska", group: "3A", avatar: "AL", progress: 55, trend: "up", subject: "Biologia" },
];

const SUBJECT_LIST = ["Matematyka", "Fizyka", "Chemia", "Biologia", "Angielski", "Polski", "Historia", "Informatyka"];

export function AIProgressAnalyzer() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [groupFilter, setGroupFilter] = useState("all");

  const filteredStudents = groupFilter === "all" ? DEMO_STUDENTS : DEMO_STUDENTS.filter(s => s.group === groupFilter);
  const groups = [...new Set(DEMO_STUDENTS.map(s => s.group))];

  const analyzeStudent = async (student: Student) => {
    setSelectedStudent(student);
    setAnalyzing(true);
    setAnalysis(null);
    setTimeout(() => {
      const weaknesses = ["Równania kwadratowe", "Trygonometria", "Funkcje wykładnicze"].slice(0, Math.floor(Math.random() * 3) + 1);
      setAnalysis({
        studentName: student.name,
        overall: student.progress,
        predicted: Math.min(100, student.progress + Math.round((Math.random() * 20 - 5))),
        strengths: ["Logiczne myślenie", "Algebra", "Geometria", "Praca zespołowa"].slice(0, Math.floor(Math.random() * 2) + 2),
        weaknesses,
        recommendations: [
          "Dodatkowe zadania z zakresu: " + weaknesses.join(", "),
          "Korepetycje 2x w tygodniu",
          "Korzystanie z AI Code Mentor dla zadań programistycznych",
          "Przygotowanie do egzaminu z arkuszy maturalnych",
        ],
        weeklyTrend: [
          { week: "Tydz 1", score: Math.max(40, student.progress - 20 + Math.floor(Math.random() * 15)) },
          { week: "Tydz 2", score: Math.max(40, student.progress - 12 + Math.floor(Math.random() * 10)) },
          { week: "Tydz 3", score: Math.max(40, student.progress - 5 + Math.floor(Math.random() * 8)) },
          { week: "Tydz 4", score: student.progress },
        ],
        subjectBreakdown: SUBJECT_LIST.slice(0, 5).map((s, i) => ({
          subject: s, score: Math.max(30, student.progress + Math.floor(Math.random() * 30 - 15)),
          change: Math.floor(Math.random() * 20 - 10),
        })),
        riskLevel: student.progress < 50 ? "high" : student.progress < 70 ? "medium" : "low",
      });
      setAnalyzing(false);
    }, 1500);
  };

  const riskColors = { low: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", medium: "text-amber-400 bg-amber-400/10 border-amber-400/20", high: "text-rose-400 bg-rose-400/10 border-rose-400/20" };
  const riskLabels = { low: "Niskie ryzyko", medium: "Umiarkowane", high: "Wysokie ryzyko" };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue-500 grid place-items-center">
          <BarChart3 className="w-5 h-5 text-black" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">AI Progress Analyzer</h2>
          <p className="text-xs text-white/40">Analiza postępów ucznia z predykcją AI</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setGroupFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${groupFilter === "all" ? 'bg-accent/15 text-accent border border-accent/20' : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:border-white/20'}`}>Wszyscy</button>
        {groups.map(g => (
          <button key={g} onClick={() => setGroupFilter(g)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${groupFilter === g ? 'bg-accent/15 text-accent border border-accent/20' : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:border-white/20'}`}>Klasa {g}</button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredStudents.map(s => (
          <button key={s.id} onClick={() => analyzeStudent(s)}
            className={`card-premium rounded-2xl p-4 text-left transition-all hover:scale-[1.02] ${selectedStudent?.id === s.id ? 'border-accent/20 ring-1 ring-accent/20' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-blue-500 grid place-items-center text-[10px] font-bold text-black shrink-0">{s.avatar}</div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">{s.name}</div>
                <div className="text-[10px] text-white/30">Klasa {s.group} · {s.subject}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold text-white">{s.progress}%</div>
                {s.trend === "up" ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> :
                 s.trend === "down" ? <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> :
                 <Zap className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <ChevronRight className="w-4 h-4 text-white/20" />
            </div>
          </button>
        ))}
      </div>

      {analyzing && (
        <div className="card-premium rounded-2xl p-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-accent mx-auto mb-3" />
          <p className="text-sm text-white/50">AI analizuje postępy ucznia...</p>
        </div>
      )}

      {analysis && !analyzing && (
        <div className="space-y-4">
          <div className="card-premium rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{analysis.studentName}</h3>
                <p className="text-xs text-white/40">Prognoza AI: <span className="text-accent font-medium">{analysis.predicted}%</span> (za 4 tygodnie)</p>
              </div>
              <div className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider ${riskColors[analysis.riskLevel]}`}>{riskLabels[analysis.riskLevel]}</div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                <div className="text-lg font-bold text-white">{analysis.overall}%</div>
                <div className="text-[10px] text-white/30">Obecnie</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                <div className="text-lg font-bold text-accent">{analysis.predicted}%</div>
                <div className="text-[10px] text-white/30">Prognoza</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                <div className={`text-lg font-bold ${analysis.predicted - analysis.overall >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {analysis.predicted - analysis.overall >= 0 ? '+' : ''}{analysis.predicted - analysis.overall}%
                </div>
                <div className="text-[10px] text-white/30">Zmiana</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-white/30 font-medium uppercase tracking-wider mb-2">Trend tygodniowy</div>
              <div className="flex items-end gap-2 h-16">
                {analysis.weeklyTrend.map((w, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-md bg-gradient-to-t from-accent/30 to-accent/10" style={{ height: `${w.score}%`, minHeight: "8px" }} />
                    <span className="text-[8px] text-white/20">{w.week}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="card-premium rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-white">
                <Award className="w-4 h-4 text-emerald-400" /> Mocne strony
              </div>
              <div className="space-y-2">
                {analysis.strengths.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />{s}
                  </div>
                ))}
              </div>
            </div>
            <div className="card-premium rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-white">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Obszary do poprawy
              </div>
              <div className="space-y-2">
                {analysis.weaknesses.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                    <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />{s}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card-premium rounded-2xl p-5 border-accent/10">
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-white">
              <Brain className="w-4 h-4 text-accent" /> Rekomendacje AI
            </div>
            <div className="space-y-2">
              {analysis.recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-white/50">
                  <span className="w-4 h-4 rounded-full bg-accent/10 grid place-items-center text-[8px] font-bold text-accent shrink-0 mt-0.5">{i + 1}</span>
                  {r}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
