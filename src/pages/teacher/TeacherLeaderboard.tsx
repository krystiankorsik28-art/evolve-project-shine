import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Trophy, Medal, Crown } from "lucide-react";

interface Row { name: string; percent: number; score: number; submitted_at: string | null; }

export default function TeacherLeaderboard() {
  const { user } = useAuth();
  const [exams, setExams] = useState<{ id: string; title: string }[]>([]);
  const [examId, setExamId] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    document.title = "Ranking uczniów — EduNex.pl";
    if (!user) return;
    supabase.from("exams").select("id,title").eq("created_by", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { setExams(data ?? []); if (data?.[0]) setExamId(data[0].id); });
  }, [user]);

  useEffect(() => {
    if (!examId) return;
    supabase.from("attempts")
      .select("student_name,percent,score,submitted_at")
      .eq("exam_id", examId)
      .not("percent", "is", null)
      .order("percent", { ascending: false })
      .then(({ data }) => {
        setRows((data ?? []).map(d => ({
          name: d.student_name,
          percent: Number(d.percent) || 0,
          score: Number(d.score) || 0,
          submitted_at: d.submitted_at,
        })));
      });
  }, [examId]);

  const podium = (i: number) => {
    if (i === 0) return { icon: Crown, cls: "text-gold drop-shadow-[0_0_10px_hsl(var(--gold)/0.6)]", bg: "from-gold/30 to-gold/5 border-gold/40" };
    if (i === 1) return { icon: Trophy, cls: "text-accent", bg: "from-accent/20 to-transparent border-accent/30" };
    if (i === 2) return { icon: Medal, cls: "text-flag-red", bg: "from-flag-red/20 to-transparent border-flag-red/30" };
    return { icon: null, cls: "text-muted-foreground", bg: "" };
  };

  return (
    <AppShell title="Ranking uczniów" subtitle="Top wyników w wybranym egzaminie">
      <Card className="p-5 mb-6">
        <Select value={examId} onValueChange={setExamId}>
          <SelectTrigger className="w-full md:w-96"><SelectValue placeholder="Wybierz egzamin" /></SelectTrigger>
          <SelectContent>{exams.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}</SelectContent>
        </Select>
      </Card>

      <div className="space-y-2">
        {rows.length === 0 && <Card className="p-8 text-center text-muted-foreground">Brak wyników do wyświetlenia.</Card>}
        {rows.map((r, i) => {
          const p = podium(i);
          return (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className={`p-4 flex items-center gap-4 hover-lift ${i < 3 ? `bg-gradient-to-r ${p.bg} border` : ""}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-xl ${i < 3 ? "bg-background/50" : "bg-secondary"}`}>
                  {p.icon ? <p.icon className={`h-6 w-6 ${p.cls}`} /> : <span className="text-muted-foreground">#{i + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{r.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.submitted_at ? new Date(r.submitted_at).toLocaleString("pl-PL") : "—"}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-display font-bold ${i === 0 ? "text-gradient-gold" : ""}`}>{r.percent}%</div>
                  <div className="text-xs text-muted-foreground">{r.score} pkt</div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </AppShell>
  );
}
