import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Sparkles, KeyRound, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

type QType = "single_choice" | "multiple_choice" | "true_false" | "short_answer" | "essay";

interface Question {
  id: string; question_type: QType; prompt: string;
  options: string[]; correct_answer: unknown; points: number;
  difficulty: "easy" | "medium" | "hard"; order_index: number;
}

interface Exam {
  id: string; title: string; description: string | null; subject: string | null;
  status: string; duration_minutes: number; passing_score: number;
  shuffle_questions: boolean; show_results: boolean;
}

export default function TeacherExamEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(5);
  const [aiLoading, setAiLoading] = useState(false);
  const [pin, setPin] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const { data: e } = await supabase.from("exams").select("*").eq("id", id).maybeSingle();
    if (!e) { toast.error("Egzamin nie znaleziony"); navigate("/teacher/exams"); return; }
    setExam(e as never);
    const { data: qs } = await supabase.from("questions").select("*").eq("exam_id", id).order("order_index");
    setQuestions((qs ?? []).map((q) => ({
      ...q,
      options: Array.isArray(q.options) ? q.options as string[] : [],
    })) as never);
    const { data: existingPin } = await supabase.from("exam_pins").select("pin_code").eq("exam_id", id).eq("active", true).maybeSingle();
    setPin(existingPin?.pin_code ?? null);
    setLoading(false);
  };

  useEffect(() => {
    document.title = "Edytor egzaminu — EduNex.pl";
    load();
  }, [id]);

  const saveExam = async () => {
    if (!exam) return;
    const { error } = await supabase.from("exams").update({
      title: exam.title, description: exam.description, subject: exam.subject,
      duration_minutes: exam.duration_minutes, passing_score: exam.passing_score,
      shuffle_questions: exam.shuffle_questions, show_results: exam.show_results,
      status: exam.status,
    }).eq("id", exam.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Zapisano");
    await logAudit("exam_updated", { resource_type: "exam", resource_id: exam.id });
  };

  const addQuestion = async (type: QType = "single_choice") => {
    if (!id) return;
    const { data, error } = await supabase.from("questions").insert({
      exam_id: id, question_type: type, prompt: "Nowe pytanie",
      options: type === "true_false" ? ["Prawda", "Fałsz"] : type === "single_choice" || type === "multiple_choice" ? ["Opcja A", "Opcja B"] : [],
      correct_answer: null, points: 1, order_index: questions.length,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    setQuestions([...questions, { ...data, options: data.options as string[] } as never]);
  };

  const updateQuestion = async (q: Question) => {
    const { error } = await supabase.from("questions").update({
      prompt: q.prompt, options: q.options as never, correct_answer: q.correct_answer as never,
      points: q.points, difficulty: q.difficulty,
    }).eq("id", q.id);
    if (error) toast.error(error.message);
  };

  const deleteQuestion = async (qid: string) => {
    const { error } = await supabase.from("questions").delete().eq("id", qid);
    if (error) { toast.error(error.message); return; }
    setQuestions(questions.filter((q) => q.id !== qid));
  };

  const generateAi = async () => {
    if (!id || !aiTopic.trim()) { toast.error("Podaj temat"); return; }
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-questions", {
        body: { exam_id: id, topic: aiTopic.trim(), count: aiCount },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error ?? "Błąd AI");
      toast.success(`Wygenerowano ${data.count} pytań`);
      setAiOpen(false);
      setAiTopic("");
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Błąd generowania";
      if (msg.includes("429")) toast.error("Limit AI przekroczony. Spróbuj za chwilę.");
      else if (msg.includes("402")) toast.error("Wymagane doładowanie kredytów AI w workspace.");
      else toast.error(msg);
    } finally {
      setAiLoading(false);
    }
  };

  const generatePin = async () => {
    if (!id || !exam) return;
    const code = Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (pin) {
      await supabase.from("exam_pins").update({ active: false }).eq("exam_id", id);
    }
    const { error } = await supabase.from("exam_pins").insert({
      exam_id: id, pin_code: code, created_by: user.id,
    });
    if (error) { toast.error(error.message); return; }
    setPin(code);
    await logAudit("exam_pin_generated", { resource_type: "exam", resource_id: id });
    toast.success(`PIN: ${code}`);
  };

  if (loading || !exam) {
    return <AppShell title="Ładowanie..."><div className="flex justify-center py-16"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div></AppShell>;
  }

  return (
    <AppShell title={exam.title} subtitle="Edytor egzaminu">
      <div className="space-y-6 max-w-5xl">
        {/* Ustawienia */}
        <Card>
          <CardHeader><CardTitle>Ustawienia</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Tytuł</Label>
              <Input value={exam.title} onChange={(e) => setExam({ ...exam, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Przedmiot</Label>
              <Input value={exam.subject ?? ""} onChange={(e) => setExam({ ...exam, subject: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Czas (min)</Label>
              <Input type="number" value={exam.duration_minutes} onChange={(e) => setExam({ ...exam, duration_minutes: parseInt(e.target.value) || 60 })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Opis</Label>
              <Textarea value={exam.description ?? ""} onChange={(e) => setExam({ ...exam, description: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Próg zaliczenia (%)</Label>
              <Input type="number" min={0} max={100} value={exam.passing_score} onChange={(e) => setExam({ ...exam, passing_score: parseInt(e.target.value) || 50 })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={exam.status} onValueChange={(v) => setExam({ ...exam, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Szkic</SelectItem>
                  <SelectItem value="published">Opublikowany</SelectItem>
                  <SelectItem value="archived">Zarchiwizowany</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2"><Switch checked={exam.shuffle_questions} onCheckedChange={(v) => setExam({ ...exam, shuffle_questions: v })} /><Label>Mieszaj pytania</Label></div>
            <div className="flex items-center gap-2"><Switch checked={exam.show_results} onCheckedChange={(v) => setExam({ ...exam, show_results: v })} /><Label>Pokaż wyniki uczniowi</Label></div>
            <div className="md:col-span-2 flex gap-2">
              <Button onClick={saveExam}><Save className="h-4 w-4 mr-2" /> Zapisz ustawienia</Button>
            </div>
          </CardContent>
        </Card>

        {/* PIN */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> Kod PIN dla uczniów</CardTitle></CardHeader>
          <CardContent>
            {pin ? (
              <div className="flex items-center gap-4">
                <div className="text-4xl font-mono font-bold tracking-widest bg-secondary px-6 py-3 rounded-lg">{pin}</div>
                <Button variant="outline" onClick={generatePin}>Wygeneruj nowy</Button>
              </div>
            ) : (
              <Button onClick={generatePin}><KeyRound className="h-4 w-4 mr-2" /> Wygeneruj PIN</Button>
            )}
            <p className="text-xs text-muted-foreground mt-3">Uczniowie wpisują ten kod na stronie głównej, w sekcji "Uczeń".</p>
          </CardContent>
        </Card>

        {/* Pytania */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pytania ({questions.length})</CardTitle>
              <div className="flex gap-2">
                <Dialog open={aiOpen} onOpenChange={setAiOpen}>
                  <DialogTrigger asChild><Button variant="outline"><Sparkles className="h-4 w-4 mr-2 text-accent" /> Generuj AI</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Generowanie pytań AI</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2"><Label>Temat / zakres</Label><Textarea value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="np. Średniowiecze w Polsce, X-XV wiek" rows={3} /></div>
                      <div className="space-y-2"><Label>Liczba pytań</Label><Input type="number" min={1} max={20} value={aiCount} onChange={(e) => setAiCount(parseInt(e.target.value) || 5)} /></div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAiOpen(false)}>Anuluj</Button>
                      <Button onClick={generateAi} disabled={aiLoading}>{aiLoading ? "Generowanie..." : "Generuj"}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button onClick={() => addQuestion()}><Plus className="h-4 w-4 mr-2" /> Dodaj pytanie</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Brak pytań. Dodaj pierwsze lub użyj AI.</p>
            ) : questions.map((q, i) => (
              <QuestionEditor key={q.id} question={q} index={i}
                onChange={(nq) => { setQuestions(questions.map((x) => x.id === nq.id ? nq : x)); }}
                onSave={updateQuestion}
                onDelete={deleteQuestion}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function QuestionEditor({ question, index, onChange, onSave, onDelete }: {
  question: Question; index: number;
  onChange: (q: Question) => void;
  onSave: (q: Question) => void;
  onDelete: (id: string) => void;
}) {
  const isChoice = question.question_type === "single_choice" || question.question_type === "multiple_choice" || question.question_type === "true_false";
  return (
    <div className="border border-border rounded-lg p-4 space-y-3 bg-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline">#{index + 1}</Badge>
          <Badge variant="secondary">{question.question_type}</Badge>
          <Badge variant="outline">{question.points} pkt</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onDelete(question.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </div>
      <Textarea value={question.prompt} onChange={(e) => onChange({ ...question, prompt: e.target.value })} onBlur={() => onSave(question)} placeholder="Treść pytania..." rows={2} />
      {isChoice && (
        <div className="space-y-2">
          {question.options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <Input value={opt} onChange={(e) => { const no = [...question.options]; no[i] = e.target.value; onChange({ ...question, options: no }); }} onBlur={() => onSave(question)} />
              <Button variant={question.correct_answer === i || (Array.isArray(question.correct_answer) && question.correct_answer.includes(i)) ? "default" : "outline"} size="sm" onClick={() => {
                const newCorrect = question.question_type === "multiple_choice"
                  ? (Array.isArray(question.correct_answer) ? (question.correct_answer.includes(i) ? question.correct_answer.filter((x) => x !== i) : [...question.correct_answer, i]) : [i])
                  : i;
                onChange({ ...question, correct_answer: newCorrect });
                onSave({ ...question, correct_answer: newCorrect });
              }}>✓</Button>
              {question.question_type !== "true_false" && (
                <Button variant="ghost" size="sm" onClick={() => { const no = question.options.filter((_, x) => x !== i); onChange({ ...question, options: no }); onSave({ ...question, options: no }); }}>×</Button>
              )}
            </div>
          ))}
          {question.question_type !== "true_false" && (
            <Button variant="ghost" size="sm" onClick={() => { const no = [...question.options, `Opcja ${String.fromCharCode(65 + question.options.length)}`]; onChange({ ...question, options: no }); onSave({ ...question, options: no }); }}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Dodaj opcję
            </Button>
          )}
        </div>
      )}
      {(question.question_type === "short_answer" || question.question_type === "essay") && (
        <div className="space-y-2">
          <Label className="text-xs">Wzorzec/oczekiwana odpowiedź (dla AI):</Label>
          <Textarea value={typeof question.correct_answer === "string" ? question.correct_answer : ""} onChange={(e) => onChange({ ...question, correct_answer: e.target.value })} onBlur={() => onSave(question)} rows={2} />
        </div>
      )}
    </div>
  );
}
