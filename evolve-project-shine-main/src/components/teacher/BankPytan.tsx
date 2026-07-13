import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Library, Plus, Trash2, Search, Loader2, Sparkles } from "lucide-react";
import { Modal, Field, inputCls } from "./Egzaminy";
import { confirmDialog } from "@/components/ConfirmDialog";

type QB = {
  id: string;
  prompt: string;
  question_type: "multiple_choice" | "true_false" | "short_answer" | "essay";
  difficulty: "easy" | "medium" | "hard";
  points: number;
  options: unknown;
  correct_answer: unknown;
  explanation: string | null;
  category_id: string | null;
  ai_generated: boolean;
  usage_count: number;
  created_at: string;
};
type Cat = { id: string; name: string; slug: string; color: string | null };

export function BankPytan() {
  const [items, setItems] = useState<QB[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState<"" | "easy" | "medium" | "hard">("");
  const [cat, setCat] = useState("");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: c } = await supabase.from("question_categories").select("*").order("name");
    setCats((c ?? []) as Cat[]);
    let qb = supabase.from("question_bank").select("*").order("created_at", { ascending: false }).limit(500);
    if (diff) qb = qb.eq("difficulty", diff);
    if (cat) qb = qb.eq("category_id", cat);
    if (q.trim()) qb = qb.ilike("prompt", `%${q.trim()}%`);
    const { data } = await qb;
    setItems((data ?? []) as QB[]);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [diff, cat]);

  const remove = async (id: string) => {
    if (!(await confirmDialog({ description: "Usunąć pytanie?" }))) return;
    const { error } = await supabase.from("question_bank").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Usunięto"); load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-950">Bank pytań</h2>
          <p className="text-xs text-slate-500">Zbiór pytań do wielokrotnego użycia w egzaminach i quizach.</p>
        </div>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-semibold"><Plus className="w-4 h-4"/>Dodaj pytanie</button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
          <input value={q} onChange={(e)=>setQ(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&load()} placeholder="Szukaj treści pytania... (Enter)" className={inputCls + " pl-10"}/>
        </div>
        <select value={diff} onChange={(e)=>setDiff(e.target.value as "" | "easy" | "medium" | "hard")} className={inputCls + " w-auto"}>
          <option value="" className="bg-white text-slate-950">Każda trudność</option>
          <option value="easy" className="bg-white text-slate-950">Łatwa</option>
          <option value="medium" className="bg-white text-slate-950">Średnia</option>
          <option value="hard" className="bg-white text-slate-950">Trudna</option>
        </select>
        <select value={cat} onChange={(e)=>setCat(e.target.value)} className={inputCls + " w-auto"}>
          <option value="" className="bg-white text-slate-950">Każda kategoria</option>
          {cats.map(c => <option key={c.id} value={c.id} className="bg-white text-slate-950">{c.name}</option>)}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {loading ? <div className="col-span-2 text-center py-12 text-slate-400"><Loader2 className="w-5 h-5 animate-spin inline"/></div> :
         items.length === 0 ? <div className="col-span-2 text-center py-12 text-slate-500 text-sm border border-dashed border-slate-300 bg-white rounded-xl">Brak pytań — dodaj pierwsze.</div> :
         items.map(it => (
          <div key={it.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-cyan-300 hover:shadow-md transition">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex gap-1.5 flex-wrap">
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono ${it.difficulty==="easy"?"bg-emerald-50 text-emerald-700":it.difficulty==="hard"?"bg-rose-50 text-rose-700":"bg-amber-50 text-amber-700"}`}>{it.difficulty.toUpperCase()}</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-mono bg-slate-100 text-slate-600">{it.question_type}</span>
                {it.ai_generated && <span className="text-[9px] px-2 py-0.5 rounded-full font-mono bg-violet-50 text-violet-700 inline-flex items-center gap-1"><Sparkles className="w-2.5 h-2.5"/>AI</span>}
                <span className="text-[9px] px-2 py-0.5 rounded-full font-mono bg-cyan-50 text-cyan-700">{it.points} pkt</span>
              </div>
              <button onClick={() => remove(it.id)} className="p-1.5 rounded text-rose-500 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="w-3.5 h-3.5"/></button>
            </div>
            <div className="text-sm text-slate-900 line-clamp-3">{it.prompt}</div>
            {it.explanation && <div className="text-xs text-slate-500 mt-2 italic line-clamp-2">{it.explanation}</div>}
          </div>
        ))}
      </div>

      {creating && <NewQuestion cats={cats} onClose={() => { setCreating(false); load(); }}/>}
    </div>
  );
}

function NewQuestion({ cats, onClose }: { cats: Cat[]; onClose: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState<"multiple_choice" | "true_false" | "short_answer" | "essay">("multiple_choice");
  const [diff, setDiff] = useState<"easy" | "medium" | "hard">("medium");
  const [points, setPoints] = useState(1);
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correct, setCorrect] = useState<string>("");
  const [explanation, setExplanation] = useState("");
  const [category, setCategory] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!prompt.trim()) return toast.error("Podaj treść pytania");
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return toast.error("Brak sesji"); }
    const payload = {
      prompt, question_type: type, difficulty: diff, points,
      options: type === "multiple_choice" ? options.filter(o=>o.trim()) : type === "true_false" ? ["Prawda","Fałsz"] : [],
      correct_answer: correct || null,
      explanation: explanation || null,
      category_id: category || null,
      created_by: user.id,
    };
    const { error } = await supabase.from("question_bank").insert(payload);
    if (error) { setBusy(false); return toast.error(error.message); }
    toast.success("Dodano"); setBusy(false); onClose();
  };

  return (
    <Modal title="Nowe pytanie" onClose={onClose} wide>
      <Field label="Treść pytania"><textarea rows={3} value={prompt} onChange={(e)=>setPrompt(e.target.value)} className={inputCls}/></Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Typ"><select value={type} onChange={(e)=>setType(e.target.value as typeof type)} className={inputCls}>
          <option value="multiple_choice" className="bg-slate-900">Wielokrotny wybór</option>
          <option value="true_false" className="bg-slate-900">Prawda/Fałsz</option>
          <option value="short_answer" className="bg-slate-900">Krótka odpowiedź</option>
          <option value="essay" className="bg-slate-900">Esej</option>
        </select></Field>
        <Field label="Trudność"><select value={diff} onChange={(e)=>setDiff(e.target.value as typeof diff)} className={inputCls}>
          <option value="easy" className="bg-slate-900">Łatwa</option>
          <option value="medium" className="bg-slate-900">Średnia</option>
          <option value="hard" className="bg-slate-900">Trudna</option>
        </select></Field>
        <Field label="Punkty"><input type="number" value={points} onChange={(e)=>setPoints(Number(e.target.value))} className={inputCls}/></Field>
      </div>
      {type === "multiple_choice" && (
        <Field label="Opcje (1 na linię)">
          {options.map((o, i) => (
            <input key={i} value={o} onChange={(e)=>setOptions(options.map((x,j)=>j===i?e.target.value:x))} placeholder={`Opcja ${i+1}`} className={inputCls + " mb-1"}/>
          ))}
        </Field>
      )}
      <Field label="Poprawna odpowiedź"><input value={correct} onChange={(e)=>setCorrect(e.target.value)} placeholder={type==="multiple_choice"?"Skopiuj jedną z opcji":"np. Prawda lub krótki tekst"} className={inputCls}/></Field>
      <Field label="Wyjaśnienie (opcjonalnie)"><textarea rows={2} value={explanation} onChange={(e)=>setExplanation(e.target.value)} className={inputCls}/></Field>
      <Field label="Kategoria"><select value={category} onChange={(e)=>setCategory(e.target.value)} className={inputCls}>
        <option value="" className="bg-slate-900">— brak —</option>
        {cats.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
      </select></Field>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm">Anuluj</button>
        <button disabled={busy} onClick={save} className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold text-sm disabled:opacity-50">{busy?"Zapisuję...":"Zapisz"}</button>
      </div>
    </Modal>
  );
}
