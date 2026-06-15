import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Radio, Plus, Play, Square, Trash2, Loader2, Copy, ChevronRight, Trophy, Sparkles, ChevronLeft, BarChart3, Medal, Users, Timer, Shuffle, Zap } from "lucide-react";
import { Modal, Field, inputCls } from "./Egzaminy";
import { confirmDialog } from "@/components/ConfirmDialog";

type LiveQ = { prompt: string; options: string[]; correct: number; time_sec?: number };
type Session = { id: string; title: string; pin_code: string; status: "lobby"|"active"|"ended"; current_question_index: number; questions: unknown; created_at: string; question_started_at?: string | null; time_per_question?: number | null; time_bonus?: boolean | null; shuffle_questions?: boolean | null };
type Participant = { id: string; nickname: string; score: number; joined_at: string; answers?: unknown };

export function LiveQuiz() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [opened, setOpened] = useState<Session | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("live_sessions").select("*").order("created_at", { ascending: false });
    setSessions((data ?? []) as Session[]);
    setLoading(false);
  };
  useEffect(()=>{ load(); }, []);

  const remove = async (s: Session) => {
    if (!(await confirmDialog({ description: "Usunąć sesję?" }))) return;
    await supabase.from("live_sessions").delete().eq("id", s.id);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-white">Live Quiz</h2>
          <p className="text-xs text-white/50">Quizy w czasie rzeczywistym z PIN-em — uczniowie dołączają na telefonie.</p>
        </div>
        <button onClick={()=>setCreating(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-semibold"><Plus className="w-4 h-4"/>Nowa sesja</button>
      </div>

      {loading ? <div className="py-12 text-center text-white/40"><Loader2 className="w-5 h-5 animate-spin inline"/></div> :
       sessions.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-white/40 text-sm">Brak sesji</div> :
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
         {sessions.map(s => (
           <div key={s.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-accent/30">
             <div className="flex items-start justify-between">
               <Radio className={`w-8 h-8 ${s.status==="active"?"text-emerald-400 animate-pulse":"text-cyan-300"}`}/>
               <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${s.status==="active"?"bg-emerald-500/15 text-emerald-300":s.status==="ended"?"bg-white/5 text-white/40":"bg-amber-500/15 text-amber-300"}`}>{s.status.toUpperCase()}</span>
             </div>
             <div className="text-lg font-display font-bold text-white mt-3">{s.title}</div>
             <div className="flex items-center gap-2 mt-2">
               <span className="font-mono text-2xl text-cyan-300 tracking-widest">{s.pin_code}</span>
               <button onClick={()=>{navigator.clipboard.writeText(s.pin_code); toast.success("Skopiowano");}} className="text-white/40 hover:text-white"><Copy className="w-3.5 h-3.5"/></button>
             </div>
             <div className="flex gap-1 mt-4 pt-3 border-t border-white/5">
               <button onClick={()=>setOpened(s)} className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-sm text-white/80 inline-flex items-center justify-center gap-1.5">Otwórz <ChevronRight className="w-3.5 h-3.5"/></button>
               <button onClick={()=>remove(s)} className="p-2 rounded-lg hover:bg-white/10 text-pink-400"><Trash2 className="w-4 h-4"/></button>
             </div>
           </div>
         ))}
       </div>}

      {creating && <NewSession onClose={()=>{setCreating(false); load();}}/>}
      {opened && <SessionView s={opened} onClose={()=>{setOpened(null); load();}}/>}
    </div>
  );
}

function NewSession({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<LiveQ[]>([{ prompt: "", options: ["","","",""], correct: 0, time_sec: 20 }]);
  const [busy, setBusy] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(5);
  const [aiBusy, setAiBusy] = useState(false);
  const [timePerQuestion, setTimePerQuestion] = useState(20);
  const [timeBonus, setTimeBonus] = useState(true);
  const [shuffleQ, setShuffleQ] = useState(false);

  const aiGenerate = async () => {
    if (!aiTopic.trim()) return toast.error("Wpisz temat");
    setAiBusy(true);
    try {
      const { aiGenerateQuestions } = await import("@/lib/ai.functions");
      const out = await aiGenerateQuestions({ data: { topic: aiTopic, count: aiCount, difficulty: "medium" } });
      const mapped = (out as Array<{ prompt: string; question_type: string; options?: string[]; correct_answer: unknown }>)
        .filter(q => q.question_type === "multiple_choice" && q.options && q.options.length >= 2)
        .map(q => {
          const opts = (q.options ?? []).slice(0,4);
          while (opts.length < 4) opts.push("");
          const correctStr = String(q.correct_answer);
          let correctIdx = opts.findIndex(o => o.trim().toLowerCase() === correctStr.trim().toLowerCase());
          if (correctIdx < 0) {
            const n = parseInt(correctStr, 10);
            if (!isNaN(n) && n >= 0 && n < opts.length) correctIdx = n;
            else correctIdx = 0;
          }
          return { prompt: q.prompt, options: opts, correct: correctIdx, time_sec: timePerQuestion };
        });
      if (mapped.length === 0) return toast.error("AI nie zwróciło pytań ABCD");
      setQuestions(prev => [...prev.filter(q => q.prompt.trim()), ...mapped]);
      if (!title) setTitle(aiTopic);
      toast.success(`Dodano ${mapped.length} pytań`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Błąd AI"); } finally { setAiBusy(false); }
  };

  const save = async () => {
    if (!title.trim()) return toast.error("Tytuł");
    const valid = questions.filter(q => q.prompt.trim() && q.options.filter(o=>o.trim()).length >= 2);
    if (valid.length === 0) return toast.error("Dodaj przynajmniej 1 pytanie");
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return toast.error("Brak sesji"); }
    let final = valid.map(q => ({ ...q, time_sec: q.time_sec || timePerQuestion }));
    if (shuffleQ) final = [...final].sort(() => Math.random() - 0.5);
    const pin = String(Math.floor(100000 + Math.random()*900000));
    const { error } = await supabase.from("live_sessions").insert({
      title, pin_code: pin, status: "lobby", current_question_index: 0,
      questions: final, created_by: user.id,
      ...({ time_per_question: timePerQuestion, time_bonus: timeBonus, shuffle_questions: shuffleQ } as Record<string, unknown>),
    });
    if (error) { setBusy(false); return toast.error(error.message); }
    toast.success(`Utworzono. PIN: ${pin}`); setBusy(false); onClose();
  };
  return (
    <Modal title="Nowa sesja Live" onClose={onClose} wide>
      <Field label="Tytuł"><input value={title} onChange={(e)=>setTitle(e.target.value)} className={inputCls}/></Field>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <label className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-white/50 font-mono flex items-center gap-1"><Timer className="w-3 h-3"/>Czas / pytanie (s)</div>
          <input type="number" min={5} max={300} value={timePerQuestion} onChange={(e)=>setTimePerQuestion(Number(e.target.value))} className={inputCls + " mt-1"}/>
        </label>
        <label className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 flex flex-col">
          <div className="text-[10px] uppercase tracking-wider text-white/50 font-mono flex items-center gap-1"><Zap className="w-3 h-3"/>Bonus za szybkość</div>
          <button type="button" onClick={()=>setTimeBonus(v=>!v)} className={`mt-2 px-3 py-1.5 rounded-md text-xs font-semibold ${timeBonus?"bg-emerald-500/20 text-emerald-300 border border-emerald-400/30":"bg-white/5 text-white/50 border border-white/10"}`}>{timeBonus?"WŁ.":"WYŁ."}</button>
        </label>
        <label className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 flex flex-col">
          <div className="text-[10px] uppercase tracking-wider text-white/50 font-mono flex items-center gap-1"><Shuffle className="w-3 h-3"/>Losuj kolejność</div>
          <button type="button" onClick={()=>setShuffleQ(v=>!v)} className={`mt-2 px-3 py-1.5 rounded-md text-xs font-semibold ${shuffleQ?"bg-violet-500/20 text-violet-300 border border-accent/30":"bg-white/5 text-white/50 border border-white/10"}`}>{shuffleQ?"WŁ.":"WYŁ."}</button>
        </label>
      </div>

      <div className="rounded-xl border border-accent/30 bg-gradient-to-r from-accent/10 to-accent/10 p-3 mb-3">
        <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-violet-300"/><span className="text-sm font-semibold text-white">Generuj pytania AI</span></div>
        <div className="flex flex-wrap gap-2">
          <input value={aiTopic} onChange={(e)=>setAiTopic(e.target.value)} placeholder="Temat quizu, np. Pierwiastki chemiczne" className={inputCls + " flex-1 min-w-[200px]"}/>
          <input type="number" min={1} max={15} value={aiCount} onChange={(e)=>setAiCount(Number(e.target.value))} className={inputCls + " w-20"}/>
          <button disabled={aiBusy} onClick={aiGenerate} className="px-3 py-2 rounded-lg bg-violet-500 hover:bg-violet-400 text-white text-sm font-semibold disabled:opacity-50 inline-flex items-center gap-1.5">
            {aiBusy ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>} Generuj
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => (
          <div key={i} className="rounded-xl border border-white/10 p-3 bg-white/[0.02]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-cyan-300">PYTANIE {i+1}</span>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1 text-[11px] text-white/50"><Timer className="w-3 h-3"/>
                  <input type="number" min={5} max={300} value={q.time_sec ?? timePerQuestion} onChange={(e)=>setQuestions(questions.map((x,j)=>j===i?{...x, time_sec:Number(e.target.value)}:x))} className="w-16 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white text-xs"/>s
                </div>
                <button onClick={()=>setQuestions(questions.filter((_,j)=>j!==i))} className="p-1 rounded hover:bg-white/10 text-pink-400"><Trash2 className="w-3.5 h-3.5"/></button>
              </div>
            </div>
            <input value={q.prompt} onChange={(e)=>setQuestions(questions.map((x,j)=>j===i?{...x, prompt:e.target.value}:x))} placeholder="Treść pytania" className={inputCls + " mb-2"}/>
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((o, k) => (
                <div key={k} className="flex items-center gap-2">
                  <input type="radio" checked={q.correct===k} onChange={()=>setQuestions(questions.map((x,j)=>j===i?{...x, correct:k}:x))} className="accent-cyan-400"/>
                  <input value={o} onChange={(e)=>setQuestions(questions.map((x,j)=>j===i?{...x, options:x.options.map((y,l)=>l===k?e.target.value:y)}:x))} placeholder={`Opcja ${k+1}`} className={inputCls}/>
                </div>
              ))}
            </div>
          </div>
        ))}
        <button onClick={()=>setQuestions([...questions, { prompt:"", options:["","","",""], correct:0, time_sec: timePerQuestion }])} className="w-full py-2 rounded-lg border border-dashed border-white/15 text-white/50 hover:text-white hover:border-accent/30 text-sm">+ Dodaj pytanie</button>
      </div>
      <div className="flex justify-end gap-2 pt-3">
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm">Anuluj</button>
        <button disabled={busy} onClick={save} className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold text-sm disabled:opacity-50">{busy?"...":"Utwórz sesję"}</button>
      </div>
    </Modal>
  );
}

function SessionView({ s, onClose }: { s: Session; onClose: () => void }) {
  const [session, setSession] = useState<Session>(s);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: sess } = await supabase.from("live_sessions").select("*").eq("id", s.id).single();
      if (sess) setSession(sess as Session);
      const { data: pp } = await supabase.from("live_participants").select("*").eq("session_id", s.id).order("score", { ascending: false });
      setParticipants((pp ?? []) as Participant[]);
    };
    load();
    const ch = supabase.channel(`live-${s.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "live_participants", filter: `session_id=eq.${s.id}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "live_sessions", filter: `id=eq.${s.id}` }, load)
      .subscribe();
    const iv = setInterval(load, 3000);
    return () => { supabase.removeChannel(ch); clearInterval(iv); };
  }, [s.id]);

  const updateSession = (patch: Record<string, unknown>) => (supabase.from("live_sessions") as unknown as { update: (v: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: unknown }> } }).update(patch).eq("id", s.id);
  const start = async () => { await updateSession({ status: "active", started_at: new Date().toISOString(), question_started_at: new Date().toISOString() }); };
  const stop = async () => { await updateSession({ status: "ended", ended_at: new Date().toISOString() }); };
  const nextQ = async () => { await updateSession({ current_question_index: session.current_question_index + 1, question_started_at: new Date().toISOString() }); };
  const prevQ = async () => { if (session.current_question_index <= 0) return; await updateSession({ current_question_index: session.current_question_index - 1, question_started_at: new Date().toISOString() }); };
  const removeP = async (p: Participant) => { if (!(await confirmDialog({ description: `Wyrzucić ${p.nickname}?` }))) return; await supabase.from("live_participants").delete().eq("id", p.id); };

  const qs = Array.isArray(session.questions) ? session.questions as LiveQ[] : [];
  const currentQ = qs[session.current_question_index];
  const qTime = currentQ?.time_sec ?? session.time_per_question ?? 20;

  // Live countdown
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (session.status !== "active") return;
    const iv = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(iv);
  }, [session.status, session.current_question_index]);
  const elapsed = session.question_started_at ? Math.max(0, (now - new Date(session.question_started_at).getTime()) / 1000) : 0;
  const remaining = Math.max(0, qTime - elapsed);
  const pctTime = Math.min(100, (elapsed / qTime) * 100);

  // Statystyki odpowiedzi dla bieżącego pytania
  const answerStats = useMemo(() => {
    if (!currentQ) return null;
    const dist = new Array(currentQ.options.length).fill(0);
    let answered = 0;
    participants.forEach(p => {
      const ans = Array.isArray(p.answers) ? p.answers as Array<{ q: number; choice: number }> : [];
      const a = ans.find(x => x.q === session.current_question_index);
      if (a && typeof a.choice === "number" && a.choice >= 0 && a.choice < dist.length) {
        dist[a.choice]++;
        answered++;
      }
    });
    return { dist, answered };
  }, [participants, currentQ, session.current_question_index]);

  return (
    <Modal title={session.title} onClose={onClose} wide>
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-xl bg-gradient-to-r from-accent/10 to-accent/10 border border-white/10 mb-4">
        <div>
          <div className="text-xs text-white/50 font-mono">PIN DO DOŁĄCZENIA</div>
          <div className="flex items-center gap-2">
            <div className="text-4xl font-mono font-bold text-cyan-300 tracking-widest">{session.pin_code}</div>
            <button onClick={()=>{navigator.clipboard.writeText(session.pin_code); toast.success("Skopiowano");}} className="text-white/40 hover:text-white"><Copy className="w-4 h-4"/></button>
          </div>
          <div className="text-xs text-white/40 mt-1 inline-flex items-center gap-1"><Users className="w-3 h-3"/>{participants.length} uczestników</div>
        </div>
        <div className="flex gap-2">
          {session.status === "lobby" && <button onClick={start} className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-900 font-semibold text-sm inline-flex items-center gap-2"><Play className="w-4 h-4"/>Start</button>}
          {session.status === "active" && <>
            <button onClick={prevQ} disabled={session.current_question_index <= 0} className="px-3 py-2 rounded-lg bg-white/10 text-white font-semibold text-sm disabled:opacity-30 inline-flex items-center gap-1"><ChevronLeft className="w-4 h-4"/></button>
            <button onClick={nextQ} disabled={session.current_question_index >= qs.length - 1} className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-900 font-semibold text-sm disabled:opacity-50">Następne pytanie</button>
            <button onClick={stop} className="px-4 py-2 rounded-lg bg-pink-500 text-white font-semibold text-sm inline-flex items-center gap-2"><Square className="w-4 h-4"/>Zakończ</button>
          </>}
          {session.status === "ended" && <span className="px-3 py-2 rounded-lg bg-white/5 text-white/50 text-sm">Sesja zakończona</span>}
        </div>
      </div>

      {currentQ && session.status === "active" && (
        <div className="rounded-xl border border-accent/30 bg-cyan-500/5 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-mono text-cyan-300">PYTANIE {session.current_question_index+1}/{qs.length}</div>
            <div className="flex items-center gap-3">
              <div className={`inline-flex items-center gap-1 text-xs font-mono ${remaining < 5 ? "text-rose-300 animate-pulse" : "text-amber-300"}`}><Timer className="w-3.5 h-3.5"/>{Math.ceil(remaining)}s</div>
              <div className="text-xs text-white/50 inline-flex items-center gap-1"><BarChart3 className="w-3 h-3"/>{answerStats?.answered ?? 0}/{participants.length}</div>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-3">
            <div className={`h-full transition-all ${remaining < 5 ? "bg-gradient-to-r from-accent to-blue-500" : "bg-gradient-to-r from-accent to-blue-500"}`} style={{ width: `${100 - pctTime}%` }}/>
          </div>
          <div className="text-lg text-white font-semibold mb-3">{currentQ.prompt}</div>
          <div className="space-y-1.5">
            {currentQ.options.map((o, i) => {
              const cnt = answerStats?.dist[i] ?? 0;
              const pct = answerStats && answerStats.answered ? Math.round((cnt / answerStats.answered) * 100) : 0;
              const isCorrect = i === currentQ.correct;
              return (
                <div key={i} className={`relative rounded-lg p-2 overflow-hidden border ${isCorrect ? "border-emerald-400/40" : "border-white/10"}`}>
                  <div className={`absolute inset-y-0 left-0 ${isCorrect ? "bg-emerald-500/20" : "bg-cyan-500/15"}`} style={{ width: `${pct}%` }}/>
                  <div className="relative flex justify-between text-sm">
                    <span className="text-white">{String.fromCharCode(65+i)}. {o} {isCorrect && <span className="text-emerald-300 text-xs">✓</span>}</span>
                    <span className="text-white/60 font-mono text-xs">{cnt} · {pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {session.status === "ended" && participants.length > 0 && (
        <div className="rounded-xl border border-accent/30 bg-gradient-to-r from-accent/10 to-accent/10 p-4 mb-4">
          <h3 className="font-display font-bold text-amber-300 mb-3 inline-flex items-center gap-2"><Medal className="w-5 h-5"/>Podium</h3>
          <div className="grid grid-cols-3 gap-2">
            {participants.slice(0,3).map((p, i) => (
              <div key={p.id} className={`p-3 rounded-lg text-center ${i===0?"bg-amber-500/20 border border-amber-400/40":i===1?"bg-white/10 border border-white/20":"bg-orange-700/20 border border-orange-700/40"}`}>
                <div className="text-2xl">{i===0?"🥇":i===1?"🥈":"🥉"}</div>
                <div className="font-semibold text-white text-sm truncate">{p.nickname}</div>
                <div className="font-mono text-cyan-300">{p.score} pkt</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2 mb-3"><Trophy className="w-4 h-4 text-amber-300"/><span className="font-semibold text-white">Ranking ({participants.length})</span></div>
        {participants.length === 0 ? <div className="text-sm text-white/40 py-4 text-center">Brak uczestników</div> :
         <div className="space-y-1 max-h-72 overflow-auto">
           {participants.map((p, i) => (
             <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03]">
               <span className="text-sm text-white"><span className="text-white/40 font-mono mr-2">#{i+1}</span>{p.nickname}</span>
               <div className="flex items-center gap-2">
                 <span className="font-mono font-bold text-cyan-300">{p.score}</span>
                 <button onClick={()=>removeP(p)} className="p-1 rounded hover:bg-pink-500/15 text-pink-400/60 hover:text-pink-300"><Trash2 className="w-3 h-3"/></button>
               </div>
             </div>
           ))}
         </div>}
      </div>
    </Modal>
  );
}
