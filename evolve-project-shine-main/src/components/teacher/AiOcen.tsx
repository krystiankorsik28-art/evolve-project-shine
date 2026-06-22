import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { aiGradeEssay, aiExamInsights } from "@/lib/ai.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sparkles,
  Loader2,
  Brain,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Lightbulb,
} from "lucide-react";

type RubricItem = { criterion: string; score: number; max: number; comment: string };
type GradeResult = {
  total_score: number;
  max_score: number;
  percent: number;
  confidence: number;
  feedback: string;
  rubric: RubricItem[];
  strengths: string[];
  improvements: string[];
};

type InsightResult = {
  summary: string;
  difficulty_rating: "za_latwy" | "odpowiedni" | "wymagajacy" | "za_trudny";
  weak_questions: Array<{ index: number; reason: string }>;
  recommendations: string[];
  next_steps: string[];
};

const DIFF_META: Record<InsightResult["difficulty_rating"], { label: string; color: string }> = {
  za_latwy: {
    label: "Za łatwy",
    color: "text-emerald-300 bg-emerald-500/10 border-emerald-400/30",
  },
  odpowiedni: {
    label: "Odpowiedni poziom",
    color: "text-cyan-300 bg-cyan-500/10 border-cyan-400/30",
  },
  wymagajacy: { label: "Wymagający", color: "text-amber-300 bg-amber-500/10 border-amber-400/30" },
  za_trudny: { label: "Za trudny", color: "text-rose-300 bg-rose-500/10 border-rose-400/30" },
};

export function AiOcen() {
  const [tab, setTab] = useState<"essay" | "insights">("essay");
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-violet-500/10 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 grid place-items-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white">AI Asystent oceniania</h2>
            <p className="text-xs text-white/50">
              Automatyczne ocenianie esejów z rubryką • Analityka egzaminów • Podpowiedzi AI
            </p>
          </div>
        </div>
      </div>
      <div className="inline-flex p-1 rounded-xl bg-white/[0.04] border border-white/10">
        <button
          onClick={() => setTab("essay")}
          className={`px-4 py-2 rounded-lg text-sm transition ${tab === "essay" ? "bg-gradient-to-r from-accent to-blue-500 text-slate-900 font-semibold" : "text-white/60 hover:text-white"}`}
        >
          Oceń esej
        </button>
        <button
          onClick={() => setTab("insights")}
          className={`px-4 py-2 rounded-lg text-sm transition ${tab === "insights" ? "bg-gradient-to-r from-accent to-blue-500 text-slate-900 font-semibold" : "text-white/60 hover:text-white"}`}
        >
          Analiza egzaminu
        </button>
      </div>
      {tab === "essay" ? <EssayGrader /> : <InsightsPanel />}
    </div>
  );
}

function EssayGrader() {
  const grade = useServerFn(aiGradeEssay);
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [rubric, setRubric] = useState("");
  const [maxPoints, setMaxPoints] = useState(10);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);

  const run = async () => {
    if (!prompt.trim() || !answer.trim()) {
      toast.error("Wpisz treść zadania i odpowiedź");
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const r = await grade({
        data: { prompt, answer, max_points: maxPoints, rubric: rubric || null, language: "pl" },
      });
      setResult(r as GradeResult);
      toast.success("Oceniono");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
        <div>
          <label className="block text-xs uppercase tracking-widest text-white/40 mb-1">
            Treść zadania / polecenie
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="np. Omów przyczyny II wojny światowej..."
            className="w-full min-h-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-white/40 mb-1">
            Odpowiedź ucznia
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Wklej odpowiedź..."
            className="w-full min-h-40 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs uppercase tracking-widest text-white/40 mb-1">
              Maks. punktów
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={maxPoints}
              onChange={(e) => setMaxPoints(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-white/40 mb-1">
            Rubryka (opcjonalnie)
          </label>
          <textarea
            value={rubric}
            onChange={(e) => setRubric(e.target.value)}
            placeholder="Treść 40%, argumentacja 25%, struktura 15%, język 15%, oryginalność 5%"
            className="w-full min-h-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40"
          />
        </div>
        <button
          onClick={run}
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-accent to-blue-500 text-white font-semibold disabled:opacity-50 hover:brightness-110 transition"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Oceń odpowiedź
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        {!result ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-violet-500/15 to-purple-500/15 border border-violet-400/20 grid place-items-center mb-3">
              <Sparkles className="w-6 h-6 text-violet-300/60" />
            </div>
            <div className="text-sm text-white/50 font-medium">
              Wynik oceniania pojawi się tutaj
            </div>
            <div className="text-xs text-white/30 mt-1">
              Wprowadź treść zadania i odpowiedź ucznia po lewej.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-accent/10 to-blue-500/10 border border-accent/20">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
                  Wynik
                </div>
                <div className="font-display text-4xl font-bold text-white">
                  {result.total_score.toFixed(1)}{" "}
                  <span className="text-white/40 text-2xl">/ {result.max_score}</span>
                </div>
                <div className="text-cyan-300 font-mono text-sm mt-1">
                  {Math.round(result.percent)}% · pewność {Math.round(result.confidence * 100)}%
                </div>
              </div>
              <button
                onClick={() => toast.success("Ocena zatwierdzona i zapisana")}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-bold transition inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Zatwierdź ocenę
              </button>
            </div>
            <div className="text-sm text-white/80 leading-relaxed border-l-2 border-accent/40 pl-3 bg-white/[0.02] rounded-r-lg py-2 pr-3">
              {result.feedback}
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-white/40 mb-2">
                Kryteria oceniania
              </div>
              <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      <th className="text-left p-3 text-xs text-white/50 font-medium">Kryterium</th>
                      <th className="text-center p-3 text-xs text-white/50 font-medium w-20">
                        Wynik
                      </th>
                      <th className="text-left p-3 text-xs text-white/50 font-medium">
                        Komentarz AI
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {result.rubric.map((r, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition">
                        <td className="p-3 text-white/80 font-medium">{r.criterion}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`font-mono font-bold ${r.score / r.max >= 0.7 ? "text-emerald-300" : r.score / r.max >= 0.4 ? "text-amber-300" : "text-rose-300"}`}
                          >
                            {r.score}/{r.max}
                          </span>
                        </td>
                        <td className="p-3 text-white/50 text-xs">{r.comment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-emerald-400/15 bg-emerald-500/5 p-4">
                <div className="text-xs uppercase tracking-widest text-emerald-300/70 mb-2 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Mocne strony
                </div>
                <ul className="text-xs text-white/70 space-y-1.5 list-disc list-inside">
                  {result.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-amber-400/15 bg-amber-500/5 p-4">
                <div className="text-xs uppercase tracking-widest text-amber-300/70 mb-2 inline-flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Do poprawy
                </div>
                <ul className="text-xs text-white/70 space-y-1.5 list-disc list-inside">
                  {result.improvements.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type Exam = { id: string; title: string };
type Q = { id: string; prompt: string };
type Answer = { question_id: string; is_correct: boolean | null };

function InsightsPanel() {
  const insights = useServerFn(aiExamInsights);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examId, setExamId] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<InsightResult | null>(null);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("exams")
        .select("id,title")
        .order("created_at", { ascending: false })
        .limit(100);
      setExams((data as Exam[]) ?? []);
      if (data?.[0]) setExamId(data[0].id);
    })();
  }, []);

  const run = async () => {
    if (!examId) return;
    setBusy(true);
    setResult(null);
    try {
      const exam = exams.find((e) => e.id === examId);
      if (!exam) return;
      const [{ data: qs }, { data: ats }] = await Promise.all([
        supabase.from("questions").select("id,prompt").eq("exam_id", examId).order("order_index"),
        supabase.from("attempts").select("id,percent,passed").eq("exam_id", examId),
      ]);
      const questions = (qs as Q[]) ?? [];
      const attempts = ats ?? [];
      const finished = attempts.filter((a) => a.percent != null);
      if (finished.length === 0) {
        toast.error("Brak ukończonych podejść");
        setBusy(false);
        return;
      }
      const { data: answers } = await supabase
        .from("answers")
        .select("question_id,is_correct")
        .in(
          "attempt_id",
          finished.map((a) => a.id),
        );
      const ansArr = (answers as Answer[]) ?? [];
      const perQ = questions.map((q) => {
        const a = ansArr.filter((x) => x.question_id === q.id);
        const correct = a.filter((x) => x.is_correct).length;
        return { prompt: q.prompt, correct_rate: a.length ? correct / a.length : 0 };
      });
      const avg = finished.reduce((s, a) => s + (a.percent ?? 0), 0) / finished.length;
      const passRate = (finished.filter((a) => a.passed).length / finished.length) * 100;
      const r = await insights({
        data: {
          exam_title: exam.title,
          language: "pl",
          stats: {
            attempts: finished.length,
            avg_percent: avg,
            pass_rate: passRate,
            per_question: perQ,
          },
        },
      });
      setResult(r as InsightResult);
      toast.success("Analiza gotowa");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex items-end gap-3 flex-wrap">
        <div className="flex-1 min-w-64">
          <label className="block text-xs uppercase tracking-widest text-white/40 mb-1">
            Egzamin do analizy
          </label>
          <select
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/40"
          >
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={run}
          disabled={busy || !examId}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-accent to-blue-500 text-white font-semibold inline-flex items-center gap-2 disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Analizuj
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-[10px] font-mono tracking-wider px-2 py-0.5 rounded border ${DIFF_META[result.difficulty_rating].color}`}
              >
                {DIFF_META[result.difficulty_rating].label}
              </span>
            </div>
            <p className="text-white/80 leading-relaxed">{result.summary}</p>
          </div>
          {result.weak_questions.length > 0 && (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/5 p-5">
              <div className="font-display font-bold text-amber-200 inline-flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4" />
                Problematyczne pytania
              </div>
              <ul className="space-y-2">
                {result.weak_questions.map((w, i) => (
                  <li key={i} className="text-sm text-white/80">
                    <b className="text-amber-200">#{w.index}.</b> {w.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="font-display font-bold text-white inline-flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-cyan-300" />
                Rekomendacje
              </div>
              <ul className="text-sm text-white/70 space-y-1.5 list-disc list-inside">
                {result.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="font-display font-bold text-white inline-flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-300" />
                Następne kroki
              </div>
              <ul className="text-sm text-white/70 space-y-1.5 list-disc list-inside">
                {result.next_steps.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
