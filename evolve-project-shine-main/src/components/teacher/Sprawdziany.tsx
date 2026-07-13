import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Edit3, Eye, EyeOff, Loader2, ScrollText } from "lucide-react";
import { ExamEditor } from "./ExamEditor";
import { confirmDialog } from "@/components/ConfirmDialog";

type Exam = {
  id: string; title: string; subject: string | null;
  status: "draft" | "published" | "archived";
  duration_minutes: number; passing_score: number;
  created_at: string;
  category?: string | null;
};

export function Sprawdziany() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [openExamId, setOpenExamId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("exams").select("*").eq("category", "sprawdzian").order("created_at", { ascending: false });
    setExams((data ?? []) as Exam[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggleStatus = async (e: Exam) => {
    const next = e.status === "published" ? "draft" : "published";
    const { error } = await supabase.from("exams").update({ status: next }).eq("id", e.id);
    if (error) return toast.error(error.message);
    toast.success(next === "published" ? "Opublikowano" : "Schowano");
    load();
  };

  const remove = async (e: Exam) => {
    if (!(await confirmDialog({ description: `Usunąć sprawdzian "${e.title}"?` }))) return;
    const { error } = await supabase.from("exams").delete().eq("id", e.id);
    if (error) return toast.error(error.message);
    toast.success("Usunięto"); load();
  };

  const createNew = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Brak sesji");
    const { data, error } = await supabase.from("exams").insert({
      title: "Nowy sprawdzian", duration_minutes: 30, passing_score: 50, created_by: user.id, category: "sprawdzian",
    }).select().single();
    if (error) {
      if (error.message?.includes("category")) {
        toast.error("Brak kolumny 'category' w tabeli exams — dodaj ją w Supabase dashboard (type: text)");
      } else {
        toast.error(error.message);
      }
      return;
    }
    setOpenExamId((data as Exam).id);
  };

  const filtered = filter === "all" ? exams : exams.filter((e) => e.status === filter);

  if (openExamId) {
    return <ExamEditor examId={openExamId} onBack={() => { setOpenExamId(null); load(); }} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-950 inline-flex items-center gap-2"><ScrollText className="w-5 h-5 text-amber-500"/>Sprawdziany</h2>
          <p className="text-xs text-slate-500">Szybkie kartkówki i testy dla Twojej klasy.</p>
        </div>
        <button onClick={createNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-blue-500 hover:from-accent/80 hover:to-blue-500/80 text-white text-sm font-semibold shadow-lg shadow-accent/20">
          <Plus className="w-4 h-4"/>Nowy sprawdzian
        </button>
      </div>

      {/* Filtry */}
      <div className="flex gap-2">
        {(["all", "published", "draft"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wide transition ${filter === f ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"}`}>
            {f === "all" ? "WSZYSTKIE" : f === "published" ? "OPUBLIKOWANE" : "SZKICE"}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin inline"/></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-300 bg-slate-50 rounded-xl">
            Brak sprawdzianów. <button onClick={createNew} className="text-amber-700 hover:text-amber-800 underline">Utwórz pierwszy</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((e) => (
              <div key={e.id} className="group p-4 rounded-xl bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 hover:shadow-md transition cursor-pointer" onClick={() => setOpenExamId(e.id)}>
                <div className="flex items-start justify-between mb-2">
                  <div className="text-sm font-semibold text-slate-900 group-hover:text-amber-700 transition">{e.title}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono shrink-0 ${e.status==="published"?"bg-emerald-50 text-emerald-700 border border-emerald-200":"bg-slate-100 text-slate-600 border border-slate-200"}`}>{e.status.toUpperCase()}</span>
                </div>
                {e.subject && <div className="text-[11px] text-slate-500 mb-2 font-mono">{e.subject}</div>}
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                  <span>{e.duration_minutes} min</span>
                  <span>Próg: {e.passing_score}%</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex gap-1 opacity-0 group-hover:opacity-100 transition" onClick={(ev) => ev.stopPropagation()}>
                  <button onClick={() => toggleStatus(e)} title={e.status==="published"?"Schowaj":"Publikuj"} className="p-1.5 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900"><Eye className="w-3.5 h-3.5"/></button>
                  <button onClick={() => setOpenExamId(e.id)} title="Edytuj" className="p-1.5 rounded text-amber-600 hover:bg-amber-50 hover:text-amber-800"><Edit3 className="w-3.5 h-3.5"/></button>
                  <button onClick={() => remove(e)} title="Usuń" className="p-1.5 rounded text-rose-500 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
