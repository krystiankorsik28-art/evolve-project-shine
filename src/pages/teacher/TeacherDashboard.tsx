import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, BookOpen, Sparkles, ScrollText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ exams: 0, published: 0, attempts: 0, materials: 0 });

  useEffect(() => {
    document.title = "Pulpit nauczyciela — EduNex.pl";
    if (!user) return;
    (async () => {
      const [e, p, a, m] = await Promise.all([
        supabase.from("exams").select("*", { count: "exact", head: true }).eq("created_by", user.id),
        supabase.from("exams").select("*", { count: "exact", head: true }).eq("created_by", user.id).eq("status", "published"),
        supabase.from("attempts").select("exams!inner(created_by)", { count: "exact", head: true }).eq("exams.created_by", user.id),
        supabase.from("materials").select("*", { count: "exact", head: true }).eq("uploaded_by", user.id),
      ]);
      setStats({ exams: e.count ?? 0, published: p.count ?? 0, attempts: a.count ?? 0, materials: m.count ?? 0 });
    })();
  }, [user]);

  const tiles = [
    { icon: FileText, label: "Moje egzaminy", value: stats.exams, color: "from-primary to-primary-glow" },
    { icon: Sparkles, label: "Opublikowane", value: stats.published, color: "from-accent to-warning" },
    { icon: ScrollText, label: "Podejścia uczniów", value: stats.attempts, color: "from-success to-primary-glow" },
    { icon: BookOpen, label: "Materiały", value: stats.materials, color: "from-warning to-destructive" },
  ];

  return (
    <AppShell title="Pulpit nauczyciela" subtitle="Witaj w EduNex.pl">
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiles.map((t) => (
            <Card key={t.label} className="overflow-hidden relative">
              <div className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-br ${t.color} opacity-10 rounded-bl-full`} />
              <CardContent className="pt-6">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${t.color} mb-3 shadow-md`}>
                <t.icon className="h-5 w-5 text-white drop-shadow" />
              </div>
                <div className="text-3xl font-display font-bold">{t.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{t.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Egzaminy</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Twórz egzaminy z pomocą AI, zarządzaj kodami PIN, śledź wyniki uczniów.</p>
              <div className="flex gap-2">
                <Button asChild><Link to="/teacher/exams"><FileText className="h-4 w-4 mr-2" /> Wszystkie egzaminy</Link></Button>
                <Button variant="outline" asChild><Link to="/teacher/exams"><Plus className="h-4 w-4 mr-2" /> Nowy egzamin</Link></Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Materiały edukacyjne</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Wgrywaj prezentacje, wideo, audio i dokumenty dla swoich uczniów.</p>
              <Button asChild><Link to="/teacher/materials">Otwórz bibliotekę</Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
