import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Loader2, Trophy, XCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Result {
  id: string; status: string; score: number | null; max_score: number | null;
  percent: number | null; passed: boolean | null; student_name: string;
  exams: { title: string; passing_score: number; show_results: boolean };
}

export default function StudentResults() {
  const { attemptId } = useParams();
  const [r, setR] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Wyniki — EduNex.pl";
    if (!attemptId) return;
    (async () => {
      const { data } = await supabase
        .from("attempts")
        .select("*, exams(title, passing_score, show_results)")
        .eq("id", attemptId)
        .maybeSingle();
      setR(data as never);
      setLoading(false);
    })();
  }, [attemptId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!r) return <div className="min-h-screen flex items-center justify-center"><p>Nie znaleziono wyników.</p></div>;

  const isGraded = r.status === "graded" || r.status === "submitted";
  const showScore = r.exams.show_results && r.percent !== null;
  const passed = r.passed === true;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between">
          <Logo size="sm" />
          <Button variant="outline" asChild><Link to="/">Strona główna</Link></Button>
        </div>
      </header>

      <main className="container max-w-2xl py-12">
        <Card className="overflow-hidden">
          <div className={`h-2 ${passed ? "bg-success" : showScore ? "bg-destructive" : "bg-primary"}`} />
          <CardHeader className="text-center pt-8">
            {showScore ? (
              passed
                ? <Trophy className="h-16 w-16 mx-auto text-accent mb-2" />
                : <XCircle className="h-16 w-16 mx-auto text-destructive mb-2" />
            ) : <Sparkles className="h-16 w-16 mx-auto text-primary mb-2" />}
            <CardTitle className="text-3xl font-display">{showScore ? (passed ? "Egzamin zaliczony!" : "Egzamin niezaliczony") : "Praca oddana"}</CardTitle>
            <p className="text-muted-foreground mt-2">{r.exams.title}</p>
          </CardHeader>
          <CardContent className="text-center space-y-6 pb-8">
            <div className="text-sm text-muted-foreground">{r.student_name}</div>

            {showScore ? (
              <div className="space-y-2">
                <div className="text-6xl font-display font-bold">{r.percent?.toFixed(0)}%</div>
                <div className="text-muted-foreground">{r.score} / {r.max_score} punktów</div>
                <div className="text-xs text-muted-foreground">Próg zaliczenia: {r.exams.passing_score}%</div>
              </div>
            ) : (
              <p className="text-muted-foreground">Wyniki będą widoczne po sprawdzeniu przez nauczyciela.</p>
            )}

            <div className="pt-4">
              <Button asChild><Link to="/">Powrót na stronę główną</Link></Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
