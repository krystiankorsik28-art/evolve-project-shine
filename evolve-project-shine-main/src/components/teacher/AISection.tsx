import { useState, useEffect, lazy } from "react";
import {
  Sparkles, BookOpen, Presentation, ShieldCheck, BarChart3, Brain,
  Camera, Loader2, Wand2, Code2, Image as ImageIcon, ExternalLink, Award,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const lazyLoad = <T,>(fn: () => Promise<{ [K in keyof T]: unknown }>, name: keyof T) =>
  lazy(() => fn().then(m => ({ default: m[name] })));

const AICodeMentor = lazyLoad(() => import("@/components/ai/AICodeMentor"), "AICodeMentor");
const AICourseGenerator = lazyLoad(() => import("@/components/ai/AICourseGenerator"), "AICourseGenerator");
const AIPresentationGenerator = lazyLoad(() => import("@/components/ai/AIPresentationGenerator"), "AIPresentationGenerator");
const AIPlagiarismDetector = lazyLoad(() => import("@/components/ai/AIPlagiarismDetector"), "AIPlagiarismDetector");
const AIProgressAnalyzer = lazyLoad(() => import("@/components/ai/AIProgressAnalyzer"), "AIProgressAnalyzer");
const AIMaterialRecommender = lazyLoad(() => import("@/components/ai/AIMaterialRecommender"), "AIMaterialRecommender");

type AiQ = {
  prompt: string;
  question_type: "multiple_choice" | "true_false" | "short_answer" | "essay";
  options?: string[];
  correct_answer: string | string[] | boolean;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
};

const AI_SUB_TABS = [
  { id: "generator", label: "AI Generator", icon: Sparkles },
  { id: "codementor", label: "AI Code Mentor", icon: Code2 },
  { id: "coursegen", label: "AI Course Generator", icon: BookOpen },
  { id: "presentation", label: "AI Presentation", icon: Presentation },
  { id: "plagiarism", label: "Plagiarism Detector", icon: ShieldCheck },
  { id: "progress", label: "AI Progress Analyzer", icon: BarChart3 },
  { id: "materials", label: "AI Material Recommender", icon: BookOpen },
];

function TabBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: ()=>void; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${active?"bg-cyan-500 text-slate-900":"bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"}`}>
      <Icon className="w-4 h-4"/>{label}
    </button>
  );
}

async function saveQuestionsToBank(qs: AiQ[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Nie zalogowano");
  const rows = qs.map(q => ({
    prompt: q.prompt,
    question_type: q.question_type,
    options: q.options ?? [],
    correct_answer: q.correct_answer as unknown as never,
    explanation: q.explanation,
    difficulty: q.difficulty,
    points: q.points,
    ai_generated: true,
    created_by: user.id,
  }));
  const { error } = await supabase.from("question_bank").insert(rows);
  if (error) throw new Error(error.message);
}

async function saveQuestionsToExam(qs: AiQ[], examId: string) {
  const { data: existing } = await supabase.from("questions").select("order_index").eq("exam_id", examId).order("order_index", { ascending: false }).limit(1);
  const startIdx = ((existing?.[0]?.order_index as number | undefined) ?? -1) + 1;
  const rows = qs.map((q, i) => ({
    exam_id: examId,
    prompt: q.prompt,
    question_type: q.question_type,
    options: q.options ?? [],
    correct_answer: q.correct_answer as unknown as never,
    explanation: q.explanation,
    difficulty: q.difficulty,
    points: q.points,
    ai_generated: true,
    order_index: startIdx + i,
  }));
  const { error } = await supabase.from("questions").insert(rows);
  if (error) throw new Error(error.message);
}

function ResultActions({ qs, single }: { qs: AiQ[]; single?: boolean }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [examId, setExamId] = useState<string>("");
  const [exams, setExamsLocal] = useState<Array<{ id: string; title: string }>>([]);
  useEffect(() => {
    supabase.from("exams").select("id,title").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => setExamsLocal((data ?? []) as Array<{ id: string; title: string }>));
  }, []);
  const bank = async () => { setBusy("bank"); try { await saveQuestionsToBank(qs); toast.success(`Dodano do banku (${qs.length})`); } catch (e) { toast.error(e instanceof Error ? e.message : "Błąd"); } finally { setBusy(null); } };
  const exam = async () => { if (!examId) return toast.error("Wybierz egzamin"); setBusy("exam"); try { await saveQuestionsToExam(qs, examId); toast.success(`Dodano do egzaminu`); } catch (e) { toast.error(e instanceof Error ? e.message : "Błąd"); } finally { setBusy(null); } };
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button disabled={busy!==null} onClick={bank} className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-semibold disabled:opacity-50">
        {busy==="bank" ? "Zapisuję..." : `Zapisz do banku${single?"":` (${qs.length})`}`}
      </button>
      <select value={examId} onChange={e=>setExamId(e.target.value)} className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white">
        <option value="" className="bg-slate-900">— wybierz egzamin —</option>
        {exams.map(e => <option key={e.id} value={e.id} className="bg-slate-900">{e.title}</option>)}
      </select>
      <button disabled={busy!==null || !examId} onClick={exam} className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-xs font-semibold disabled:opacity-50">
        {busy==="exam" ? "Zapisuję..." : "Dodaj do egzaminu"}
      </button>
    </div>
  );
}

function QPreview({ q, idx }: { q: AiQ; idx: number }) {
  const correct = Array.isArray(q.correct_answer) ? q.correct_answer.join(", ") : String(q.correct_answer);
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-accent">PYT. {idx+1} · {q.question_type.toUpperCase()} · {q.difficulty.toUpperCase()} · {q.points}p</span>
      </div>
      <div className="text-sm text-white font-medium">{q.prompt}</div>
      {q.options && q.options.length > 0 && (
        <ul className="text-xs text-white/70 space-y-0.5 pl-4 list-disc">{q.options.map((o,i)=><li key={i}>{o}</li>)}</ul>
      )}
      <div className="text-xs text-emerald-300"><b>Odp:</b> {correct}</div>
      {q.explanation && <div className="text-xs text-white/50 italic">{q.explanation}</div>}
    </div>
  );
}

function AIImage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string>("");
  const generate = async () => {
    if (!prompt.trim()) return toast.error("Wpisz opis ilustracji");
    setLoading(true);
    try {
      const { aiGenerateQuestionImage } = await import("@/lib/ai.functions");
      const out = await aiGenerateQuestionImage({ data: { prompt } });
      setUrl(out.image_url);
      toast.success("Wygenerowano ilustrację");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Błąd"); } finally { setLoading(false); }
  };
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-accent mb-2 block font-mono">Opis ilustracji</span>
          <textarea rows={5} value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="np. Schemat układu krwionośnego człowieka" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-cyan-400/50 text-white placeholder-white/30"/>
        </label>
        <button disabled={loading} onClick={generate} className="w-full inline-flex justify-center items-center gap-2 bg-gradient-to-r from-accent to-blue-500 text-slate-900 font-bold px-5 py-3 rounded-xl disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Wand2 className="w-4 h-4"/>} {loading ? "Generuję..." : "Wygeneruj ilustrację"}
        </button>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-accent"/>Podgląd</h3>
        {url ? (
          <div className="space-y-3">
            <img src={url} alt="generated" className="w-full rounded-lg border border-white/10"/>
            <a href={url} download="ilustracja.png" className="inline-block px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-900 text-xs font-semibold">Pobierz</a>
          </div>
        ) : (<p className="text-sm text-white/40">Ilustracja pojawi się tutaj.</p>)}
      </div>
    </div>
  );
}

function AIPhoto() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiQ | null>(null);

  const onFile = (f: File | null) => {
    setFile(f);
    if (f) { const r = new FileReader(); r.onload = () => setPreview(r.result as string); r.readAsDataURL(f); }
    else setPreview("");
  };

  const generate = async () => {
    if (!file || !desc) { toast.error("Dodaj zdjęcie i opis"); return; }
    setLoading(true);
    try {
      const { aiQuestionFromPhoto } = await import("@/lib/ai.functions");
      const out = await aiQuestionFromPhoto({ data: { image_base64: preview, description: desc } });
      setResult(out as AiQ);
      toast.success("Pytanie wygenerowane");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd AI");
    } finally { setLoading(false); }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-accent mb-2 font-mono">Krok 1</div>
          <label className="block border-2 border-dashed border-white/15 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-400/40 hover:bg-white/[0.02] transition">
            <input type="file" accept="image/*" onChange={(e)=>onFile(e.target.files?.[0] ?? null)} className="hidden"/>
            {preview ? <img src={preview} alt="podgląd" className="max-h-64 mx-auto rounded-lg"/> : (<><ImageIcon className="w-10 h-10 mx-auto text-white/30 mb-2"/><p className="text-sm text-white/50">Kliknij lub przeciągnij zdjęcie zadania</p></>)}
          </label>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-violet-300 mb-2 font-mono">Krok 2</div>
          <textarea rows={3} value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="np. Pytanie ABCD do klasy 2 LO o sile tarcia." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-cyan-400/50 text-white placeholder-white/30"/>
        </div>
        <button disabled={loading} onClick={generate} className="w-full inline-flex justify-center items-center gap-2 bg-gradient-to-r from-accent to-blue-500 text-slate-900 font-bold px-5 py-3 rounded-xl disabled:opacity-50 transition hover:scale-[1.01]">
          {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Wand2 className="w-4 h-4"/>} {loading ? "AI pracuje..." : "Wygeneruj pytanie"}
        </button>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent"/>Wynik</h3>
        {result ? (<><QPreview q={result} idx={0}/><ResultActions qs={[result]} single/></>) : (<p className="text-sm text-white/40">Wynik pojawi się tutaj.</p>)}
      </div>
    </div>
  );
}

function AIGenerate() {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<"easy"|"medium"|"hard">("medium");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiQ[] | null>(null);

  const generate = async () => {
    if (!topic) { toast.error("Wpisz temat"); return; }
    setLoading(true);
    try {
      const { aiGenerateQuestions } = await import("@/lib/ai.functions");
      const out = await aiGenerateQuestions({ data: { topic, count, difficulty } });
      setResult(out as AiQ[]);
      toast.success(`Wygenerowano ${count} pytań`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd AI");
    } finally { setLoading(false); }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-accent mb-2 block font-mono">Temat</span>
          <input value={topic} onChange={(e)=>setTopic(e.target.value)} placeholder="np. II wojna światowa — 1939" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-cyan-400/50 text-white placeholder-white/30"/>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-violet-300 mb-2 block font-mono">Liczba pytań</span>
            <input type="number" min={1} max={30} value={count} onChange={(e)=>setCount(Number(e.target.value))} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-cyan-400/50 text-white"/>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-emerald-300 mb-2 block font-mono">Trudność</span>
            <select value={difficulty} onChange={(e)=>setDifficulty(e.target.value as "easy"|"medium"|"hard")} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-cyan-400/50 text-white">
              <option value="easy" className="bg-slate-900">Łatwa</option>
              <option value="medium" className="bg-slate-900">Średnia</option>
              <option value="hard" className="bg-slate-900">Trudna</option>
            </select>
          </label>
        </div>
        <button disabled={loading} onClick={generate} className="w-full inline-flex justify-center items-center gap-2 bg-gradient-to-r from-accent to-blue-500 text-slate-900 font-bold px-5 py-3 rounded-xl disabled:opacity-50 hover:scale-[1.01] transition">
          {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Brain className="w-4 h-4"/>} {loading ? "AI pracuje..." : "Wygeneruj"}
        </button>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent"/>Wynik</h3>
        {result ? (
          <div className="space-y-2 max-h-[500px] overflow-auto pr-1">
            {result.map((q,i) => <QPreview key={i} q={q} idx={i}/>)}
            <ResultActions qs={result}/>
          </div>
        ) : (<p className="text-sm text-white/40">Wynik pojawi się tutaj.</p>)}
      </div>
    </div>
  );
}

export function AISection() {
  const [aiTab, setAiTab] = useState("generator");
  const [mode, setMode] = useState<"photo" | "topic" | "image">("topic");
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-1.5">
        {AI_SUB_TABS.map(t => (
          <button key={t.id} onClick={() => setAiTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all
              ${aiTab === t.id ? 'bg-accent/15 text-accent border border-accent/20 shadow-sm' : 'text-white/40 hover:text-white/70 border border-transparent'}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {aiTab === "generator" && (
        <>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-accent/10 via-accent/5 to-accent/10 p-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue-500 grid place-items-center"><Sparkles className="w-5 h-5 text-slate-900"/></div>
              <div>
                <h2 className="text-xl font-display font-bold text-white">AI Generator</h2>
                <p className="text-xs text-white/50">Gemini · pytania ze zdjęcia, z tematu, lub ilustracje do pytań — z zapisem do banku lub bezpośrednio do egzaminu.</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <TabBtn active={mode==="topic"} onClick={()=>setMode("topic")} icon={Brain} label="Z tematu"/>
            <TabBtn active={mode==="photo"} onClick={()=>setMode("photo")} icon={Camera} label="Ze zdjęcia"/>
            <TabBtn active={mode==="image"} onClick={()=>setMode("image")} icon={ImageIcon} label="Ilustracja"/>
          </div>
          {mode === "topic" && <AIGenerate />}
          {mode === "photo" && <AIPhoto />}
          {mode === "image" && <AIImage />}
        </>
      )}
      {aiTab === "codementor" && <AICodeMentor />}
      {aiTab === "coursegen" && <AICourseGenerator />}
      {aiTab === "presentation" && <AIPresentationGenerator />}
      {aiTab === "plagiarism" && <AIPlagiarismDetector />}
      {aiTab === "progress" && <AIProgressAnalyzer />}
      {aiTab === "materials" && <AIMaterialRecommender />}
    </div>
  );
}
