import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/Logo";
import { Loader2, Clock, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Question {
  id: string; question_type: string; prompt: string;
  options: string[]; points: number; order_index: number;
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
        .select("id, question_type, prompt, options, points, order_index")
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
      <header className="border-b border-border bg-card sticky top-0 z-30">
        <div className="container flex items-center justify-between h-16">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">{answered}/{questions.length} odpowiedzi</div>
            <div className={`flex items-center gap-2 font-mono text-lg font-bold px-3 py-1 rounded-md ${timeLeft && timeLeft < 300 ? "bg-destructive/10 text-destructive" : "bg-secondary"}`}>
              <Clock className="h-4 w-4" /> {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </div>
          </div>
        </div>
        <div className="h-1 bg-secondary"><div className="h-full bg-gradient-gold transition-all" style={{ width: `${progress}%` }} /></div>
      </header>

      <main className="container max-w-3xl py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold">{attempt.exams.title}</h1>
        </div>

        <motion.div key={q.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-muted-foreground">Pytanie {current + 1} z {questions.length} · {q.points} pkt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">{q.prompt}</p>

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
