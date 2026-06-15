import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Plus, Trash2, Edit3, Eye, EyeOff, Loader2, Search, Copy,
  BookOpen, Clock, Target, BarChart3, FileText, Users, HelpCircle,
  ArrowUpDown, CalendarDays, RefreshCw, ListChecks, Sigma,
} from "lucide-react";
import { ExamEditor } from "./ExamEditor";
import { confirmDialog } from "@/components/ConfirmDialog";

const SUBJECT_COLORS: Record<string, string> = {
  Matematyka: "from-blue-400 to-indigo-500",
  "Język polski": "from-rose-400 to-pink-500",
  "Język angielski": "from-emerald-400 to-teal-500",
  Biologia: "from-green-400 to-emerald-500",
  Chemia: "from-cyan-400 to-blue-500",
  Fizyka: "from-amber-400 to-orange-500",
  Geografia: "from-lime-400 to-green-500",
  Historia: "from-amber-400 to-yellow-500",
  Informatyka: "from-violet-400 to-purple-500",
  Plastyka: "from-fuchsia-400 to-pink-500",
  Muzyka: "from-indigo-400 to-violet-500",
  WF: "from-emerald-400 to-cyan-500",
  Religia: "from-amber-300 to-yellow-500",
};

function subjectGradient(subject: string | null) {
  if (!subject) return "from-sky-400 to-blue-400";
  for (const [key, val] of Object.entries(SUBJECT_COLORS)) {
    if (subject.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return "from-sky-400 to-blue-400";
}

type Exam = {
  id: string;
  title: string;
  subject: string | null;
  status: "draft" | "published" | "archived";
  duration_minutes: number;
  passing_score: number;
  created_at: string;
  category?: string | null;
};

type ExamMeta = {
  questionCount: number;
  attemptCount: number;
  pin: string | null;
};

export function Egzaminy() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [meta, setMeta] = useState<Record<string, ExamMeta>>({});
  const [loading, setLoading] = useState(true);
  const [openExamId, setOpenExamId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [sortBy, setSortBy] = useState<"date" | "title" | "duration" | "questions">("date");

  const loadMeta = useCallback(async (examIds: string[]) => {
    if (examIds.length === 0) return;
    const [qRes, aRes, pRes] = await Promise.all([
      supabase.from("questions").select("exam_id, id").in("exam_id", examIds),
      supabase.from("attempts").select("exam_id, id").in("exam_id", examIds),
      supabase.from("exam_codes").select("exam_id, code").in("exam_id", examIds),
    ]);
    const qMap: Record<string, number> = {};
    for (const r of (qRes.data ?? [])) {
      qMap[r.exam_id] = (qMap[r.exam_id] ?? 0) + 1;
    }
    const aMap: Record<string, number> = {};
    for (const r of (aRes.data ?? [])) {
      aMap[r.exam_id] = (aMap[r.exam_id] ?? 0) + 1;
    }
    const pMap: Record<string, string | null> = {};
    for (const r of (pRes.data ?? [])) {
      pMap[r.exam_id] = r.code;
    }
    const m: Record<string, ExamMeta> = {};
    for (const id of examIds) {
      m[id] = { questionCount: qMap[id] ?? 0, attemptCount: aMap[id] ?? 0, pin: pMap[id] ?? null };
    }
    setMeta(m);
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("exams").select("*").order("created_at", { ascending: false });
    const filtered = ((data ?? []) as Exam[]).filter((e) => e.category !== "sprawdzian");
    setExams(filtered);
    await loadMeta(filtered.map((e) => e.id));
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

  const copyPin = async (examId: string) => {
    const m = meta[examId];
    if (!m?.pin) {
      toast.error("Brak PIN-u. Opublikuj egzamin, aby wygenerować PIN.");
      return;
    }
    try { await navigator.clipboard.writeText(m.pin); toast.success("PIN skopiowany: " + m.pin); }
    catch { toast.error("Nie udało się skopiować"); }
  };

  const regeneratePin = async (examId: string) => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const { error } = await supabase.from("exam_codes").upsert(
      { exam_id: examId, code: pin },
      { onConflict: "exam_id" }
    );
    if (error) return toast.error(error.message);
    toast.success("Nowy PIN: " + pin);
    load();
  };

  const remove = async (e: Exam) => {
    if (!(await confirmDialog({ description: `Usunąć egzamin "${e.title}"? Wraz z pytaniami i odpowiedziami.` }))) return;
    await supabase.from("questions").delete().eq("exam_id", e.id);
    await supabase.from("attempts").delete().eq("exam_id", e.id);
    const { error } = await supabase.from("exams").delete().eq("id", e.id);
    if (error) return toast.error(error.message);
    toast.success("Usunięto"); load();
  };

  const createNew = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Brak sesji");
    const { data, error } = await supabase.from("exams").insert({
      title: "Nowy egzamin", duration_minutes: 60, passing_score: 50, created_by: user.id, category: "egzamin",
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

  const published = exams.filter((e) => e.status === "published").length;
  const drafts = exams.filter((e) => e.status === "draft").length;
  const totalQuestions = Object.values(meta).reduce((a, m) => a + m.questionCount, 0);
  const totalAttempts = Object.values(meta).reduce((a, m) => a + m.attemptCount, 0);

  const filtered = useMemo(() => {
    let f = [...exams];
    if (search) f = f.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()) || e.subject?.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter === "published") f = f.filter((e) => e.status === "published");
    if (statusFilter === "draft") f = f.filter((e) => e.status === "draft");
    if (sortBy === "title") f.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === "duration") f.sort((a, b) => a.duration_minutes - b.duration_minutes);
    else if (sortBy === "questions") f.sort((a, b) => (meta[b.id]?.questionCount ?? 0) - (meta[a.id]?.questionCount ?? 0));
    else f.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return f;
  }, [exams, search, statusFilter, sortBy, meta]);

  if (openExamId) {
    return <ExamEditor examId={openExamId} onBack={() => { setOpenExamId(null); load(); }} />;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="inline-flex items-center gap-2 text-xl font-display font-bold text-white">
            <FileText className="w-5 h-5 text-sky-400"/>Egzaminy
          </h2>
          <p className="text-xs text-white/50">Twórz, publikuj i zarządzaj egzaminami.</p>
        </div>
        <button onClick={createNew} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-blue-500 hover:from-accent hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-accent/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="w-4 h-4"/>Nowy egzamin
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={FileText} label="Wszystkie" value={exams.length} color="from-accent to-blue-500" />
        <StatCard icon={Eye} label="Opublikowane" value={published} color="from-accent to-blue-500" />
        <StatCard icon={Edit3} label="Szkice" value={drafts} color="from-accent to-blue-500" />
        <StatCard icon={BarChart3} label="Śr. czas" value={exams.length ? `${Math.round(exams.reduce((a, e) => a + e.duration_minutes, 0) / exams.length)} min` : "—"} color="from-accent to-blue-500" />
      </div>

      {/* Secondary stats */}
      <div className="flex flex-wrap gap-3 text-xs text-white/50">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10">
          <HelpCircle className="w-3.5 h-3.5 text-sky-400"/>{totalQuestions} pytań
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10">
          <Users className="w-3.5 h-3.5 text-violet-400"/>{totalAttempts} podejść
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10">
          <Sigma className="w-3.5 h-3.5 text-emerald-400"/>{exams.length ? Math.round(totalQuestions / exams.length) : 0} średnio pytań/egzamin
        </span>
      </div>

      {/* Search + filter + sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj egzaminu po tytule lub przedmiocie…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 outline-none focus:border-sky-400/50 text-sm text-white placeholder-white/30 transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "published", "draft"] as const).map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-mono tracking-wide transition ${
                statusFilter === f
                  ? "bg-gradient-to-r from-accent/20 to-accent/20 text-sky-300 border border-sky-400/30"
                  : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
              }`}>
              {f === "all" ? "WSZYSTKIE" : f === "published" ? "OPUBLIKOWANE" : "SZKICE"}
            </button>
          ))}
          <div className="relative">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 rounded-lg text-xs font-mono bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 outline-none appearance-none cursor-pointer pr-8">
              <option value="date">Data ↓</option>
              <option value="title">Tytuł A-Z</option>
              <option value="duration">Czas ↑</option>
              <option value="questions">Pytań ↓</option>
            </select>
            <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-4 sm:p-5">
        {loading ? (
          <div className="py-16 text-center text-white/40"><Loader2 className="w-6 h-6 animate-spin inline"/></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/40 text-sm border border-dashed border-white/10 rounded-xl">
            {search || statusFilter !== "all"
              ? "Brak wyników dla tej filtracji."
              : (
                <div className="space-y-3">
                  <FileText className="w-12 h-12 mx-auto text-white/20" />
                  <p>Brak egzaminów.</p>
                  <button onClick={createNew} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-blue-500 text-white text-sm font-semibold hover:brightness-110 transition">
                    <Plus className="w-4 h-4"/>Utwórz pierwszy
                  </button>
                </div>
              )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((e) => {
              const grad = subjectGradient(e.subject);
              const m = meta[e.id];
              return (
                <div key={e.id} onClick={() => setOpenExamId(e.id)}
                  className="group relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/10 hover:border-accent/30 hover:bg-white/[0.04] transition cursor-pointer p-4">

                  {/* Top gradient bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${grad}`} />

                  {/* Color dot + PIN badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${grad} opacity-60`} />
                    {m?.pin && e.status === "published" && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-400/20">
                        PIN: {m.pin}
                      </span>
                    )}
                  </div>

                  {/* Title + status */}
                  <div className="flex items-start justify-between gap-2 mt-1">
                    <h3 className="text-sm font-semibold text-white group-hover:text-sky-300 transition leading-snug line-clamp-2 pr-14">{e.title}</h3>
                    <span className={`shrink-0 text-[9px] px-2 py-0.5 rounded-full font-mono tracking-wider ${
                      e.status === "published"
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/20"
                        : "bg-amber-500/10 text-amber-300 border border-amber-400/15"
                    }`}>{e.status.toUpperCase()}</span>
                  </div>

                  {/* Subject badge */}
                  {e.subject && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r ${grad} text-white/90 font-medium`}>
                        <BookOpen className="w-3 h-3"/>{e.subject}
                      </span>
                    </div>
                  )}

                  {/* Meta row - expanded */}
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-white/50 font-mono flex-wrap">
                    <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3 text-cyan-400"/>{e.duration_minutes} min</span>
                    <span className="inline-flex items-center gap-1"><Target className="w-3 h-3 text-amber-400"/>{e.passing_score}%</span>
                    <span className="inline-flex items-center gap-1"><HelpCircle className="w-3 h-3 text-sky-400"/>{m?.questionCount ?? "…"}</span>
                    <span className="inline-flex items-center gap-1"><Users className="w-3 h-3 text-violet-400"/>{m?.attemptCount ?? "…"}</span>
                  </div>

                  {/* Date */}
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-white/30 font-mono">
                    <CalendarDays className="w-3 h-3"/>{new Date(e.created_at).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}
                  </div>

                  {/* Progress bar (attempts / question count) */}
                  {m && m.questionCount > 0 && (
                    <div className="mt-2.5 h-1 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-accent to-blue-500 transition-all"
                        style={{ width: `${Math.min(100, ((m.attemptCount ?? 0) / m.questionCount) * 100)}%` }} />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-3 pt-3 border-t border-white/5 flex gap-1 opacity-0 group-hover:opacity-100 transition" onClick={(ev) => ev.stopPropagation()}>
                    <button onClick={() => toggleStatus(e)} title={e.status==="published"?"Schowaj":"Publikuj"}
                      className={`p-1.5 rounded-md text-xs transition ${e.status==="published" ? "hover:bg-amber-500/15 text-amber-400" : "hover:bg-emerald-500/15 text-emerald-400"}`}>
                      {e.status==="published" ? <EyeOff className="w-3.5 h-3.5"/> : <Eye className="w-3.5 h-3.5"/>}
                    </button>
                    <button onClick={() => copyPin(e.id)} title="Kopiuj PIN"
                      className="p-1.5 rounded-md hover:bg-white/10 text-white/50 hover:text-white transition">
                      <Copy className="w-3.5 h-3.5"/>
                    </button>
                    <button onClick={() => regeneratePin(e.id)} title="Generuj nowy PIN"
                      className="p-1.5 rounded-md hover:bg-cyan-500/15 text-cyan-400 transition">
                      <RefreshCw className="w-3.5 h-3.5"/>
                    </button>
                    <button onClick={() => setOpenExamId(e.id)} title="Edytuj"
                      className="p-1.5 rounded-md hover:bg-sky-500/15 text-sky-400 transition">
                      <Edit3 className="w-3.5 h-3.5"/>
                    </button>
                    <button onClick={() => remove(e)} title="Usuń"
                      className="p-1.5 rounded-md hover:bg-pink-500/15 text-pink-400 transition ml-auto">
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{className?:string}>; label: string; value: string | number; color: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur p-4 group hover:border-white/20 transition">
      <div className={`absolute -right-6 -top-6 w-16 h-16 rounded-full bg-gradient-to-br ${color} opacity-20 blur-xl group-hover:opacity-30 transition`} />
      <div className="relative flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} grid place-items-center shadow-lg`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-lg font-display font-bold text-white">{value}</div>
          <div className="text-[10px] text-white/50">{label}</div>
        </div>
      </div>
    </div>
  );
}

/* shared */
export const inputCls = "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-cyan-400/50 text-white placeholder-white/30 text-sm";
export function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return <label className="block mb-3"><span className="text-[11px] uppercase tracking-wider text-white/50 mb-1.5 block font-mono">{label}</span>{children}</label>;
}
export function Modal({ title, children, onClose, wide }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className={`w-full ${wide?"max-w-2xl":"max-w-md"} bg-[#0b1224] border border-white/10 rounded-2xl p-6 max-h-[90vh] overflow-auto`} onClick={(e)=>e.stopPropagation()}>
        <h3 className="text-lg font-display font-bold text-white mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}
