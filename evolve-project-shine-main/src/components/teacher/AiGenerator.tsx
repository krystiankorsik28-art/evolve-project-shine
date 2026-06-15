import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { aiGenerateQuestions, aiQuestionFromPhoto } from "@/lib/ai.functions";
import { Modal, Field, inputCls } from "./Egzaminy";
import { TYPE_LABELS, type QType, type QDraft, emptyQuestion, withTypeDefaults } from "./QuestionEditor";
import { Sparkles, Loader2, FileText, Image as ImageIcon, BookOpen, Check, X } from "lucide-react";
import { toast } from "sonner";
import { VoiceInput } from "@/components/VoiceInput";

type GeneratedQ = {
  prompt: string;
  question_type: string;
  options?: string[] | null;
  correct_answer: unknown;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
};

const ALL_TYPES: QType[] = [
  "single_choice", "multiple_choice", "true_false", "short_answer", "essay",
  "matching", "drag_drop", "fill_in_blank", "ordering", "numeric", "code",
];

export function AiGenerator({ onClose, onAccept }: { onClose: () => void; onAccept: (qs: QDraft[]) => void }) {
  const genFn = useServerFn(aiGenerateQuestions);
  const photoFn = useServerFn(aiQuestionFromPhoto);

  const [mode, setMode] = useState<"topic" | "material" | "photo">("topic");
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [language, setLanguage] = useState("pl");
  const [style, setStyle] = useState<"exam" | "quiz" | "test">("exam");
  const [types, setTypes] = useState<QType[]>(["single_choice", "true_false", "short_answer"]);
  const [photoB64, setPhotoB64] = useState<string | null>(null);
  const [photoDesc, setPhotoDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [generated, setGenerated] = useState<QDraft[]>([]);
  const [picked, setPicked] = useState<Record<number, boolean>>({});

  const toggleType = (t: QType) => setTypes((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]);

  const onPhoto = (f: File) => {
    const r = new FileReader();
    r.onload = () => setPhotoB64(String(r.result));
    r.readAsDataURL(f);
  };

  const toDraft = (g: GeneratedQ): QDraft => {
    const t = (ALL_TYPES.includes(g.question_type as QType) ? g.question_type : "short_answer") as QType;
    return withTypeDefaults({
      ...emptyQuestion(t),
      prompt: g.prompt,
      difficulty: g.difficulty,
      points: g.points,
      explanation: g.explanation,
      options: g.options ?? [],
      correct_answer: g.correct_answer as unknown,
    } as QDraft, t);
  };

  const generate = async () => {
    setBusy(true);
    try {
      if (mode === "photo") {
        if (!photoB64) throw new Error("Wybierz zdjęcie");
        const q = await photoFn({ data: { image_base64: photoB64, description: photoDesc || "Wygeneruj pytanie z tego obrazka", language } });
        const draft = toDraft(q as GeneratedQ);
        setGenerated([draft]);
        setPicked({ 0: true });
      } else {
        if (!topic.trim() || topic.trim().length < 3) throw new Error("Podaj temat lub materiał (min. 3 znaki)");
        if (types.length === 0) throw new Error("Wybierz przynajmniej jeden typ pytania");
        const qs = await genFn({ data: { topic, mode, count, difficulty, language, types, style, subject: subject || null } });
        const drafts = (qs as GeneratedQ[]).map(toDraft);
        setGenerated(drafts);
        const all: Record<number, boolean> = {};
        drafts.forEach((_, i) => (all[i] = true));
        setPicked(all);
      }
      toast.success("Wygenerowano");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Błąd AI");
    } finally {
      setBusy(false);
    }
  };

  const accept = () => {
    const chosen = generated.filter((_, i) => picked[i]);
    if (chosen.length === 0) return toast.error("Nic nie zaznaczono");
    onAccept(chosen);
    onClose();
  };

  return (
    <Modal title="AI Generator pytań" onClose={onClose} wide>
      {generated.length === 0 ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            {[
              { id: "topic", icon: BookOpen, label: "Z tematu" },
              { id: "material", icon: FileText, label: "Z materiału" },
              { id: "photo", icon: ImageIcon, label: "Ze zdjęcia" },
            ].map((m) => {
              const Icon = m.icon;
              const active = mode === m.id;
              return (
                <button key={m.id} onClick={() => setMode(m.id as typeof mode)} className={`flex-1 p-3 rounded-xl border text-sm inline-flex items-center justify-center gap-2 ${active ? "border-accent/50 bg-cyan-500/10 text-cyan-200" : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20"}`}>
                  <Icon className="w-4 h-4" />{m.label}
                </button>
              );
            })}
          </div>

          {mode === "topic" && (
            <Field label={<div className="flex items-center justify-between gap-2"><span>Temat</span><VoiceInput size="sm" value={topic} onChange={setTopic} /></div>}>
              <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="np. II wojna światowa, równania kwadratowe..." className={inputCls} />
            </Field>
          )}
          {mode === "material" && (
            <Field label={<div className="flex items-center justify-between gap-2"><span>Materiał / tekst źródłowy</span><VoiceInput size="sm" value={topic} onChange={setTopic} /></div>}>
              <textarea rows={8} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Wklej fragment podręcznika, notatki, artykuł... lub podyktuj mikrofonem" className={inputCls} />
            </Field>
          )}
          {mode === "photo" && (
            <>
              <Field label="Zdjęcie (zadanie, kartka, slajd)"><input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onPhoto(e.target.files[0])} className={inputCls} /></Field>
              {photoB64 && <img src={photoB64} alt="" className="max-h-40 rounded-lg border border-white/10" />}
              <Field label={<div className="flex items-center justify-between gap-2"><span>Opis dla AI</span><VoiceInput size="sm" value={photoDesc} onChange={setPhotoDesc} /></div>}>
                <input value={photoDesc} onChange={(e) => setPhotoDesc(e.target.value)} placeholder="np. Wygeneruj pytanie do tego zadania matematycznego" className={inputCls} />
              </Field>
            </>
          )}

          {mode !== "photo" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Field label="Przedmiot"><input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls} placeholder="opcjonalnie" /></Field>
                <Field label="Liczba pytań"><input type="number" min={1} max={30} value={count} onChange={(e) => setCount(Math.max(1, Math.min(30, Number(e.target.value))))} className={inputCls} /></Field>
                <Field label="Trudność">
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)} className={inputCls}>
                    <option value="easy" className="bg-slate-900">Łatwa</option>
                    <option value="medium" className="bg-slate-900">Średnia</option>
                    <option value="hard" className="bg-slate-900">Trudna</option>
                  </select>
                </Field>
                <Field label="Styl">
                  <select value={style} onChange={(e) => setStyle(e.target.value as typeof style)} className={inputCls}>
                    <option value="exam" className="bg-slate-900">Egzamin</option>
                    <option value="quiz" className="bg-slate-900">Quiz</option>
                    <option value="test" className="bg-slate-900">Sprawdzian</option>
                  </select>
                </Field>
              </div>
              <Field label="Typy pytań do wygenerowania">
                <div className="flex flex-wrap gap-2">
                  {ALL_TYPES.map((t) => {
                    const on = types.includes(t);
                    return (
                      <button key={t} onClick={() => toggleType(t)} className={`text-xs px-3 py-1.5 rounded-full border ${on ? "border-accent/50 bg-cyan-500/15 text-cyan-200" : "border-white/10 bg-white/5 text-white/60 hover:border-white/20"}`}>
                        {TYPE_LABELS[t]}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm">Anuluj</button>
            <button disabled={busy} onClick={generate} className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-blue-500 hover:from-accent/80 hover:to-blue-500/80 text-white font-semibold text-sm inline-flex items-center gap-2 disabled:opacity-50">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}{busy ? "Generuję..." : "Generuj"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/70">Wygenerowano {generated.length} pytań. Zaznacz te do dodania:</div>
            <div className="flex gap-2">
              <button onClick={() => setGenerated([])} className="text-xs px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white/70">↻ Generuj ponownie</button>
              <button onClick={() => { const all: Record<number, boolean> = {}; generated.forEach((_, i) => (all[i] = true)); setPicked(all); }} className="text-xs px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white/70">Zaznacz wszystko</button>
            </div>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-auto">
            {generated.map((g, i) => (
              <div key={i} className={`rounded-lg border p-3 ${picked[i] ? "border-accent/40 bg-cyan-500/5" : "border-white/10 bg-white/[0.02]"}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => setPicked({ ...picked, [i]: !picked[i] })} className={`mt-0.5 w-5 h-5 rounded grid place-items-center ${picked[i] ? "bg-cyan-500 text-slate-900" : "bg-white/10 text-transparent"}`}>
                    {picked[i] ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-2 mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50 font-mono">{TYPE_LABELS[g.question_type as QType] ?? g.question_type}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono">{g.points} pkt</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-mono">{g.difficulty}</span>
                    </div>
                    <div className="text-sm text-white/90">{g.prompt}</div>
                    {Array.isArray(g.options) && (g.options as string[]).length > 0 && (
                      <ul className="mt-1.5 text-xs text-white/50 space-y-0.5">
                        {(g.options as string[]).map((o, j) => <li key={j}>• {o}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm">Anuluj</button>
            <button onClick={accept} className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold text-sm">Dodaj zaznaczone ({Object.values(picked).filter(Boolean).length})</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
