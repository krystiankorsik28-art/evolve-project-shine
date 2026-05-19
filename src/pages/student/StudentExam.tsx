import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/Logo";
import { Loader2, Clock, CheckCircle2, ShieldAlert, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Question {
  id: string; question_type: string; prompt: string;
  options: string[]; points: number; order_index: number;
  media_url?: string | null;
}

interface Attempt {
  id: string; exam_id: string; status: string; started_at: string;
  exams: { title: string; duration_minutes: number; description: string | null; show_results: boolean };
}

export default function StudentExam() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [violations, setViolations] = useState(0);
  const [acFullscreen, setAcFullscreen] = useState(false);
  const violationsRef = useRef(0);

  // Anti-cheat: log violation to proctoring_events
  const logEvent = async (event_type: string, metadata: Record<string, unknown> = {}) => {
    if (!attemptId) return;
    try {
      await supabase.from("proctoring_events").insert([{
        attempt_id: attemptId, event_type, metadata: metadata as never,
      }]);
    } catch { /* ignore */ }
  };

  const flagViolation = (type: string, msg: string) => {
    violationsRef.current += 1;
    setViolations(violationsRef.current);
    toast.warning(`⚠️ ${msg} (${violationsRef.current})`);
    logEvent(type, { count: violationsRef.current, ts: Date.now() });
  };

  useEffect(() => {
    document.title = "Egzamin — EduNex.pl";
    if (!attemptId) return;
    (async () => {
      const { data: a } = await supabase
        .from("attempts")
        .select("*, exams(title, duration_minutes, description, show_results)")
        .eq("id", attemptId)
        .maybeSingle();
      if (!a) { toast.error("Podejście nie znalezione"); navigate("/"); return; }
      if (a.status !== "in_progress") { navigate(`/student/results/${attemptId}`); return; }
      setAttempt(a as never);
      const { data: qs } = await supabase
        .from("questions")
        .select("id, question_type, prompt, options, points, order_index, media_url")
        .eq("exam_id", a.exam_id)
        .order("order_index");
      setQuestions((qs ?? []).map((q) => ({ ...q, options: Array.isArray(q.options) ? q.options as string[] : [] })) as never);

      const startedMs = new Date(a.started_at).getTime();
      const endMs = startedMs + (a.exams as { duration_minutes: number }).duration_minutes * 60 * 1000;
      setTimeLeft(Math.max(0, Math.floor((endMs - Date.now()) / 1000)));
      setLoading(false);
    })();
  }, [attemptId, navigate]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && attempt && !submitting) {
      toast.warning("Czas się skończył — automatyczne oddanie pracy");
      submit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // === ANTI-CHEAT ===
  useEffect(() => {
    if (!attempt) return;
    logEvent("exam_started", { ua: navigator.userAgent });

    const onVis = () => {
      if (document.hidden) flagViolation("tab_hidden", "Wyjście z karty wykryte");
    };
    const onBlur = () => flagViolation("window_blur", "Utrata fokusu okna");
    const onCopy = (e: ClipboardEvent) => { e.preventDefault(); flagViolation("copy_attempt", "Kopiowanie zablokowane"); };
    const onPaste = (e: ClipboardEvent) => { e.preventDefault(); flagViolation("paste_attempt", "Wklejanie zablokowane"); };
    const onContext = (e: MouseEvent) => { e.preventDefault(); flagViolation("right_click", "Prawy przycisk zablokowany"); };
    const onKey = (e: KeyboardEvent) => {
      // Block PrintScreen, Ctrl+P, Ctrl+S, F12, Ctrl+Shift+I
      if (e.key === "PrintScreen" || (e.ctrlKey && ["p", "s", "u"].includes(e.key.toLowerCase())) ||
          e.key === "F12" || (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()))) {
        e.preventDefault();
        flagViolation("forbidden_key", `Zablokowano ${e.key}`);
      }
    };
    const onFs = () => setAcFullscreen(!!document.fullscreenElement);
    const onBefore = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("contextmenu", onContext);
    document.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFs);
    window.addEventListener("beforeunload", onBefore);

    // Heartbeat co 15s
    const hb = setInterval(() => logEvent("heartbeat", { current_q: current, answered: Object.keys(responses).length }), 15000);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFs);
      window.removeEventListener("beforeunload", onBefore);
      clearInterval(hb);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt?.id]);

  const enterFullscreen = async () => {
    try { await document.documentElement.requestFullscreen(); }
    catch { toast.error("Twoja przeglądarka nie wspiera trybu pełnoekranowego"); }
  };

  const submit = async () => {
    if (!attempt || submitting) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-attempt", {
        body: { attempt_id: attempt.id, responses },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error ?? "Błąd zapisu");
      toast.success("Praca oddana");
      sessionStorage.removeItem("edunex_student");
      navigate(`/student/results/${attempt.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd");
      setSubmitting(false);
    }
  };

  if (loading || !attempt) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md"><CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Egzamin nie zawiera pytań. Skontaktuj się z nauczycielem.</p>
        </CardContent></Card>
      </div>
    );
  }

  const q = questions[current];
  const mins = Math.floor((timeLeft ?? 0) / 60);
  const secs = (timeLeft ?? 0) % 60;
  const answered = Object.keys(responses).length;
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-30 shadow-sm">
        <div className="container flex items-center justify-between h-16 gap-4">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="font-mono font-bold text-foreground tabular-nums">{answered}</span>
              <span className="text-muted-foreground">/ {questions.length} odp.</span>
            </div>
            {violations > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold">
                <ShieldAlert className="h-3.5 w-3.5" /> {violations}
              </div>
            )}
            {!acFullscreen && (
              <Button size="sm" variant="outline" onClick={enterFullscreen} className="hidden md:inline-flex">
                <Eye className="h-3.5 w-3.5 mr-1.5" /> Pełny ekran
              </Button>
            )}
            <div className={`flex items-center gap-2 font-mono text-base font-bold px-3 py-1.5 rounded-lg border ${timeLeft && timeLeft < 300 ? "bg-destructive/10 text-destructive border-destructive/30 animate-pulse" : "bg-secondary text-foreground border-border"}`}>
              <Clock className="h-4 w-4" /> <span className="tabular-nums">{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
        <div className="h-1 bg-secondary"><div className="h-full bg-gradient-gold transition-all" style={{ width: `${progress}%` }} /></div>
      </header>

      <main className="container max-w-3xl py-8 px-4">
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-1">Egzamin</div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-foreground text-balance">{attempt.exams.title}</h1>
        </div>

        <motion.div key={q.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-muted-foreground">Pytanie {current + 1} z {questions.length} · {q.points} pkt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">{q.prompt}</p>
              {q.media_url && (
                <div className="rounded-lg overflow-hidden border border-border bg-secondary/40">
                  <img src={q.media_url} alt="Załącznik do pytania" className="w-full max-h-[420px] object-contain" loading="lazy" />
                </div>
              )}

              {(q.question_type === "single_choice" || q.question_type === "true_false") && (
                <div className="space-y-2">
                  {q.options.map((opt, i) => (
                    <button key={i} onClick={() => setResponses({ ...responses, [q.id]: i })}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-smooth ${responses[q.id] === i ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {q.question_type === "multiple_choice" && (
                <div className="space-y-2">
                  {q.options.map((opt, i) => {
                    const selected = Array.isArray(responses[q.id]) ? (responses[q.id] as number[]).includes(i) : false;
                    return (
                      <button key={i} onClick={() => {
                        const cur = Array.isArray(responses[q.id]) ? responses[q.id] as number[] : [];
                        const nr = cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i];
                        setResponses({ ...responses, [q.id]: nr });
                      }}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-smooth ${selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                        {selected && <CheckCircle2 className="h-4 w-4 inline mr-2 text-primary" />}{opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {(q.question_type === "short_answer" || q.question_type === "essay") && (
                <Textarea value={(responses[q.id] as string) ?? ""} onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })} rows={q.question_type === "essay" ? 8 : 3} placeholder="Twoja odpowiedź..." maxLength={5000} />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" disabled={current === 0} onClick={() => setCurrent(current - 1)}>← Poprzednie</Button>
          {current < questions.length - 1 ? (
            <Button onClick={() => setCurrent(current + 1)}>Następne →</Button>
          ) : (
            <Button onClick={submit} disabled={submitting} className="bg-success hover:bg-success/90">
              {submitting ? "Zapisywanie..." : "Oddaj pracę"}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
