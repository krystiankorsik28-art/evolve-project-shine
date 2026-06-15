import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { aiGenerateLessonPlan } from "@/lib/ai-advanced.functions";
import { CalendarClock, Sparkles, Loader2, Save, Trash2, Plus, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { VoiceInput } from "@/components/VoiceInput";
import { confirmDialog } from "@/components/ConfirmDialog";

type Plan = {
  id: string; title: string; subject: string | null; topic: string | null;
  duration_minutes: number | null; scheduled_at: string | null;
  objectives: string[] | null; materials: string[] | null; homework: string | null;
  content: { phases?: Array<{ name: string; duration_min: number; description: string; activities: string[] }>; assessment?: string } | null;
  status: string | null; ai_generated: boolean | null; created_at: string;
};

export function PlanLekcji() {
  const gen = useServerFn(aiGenerateLessonPlan);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [open, setOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<Plan | null>(null);

  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [duration, setDuration] = useState(45);

  const load = async () => {
    try {
      const { data, error } = await supabase.from("lesson_plans").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setPlans((data ?? []) as unknown as Plan[]);
    } catch (e) {
      console.error("Błąd ładowania planów:", e);
      toast.error("Nie udało się załadować planów lekcji");
      setPlans([]);
    }
  };
  useEffect(() => { load(); }, []);

  const generate = async () => {
    if (!topic.trim()) return toast.error("Podaj temat");
    setBusy(true);
    try {
      const p = await gen({ data: { topic, subject: subject || null, grade: grade || null, duration_minutes: duration } });
      const { data: user } = await supabase.auth.getUser();
      const ins = {
        created_by: user.user!.id,
        title: p.title, subject: subject || null, topic, duration_minutes: duration,
        objectives: p.objectives, materials: p.materials, homework: p.homework,
        content: { phases: p.phases, assessment: p.assessment },
        ai_generated: true, status: "draft",
      };
      const { error } = await supabase.from("lesson_plans").insert(ins);
      if (error) throw new Error(error.message);
      toast.success("Plan lekcji wygenerowany");
      setOpen(false); setTopic(""); setSubject(""); setGrade("");
      load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Błąd"); }
    finally { setBusy(false); }
  };

  const del = async (id: string) => {
    if (!(await confirmDialog({ description: "Usunąć plan?" }))) return;
    await supabase.from("lesson_plans").delete().eq("id", id);
    setPlans((p) => p.filter(x => x.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-accent/10 via-accent/5 to-accent/10 p-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue-500 grid place-items-center"><CalendarClock className="w-5 h-5 text-slate-900"/></div>
          <div>
            <h2 className="text-xl font-display font-bold text-white">Plan lekcji</h2>
            <p className="text-xs text-white/50">Twórz ręcznie lub generuj z AI — cele, fazy, materiały, praca domowa, ocenianie.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setManualOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm">
            <Plus className="w-4 h-4"/>Ręczny
          </button>
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-accent to-blue-500 hover:from-accent/80 hover:to-blue-500/80 text-slate-900 font-semibold text-sm">
            <Sparkles className="w-4 h-4"/>Generuj z AI
          </button>
        </div>
      </div>

      {manualOpen && <ManualPlanModal onClose={() => { setManualOpen(false); load(); }} />}

      <div className="grid md:grid-cols-2 gap-4">
        {plans.length === 0 && <div className="col-span-2 text-center py-16 text-white/40">Brak planów. Wygeneruj pierwszy z AI.</div>}
        {plans.map((p) => (
          <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-cyan-400/30 transition group">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {p.ai_generated && <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 font-mono">AI</span>}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50 font-mono">{p.duration_minutes ?? 45} min</span>
                  {p.subject && <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono">{p.subject}</span>}
                </div>
                <h3 className="font-bold text-white">{p.title}</h3>
                {p.topic && <div className="text-xs text-white/50 mt-1">{p.topic}</div>}
              </div>
              <button onClick={() => del(p.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-white/40 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5"/></button>
            </div>
            {p.objectives && p.objectives.length > 0 && (
              <ul className="text-xs text-white/60 space-y-0.5 mb-3">
                {p.objectives.slice(0, 3).map((o, i) => <li key={i}>• {o}</li>)}
              </ul>
            )}
            <button onClick={() => setView(p)} className="text-xs inline-flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200"><BookOpen className="w-3.5 h-3.5"/>Otwórz konspekt</button>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg bg-[#0b1224] border border-white/10 rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-cyan-400"/>Generuj plan lekcji</h3>
            <div className="space-y-3">
              <label className="block">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-white/50 font-mono">Temat lekcji</span>
                  <VoiceInput size="sm" value={topic} onChange={setTopic} />
                </div>
                <textarea rows={3} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="np. Wprowadzenie do funkcji kwadratowej, rola enzymów w organizmie..." className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white"/>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label><span className="text-[11px] uppercase tracking-wider text-white/50 font-mono">Przedmiot</span><input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full mt-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white"/></label>
                <label><span className="text-[11px] uppercase tracking-wider text-white/50 font-mono">Klasa</span><input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="8, 1 LO..." className="w-full mt-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white"/></label>
                <label><span className="text-[11px] uppercase tracking-wider text-white/50 font-mono">Czas (min)</span><input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full mt-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white"/></label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg bg-white/5 text-white/70 text-sm">Anuluj</button>
                <button disabled={busy} onClick={generate} className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-blue-500 text-slate-900 font-semibold text-sm inline-flex items-center gap-2 disabled:opacity-50">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}{busy ? "Generuję..." : "Generuj"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {view && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4" onClick={() => setView(null)}>
          <div className="w-full max-w-3xl max-h-[90vh] overflow-auto bg-[#0b1224] border border-white/10 rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-display font-bold text-white mb-1">{view.title}</h3>
            <div className="text-xs text-white/50 mb-4">{view.subject} · {view.duration_minutes} min</div>
            {view.objectives && (
              <section className="mb-5">
                <h4 className="text-xs uppercase tracking-wider text-cyan-300 font-mono mb-2">Cele lekcji</h4>
                <ul className="space-y-1 text-sm text-white/80">{view.objectives.map((o, i) => <li key={i}>• {o}</li>)}</ul>
              </section>
            )}
            {view.content?.phases && (
              <section className="mb-5">
                <h4 className="text-xs uppercase tracking-wider text-cyan-300 font-mono mb-2">Przebieg lekcji</h4>
                <div className="space-y-3">
                  {view.content.phases.map((ph, i) => (
                    <div key={i} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-white text-sm">{i+1}. {ph.name}</div>
                        <div className="text-[11px] text-cyan-300 font-mono">{ph.duration_min} min</div>
                      </div>
                      <div className="text-sm text-white/70 mb-2">{ph.description}</div>
                      <ul className="space-y-0.5 text-xs text-white/60">{ph.activities.map((a, j) => <li key={j}>– {a}</li>)}</ul>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {view.materials && (
              <section className="mb-5">
                <h4 className="text-xs uppercase tracking-wider text-cyan-300 font-mono mb-2">Materiały</h4>
                <ul className="space-y-1 text-sm text-white/80">{view.materials.map((m, i) => <li key={i}>• {m}</li>)}</ul>
              </section>
            )}
            {view.homework && (
              <section className="mb-5">
                <h4 className="text-xs uppercase tracking-wider text-cyan-300 font-mono mb-2">Praca domowa</h4>
                <div className="text-sm text-white/80 whitespace-pre-wrap">{view.homework}</div>
              </section>
            )}
            {view.content?.assessment && (
              <section className="mb-5">
                <h4 className="text-xs uppercase tracking-wider text-cyan-300 font-mono mb-2">Ocenianie</h4>
                <div className="text-sm text-white/80 whitespace-pre-wrap">{view.content.assessment}</div>
              </section>
            )}
            <div className="flex justify-end pt-3 border-t border-white/10">
              <button onClick={() => setView(null)} className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-900 font-semibold text-sm">Zamknij</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ MANUAL LESSON PLAN ============ */
type Phase = { name: string; duration_min: number; description: string; activities: string[] };

function ManualPlanModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(45);
  const [objectives, setObjectives] = useState<string[]>([""]);
  const [materials, setMaterials] = useState<string[]>([""]);
  const [homework, setHomework] = useState("");
  const [assessment, setAssessment] = useState("");
  const [phases, setPhases] = useState<Phase[]>([
    { name: "Wprowadzenie", duration_min: 5, description: "", activities: [""] },
    { name: "Główna część", duration_min: 30, description: "", activities: [""] },
    { name: "Podsumowanie", duration_min: 10, description: "", activities: [""] },
  ]);
  const [busy, setBusy] = useState(false);

  const updateList = (arr: string[], i: number, v: string) => arr.map((x, j) => (j === i ? v : x));
  const addItem = (arr: string[]) => [...arr, ""];
  const rmItem = (arr: string[], i: number) => arr.filter((_, j) => j !== i);

  const save = async () => {
    if (!title.trim()) return toast.error("Podaj tytuł");
    setBusy(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase.from("lesson_plans").insert({
        created_by: user.user!.id,
        title, subject: subject || null, topic: topic || null, duration_minutes: duration,
        objectives: objectives.filter((o) => o.trim()),
        materials: materials.filter((m) => m.trim()),
        homework: homework || null,
        content: {
          phases: phases.filter((p) => p.name.trim()).map((p) => ({ ...p, activities: p.activities.filter((a) => a.trim()) })),
          assessment,
        },
        ai_generated: false, status: "draft",
      });
      if (error) throw new Error(error.message);
      toast.success("Plan zapisany");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Błąd");
    } finally { setBusy(false); }
  };

  const inputCls = "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-cyan-400/40";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[92vh] overflow-auto bg-[#0b1224] border border-white/10 rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-cyan-400"/>Ręczny plan lekcji</h3>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <label className="col-span-2"><span className="text-[11px] uppercase tracking-wider text-white/50 font-mono">Tytuł *</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls + " mt-1.5"}/>
          </label>
          <label><span className="text-[11px] uppercase tracking-wider text-white/50 font-mono">Przedmiot</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls + " mt-1.5"}/>
          </label>
          <label><span className="text-[11px] uppercase tracking-wider text-white/50 font-mono">Temat</span>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} className={inputCls + " mt-1.5"}/>
          </label>
          <label><span className="text-[11px] uppercase tracking-wider text-white/50 font-mono">Czas trwania (min)</span>
            <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={inputCls + " mt-1.5"}/>
          </label>
        </div>

        <section className="mb-4">
          <div className="text-xs uppercase tracking-wider text-cyan-300 font-mono mb-2">Cele lekcji</div>
          {objectives.map((o, i) => (
            <div key={i} className="flex gap-2 mb-1.5">
              <input value={o} onChange={(e) => setObjectives(updateList(objectives, i, e.target.value))} placeholder={`Cel ${i + 1}`} className={inputCls}/>
              <button onClick={() => setObjectives(rmItem(objectives, i))} className="p-2 rounded-lg hover:bg-white/10 text-pink-400"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))}
          <button onClick={() => setObjectives(addItem(objectives))} className="text-xs text-cyan-300 hover:text-cyan-200">+ Dodaj cel</button>
        </section>

        <section className="mb-4">
          <div className="text-xs uppercase tracking-wider text-cyan-300 font-mono mb-2">Fazy lekcji</div>
          {phases.map((ph, i) => (
            <div key={i} className="rounded-lg border border-white/10 bg-white/[0.03] p-3 mb-2">
              <div className="flex gap-2 mb-2">
                <input value={ph.name} onChange={(e) => setPhases(phases.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Nazwa fazy" className={inputCls + " flex-1"}/>
                <input type="number" value={ph.duration_min} onChange={(e) => setPhases(phases.map((x, j) => j === i ? { ...x, duration_min: Number(e.target.value) } : x))} className={inputCls + " w-24"}/>
                <button onClick={() => setPhases(phases.filter((_, j) => j !== i))} className="p-2 rounded-lg hover:bg-white/10 text-pink-400"><Trash2 className="w-4 h-4"/></button>
              </div>
              <textarea value={ph.description} onChange={(e) => setPhases(phases.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} placeholder="Opis fazy" rows={2} className={inputCls + " mb-2"}/>
              <div className="text-[10px] uppercase tracking-wider text-white/40 font-mono mb-1">Aktywności</div>
              {ph.activities.map((a, k) => (
                <div key={k} className="flex gap-2 mb-1">
                  <input value={a} onChange={(e) => setPhases(phases.map((x, j) => j === i ? { ...x, activities: updateList(x.activities, k, e.target.value) } : x))} placeholder={`Aktywność ${k + 1}`} className={inputCls}/>
                  <button onClick={() => setPhases(phases.map((x, j) => j === i ? { ...x, activities: rmItem(x.activities, k) } : x))} className="p-1.5 rounded hover:bg-white/10 text-pink-400/70"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
              ))}
              <button onClick={() => setPhases(phases.map((x, j) => j === i ? { ...x, activities: addItem(x.activities) } : x))} className="text-xs text-cyan-300 hover:text-cyan-200">+ Aktywność</button>
            </div>
          ))}
          <button onClick={() => setPhases([...phases, { name: "", duration_min: 5, description: "", activities: [""] }])} className="text-xs text-cyan-300 hover:text-cyan-200">+ Dodaj fazę</button>
        </section>

        <section className="mb-4">
          <div className="text-xs uppercase tracking-wider text-cyan-300 font-mono mb-2">Materiały</div>
          {materials.map((m, i) => (
            <div key={i} className="flex gap-2 mb-1.5">
              <input value={m} onChange={(e) => setMaterials(updateList(materials, i, e.target.value))} placeholder={`Materiał ${i + 1}`} className={inputCls}/>
              <button onClick={() => setMaterials(rmItem(materials, i))} className="p-2 rounded-lg hover:bg-white/10 text-pink-400"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))}
          <button onClick={() => setMaterials(addItem(materials))} className="text-xs text-cyan-300 hover:text-cyan-200">+ Dodaj materiał</button>
        </section>

        <div className="grid md:grid-cols-2 gap-3 mb-4">
          <label><span className="text-[11px] uppercase tracking-wider text-cyan-300 font-mono">Praca domowa</span>
            <textarea value={homework} onChange={(e) => setHomework(e.target.value)} rows={3} className={inputCls + " mt-1.5"}/>
          </label>
          <label><span className="text-[11px] uppercase tracking-wider text-cyan-300 font-mono">Sposób oceniania</span>
            <textarea value={assessment} onChange={(e) => setAssessment(e.target.value)} rows={3} className={inputCls + " mt-1.5"}/>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 text-white/70 text-sm">Anuluj</button>
          <button disabled={busy} onClick={save} className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold text-sm inline-flex items-center gap-2 disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}{busy ? "Zapisuję..." : "Zapisz plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
