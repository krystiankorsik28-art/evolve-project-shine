import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { aiExamAgent } from "@/lib/ai.functions";
import { supabase } from "@/integrations/supabase/client";
import { Modal, Field, inputCls } from "./Egzaminy";
import { VoiceInput } from "@/components/VoiceInput";
import { emptyQuestion, withTypeDefaults, type QDraft, type QType } from "./QuestionEditor";
import { Sparkles, Loader2, ImagePlus, X, Wand2 } from "lucide-react";
import { toast } from "sonner";

const ALL_TYPES: QType[] = [
  "single_choice", "multiple_choice", "true_false", "short_answer", "essay",
  "matching", "drag_drop", "fill_in_blank", "ordering", "numeric", "code",
];

type AgentQ = {
  prompt: string;
  question_type: string;
  options?: string[] | null;
  correct_answer: unknown;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  attach_image_index?: number | null;
};

export function AiAssistant({ onClose, onAccept }: { onClose: () => void; onAccept: (qs: QDraft[]) => Promise<void> | void }) {
  const agentFn = useServerFn(aiExamAgent);
  const [instruction, setInstruction] = useState("");
  const [subject, setSubject] = useState("");
  const [images, setImages] = useState<Array<{ b64: string; file: File }>>([]);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addImages = async (files: FileList) => {
    const arr: Array<{ b64: string; file: File }> = [];
    for (const f of Array.from(files).slice(0, 8 - images.length)) {
      if (!f.type.startsWith("image/")) continue;
      if (f.size > 8 * 1024 * 1024) { toast.error(`${f.name}: max 8 MB`); continue; }
      const b64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.onerror = () => rej(new Error("read"));
        r.readAsDataURL(f);
      });
      arr.push({ b64, file: f });
    }
    setImages([...images, ...arr]);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Brak sesji");
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("question-media").upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    return supabase.storage.from("question-media").getPublicUrl(path).data.publicUrl;
  };

  const run = async () => {
    if (instruction.trim().length < 3) return toast.error("Napisz, co mam zrobić");
    setBusy(true);
    setSummary("");
    try {
      const res = await agentFn({
        data: {
          instruction,
          images_base64: images.map((x) => x.b64),
          subject: subject || null,
          language: "pl",
        },
      });
      const out = res as { summary: string; questions: AgentQ[] };
      setSummary(out.summary);

      // Upload tylko tych obrazków, do których AI się odwołuje
      const usedIdxs = Array.from(new Set(out.questions.map((q) => q.attach_image_index).filter((x): x is number => typeof x === "number" && x >= 0 && x < images.length)));
      const urlByIdx = new Map<number, string>();
      for (const idx of usedIdxs) {
        try {
          const url = await uploadImage(images[idx].file);
          urlByIdx.set(idx, url);
        } catch (e) {
          toast.error(`Nie udało się wgrać zdjęcia ${idx + 1}: ${e instanceof Error ? e.message : ""}`);
        }
      }

      const drafts: QDraft[] = out.questions.map((g) => {
        const t = (ALL_TYPES.includes(g.question_type as QType) ? g.question_type : "short_answer") as QType;
        const base = withTypeDefaults({
          ...emptyQuestion(t),
          prompt: g.prompt,
          difficulty: g.difficulty,
          points: g.points,
          explanation: g.explanation,
          options: g.options ?? [],
          correct_answer: g.correct_answer as unknown,
        } as QDraft, t);
        if (typeof g.attach_image_index === "number" && urlByIdx.has(g.attach_image_index)) {
          base.media_url = urlByIdx.get(g.attach_image_index)!;
        }
        return base;
      });

      await onAccept(drafts);
      toast.success(`AI dodało ${drafts.length} pytań`);
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Błąd AI");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="🪄 AI Asystent egzaminu" onClose={onClose} wide>
      <div className="space-y-4">
        <div className="rounded-lg border border-accent/20 bg-violet-500/5 p-3 text-xs text-violet-100/80">
          Napisz po prostu, co mam zrobić — np. <em>„dodaj 3 zadania ze zdjęcia jako pytania otwarte i dołącz obrazek do każdego"</em>, <em>„zrób 5 pytań testowych z tego materiału"</em>, <em>„utwórz pytanie wielokrotnego wyboru do tego diagramu"</em>. Możesz dyktować mikrofonem 🎙️.
        </div>

        <Field label={<div className="flex items-center justify-between gap-2"><span>Co mam zrobić?</span><VoiceInput size="sm" value={instruction} onChange={setInstruction} /></div>}>
          <textarea
            rows={4}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="np. Dodaj wszystkie zadania ze zdjęcia, jako pytania otwarte, do każdego dołącz to zdjęcie"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Przedmiot (opcjonalnie)">
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls} placeholder="np. Matematyka" />
          </Field>
          <div />
        </div>

        <Field label={`Zdjęcia (opcjonalnie, do 8) — ${images.length}/8`}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addImages(e.target.files)}
          />
          <div className="flex flex-wrap gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <img src={img.b64} alt="" className="w-24 h-24 object-cover rounded-lg border border-white/10" />
                <div className="absolute bottom-0.5 left-0.5 px-1 rounded bg-black/70 text-[10px] text-white/80 font-mono">#{i}</div>
                <button onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute -top-2 -right-2 p-1 rounded-full bg-pink-500 text-white">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {images.length < 8 && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="w-24 h-24 rounded-lg border border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.05] grid place-items-center text-white/60"
              >
                <ImagePlus className="w-6 h-6" />
              </button>
            )}
          </div>
        </Field>

        {summary && (
          <div className="rounded-lg bg-cyan-500/5 border border-accent/20 p-3 text-xs text-cyan-100">
            <strong>AI:</strong> {summary}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm">Anuluj</button>
          <button
            disabled={busy}
            onClick={run}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-blue-500 hover:from-accent/80 hover:to-blue-500/80 text-white font-semibold text-sm inline-flex items-center gap-2 disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {busy ? "Pracuję..." : "Wykonaj"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
