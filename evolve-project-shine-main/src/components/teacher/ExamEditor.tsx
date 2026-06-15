import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft, Save, Plus, Trash2, Sparkles, Library, Copy, KeyRound,
  RefreshCw, GripVertical, ChevronUp, ChevronDown, Loader2, HelpCircle,
  FileQuestion, ListChecks, Sigma, AlignLeft, Check, X, Wand2,
  Clock, Target,
} from "lucide-react";
import { Field, inputCls, Modal } from "./Egzaminy";
import { QuestionEditor, emptyQuestion, TYPE_LABELS, type QDraft, type QType } from "./QuestionEditor";
import { AiGenerator } from "./AiGenerator";
import { AiAssistant } from "./AiAssistant";
import { VoiceInput } from "@/components/VoiceInput";
import { confirmDialog } from "@/components/ConfirmDialog";

type Exam = {
  id: string; title: string; subject: string | null; description: string | null;
  status: "draft" | "published" | "archived";
  duration_minutes: number; passing_score: number;
  shuffle_questions: boolean; show_results: boolean;
};
type Q = QDraft & { id: string; order_index: number };
type Pin = { id: string; pin_code: string; active: boolean; used_count: number; max_uses: number | null };

const QTYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  single_choice: ListChecks,
  multiple_choice: ListChecks,
  true_false: Check,
  short_answer: AlignLeft,
  essay: FileQuestion,
  matching: AlignLeft,
  fill_in_blank: AlignLeft,
  ordering: ListChecks,
  numeric: Sigma,
  code: FileQuestion,
};

export function ExamEditor({ examId, onBack }: { examId: string; onBack: () => void }) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingExam, setSavingExam] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiAssistOpen, setAiAssistOpen] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | number[] | null>([]);
  const [qSearch, setQSearch] = useState("");

  const activePin = useMemo(() => pins.find((p) => p.active) ?? null, [pins]);
  const totalPoints = useMemo(() => questions.reduce((s, q) => s + Number(q.points || 0), 0), [questions]);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: e }, { data: qs }] = await Promise.all([
        supabase.from("exams").select("*").eq("id", examId).single(),
        supabase.from("questions").select("*").eq("exam_id", examId).order("order_index"),
      ]);
      setExam(e as Exam | null);
      const qlist = ((qs ?? []) as unknown[]).map((q) => q as Q);
      setQuestions(qlist);
      setOpenIdx(qlist.length > 0 ? [0] : []);

      let ps: Pin[] = [];
      try {
        const r = await supabase.from("exam_pins").select("*").eq("exam_id", examId).order("created_at", { ascending: false });
        ps = (r.data ?? []) as Pin[];
      } catch {}
      setPins(ps);
    } catch (err) {
      console.error("Failed to load exam:", err);
      toast.error("Nie udało się załadować egzaminu");
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, [examId]);

  const saveExam = async () => {
    if (!exam) return;
    setSavingExam(true);
    const { error } = await supabase.from("exams").update({
      title: exam.title, subject: exam.subject, description: exam.description,
      duration_minutes: exam.duration_minutes, passing_score: exam.passing_score,
      status: exam.status, shuffle_questions: exam.shuffle_questions, show_results: exam.show_results,
    }).eq("id", exam.id);
    setSavingExam(false);
    if (error) return toast.error(error.message);
    toast.success("Ustawienia zapisane");
  };

  const addQuestion = async (draft?: QDraft, afterIdx?: number) => {
    const d = draft ?? emptyQuestion("single_choice");
    const idx = afterIdx !== undefined ? afterIdx + 1 : questions.length;
    const { data, error } = await supabase.from("questions").insert({
      exam_id: examId, prompt: d.prompt || "Nowe pytanie",
      question_type: d.question_type, difficulty: d.difficulty, points: d.points,
      options: d.options as never, correct_answer: d.correct_answer as never,
      explanation: d.explanation, media_url: d.media_url, order_index: idx,
    }).select().single();
    if (error) return toast.error(error.message);
    setQuestions([...questions.slice(0, idx), data as Q, ...questions.slice(idx).map((q, i) => ({ ...q, order_index: idx + 1 + i }))]);
    setOpenIdx([idx]);
  };

  const duplicateQuestion = async (i: number) => {
    const q = questions[i];
    const { data, error } = await supabase.from("questions").insert({
      exam_id: examId, prompt: q.prompt + " (kopia)",
      question_type: q.question_type, difficulty: q.difficulty, points: q.points,
      options: q.options as never, correct_answer: q.correct_answer as never,
      explanation: q.explanation, media_url: q.media_url, order_index: questions.length,
    }).select().single();
    if (error) return toast.error(error.message);
    setQuestions([...questions, data as Q]);
    setOpenIdx([questions.length]);
    toast.success("Pytanie skopiowane");
  };

  const updateQuestion = async (i: number, patch: QDraft) => {
    const q = questions[i];
    const next = { ...q, ...patch };
    setQuestions(questions.map((x, j) => (j === i ? next : x)));
    await supabase.from("questions").update({
      prompt: patch.prompt, question_type: patch.question_type, difficulty: patch.difficulty,
      points: patch.points, options: patch.options as never, correct_answer: patch.correct_answer as never,
      explanation: patch.explanation, media_url: patch.media_url,
    }).eq("id", q.id);
  };

  const delQuestion = async (i: number) => {
    if (!(await confirmDialog({ description: "Usunąć pytanie?" }))) return;
    const q = questions[i];
    await supabase.from("questions").delete().eq("id", q.id);
    setQuestions(questions.filter((_, j) => j !== i));
  };

  const move = async (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= questions.length) return;
    const a = questions[i], b = questions[j];
    const arr = [...questions]; arr[i] = b; arr[j] = a;
    setQuestions(arr);
    await Promise.all([
      supabase.from("questions").update({ order_index: j }).eq("id", a.id),
      supabase.from("questions").update({ order_index: i }).eq("id", b.id),
    ]);
  };

  const newPin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Brak sesji");
    if (activePin) await supabase.from("exam_pins").update({ active: false }).eq("id", activePin.id);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const { error } = await supabase.from("exam_pins").insert({ exam_id: examId, pin_code: code, created_by: user.id });
    if (error) return toast.error(error.message);
    toast.success(`Nowy PIN: ${code}`);
    load();
  };

  const delPin = async (id: string) => { await supabase.from("exam_pins").delete().eq("id", id); load(); };

  const filteredQuestions = useMemo(() => {
    if (!qSearch) return questions;
    return questions.filter((q) => q.prompt.toLowerCase().includes(qSearch.toLowerCase()) || q.question_type.toLowerCase().includes(qSearch.toLowerCase()));
  }, [questions, qSearch]);

  const toggleOpen = (i: number) => {
    setOpenIdx((prev) => {
      if (prev === null) return [i];
      const arr = Array.isArray(prev) ? prev : [prev];
      if (arr.includes(i)) return arr.filter((v) => v !== i);
      return [...arr, i];
    });
  };

  if (loading || !exam) return <div className="py-20 text-center text-white/40"><Loader2 className="w-6 h-6 animate-spin inline" /></div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition"><ArrowLeft className="w-4 h-4" /></button>
          <div>
            <h2 className="text-xl font-display font-bold text-white">{exam.title || "Nowy egzamin"}</h2>
            <p className="text-[11px] text-white/40 font-mono">
              {questions.length} pytań · {totalPoints} pkt łącznie · {exam.status === "published" ? "Opublikowany" : exam.status === "archived" ? "Archiwum" : "Szkic"}
            </p>
          </div>
        </div>
        <button onClick={saveExam} disabled={savingExam} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-blue-500 hover:from-accent hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-accent/20 disabled:opacity-50 transition-all hover:scale-[1.02]">
          <Save className="w-4 h-4" />{savingExam ? "Zapisuję..." : "Zapisz ustawienia"}
        </button>
      </div>

      {/* Points summary bar */}
      <div className="flex flex-wrap gap-3 text-xs text-white/50">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10">
          <Sigma className="w-3.5 h-3.5 text-sky-400"/>{totalPoints} pkt
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-400"/>{Math.round(totalPoints / Math.max(1, questions.length) * 10) / 10} średnio pkt/pyt.
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10">
          <Clock className="w-3.5 h-3.5 text-amber-400"/>{exam.duration_minutes} min · {Math.round(exam.duration_minutes / Math.max(1, questions.length) * 10) / 10} min/pyt.
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10">
          <Target className="w-3.5 h-3.5 text-violet-400"/>Próg: {exam.passing_score}%
        </span>
      </div>

      {/* Settings + PIN */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* SETTINGS */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
          <h3 className="text-sm font-mono uppercase tracking-widest text-white/40 mb-2">Ustawienia</h3>
          <Field label={<div className="flex items-center justify-between gap-2"><span>Tytuł</span><VoiceInput size="sm" value={exam.title} onChange={(v) => setExam({ ...exam, title: v })} /></div>}>
            <input value={exam.title} onChange={(e) => setExam({ ...exam, title: e.target.value })} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Przedmiot"><input value={exam.subject ?? ""} onChange={(e) => setExam({ ...exam, subject: e.target.value })} className={inputCls} placeholder="np. Matematyka" /></Field>
            <Field label="Status">
              <select value={exam.status} onChange={(e) => setExam({ ...exam, status: e.target.value as Exam["status"] })} className={inputCls}>
                <option value="draft">Szkic</option>
                <option value="published">Opublikowany</option>
                <option value="archived">Archiwum</option>
              </select>
            </Field>
          </div>
          <Field label={<div className="flex items-center justify-between gap-2"><span>Opis / instrukcja</span><VoiceInput size="sm" value={exam.description ?? ""} onChange={(v) => setExam({ ...exam, description: v })} /></div>}>
            <textarea rows={2} value={exam.description ?? ""} onChange={(e) => setExam({ ...exam, description: e.target.value })} className={inputCls} placeholder="Instrukcja dla uczniów..." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Czas (min)"><input type="number" value={exam.duration_minutes} onChange={(e) => setExam({ ...exam, duration_minutes: Number(e.target.value) })} className={inputCls} /></Field>
            <Field label="Próg zaliczenia (%)"><input type="number" value={exam.passing_score} onChange={(e) => setExam({ ...exam, passing_score: Number(e.target.value) })} className={inputCls} /></Field>
          </div>
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="inline-flex items-center gap-2 text-sm text-white/70 cursor-pointer">
              <input type="checkbox" checked={exam.shuffle_questions} onChange={(e) => setExam({ ...exam, shuffle_questions: e.target.checked })} className="accent-cyan-400" />
              Tasuj kolejność pytań
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-white/70 cursor-pointer">
              <input type="checkbox" checked={exam.show_results} onChange={(e) => setExam({ ...exam, show_results: e.target.checked })} className="accent-cyan-400" />
              Pokaż wynik uczniowi
            </label>
          </div>
        </div>

        {/* PIN */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
          <h3 className="text-sm font-mono uppercase tracking-widest text-white/40 mb-1 inline-flex items-center gap-2"><KeyRound className="w-4 h-4 text-amber-400" />Aktywny PIN</h3>
          {activePin ? (
            <div className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 to-accent/10 p-4 text-center">
              <div className="font-mono text-3xl tracking-[0.25em] text-cyan-300">{activePin.pin_code}</div>
              <div className="text-[10px] text-white/40 mt-1 font-mono">
                {activePin.used_count}/{activePin.max_uses ?? "∞"} użyć
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-white/40 text-xs">Brak aktywnego PIN-u</div>
          )}
          <div className="flex gap-2">
            {activePin && (
              <button onClick={() => { navigator.clipboard.writeText(activePin.pin_code); toast.success("Skopiowano"); }} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-xs transition">
                <Copy className="w-3.5 h-3.5" />Kopiuj
              </button>
            )}
            <button onClick={newPin} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-accent to-blue-500 hover:from-accent hover:to-blue-500 text-white font-semibold text-xs transition">
              <RefreshCw className="w-3.5 h-3.5" />Nowy PIN
            </button>
          </div>
          {pins.length > 1 && (
            <details className="text-xs">
              <summary className="text-white/40 cursor-pointer hover:text-white/60">Historia ({pins.length - 1})</summary>
              <div className="space-y-1 mt-2 max-h-32 overflow-auto">
                {pins.filter((p) => p.id !== activePin?.id).map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-[11px] text-white/50 p-2 rounded bg-white/[0.02]">
                    <span className="font-mono">{p.pin_code}</span>
                    <button onClick={() => delPin(p.id)} className="text-pink-400 hover:text-pink-300"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>

      {/* QUESTIONS */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        {/* Question toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-mono uppercase tracking-widest text-white/40">Pytania ({filteredQuestions.length})</h3>
            <div className="relative">
              <input value={qSearch} onChange={(e) => setQSearch(e.target.value)} placeholder="Szukaj w pytaniach..." className="w-44 pl-3 pr-7 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 outline-none focus:border-sky-400/50" />
              {qSearch && <button onClick={() => setQSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"><X className="w-3 h-3" /></button>}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setAiAssistOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent to-blue-500 hover:from-accent hover:to-blue-500 text-white text-xs font-semibold transition">
              <Wand2 className="w-3.5 h-3.5" />AI Asystent
            </button>
            <button onClick={() => setAiOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent to-blue-500 hover:from-accent hover:to-blue-500 text-white text-xs font-semibold transition">
              <Sparkles className="w-3.5 h-3.5" />Generuj AI
            </button>
            <button onClick={() => setBankOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-xs transition">
              <Library className="w-3.5 h-3.5" />Z banku
            </button>
            <button onClick={() => addQuestion()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent to-blue-500 hover:from-accent hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-accent/20 transition">
              <Plus className="w-3.5 h-3.5" />Dodaj
            </button>
          </div>
        </div>

        {/* Questions list */}
        {questions.length === 0 ? (
          <div className="py-16 text-center text-white/40 text-sm border border-dashed border-white/10 rounded-xl">
            <FileQuestion className="w-12 h-12 mx-auto mb-3 text-white/20" />
            <p className="mb-3">Brak pytań. Dodaj ręcznie, z banku lub wygeneruj AI.</p>
            <div className="flex justify-center gap-2">
              <button onClick={() => addQuestion()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-xs font-semibold"><Plus className="w-3.5 h-3.5" />Dodaj ręcznie</button>
              <button onClick={() => setAiOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent to-blue-500 text-white text-xs font-semibold"><Sparkles className="w-3.5 h-3.5" />Generuj AI</button>
            </div>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="py-8 text-center text-white/40 text-sm">Brak wyników dla &quot;{qSearch}&quot;</div>
        ) : (
          <div className="space-y-2">
            {filteredQuestions.map((q, fi) => {
              const realIdx = questions.indexOf(q);
              const isOpen = Array.isArray(openIdx) ? openIdx.includes(realIdx) : openIdx === realIdx;
              const QIcon = QTYPE_ICONS[q.question_type] || FileQuestion;
              return (
                <div key={q.id} className={`rounded-xl border transition ${isOpen ? "border-accent/30 bg-white/[0.04]" : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}>
                  {/* Question header */}
                  <div className="flex items-center gap-2 p-3">
                    <GripVertical className="w-4 h-4 text-white/20 cursor-grab" />
                    <span className="text-[10px] text-white/40 font-mono w-8 text-right">#{realIdx + 1}</span>
                    <QIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                    <button onClick={() => toggleOpen(realIdx)} className="flex-1 text-left min-w-0">
                      <div className="text-sm text-white/90 truncate">{q.prompt || <span className="italic text-white/40">— bez treści —</span>}</div>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/50 font-mono">{TYPE_LABELS[q.question_type as QType] ?? q.question_type}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 font-mono">{q.points} pkt</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${q.difficulty === "hard" ? "bg-pink-500/10 text-pink-300" : q.difficulty === "medium" ? "bg-amber-500/10 text-amber-300" : "bg-emerald-500/10 text-emerald-300"}`}>{q.difficulty}</span>
                      </div>
                    </button>
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => move(realIdx, -1)} disabled={realIdx === 0} className="p-1 rounded hover:bg-white/10 text-white/50 disabled:opacity-20"><ChevronUp className="w-3.5 h-3.5" /></button>
                      <button onClick={() => move(realIdx, 1)} disabled={realIdx === questions.length - 1} className="p-1 rounded hover:bg-white/10 text-white/50 disabled:opacity-20"><ChevronDown className="w-3.5 h-3.5" /></button>
                    </div>
                    <button onClick={() => duplicateQuestion(realIdx)} title="Duplikuj" className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-cyan-300 transition"><Copy className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { addQuestion(undefined, realIdx); }} title="Dodaj poniżej" className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-emerald-300 transition"><Plus className="w-3.5 h-3.5" /></button>
                    <button onClick={() => delQuestion(realIdx)} title="Usuń" className="p-1.5 rounded hover:bg-white/10 text-pink-400 hover:text-pink-300 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  {/* Question editor (collapsible) */}
                  {isOpen && (
                    <div className="p-4 pt-0 border-t border-white/10 bg-black/20 rounded-b-xl">
                      <QuestionEditor q={q} onChange={(patch) => updateQuestion(realIdx, patch)} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {aiOpen && (
        <AiGenerator
          onClose={() => setAiOpen(false)}
          onAccept={async (qs) => { for (const q of qs) await addQuestion(q); toast.success(`Dodano ${qs.length} pytań`); }}
        />
      )}
      {bankOpen && <BankPicker onClose={() => setBankOpen(false)} onPick={async (qs) => { for (const q of qs) await addQuestion(q); toast.success(`Dodano ${qs.length} z banku`); }} />}
      {aiAssistOpen && (
        <AiAssistant
          onClose={() => setAiAssistOpen(false)}
          onAccept={async (qs) => { for (const q of qs) await addQuestion(q); }}
        />
      )}
    </div>
  );
}

function BankPicker({ onClose, onPick }: { onClose: () => void; onPick: (qs: QDraft[]) => void }) {
  const [items, setItems] = useState<Array<QDraft & { id: string }>>([]);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  useEffect(() => {
    (async () => {
      let qb = supabase.from("question_bank").select("*").order("created_at", { ascending: false }).limit(200);
      if (q.trim()) qb = qb.ilike("prompt", `%${q.trim()}%`);
      const { data } = await qb;
      setItems(((data ?? []) as unknown[]) as Array<QDraft & { id: string }>);
      setLoading(false);
    })();
  }, [q]);
  return (
    <Modal title="Wybierz pytania z banku" onClose={onClose} wide>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj..." className={inputCls + " mb-3"} />
      <div className="space-y-1.5 max-h-[400px] overflow-auto">
        {loading ? <div className="text-center text-white/40 py-6"><Loader2 className="w-5 h-5 animate-spin inline" /></div> :
          items.length === 0 ? <div className="text-center text-white/40 py-6 text-sm">Bank jest pusty</div> :
          items.map((it) => (
            <label key={it.id} className={`flex items-start gap-2 p-2.5 rounded-lg cursor-pointer ${picked[it.id] ? "bg-cyan-500/10 border border-accent/30" : "bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]"}`}>
              <input type="checkbox" checked={!!picked[it.id]} onChange={(e) => setPicked({ ...picked, [it.id]: e.target.checked })} className="mt-1 accent-cyan-400" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white/90 line-clamp-2">{it.prompt}</div>
                <div className="flex gap-1.5 mt-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/50 font-mono">{it.question_type}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 font-mono">{it.points} pkt</span>
                </div>
              </div>
            </label>
          ))}
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-white/10 mt-3">
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm transition">Anuluj</button>
        <button onClick={() => { const chosen = items.filter((it) => picked[it.id]); if (chosen.length === 0) return; onPick(chosen); onClose(); }} className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-blue-500 hover:from-accent hover:to-blue-500 text-white font-semibold text-sm transition">
          Dodaj ({Object.values(picked).filter(Boolean).length})
        </button>
      </div>
    </Modal>
  );
}
