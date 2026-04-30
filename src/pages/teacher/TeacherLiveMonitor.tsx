import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, ShieldAlert, Eye, Loader2, RefreshCw, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";

interface LiveAttempt {
  id: string;
  exam_id: string;
  student_name: string;
  status: string;
  started_at: string;
  exams: { title: string; duration_minutes: number; created_by: string } | null;
}
interface ProctorEvent {
  id: string;
  attempt_id: string;
  event_type: string;
  created_at: string;
}

const VIOLATION_TYPES = ["tab_hidden", "window_blur", "copy_attempt", "paste_attempt", "right_click", "forbidden_key"];

export default function TeacherLiveMonitor() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<LiveAttempt[]>([]);
  const [events, setEvents] = useState<ProctorEvent[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    // Pobierz egzaminy nauczyciela
    const { data: myExams } = await supabase.from("exams").select("id").eq("created_by", user.id);
    const examIds = (myExams ?? []).map((e) => e.id);
    if (examIds.length === 0) { setAttempts([]); setLoading(false); return; }

    const { data: atts } = await supabase
      .from("attempts")
      .select("id, exam_id, student_name, status, started_at, exams(title, duration_minutes, created_by)")
      .in("exam_id", examIds)
      .eq("status", "in_progress")
      .order("started_at", { ascending: false });
    setAttempts((atts ?? []) as never);

    const ids = (atts ?? []).map((a) => a.id);
    if (ids.length > 0) {
      const { data: ev } = await supabase
        .from("proctoring_events")
        .select("id, attempt_id, event_type, created_at")
        .in("attempt_id", ids)
        .order("created_at", { ascending: false })
        .limit(500);
      setEvents((ev ?? []) as never);

      const counts: Record<string, number> = {};
      for (const id of ids) {
        const { count } = await supabase.from("answers").select("*", { count: "exact", head: true }).eq("attempt_id", id);
        counts[id] = count ?? 0;
      }
      setAnswers(counts);
    } else {
      setEvents([]); setAnswers({});
    }
    setLoading(false);
  };

  useEffect(() => {
    document.title = "Live monitoring — EduNex.pl";
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Realtime subscriptions
  useEffect(() => {
    const ch = supabase
      .channel("teacher-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "attempts" }, () => load())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "proctoring_events" }, (payload) => {
        const ev = payload.new as ProctorEvent;
        setEvents((prev) => [ev, ...prev].slice(0, 500));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "answers" }, (payload) => {
        const a = payload.new as { attempt_id: string };
        setAnswers((prev) => ({ ...prev, [a.attempt_id]: (prev[a.attempt_id] ?? 0) + 1 }));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const violationsByAttempt = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of events) if (VIOLATION_TYPES.includes(e.event_type)) m[e.attempt_id] = (m[e.attempt_id] ?? 0) + 1;
    return m;
  }, [events]);

  return (
    <AppShell title="Live monitoring egzaminów" subtitle="Aktywne podejścia uczniów w czasie rzeczywistym">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
            </span>
            Połączono na żywo
          </div>
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4 mr-2" /> Odśwież</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
        ) : attempts.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-40" />
            Brak aktywnych podejść. Live monitoring pokazuje uczniów rozwiązujących Twoje egzaminy w tym momencie.
          </CardContent></Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attempts.map((a) => {
              const v = violationsByAttempt[a.id] ?? 0;
              const ansCount = answers[a.id] ?? 0;
              const elapsed = Math.floor((Date.now() - new Date(a.started_at).getTime()) / 60000);
              const dur = a.exams?.duration_minutes ?? 60;
              const remaining = Math.max(0, dur - elapsed);
              const lastEv = events.filter((e) => e.attempt_id === a.id).slice(0, 3);
              return (
                <motion.div key={a.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className={v >= 3 ? "border-destructive/50" : v > 0 ? "border-warning/40" : ""}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base truncate">{a.student_name}</CardTitle>
                          <p className="text-xs text-muted-foreground truncate">{a.exams?.title ?? "—"}</p>
                        </div>
                        {v > 0 && (
                          <Badge className="bg-destructive/10 text-destructive border-destructive/30">
                            <ShieldAlert className="h-3 w-3 mr-1" /> {v}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-muted-foreground" /> {ansCount} odp.</div>
                        <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-muted-foreground" /> {remaining} min</div>
                      </div>
                      {lastEv.length > 0 && (
                        <div className="text-[11px] space-y-0.5 border-t border-border pt-2">
                          {lastEv.map((e) => (
                            <div key={e.id} className={`truncate ${VIOLATION_TYPES.includes(e.event_type) ? "text-destructive" : "text-muted-foreground"}`}>
                              · {e.event_type} · {new Date(e.created_at).toLocaleTimeString("pl-PL")}
                            </div>
                          ))}
                        </div>
                      )}
                      <Button asChild size="sm" variant="outline" className="w-full">
                        <Link to={`/teacher/exams/${a.exam_id}`}>Zobacz egzamin</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
