import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid, Legend,
} from "recharts";
import { Activity, TrendingUp, Award, Users, FileCheck2, Percent } from "lucide-react";

interface Stats {
  totalExams: number;
  totalAttempts: number;
  totalSubmitted: number;
  avgScore: number;
  passRate: number;
  uniqueStudents: number;
}

const COLORS = ["hsl(188 95% 50%)", "hsl(215 90% 55%)", "hsl(43 92% 52%)", "hsl(354 78% 50%)", "hsl(152 65% 45%)"];

export default function TeacherAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalExams: 0, totalAttempts: 0, totalSubmitted: 0, avgScore: 0, passRate: 0, uniqueStudents: 0 });
  const [examChart, setExamChart] = useState<{ name: string; attempts: number; avg: number }[]>([]);
  const [trend, setTrend] = useState<{ date: string; attempts: number }[]>([]);
  const [pie, setPie] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    document.title = "Analityka — EduNex.pl";
    if (!user) return;
    (async () => {
      const { data: exams } = await supabase.from("exams").select("id,title,passing_score").eq("created_by", user.id);
      const examIds = (exams ?? []).map(e => e.id);
      if (examIds.length === 0) return;
      const { data: attempts } = await supabase
        .from("attempts")
        .select("id,exam_id,status,percent,passed,started_at,student_name")
        .in("exam_id", examIds);

      const all = attempts ?? [];
      const submitted = all.filter(a => a.status === "submitted" || a.status === "graded" || a.percent != null);
      const passed = submitted.filter(a => a.passed).length;
      const avg = submitted.length ? submitted.reduce((s, a) => s + (Number(a.percent) || 0), 0) / submitted.length : 0;
      const uniqueNames = new Set(all.map(a => a.student_name)).size;

      setStats({
        totalExams: exams?.length ?? 0,
        totalAttempts: all.length,
        totalSubmitted: submitted.length,
        avgScore: Math.round(avg),
        passRate: submitted.length ? Math.round((passed / submitted.length) * 100) : 0,
        uniqueStudents: uniqueNames,
      });

      // Per-exam chart
      const byExam = (exams ?? []).map(e => {
        const examAttempts = all.filter(a => a.exam_id === e.id);
        const subm = examAttempts.filter(a => a.percent != null);
        const a = subm.length ? subm.reduce((s, x) => s + Number(x.percent), 0) / subm.length : 0;
        return { name: e.title.slice(0, 18), attempts: examAttempts.length, avg: Math.round(a) };
      });
      setExamChart(byExam.slice(0, 8));

      // Trend last 14 days
      const now = new Date();
      const days: { date: string; attempts: number }[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(5, 10);
        const cnt = all.filter(a => a.started_at?.slice(5, 10) === key).length;
        days.push({ date: key, attempts: cnt });
      }
      setTrend(days);

      // Pie - score distribution
      const buckets = { "0-49%": 0, "50-69%": 0, "70-89%": 0, "90-100%": 0 };
      submitted.forEach(a => {
        const p = Number(a.percent) || 0;
        if (p < 50) buckets["0-49%"]++;
        else if (p < 70) buckets["50-69%"]++;
        else if (p < 90) buckets["70-89%"]++;
        else buckets["90-100%"]++;
      });
      setPie(Object.entries(buckets).map(([name, value]) => ({ name, value })));
    })();
  }, [user]);

  const kpis = [
    { label: "Egzaminy", value: stats.totalExams, icon: FileCheck2, color: "text-accent" },
    { label: "Wszystkie podejścia", value: stats.totalAttempts, icon: Activity, color: "text-primary-glow" },
    { label: "Oddane", value: stats.totalSubmitted, icon: TrendingUp, color: "text-success" },
    { label: "Średni wynik", value: `${stats.avgScore}%`, icon: Percent, color: "text-gold" },
    { label: "Zdawalność", value: `${stats.passRate}%`, icon: Award, color: "text-success" },
    { label: "Uczniowie", value: stats.uniqueStudents, icon: Users, color: "text-flag-red" },
  ];

  return (
    <AppShell title="Analityka" subtitle="Wykresy, trendy, KPI Twoich egzaminów">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 bg-gradient-card border-border/60 hover-lift">
              <div className="flex items-center justify-between mb-2">
                <k.icon className={`h-5 w-5 ${k.color}`} />
              </div>
              <div className="text-2xl font-bold font-display">{k.value}</div>
              <div className="text-xs text-muted-foreground">{k.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart className="h-4 w-4" /> Średni wynik per egzamin</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={examChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="avg" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Aktywność (14 dni)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="attempts" stroke="hsl(var(--primary-glow))" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Award className="h-4 w-4" /> Rozkład wyników</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
    </AppShell>
  );
}
