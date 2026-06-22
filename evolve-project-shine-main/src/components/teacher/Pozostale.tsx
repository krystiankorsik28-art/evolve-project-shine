import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart3, Trophy, BookOpen, MessagesSquare, Settings, Upload, Trash2, Loader2, Download, Plus, MessageCircle, Send, ChevronDown, ChevronLeft, ChevronRight, Check, Sparkles, X, BookText, GraduationCap, FlaskConical, Atom, Leaf, Globe, History, Monitor, Languages, ShieldCheck, Fingerprint, Building2, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Modal, Field, inputCls } from "./Egzaminy";
import { confirmDialog } from "@/components/ConfirmDialog";
import { AuthProvider } from "@/lib/auth/auth-context";
import { Setup2FA } from "@/components/auth/Setup2FA";
import { SessionManager } from "@/components/auth/SessionManager";
import { DeviceManager } from "@/components/auth/DeviceManager";
import { PasskeyAuth } from "@/components/auth/PasskeyAuth";
import { OrganizationManager } from "@/components/auth/OrganizationManager";

/* ===================== ANALITYKA ===================== */
export function Analityka() {
  const [stats, setStats] = useState<{ exams: number; attempts: number; avgScore: number; passRate: number; perExam: Array<{ name: string; avg: number; count: number }>; statusDist: Array<{ name: string; value: number }> }>({ exams: 0, attempts: 0, avgScore: 0, passRate: 0, perExam: [], statusDist: [] });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: exams } = await supabase.from("exams").select("id,title,status");
      const { data: attempts } = await supabase.from("attempts").select("exam_id,percent,passed,status").limit(2000);
      const ex = exams ?? []; const at = attempts ?? [];
      const finished = at.filter(a => a.percent != null);
      const avg = finished.length ? finished.reduce((s,a)=>s+(a.percent ?? 0),0)/finished.length : 0;
      const passed = finished.filter(a=>a.passed).length;
      const perExam = ex.map(e => {
        const eat = finished.filter(a=>a.exam_id===e.id);
        return { name: e.title.slice(0,15), avg: eat.length ? Math.round(eat.reduce((s,a)=>s+(a.percent??0),0)/eat.length) : 0, count: eat.length };
      }).filter(x=>x.count>0).slice(0,10);
      const statusDist = [
        { name: "Ukończone", value: at.filter(a=>a.status==="submitted"||a.status==="graded").length },
        { name: "W trakcie", value: at.filter(a=>a.status==="in_progress").length },
        { name: "Porzucone", value: at.filter(a=>a.status!=="submitted" && a.status!=="graded" && a.status!=="in_progress").length },
      ];
      setStats({ exams: ex.length, attempts: at.length, avgScore: Math.round(avg), passRate: finished.length ? Math.round((passed/finished.length)*100) : 0, perExam, statusDist });
      setLoading(false);
    })();
  }, []);
  const COLORS = ["#22d3ee","#a78bfa","#f472b6"];
  if (loading) return <div className="py-12 text-center text-white/40"><Loader2 className="w-5 h-5 animate-spin inline"/></div>;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Egzaminy" value={stats.exams} color="from-accent to-blue-500"/>
        <KPI label="Podejścia" value={stats.attempts} color="from-accent to-blue-500"/>
        <KPI label="Średni wynik" value={`${stats.avgScore}%`} color="from-accent to-blue-500"/>
        <KPI label="Zdawalność" value={`${stats.passRate}%`} color="from-accent to-blue-500"/>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="font-display font-bold text-white mb-3 inline-flex items-center gap-2"><BarChart3 className="w-4 h-4 text-cyan-300"/>Średnia % wg egzaminu</h3>
          {stats.perExam.length===0 ? <div className="text-sm text-white/40 py-8 text-center">Brak danych</div> :
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.perExam}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10}/>
              <YAxis stroke="#64748b" fontSize={10}/>
              <Tooltip contentStyle={{ background: "#0b1224", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}/>
              <Bar dataKey="avg" fill="#22d3ee" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="font-display font-bold text-white mb-3 inline-flex items-center gap-2"><BarChart3 className="w-4 h-4 text-violet-300"/>Status podejść</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={stats.statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {stats.statusDist.map((_,i)=><Cell key={i} fill={COLORS[i]}/>)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0b1224", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
function KPI({ label, value, color }: { label: string; value: string | number; color: string }) {
  return <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${color} opacity-20 blur-2xl`}/>
    <div className="text-3xl font-display font-bold text-white">{value}</div>
    <div className="text-xs text-white/50 mt-1">{label}</div>
  </div>;
}

/* ===================== RANKING ===================== */
export function Ranking() {
  const [rows, setRows] = useState<Array<{ name: string; avg: number; count: number; best: number }>>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("attempts").select("student_name,percent,passed").not("percent","is",null).limit(2000);
    const map = new Map<string, { sum: number; count: number; best: number }>();
    (data ?? []).forEach(a => {
      const cur = map.get(a.student_name) ?? { sum: 0, count: 0, best: 0 };
      cur.sum += a.percent ?? 0; cur.count += 1; cur.best = Math.max(cur.best, a.percent ?? 0);
      map.set(a.student_name, cur);
    });
    const arr = Array.from(map.entries()).map(([name, v]) => ({ name, avg: Math.round(v.sum/v.count), count: v.count, best: Math.round(v.best) }));
    arr.sort((a,b)=>b.avg-a.avg);
    setRows(arr); setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const deleteStudent = async (name: string) => {
    const ok = await confirmDialog({ title: "Usunąć ucznia z rankingu?", message: `Wszystkie podejścia ucznia "${name}" zostaną usunięte. Tej operacji nie można cofnąć.`, confirmLabel: "Usuń" });
    if (!ok) return;
    const { error } = await supabase.from("attempts").delete().eq("student_name", name);
    if (error) { toast.error(error.message); return; }
    toast.success(`Usunięto ${name} z rankingu`);
    void load();
  };

  if (loading) return <div className="py-12 text-center text-white/40"><Loader2 className="w-5 h-5 animate-spin inline"/></div>;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="text-xl font-display font-bold text-white inline-flex items-center gap-2 mb-4"><Trophy className="w-5 h-5 text-amber-300"/>Ranking uczniów</h2>
      {rows.length===0 ? <div className="text-center py-10 text-white/40 text-sm">Brak wyników</div> :
       <div className="space-y-2">
         {rows.map((r, i) => (
           <div key={r.name} className={`flex items-center justify-between p-3 rounded-xl ${i<3?"bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-400/20":"bg-white/[0.03] border border-white/10"}`}>
             <div className="flex items-center gap-3">
               <div className={`w-9 h-9 rounded-lg grid place-items-center font-bold ${i===0?"bg-amber-500 text-slate-900":i===1?"bg-slate-300 text-slate-900":i===2?"bg-amber-700 text-white":"bg-white/5 text-white/60"}`}>{i+1}</div>
               <div><div className="font-semibold text-white">{r.name}</div><div className="text-xs text-white/40">{r.count} podejść</div></div>
             </div>
             <div className="flex items-center gap-3">
               <div className="text-right"><div className="font-mono font-bold text-cyan-300 text-lg">{r.avg}%</div><div className="text-[10px] text-white/40">best {r.best}%</div></div>
               <button type="button" onClick={() => deleteStudent(r.name)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 transition" title="Usuń ucznia z rankingu"><Trash2 className="w-4 h-4"/></button>
             </div>
           </div>
         ))}
       </div>}
    </div>
  );
}

/* ===================== MATERIAŁY ===================== */
type Material = { id: string; title: string; file_path: string; subject: string | null; file_type: string | null; file_size: number | null; visible_to_students: boolean; created_at: string };
export function Materialy({ go }: { go?: (tab: string) => void }) {
  const [items, setItems] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("materials").select("*").order("created_at", { ascending: false });
    setItems((data ?? []) as Material[]);
    setLoading(false);
  };
  useEffect(()=>{ load(); }, []);

  const upload = async (file: File, title: string, subject: string) => {
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return toast.error("Brak sesji"); }
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("materials").upload(path, file);
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const { error } = await supabase.from("materials").insert({
      title, file_path: path, subject: subject || null,
      file_type: file.type, file_size: file.size, uploaded_by: user.id,
    });
    if (error) { setUploading(false); return toast.error(error.message); }
    toast.success("Wgrano"); setUploading(false); load();
  };

  const download = async (m: Material) => {
    const { data, error } = await supabase.storage.from("materials").createSignedUrl(m.file_path, 60);
    if (error || !data) return toast.error("Błąd pobierania");
    window.open(data.signedUrl, "_blank");
  };

  const remove = async (m: Material) => {
    if (!(await confirmDialog({ description: "Usunąć materiał?" }))) return;
    await supabase.storage.from("materials").remove([m.file_path]);
    await supabase.from("materials").delete().eq("id", m.id);
    load();
  };

  const toggleVis = async (m: Material) => {
    await supabase.from("materials").update({ visible_to_students: !m.visible_to_students }).eq("id", m.id);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-white inline-flex items-center gap-2"><BookOpen className="w-5 h-5 text-amber-300"/>Materiały</h2>
          <p className="text-xs text-white/50">Wgrywaj PDF, prezentacje, wideo dla uczniów.</p>
        </div>
        <UploadButton onUpload={upload} busy={uploading}/>
      </div>

      {/* Biblioteka podręczników */}
      <LibrarySection go={go} />

      {loading ? <div className="py-12 text-center text-white/40"><Loader2 className="w-5 h-5 animate-spin inline"/></div> :
       items.length===0 ? <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-white/40 text-sm">Brak materiałów</div> :
       <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
         {items.map(m => (
           <div key={m.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-accent/30">
             <div className="flex items-start justify-between">
               <BookOpen className="w-8 h-8 text-amber-300"/>
               <button onClick={()=>toggleVis(m)} className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${m.visible_to_students?"bg-emerald-500/15 text-emerald-300":"bg-white/5 text-white/40"}`}>{m.visible_to_students?"WIDOCZNY":"UKRYTY"}</button>
             </div>
             <div className="font-semibold text-white mt-2 truncate">{m.title}</div>
             <div className="text-xs text-white/40">{m.subject ?? "—"} · {m.file_size ? `${Math.round(m.file_size/1024)} KB` : ""}</div>
             <div className="flex gap-1 mt-3 pt-2 border-t border-white/5">
               <button onClick={()=>download(m)} className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-xs inline-flex items-center justify-center gap-1.5 text-white/80"><Download className="w-3.5 h-3.5"/>Pobierz</button>
               <button onClick={()=>remove(m)} className="p-2 rounded-lg hover:bg-white/10 text-pink-400"><Trash2 className="w-4 h-4"/></button>
             </div>
           </div>
         ))}
       </div>}
    </div>
  );
}

const subjects = [
  { icon: BookText, name: "Matematyka", color: "from-blue-500 to-cyan-400", chapters: ["Liczby i działania", "Algebra", "Geometria", "Statystyka", "Rachunek prawdopodobieństwa", "Funkcje"] },
  { icon: Atom, name: "Fizyka", color: "from-purple-500 to-pink-400", chapters: ["Mechanika", "Termodynamika", "Elektryczność", "Optyka", "Fale", "Fizyka jądrowa"] },
  { icon: FlaskConical, name: "Chemia", color: "from-green-500 to-emerald-400", chapters: ["Atomy i cząsteczki", "Reakcje chemiczne", "Kwasy i zasady", "Węglowodory", "Biochemia"] },
  { icon: Leaf, name: "Biologia", color: "from-emerald-500 to-teal-400", chapters: ["Komórka", "Genetyka", "Ekologia", "Anatomia człowieka", "Ewolucja"] },
  { icon: Languages, name: "Język polski", color: "from-rose-500 to-orange-400", chapters: ["Gramatyka", "Literatura", "Wypracowania", "Lektury", "Środki stylistyczne"] },
  { icon: Globe, name: "Geografia", color: "from-amber-500 to-yellow-400", chapters: ["Mapa i kartografia", "Klimat", "Ludność", "Gospodarka", "Regiony świata"] },
  { icon: History, name: "Historia", color: "from-red-500 to-rose-400", chapters: ["Starożytność", "Średniowiecze", "Nowożytność", "XIX wiek", "XX wiek"] },
  { icon: Monitor, name: "Informatyka", color: "from-indigo-500 to-violet-400", chapters: ["Programowanie", "Algorytmy", "Bazy danych", "Sieci", "Bezpieczeństwo"] },
];

function LibrarySection({ go }: { go?: (tab: string) => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleChapter = (subject: string, chapter: string) => {
    setSelected((p) => {
      const current = p[subject] ?? [];
      const next = current.includes(chapter) ? current.filter((c) => c !== chapter) : [...current, chapter];
      return { ...p, [subject]: next };
    });
  };

  const totalSelected = Object.values(selected).reduce((s, v) => s + v.length, 0);
  const canScrollLeft = () => { if (containerRef.current) containerRef.current.scrollBy({ left: -320, behavior: "smooth" }); };
  const canScrollRight = () => { if (containerRef.current) containerRef.current.scrollBy({ left: 320, behavior: "smooth" }); };

  return (
    <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/[0.06] to-accent/[0.06] p-5 relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-white inline-flex items-center gap-2"><BookText className="w-5 h-5 text-cyan-300"/>Biblioteka podręczników</h3>
          <p className="text-xs text-white/50">Przeglądaj podręczniki, zaznacz rozdziały i generuj egzamin z AI.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={canScrollLeft} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={canScrollRight} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Scrollable books */}
      <div ref={containerRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {subjects.map((s) => {
          const expanded = open[s.name];
          const selCount = (selected[s.name] ?? []).length;
          return (
            <div key={s.name} className="shrink-0 w-64 rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-accent/30 transition">
              <button onClick={() => setOpen((p) => ({ ...p, [s.name]: !p[s.name] }))} className="w-full flex items-center gap-3 p-3.5 hover:bg-white/[0.05] transition">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} grid place-items-center shrink-0`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-white text-sm truncate">{s.name}</div>
                  <div className="text-[10px] text-white/40">{s.chapters.length} rozdziałów{selCount > 0 ? ` · ${selCount} wybrano` : ""}</div>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/30 shrink-0 transition ${expanded ? "rotate-180" : ""}`} />
              </button>
              {expanded && (
                <div className="px-3 pb-3 space-y-1 max-h-56 overflow-y-auto">
                  {s.chapters.map((ch) => {
                    const checked = (selected[s.name] ?? []).includes(ch);
                    return (
                      <button key={ch} onClick={() => toggleChapter(s.name, ch)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition ${checked ? "bg-cyan-500/15 text-cyan-200" : "text-white/70 hover:bg-white/[0.04]"}`}>
                        <div className={`w-4 h-4 rounded border flex-shrink-0 grid place-items-center transition ${checked ? "bg-cyan-400 border-cyan-400" : "border-white/20"}`}>
                          {checked && <Check className="w-3 h-3 text-slate-900" />}
                        </div>
                        <span className="text-left">{ch}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selection bar */}
      {totalSelected > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-accent/30 bg-cyan-500/10 px-4 py-3">
          <div className="text-sm text-white/80">
            <span className="font-semibold text-cyan-200">{totalSelected}</span> rozdziałów wybranych z{" "}
            {Object.keys(selected).filter((k) => (selected[k] ?? []).length > 0).length} podręczników
          </div>
          <button onClick={() => { setSelected({}); }} className="text-xs text-white/50 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition">Wyczyść</button>
        </div>
      )}

      {totalSelected > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl border border-accent/40 bg-[#0a0f1f]/95 backdrop-blur-xl shadow-[0_16px_48px_-12px_rgba(0,0,0,0.8)] px-6 py-4 flex items-center gap-6">
          <div className="text-sm text-white/70 hidden sm:block">Zaznaczono <span className="font-bold text-cyan-200">{totalSelected}</span> rozdziałów</div>
          <button onClick={() => { localStorage.setItem("exam_selected", JSON.stringify(selected)); go?.("ai"); }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-accent to-blue-500 text-white font-semibold text-sm hover:shadow-[0_8px_24px_-8px_rgba(34,211,238,0.5)] transition">
            <Sparkles className="w-4 h-4" /> Generuj egzamin z AI
          </button>
          <button onClick={() => setSelected({})} className="p-2.5 rounded-xl hover:bg-white/5 text-white/50">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
function UploadButton({ onUpload, busy }: { onUpload: (f: File, t: string, s: string) => void; busy: boolean }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(""); const [subject, setSubject] = useState("");
  return <>
    <button onClick={()=>setOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-semibold"><Upload className="w-4 h-4"/>Wgraj</button>
    {open && <Modal title="Wgraj materiał" onClose={()=>setOpen(false)}>
      <Field label="Plik"><input type="file" onChange={(e)=>{ const f=e.target.files?.[0]??null; setFile(f); if(f && !title) setTitle(f.name); }} className={inputCls}/></Field>
      <Field label="Tytuł"><input value={title} onChange={(e)=>setTitle(e.target.value)} className={inputCls}/></Field>
      <Field label="Przedmiot"><input value={subject} onChange={(e)=>setSubject(e.target.value)} className={inputCls}/></Field>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={()=>setOpen(false)} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm">Anuluj</button>
        <button disabled={!file||busy} onClick={()=>{ if(file){ onUpload(file, title || file.name, subject); setOpen(false); }}} className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold text-sm disabled:opacity-50">{busy?"...":"Wgraj"}</button>
      </div>
    </Modal>}
  </>;
}

/* ===================== FORUM ===================== */
type Thread = { id: string; title: string; category: string; pinned: boolean; locked: boolean; created_by: string; created_at: string };
type Post = { id: string; thread_id: string; body: string; created_by: string; created_at: string };
export function Forum() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState<Thread | null>(null);
  const [creating, setCreating] = useState(false);
  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("forum_threads").select("*").order("pinned", { ascending: false }).order("updated_at", { ascending: false });
    setThreads((data ?? []) as Thread[]);
    setLoading(false);
  };
  useEffect(()=>{ load(); }, []);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-white inline-flex items-center gap-2"><MessagesSquare className="w-5 h-5 text-cyan-300"/>Forum</h2>
          <p className="text-xs text-white/50">Wątki dyskusyjne z uczniami i innymi nauczycielami.</p>
        </div>
        <button onClick={()=>setCreating(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-semibold"><Plus className="w-4 h-4"/>Nowy wątek</button>
      </div>
      {loading ? <div className="py-12 text-center text-white/40"><Loader2 className="w-5 h-5 animate-spin inline"/></div> :
       threads.length===0 ? <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-white/40 text-sm">Brak wątków</div> :
       <div className="space-y-2">
         {threads.map(t => (
           <button key={t.id} onClick={()=>setOpened(t)} className="w-full text-left rounded-xl border border-white/10 bg-white/[0.03] hover:border-accent/30 p-4 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <MessageCircle className="w-5 h-5 text-cyan-300"/>
               <div>
                 <div className="font-semibold text-white">{t.pinned && "📌 "}{t.title}</div>
                 <div className="text-xs text-white/40 font-mono">{t.category} · {new Date(t.created_at).toLocaleDateString("pl-PL")}</div>
               </div>
             </div>
           </button>
         ))}
       </div>}
      {creating && <NewThread onClose={()=>{setCreating(false); load();}}/>}
      {opened && <ThreadView t={opened} onClose={()=>setOpened(null)}/>}
    </div>
  );
}
function NewThread({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState(""); const [category, setCategory] = useState("general"); const [body, setBody] = useState("");
  const save = async () => {
    if (!title.trim()) return toast.error("Tytuł");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Brak sesji");
    const { data: th, error } = await supabase.from("forum_threads").insert({ title, category, created_by: user.id }).select().single();
    if (error || !th) return toast.error(error?.message ?? "Błąd");
    if (body.trim()) await supabase.from("forum_posts").insert({ thread_id: th.id, body, created_by: user.id });
    toast.success("Utworzono"); onClose();
  };
  return <Modal title="Nowy wątek" onClose={onClose}>
    <Field label="Tytuł"><input value={title} onChange={(e)=>setTitle(e.target.value)} className={inputCls}/></Field>
    <Field label="Kategoria"><select value={category} onChange={(e)=>setCategory(e.target.value)} className={inputCls}>
      <option value="general" className="bg-slate-900">Ogólne</option>
      <option value="dydaktyka" className="bg-slate-900">Dydaktyka</option>
      <option value="techniczne" className="bg-slate-900">Techniczne</option>
      <option value="ogłoszenia" className="bg-slate-900">Ogłoszenia</option>
    </select></Field>
    <Field label="Pierwsza wiadomość"><textarea rows={4} value={body} onChange={(e)=>setBody(e.target.value)} className={inputCls}/></Field>
    <div className="flex justify-end gap-2 pt-2">
      <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 text-white/70 text-sm">Anuluj</button>
      <button onClick={save} className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-900 font-semibold text-sm">Opublikuj</button>
    </div>
  </Modal>;
}
function ThreadView({ t, onClose }: { t: Thread; onClose: () => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [body, setBody] = useState("");
  const load = async () => {
    const { data } = await supabase.from("forum_posts").select("*").eq("thread_id", t.id).order("created_at");
    setPosts((data ?? []) as Post[]);
  };
  useEffect(()=>{ load(); }, [t.id]);
  const send = async () => {
    if (!body.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("forum_posts").insert({ thread_id: t.id, body, created_by: user.id });
    setBody(""); load();
  };
  return <Modal title={t.title} onClose={onClose} wide>
    <div className="space-y-3 max-h-[400px] overflow-auto pb-3">
      {posts.length===0 ? <div className="text-center text-white/40 py-6 text-sm">Brak wiadomości</div> :
       posts.map(p => (
        <div key={p.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="text-xs text-white/40 font-mono mb-1">{new Date(p.created_at).toLocaleString("pl-PL")}</div>
          <div className="text-sm text-white/90 whitespace-pre-wrap">{p.body}</div>
        </div>
       ))}
    </div>
    <div className="flex gap-2 border-t border-white/10 pt-3">
      <input value={body} onChange={(e)=>setBody(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&send()} placeholder="Napisz odpowiedź..." className={inputCls}/>
      <button onClick={send} className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-900 font-semibold text-sm inline-flex items-center gap-1.5"><Send className="w-4 h-4"/>Wyślij</button>
    </div>
  </Modal>;
}

/* ===================== USTAWIENIA ===================== */
type Profile = { id: string; user_id: string; first_name: string | null; last_name: string | null; display_name: string | null; phone: string | null; language: string; two_factor_enabled: boolean; avatar_url: string | null };
export function Ustawienia() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);
  const [pwd, setPwd] = useState("");
  const [tab, setTab] = useState<"profile" | "security" | "sessions" | "devices" | "orgs">("profile");
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      setProfile(data as Profile);
    })();
  }, []);
  const save = async () => {
    if (!profile) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({
      first_name: profile.first_name, last_name: profile.last_name,
      display_name: profile.display_name, phone: profile.phone,
      language: profile.language, two_factor_enabled: profile.two_factor_enabled,
    }).eq("user_id", profile.user_id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Zapisano profil");
  };
  const changePassword = async () => {
    if (pwd.length < 8) return toast.error("Min. 8 znaków");
    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) return toast.error(error.message);
    toast.success("Hasło zmienione"); setPwd("");
  };
  if (!profile) return <div className="py-12 text-center text-white/40"><Loader2 className="w-5 h-5 animate-spin inline"/></div>;

  const SETTINGS_TABS = [
    { id: "profile" as const, label: "Profil", icon: Settings },
    { id: "security" as const, label: "Bezpieczeństwo", icon: ShieldCheck },
    { id: "sessions" as const, label: "Sesje", icon: Globe },
    { id: "devices" as const, label: "Urządzenia", icon: Monitor },
    { id: "orgs" as const, label: "Organizacje", icon: Users },
  ];

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit flex-wrap">
        {SETTINGS_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${tab === t.id ? 'bg-accent/15 text-accent' : 'text-white/40 hover:text-white/60'}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="font-display font-bold text-white mb-4 inline-flex items-center gap-2"><Settings className="w-4 h-4 text-cyan-300"/>Profil</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Imię"><input value={profile.first_name ?? ""} onChange={(e)=>setProfile({...profile, first_name: e.target.value})} className={inputCls}/></Field>
              <Field label="Nazwisko"><input value={profile.last_name ?? ""} onChange={(e)=>setProfile({...profile, last_name: e.target.value})} className={inputCls}/></Field>
            </div>
            <Field label="Wyświetlana nazwa"><input value={profile.display_name ?? ""} onChange={(e)=>setProfile({...profile, display_name: e.target.value})} className={inputCls}/></Field>
            <Field label="Telefon"><input value={profile.phone ?? ""} onChange={(e)=>setProfile({...profile, phone: e.target.value})} className={inputCls}/></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Język"><select value={profile.language} onChange={(e)=>setProfile({...profile, language: e.target.value})} className={inputCls}>
                <option value="pl" className="bg-slate-900">Polski</option>
                <option value="en" className="bg-slate-900">English</option>
                <option value="de" className="bg-slate-900">Deutsch</option>
                <option value="fr" className="bg-slate-900">Français</option>
                <option value="es" className="bg-slate-900">Español</option>
                <option value="uk" className="bg-slate-900">Українська</option>
              </select></Field>
            </div>
            <button disabled={busy} onClick={save} className="mt-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold text-sm disabled:opacity-50">{busy?"...":"Zapisz profil"}</button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="font-display font-bold text-white mb-4">Zmiana hasła</h3>
            <Field label="Nowe hasło"><input type="password" value={pwd} onChange={(e)=>setPwd(e.target.value)} className={inputCls}/></Field>
            <button onClick={changePassword} className="px-4 py-2 rounded-lg bg-violet-500 hover:bg-violet-400 text-white font-semibold text-sm">Zmień hasło</button>
          </div>
        </div>
      )}

      {tab === "security" && (
        <div className="space-y-5">
          <Setup2FA />
          <PasskeyAuth />
        </div>
      )}

      {tab === "sessions" && <SessionManager />}
      {tab === "devices" && <DeviceManager />}
      {tab === "orgs" && <OrganizationManager />}
    </div>
  );
}
