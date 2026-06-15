import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity, AlertTriangle, Eye, Loader2, Trash2, Square, RefreshCw, Search, X,
  Download, CheckSquare, Square as SquareIcon, ChevronDown, ChevronUp, Clock,
  ShieldOff, Maximize, MonitorUp, AlertOctagon, Flag, Copy, Table,
  Shield, ShieldAlert, BrainCircuit, Gauge, Ban, Siren, Fingerprint,
} from "lucide-react";
import { toast } from "sonner";
import { confirmDialog } from "@/components/ConfirmDialog";

type Live = {
  attempt_id: string;
  exam_id: string;
  student_name: string | null;
  current_question: number;
  answered_count: number;
  total_questions: number;
  fullscreen_on: boolean;
  tab_hidden_count: number;
  blur_count: number;
  copy_count: number;
  paste_count: number;
  right_click_count: number;
  forbidden_key_count: number;
  suspicion_score: number;
  last_event_type: string | null;
  last_event_at: string | null;
  updated_at: string;
};

type Frame = { id: string; image_data: string; created_at: string };
type ExamRef = { id: string; title: string };
type AttemptRow = { id: string; status: string };

const RISK_COLORS = { high: "from-pink-500 to-rose-600", mid: "from-amber-500 to-orange-600", low: "from-emerald-500 to-teal-600" };
const RISK_BG = { high: "border-pink-500/40 bg-pink-500/[0.04]", mid: "border-amber-500/40 bg-amber-500/[0.03]", low: "border-white/10 bg-white/[0.02]" };

export function Monitoring() {
  const [rows, setRows] = useState<Live[]>([]);
  const [exams, setExams] = useState<Record<string, string>>({});
  const [attemptStatus, setAttemptStatus] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [focused, setFocused] = useState<Live | null>(null);
  const [q, setQ] = useState("");
  const [examFilter, setExamFilter] = useState<string>("");
  const [onlyActive, setOnlyActive] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"suspicion" | "name" | "progress">("suspicion");

  const load = useCallback(async () => {
    const [{ data: live }, { data: ex }] = await Promise.all([
      supabase.from("attempt_live_state").select("*").order("updated_at", { ascending: false }).limit(200),
      supabase.from("exams").select("id,title"),
    ]);
    setRows((live ?? []) as Live[]);
    const map: Record<string, string> = {};
    (ex ?? []).forEach((e) => { map[(e as ExamRef).id] = (e as ExamRef).title; });
    setExams(map);
    const ids = (live ?? []).map((l) => (l as Live).attempt_id);
    if (ids.length) {
      const { data: ats } = await supabase.from("attempts").select("id,status").in("id", ids);
      const m: Record<string, string> = {};
      (ats ?? []).forEach((a) => { m[(a as AttemptRow).id] = (a as AttemptRow).status; });
      setAttemptStatus(m);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase.channel("monitor")
      .on("postgres_changes", { event: "*", schema: "public", table: "attempt_live_state" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "attempts" }, load)
      .subscribe();
    const iv = setInterval(load, 5000);
    return () => { supabase.removeChannel(ch); clearInterval(iv); };
  }, [load]);

  const filtered = useMemo(() => {
    let f = rows.filter(r => {
      if (examFilter && r.exam_id !== examFilter) return false;
      if (onlyActive && attemptStatus[r.attempt_id] && attemptStatus[r.attempt_id] !== "in_progress") return false;
      if (q && !(r.student_name ?? "").toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    if (sortBy === "suspicion") f.sort((a, b) => b.suspicion_score - a.suspicion_score);
    else if (sortBy === "name") f.sort((a, b) => (a.student_name ?? "").localeCompare(b.student_name ?? ""));
    else if (sortBy === "progress") f.sort((a, b) => (b.answered_count / (b.total_questions || 1)) - (a.answered_count / (a.total_questions || 1)));
    return f;
  }, [rows, examFilter, onlyActive, q, attemptStatus, sortBy]);

  const stats = useMemo(() => {
    const high = filtered.filter(r => r.suspicion_score >= 30).length;
    const mid = filtered.filter(r => r.suspicion_score >= 10 && r.suspicion_score < 30).length;
    const noFs = filtered.filter(r => !r.fullscreen_on).length;
    const totalEvents = filtered.reduce((s, r) => s + r.tab_hidden_count + r.blur_count + r.copy_count + r.paste_count + r.right_click_count + r.forbidden_key_count, 0);
    return { total: filtered.length, high, mid, noFs, totalEvents };
  }, [filtered]);

  const risk = (s: number) => s >= 30 ? "high" : s >= 10 ? "mid" : "low";

  const cheatProbability = (r: Live): { label: string; pct: number; color: string } => {
    const raw = r.suspicion_score + r.tab_hidden_count * 3 + r.blur_count * 2 + r.copy_count * 4 + r.paste_count * 5 + r.right_click_count * 2 + r.forbidden_key_count * 6;
    const pct = Math.min(99, Math.round(raw / 2));
    if (pct >= 60) return { label: "BARDZO WYSOKIE", pct, color: "from-pink-500 to-rose-600" };
    if (pct >= 30) return { label: "PODWYŻSZONE", pct, color: "from-amber-500 to-orange-500" };
    if (pct >= 10) return { label: "NISKIE", pct, color: "from-yellow-400 to-amber-500" };
    return { label: "ZANEDBALNE", pct, color: "from-emerald-400 to-teal-500" };
  };

  const cheatBreakdown = (r: Live) => [
    { label: "Zmiana karty (TAB)", value: r.tab_hidden_count, weight: 3, max: 30 },
    { label: "Rozmycie (BLUR)", value: r.blur_count, weight: 2, max: 20 },
    { label: "Kopiowanie", value: r.copy_count, weight: 4, max: 40 },
    { label: "Wklejanie", value: r.paste_count, weight: 5, max: 50 },
    { label: "Prawy przycisk", value: r.right_click_count, weight: 2, max: 20 },
    { label: "Zabroniony klawisz", value: r.forbidden_key_count, weight: 6, max: 60 },
  ];

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(r => r.attempt_id)));
  };

  const stopExam = async (r: Live) => {
    if (!(await confirmDialog({ description: `Zatrzymać egzamin ${r.student_name ?? ""}?` }))) return;
    try {
      const { stopStudentAttempt } = await import("@/lib/proctoring.functions");
      await stopStudentAttempt({ data: { attempt_id: r.attempt_id } });
      toast.success("Zatrzymano"); load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Błąd"); }
  };

  const bulkStop = async () => {
    if (selected.size === 0) return toast.error("Zaznacz uczniów");
    if (!(await confirmDialog({ description: `Zatrzymać egzaminy ${selected.size} uczniom?` }))) return;
    try {
      const { stopStudentAttempt } = await import("@/lib/proctoring.functions");
      for (const id of selected) await stopStudentAttempt({ data: { attempt_id: id } });
      toast.success(`Zatrzymano ${selected.size}`); setSelected(new Set()); load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Błąd"); }
  };

  const removeMonitor = async (r: Live) => {
    if (!(await confirmDialog({ description: "Usunąć monitor?" }))) return;
    try {
      const { deleteLiveStateOnly } = await import("@/lib/proctoring.functions");
      await deleteLiveStateOnly({ data: { attempt_id: r.attempt_id } });
      toast.success("Monitor usunięty"); load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Błąd"); }
  };

  const removeAttempt = async (r: Live) => {
    if (!(await confirmDialog({ description: `USUNĄĆ podejście ${r.student_name ?? ""} wraz ze wszystkimi danymi?` }))) return;
    try {
      const { deleteStudentAttempt } = await import("@/lib/proctoring.functions");
      await deleteStudentAttempt({ data: { attempt_id: r.attempt_id } });
      toast.success("Usunięto"); load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Błąd"); }
  };

  const cleanupAll = async () => {
    const stale = rows.filter(r => attemptStatus[r.attempt_id] && attemptStatus[r.attempt_id] !== "in_progress");
    if (stale.length === 0) return toast.info("Brak nieaktywnych");
    if (!(await confirmDialog({ description: `Usunąć ${stale.length} nieaktywnych monitorów?` }))) return;
    try {
      const { deleteLiveStateOnly } = await import("@/lib/proctoring.functions");
      for (const r of stale) await deleteLiveStateOnly({ data: { attempt_id: r.attempt_id } });
      toast.success(`Usunięto ${stale.length}`); load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Błąd"); }
  };

  const exportCsv = () => {
    const header = "Uczeń,Egzamin,Punkty,Postęp,Ryzyko,TAB,BLUR,COPY,PASTE,RCLK,KEY,Fullscreen,Status\n";
    const body = filtered.map(r =>
      `"${r.student_name ?? ""}","${exams[r.exam_id] ?? ""}",${r.answered_count}/${r.total_questions},${r.total_questions ? Math.round(r.answered_count / r.total_questions * 100) : 0}%,${r.suspicion_score},${r.tab_hidden_count},${r.blur_count},${r.copy_count},${r.paste_count},${r.right_click_count},${r.forbidden_key_count},${r.fullscreen_on ? "TAK" : "NIE"},${attemptStatus[r.attempt_id] ?? ""}`
    ).join("\n");
    const blob = new Blob(["\uFEFF" + header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `monitoring_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV wyeksportowany");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-white inline-flex items-center gap-2">
            <MonitorUp className="w-5 h-5 text-emerald-300"/>Monitoring
          </h2>
          <p className="text-xs text-white/50">Na żywo · Postgres realtime · odświeżanie 5s</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportCsv} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs inline-flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5"/>CSV
          </button>
          <button onClick={load} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs inline-flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5"/>Odśwież
          </button>
          <button onClick={cleanupAll} className="px-3 py-1.5 rounded-lg bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 text-xs inline-flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5"/>Wyczyść nieaktywne
          </button>
        </div>
      </div>

      {/* Stats tiles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Tile color="from-accent to-blue-500" label="Aktywnych" value={stats.total} />
        <Tile color="from-accent to-blue-500" label="Średnie ryzyko" value={stats.mid} />
        <Tile color="from-accent to-blue-500" label="Wysokie ryzyko" value={stats.high} />
        <Tile color="from-accent to-blue-500" label="Bez fullscreen" value={stats.noFs} />
        <Tile color="from-accent to-blue-500" label="Zdarzenia" value={stats.totalEvents} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/10">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30"/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Szukaj ucznia..." className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 outline-none focus:border-sky-400/50"/>
        </div>
        <select value={examFilter} onChange={e => setExamFilter(e.target.value)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none">
          <option value="">Wszystkie egzaminy</option>
          {Object.entries(exams).map(([id, t]) => <option key={id} value={id}>{t}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none">
          <option value="suspicion">Ryzyko ↓</option>
          <option value="name">Nazwa A-Z</option>
          <option value="progress">Postęp ↓</option>
        </select>
        <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
          <input type="checkbox" checked={onlyActive} onChange={e => setOnlyActive(e.target.checked)} className="accent-cyan-400"/>
          tylko aktywne
        </label>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/10 border border-accent/20 text-xs text-cyan-200">
          <span className="font-semibold">{selected.size}</span> zaznaczonych
          <button onClick={bulkStop} className="ml-auto px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200">Zatrzymaj wszystkich</button>
          <button onClick={() => setSelected(new Set())} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white/70">Odznacz</button>
        </div>
      )}

      {/* Cards */}
      {loading ? (
        <div className="py-16 text-center text-white/40"><Loader2 className="w-6 h-6 animate-spin inline"/></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-white/40 text-sm">Brak aktywnych podejść</div>
      ) : (
        <>
          {/* Select all */}
          <div className="flex items-center gap-2 px-1">
            <button onClick={selectAll} className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition">
              {selected.size === filtered.length ? <CheckSquare className="w-3.5 h-3.5"/> : <SquareIcon className="w-3.5 h-3.5"/>}
              Zaznacz {selected.size === filtered.length ? "nic" : "wszystkich"} ({filtered.length})
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(r => {
              const lvl = risk(r.suspicion_score);
              const st = attemptStatus[r.attempt_id];
              const isActive = !st || st === "in_progress";
              const isExpanded = expandedCards.has(r.attempt_id);
              const totalEvents = r.tab_hidden_count + r.blur_count + r.copy_count + r.paste_count + r.right_click_count + r.forbidden_key_count;
              return (
                <div key={r.attempt_id} className={`relative rounded-2xl border ${RISK_BG[lvl]} p-4 transition hover:brightness-110`}>
                  {/* Select checkbox */}
                  <button onClick={() => toggleSelect(r.attempt_id)} className="absolute top-3 left-3 text-white/30 hover:text-white transition">
                    {selected.has(r.attempt_id) ? <CheckSquare className="w-4 h-4 text-cyan-400"/> : <SquareIcon className="w-4 h-4"/>}
                  </button>

                  {/* Risk indicator top-right */}
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-gradient-to-r ${RISK_COLORS[lvl]} text-white font-bold`}>
                      {lvl === "high" ? <AlertOctagon className="w-3 h-3"/> : lvl === "mid" ? <AlertTriangle className="w-3 h-3"/> : <Activity className="w-3 h-3"/>}
                      {r.suspicion_score}
                    </span>
                  </div>

                  {/* Student name + exam */}
                  <div className="mt-5 mb-2">
                    <div className="font-semibold text-white truncate">{r.student_name ?? "—"}</div>
                    <div className="text-[10px] font-mono text-white/40 uppercase truncate">{exams[r.exam_id] ?? r.exam_id.slice(0, 8)}</div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-[10px] text-white/50 font-mono mb-1">
                      <span>Postęp</span><span>{r.answered_count}/{r.total_questions}</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${RISK_COLORS[lvl]}`} style={{ width: `${r.total_questions ? (r.answered_count / r.total_questions) * 100 : 0}%` }}/>
                    </div>
                  </div>

                  {/* Suspicion bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-[10px] text-white/50 font-mono mb-1">
                      <span>Ryzyko</span><span>{r.suspicion_score}/100</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r from-accent to-blue-500`} style={{ width: `${Math.min(100, r.suspicion_score)}%` }}/>
                    </div>
                  </div>

                  {/* Quick info row */}
                  <div className="flex items-center justify-between text-[10px] text-white/50 font-mono mb-2">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>Pyt.{r.current_question}</span>
                    <span className={`flex items-center gap-1 ${r.fullscreen_on ? "text-emerald-300" : "text-pink-300"}`}>
                      <Maximize className="w-3 h-3"/>{r.fullscreen_on ? "FS" : "NO FS"}
                    </span>
                    <span className="flex items-center gap-1"><Flag className="w-3 h-3"/>{totalEvents} zdarzeń</span>
                  </div>

                  {/* Event stats grid */}
                  <div className="grid grid-cols-6 gap-1 text-[10px] font-mono mb-2">
                    <EventStat label="TAB" value={r.tab_hidden_count} />
                    <EventStat label="BLUR" value={r.blur_count} />
                    <EventStat label="COPY" value={r.copy_count} />
                    <EventStat label="PASTE" value={r.paste_count} />
                    <EventStat label="RCLK" value={r.right_click_count} />
                    <EventStat label="KEY" value={r.forbidden_key_count} />
                  </div>

                  {/* Expandable details */}
                  <button onClick={() => setExpandedCards(prev => { const n = new Set(prev); if (n.has(r.attempt_id)) n.delete(r.attempt_id); else n.add(r.attempt_id); return n; })} className="w-full flex items-center justify-center gap-1 text-[10px] text-white/40 hover:text-white/70 transition pb-1">
                    {isExpanded ? <><ChevronUp className="w-3 h-3"/>Mniej</> : <><ChevronDown className="w-3 h-3"/>Więcej</>}
                  </button>
                  {isExpanded && (
                    <>
                      {/* Anti-Cheat Intelligence Panel */}
                      <div className="mb-3 p-3 rounded-xl bg-gradient-to-br from-accent/[0.05] to-accent/[0.05] border border-accent/20">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldAlert className="w-4 h-4 text-rose-300"/>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-300">Anti-Cheat Intelligence</span>
                        </div>
                        {/* Cheating probability gauge */}
                        <div className="mb-3">
                          <div className="flex justify-between text-[9px] text-white/50 font-mono mb-1">
                            <span>Prawdopodobieństwo ściągania</span>
                            <span className="font-bold" style={{ color: cheatProbability(r).pct >= 60 ? "#f43f5e" : cheatProbability(r).pct >= 30 ? "#f59e0b" : "#10b981" }}>{cheatProbability(r).pct}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                            <div className={`h-full rounded-full bg-gradient-to-r ${cheatProbability(r).color} transition-all`} style={{ width: `${cheatProbability(r).pct}%` }}/>
                          </div>
                          <div className="text-[9px] text-white/40 font-mono mt-0.5">{cheatProbability(r).label}</div>
                        </div>
                        {/* Score breakdown */}
                        <div className="space-y-1">
                          {cheatBreakdown(r).map((c) => {
                            const pct = Math.min(100, Math.round((c.value * c.weight) / (c.max || 1) * 100));
                            return (
                              <div key={c.label} className="flex items-center gap-2 text-[9px] font-mono">
                                <span className="text-white/50 w-28 shrink-0">{c.label}</span>
                                <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                  <div className={`h-full rounded-full ${pct > 50 ? "bg-rose-400" : pct > 20 ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${pct}%` }}/>
                                </div>
                                <span className={`w-8 text-right font-bold ${pct > 50 ? "text-rose-300" : "text-white/60"}`}>{c.value}</span>
                              </div>
                            );
                          })}
                        </div>
                        {/* AI analysis */}
                        <div className="mt-3 pt-3 border-t border-white/[0.06]">
                          <div className="flex items-center gap-1.5 text-[9px] text-cyan-300/70 mb-1">
                            <BrainCircuit className="w-3 h-3"/>AI Analysis
                          </div>
                          <p className="text-[10px] text-white/50 italic leading-relaxed">
                            {r.suspicion_score >= 50
                              ? "Krytyczne wskaźniki ściągania. Zalecane natychmiastowe zatrzymanie egzaminu i weryfikacja."
                              : r.suspicion_score >= 20
                              ? "Podwyższone ryzyko. Monitoruj uważnie i rozważ wysłanie ostrzeżenia."
                              : r.suspicion_score >= 10
                              ? "Niewielkie anomalie. Prawdopodobnie przypadkowe zdarzenia."
                              : "Brak podejrzanych wzorców. Zachowanie zgodne z normą."}
                          </p>
                        </div>
                      </div>
                      {/* Event timeline */}
                      <div className="text-[10px] text-white/40 font-mono space-y-1 mb-2 p-2 rounded-lg bg-white/[0.03]">
                        <div className="flex items-center gap-1 text-cyan-300/60 mb-1"><Clock className="w-3 h-3"/>Ostatnie aktywności</div>
                        <div>ID podejścia: <span className="text-white/60">{r.attempt_id.slice(0, 12)}…</span></div>
                        <div>Ostatnie zdarzenie: <span className="text-white/60">{r.last_event_type ?? "—"}</span></div>
                        <div>Czas zdarzenia: <span className="text-white/60">{r.last_event_at ? new Date(r.last_event_at).toLocaleString("pl-PL") : "—"}</span></div>
                        <div>Aktualizacja: <span className="text-white/60">{new Date(r.updated_at).toLocaleString("pl-PL")}</span></div>
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-1">
                    <button onClick={() => setFocused(r)} className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/15 text-cyan-300 text-xs inline-flex items-center justify-center gap-1">
                      <Eye className="w-3.5 h-3.5"/>Podgląd
                    </button>
                    {isActive
                      ? <button onClick={() => stopExam(r)} className="px-2 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs inline-flex items-center justify-center gap-1">
                          <Square className="w-3.5 h-3.5"/>Stop
                        </button>
                      : <button onClick={() => removeMonitor(r)} className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs inline-flex items-center justify-center gap-1">
                          <ShieldOff className="w-3.5 h-3.5"/>Usuń
                        </button>}
                    <button onClick={() => removeAttempt(r)} className="col-span-2 px-2 py-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 text-xs inline-flex items-center justify-center gap-1">
                      <Trash2 className="w-3.5 h-3.5"/>Usuń podejście
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {focused && <FrameViewer row={focused} onClose={() => setFocused(null)} />}
    </div>
  );
}

function Tile({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 group hover:border-white/20 transition">
      <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full bg-gradient-to-br ${color} opacity-20 blur-2xl group-hover:opacity-30 transition`}/>
      <div className="text-2xl font-display font-bold text-white">{value}</div>
      <div className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

function EventStat({ label, value }: { label: string; value: number }) {
  const alerted = value > 0;
  return (
    <div className={`text-center py-1 rounded ${alerted ? "bg-pink-500/10 text-pink-300" : "bg-white/[0.03] text-white/40"}`}>
      <div className="font-bold text-xs">{value}</div>
      <div className="text-[7px] opacity-70 uppercase">{label}</div>
    </div>
  );
}

function FrameViewer({ row, onClose }: { row: Live; onClose: () => void }) {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [idx, setIdx] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("attempt_screen_frames").select("*").eq("attempt_id", row.attempt_id).order("created_at", { ascending: false }).limit(30);
      setFrames(((data ?? []) as Frame[]));
    };
    load();
    if (!autoRefresh) return;
    const iv = setInterval(load, 3000);
    return () => clearInterval(iv);
  }, [row.attempt_id, autoRefresh]);
  const current = frames[idx];
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="w-full max-w-5xl bg-gradient-to-b from-[#0b1224] to-[#070b17] border border-white/10 rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-display font-bold text-white">{row.student_name}</h3>
            <p className="text-[11px] text-white/40 font-mono">{frames.length} klatek · auto-odświeżanie {autoRefresh ? "ON" : "OFF"}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setAutoRefresh(v => !v)} className={`px-2 py-1 rounded text-[10px] font-mono ${autoRefresh ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-white/50"}`}>
              {autoRefresh ? "● AUTO" : "○ MANUAL"}
            </button>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-white/10 text-white/60"><X className="w-5 h-5"/></button>
          </div>
        </div>

        {/* Frame image */}
        {current ? (
          <>
            <img src={current.image_data} alt={`Klatka ${idx + 1}`} className="w-full rounded-xl border border-white/10 max-h-[60vh] object-contain bg-black/50"/>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-white/40 font-mono">{new Date(current.created_at).toLocaleString("pl-PL")}</span>
              <div className="flex items-center gap-2">
                <button disabled={idx >= frames.length - 1} onClick={() => setIdx(i => i + 1)} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 disabled:opacity-30 text-xs">‹ Starsza</button>
                <span className="font-mono text-sm text-white/70 font-bold">{idx + 1}<span className="text-white/40">/{frames.length}</span></span>
                <button disabled={idx <= 0} onClick={() => setIdx(i => i - 1)} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 disabled:opacity-30 text-xs">Nowsza ›</button>
              </div>
            </div>
            {/* Thumbnail strip */}
            <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
              {frames.map((f, i) => (
                <button key={f.id} onClick={() => setIdx(i)}
                  className={`shrink-0 w-12 h-9 rounded border-2 transition ${i === idx ? "border-cyan-400 opacity-100" : "border-transparent opacity-50 hover:opacity-80"}`}>
                  <img src={f.image_data} alt="" className="w-full h-full object-cover rounded"/>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="aspect-video grid place-items-center bg-white/[0.02] border border-dashed border-white/10 rounded-xl text-white/40 text-sm">
            Brak klatek — uczeń nie udostępnił ekranu
          </div>
        )}
      </div>
    </div>
  );
}
