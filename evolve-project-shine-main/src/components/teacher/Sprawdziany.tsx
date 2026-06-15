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
          <h2 className="text-xl font-display font-bold text-white inline-flex items-center gap-2"><ScrollText className="w-5 h-5 text-amber-400"/>Sprawdziany</h2>
          <p className="text-xs text-white/50">Szybkie kartkówki i testy dla Twojej klasy.</p>
        </div>
        <button onClick={createNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-blue-500 hover:from-accent/80 hover:to-blue-500/80 text-white text-sm font-semibold shadow-lg shadow-accent/20">
          <Plus className="w-4 h-4"/>Nowy sprawdzian
        </button>
      </div>

      {/* Filtry */}
      <div className="flex gap-2">
        {(["all", "published", "draft"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wide transition ${filter === f ? "bg-amber-500/20 text-amber-300 border border-amber-400/30" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}`}>
            {f === "all" ? "WSZYSTKIE" : f === "published" ? "OPUBLIKOWANE" : "SZKICE"}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-4">
        {loading ? (
          <div className="py-12 text-center text-white/40"><Loader2 className="w-5 h-5 animate-spin inline"/></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-white/40 text-sm border border-dashed border-white/10 rounded-xl">
            Brak sprawdzianów. <button onClick={createNew} className="text-amber-300 hover:text-amber-200 underline">Utwórz pierwszy</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((e) => (
              <div key={e.id} className="group p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-amber-400/30 hover:bg-amber-500/[0.03] transition cursor-pointer" onClick={() => setOpenExamId(e.id)}>
                <div className="flex items-start justify-between mb-2">
                  <div className="text-sm font-semibold text-white group-hover:text-amber-300 transition">{e.title}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono shrink-0 ${e.status==="published"?"bg-emerald-500/15 text-emerald-300 border border-emerald-400/20":"bg-white/5 text-white/50 border border-white/10"}`}>{e.status.toUpperCase()}</span>
                </div>
                {e.subject && <div className="text-[11px] text-white/40 mb-2 font-mono">{e.subject}</div>}
                <div className="flex items-center gap-3 text-[11px] text-white/40 font-mono">
                  <span>{e.duration_minutes} min</span>
                  <span>Próg: {e.passing_score}%</span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex gap-1 opacity-0 group-hover:opacity-100 transition" onClick={(ev) => ev.stopPropagation()}>
                  <button onClick={() => toggleStatus(e)} title={e.status==="published"?"Schowaj":"Publikuj"} className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white"><Eye className="w-3.5 h-3.5"/></button>
                  <button onClick={() => setOpenExamId(e.id)} title="Edytuj" className="p-1.5 rounded hover:bg-white/10 text-amber-300"><Edit3 className="w-3.5 h-3.5"/></button>
                  <button onClick={() => remove(e)} title="Usuń" className="p-1.5 rounded hover:bg-white/10 text-pink-400"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
