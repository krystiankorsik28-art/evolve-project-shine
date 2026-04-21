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
import { Plus, Trash2, Sparkles, KeyRound, Loader2, Save, Library } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { QuestionTypeEditor, QUESTION_TYPE_LABELS, QUESTION_TYPE_ICONS, QType } from "@/components/QuestionTypeEditor";

interface Question {
  id: string; question_type: QType; prompt: string;
  options: unknown; correct_answer: unknown; points: number;
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
  const [aiType, setAiType] = useState<QType>("single_choice");
  const [aiLoading, setAiLoading] = useState(false);
  const [pin, setPin] = useState<string | null>(null);
  const [newType, setNewType] = useState<QType>("single_choice");
  const [bankOpen, setBankOpen] = useState(false);
  const [bankItems, setBankItems] = useState<Array<{ id: string; prompt: string; question_type: QType; difficulty: string; points: number; options: unknown; correct_answer: unknown; explanation: string | null }>>([]);
  const [bankSelected, setBankSelected] = useState<Set<string>>(new Set());

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
      status: exam.status as "draft" | "published" | "archived",
    }).eq("id", exam.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Zapisano");
    await logAudit("exam_updated", { resource_type: "exam", resource_id: exam.id });
  };

  const addQuestion = async (type: QType = newType) => {
    if (!id) return;
    const defaultOptions: unknown =
      type === "true_false" ? ["Prawda", "Fałsz"] :
      type === "single_choice" || type === "multiple_choice" ? ["Opcja A", "Opcja B"] :
      type === "matching" ? [{ left: "", right: "" }] :
      type === "drag_drop" ? [{ item: "", target: "" }] :
      type === "ordering" ? ["", ""] : [];
    const { data, error } = await supabase.from("questions").insert({
      exam_id: id, question_type: type, prompt: "Nowe pytanie",
      options: defaultOptions as never,
      correct_answer: null, points: 1, order_index: questions.length,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    setQuestions([...questions, { ...data, options: (data.options ?? []) as string[] } as never]);
  };

  const loadBank = async () => {
    const { data } = await supabase.from("question_bank").select("id, prompt, question_type, difficulty, points, options, correct_answer, explanation").order("created_at", { ascending: false });
    setBankItems((data ?? []) as never);
    setBankSelected(new Set());
    setBankOpen(true);
  };

  const insertFromBank = async () => {
    if (!id || bankSelected.size === 0) return;
    const items = bankItems.filter((b) => bankSelected.has(b.id));
    const rows = items.map((b, i) => ({
      exam_id: id, question_type: b.question_type, prompt: b.prompt,
      options: (b.options ?? []) as never, correct_answer: b.correct_answer as never,
      points: b.points, difficulty: (b.difficulty as "easy" | "medium" | "hard"),
      order_index: questions.length + i,
    }));
    const { error } = await supabase.from("questions").insert(rows);
    if (error) { toast.error(error.message); return; }
    toast.success(`Dodano ${rows.length} pytań z banku`);
    setBankOpen(false);
    load();
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
        body: { exam_id: id, topic: aiTopic.trim(), count: aiCount, question_type: aiType, types: [aiType] },
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
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Pytania ({questions.length})</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Dialog open={aiOpen} onOpenChange={setAiOpen}>
                  <DialogTrigger asChild><Button variant="outline"><Sparkles className="h-4 w-4 mr-2 text-accent" /> Generuj AI</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Generowanie pytań AI</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <div><Label>Temat / zakres</Label><Textarea value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="np. Średniowiecze w Polsce, X-XV wiek" rows={3} /></div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label>Liczba pytań</Label><Input type="number" min={1} max={20} value={aiCount} onChange={(e) => setAiCount(parseInt(e.target.value) || 5)} /></div>
                        <div><Label>Typ</Label>
                          <Select value={aiType} onValueChange={(v) => setAiType(v as QType)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {(Object.keys(QUESTION_TYPE_LABELS) as QType[]).map((t) => (
                                <SelectItem key={t} value={t}>{QUESTION_TYPE_LABELS[t]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAiOpen(false)}>Anuluj</Button>
                      <Button onClick={generateAi} disabled={aiLoading}>{aiLoading ? "Generowanie..." : "Generuj"}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" onClick={loadBank}><Library className="h-4 w-4 mr-2" /> Z banku</Button>

                <div className="flex">
                  <Select value={newType} onValueChange={(v) => setNewType(v as QType)}>
                    <SelectTrigger className="w-[180px] rounded-r-none border-r-0"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(QUESTION_TYPE_LABELS) as QType[]).map((t) => (
                        <SelectItem key={t} value={t}>{QUESTION_TYPE_ICONS[t]} {QUESTION_TYPE_LABELS[t]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button className="rounded-l-none" onClick={() => addQuestion()}><Plus className="h-4 w-4 mr-1" /> Dodaj</Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Brak pytań. Dodaj pierwsze, użyj AI lub wstaw z banku.</p>
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

      {/* Bank dialog */}
      <Dialog open={bankOpen} onOpenChange={setBankOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Wstaw pytania z banku ({bankSelected.size} zaznaczonych)</DialogTitle></DialogHeader>
          {bankItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Bank jest pusty. Przejdź do "Bank pytań" aby dodać.</p>
          ) : (
            <div className="space-y-2">
              {bankItems.map((b) => (
                <label key={b.id} className={`flex gap-3 p-3 border rounded-lg cursor-pointer ${bankSelected.has(b.id) ? "border-primary bg-primary/5" : "border-border"}`}>
                  <input type="checkbox" checked={bankSelected.has(b.id)} onChange={(e) => {
                    const n = new Set(bankSelected);
                    if (e.target.checked) n.add(b.id); else n.delete(b.id);
                    setBankSelected(n);
                  }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-1 mb-1">
                      <Badge variant="secondary" className="text-xs">{QUESTION_TYPE_ICONS[b.question_type]} {QUESTION_TYPE_LABELS[b.question_type]}</Badge>
                      <Badge variant="outline" className="text-xs">{b.difficulty} • {b.points} pkt</Badge>
                    </div>
                    <p className="text-sm line-clamp-2">{b.prompt}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBankOpen(false)}>Anuluj</Button>
            <Button onClick={insertFromBank} disabled={bankSelected.size === 0}>Wstaw {bankSelected.size}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function QuestionEditor({ question, index, onChange, onSave, onDelete }: {
  question: Question; index: number;
  onChange: (q: Question) => void;
  onSave: (q: Question) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="border border-border rounded-lg p-4 space-y-3 bg-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">#{index + 1}</Badge>
          <Badge variant="secondary">{QUESTION_TYPE_ICONS[question.question_type]} {QUESTION_TYPE_LABELS[question.question_type]}</Badge>
          <Badge variant="outline">{question.points} pkt</Badge>
          <Badge variant="outline">{question.difficulty}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onDelete(question.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </div>
      <Textarea value={question.prompt} onChange={(e) => onChange({ ...question, prompt: e.target.value })} onBlur={() => onSave(question)} placeholder="Treść pytania..." rows={2} />
      <QuestionTypeEditor
        type={question.question_type}
        options={question.options}
        correctAnswer={question.correct_answer}
        onChange={(patch) => {
          const next = { ...question, ...(patch as Partial<Question>) } as Question;
          onChange(next);
          onSave(next);
        }}
        onBlur={() => onSave(question)}
      />
      <div className="flex gap-2 items-center pt-2 border-t border-border">
        <Label className="text-xs">Punkty:</Label>
        <Input type="number" min={0} step={0.5} value={question.points} className="w-20 h-8"
          onChange={(e) => onChange({ ...question, points: parseFloat(e.target.value) || 1 })}
          onBlur={() => onSave(question)} />
        <Label className="text-xs ml-2">Trudność:</Label>
        <Select value={question.difficulty} onValueChange={(v) => {
          const next = { ...question, difficulty: v as Question["difficulty"] };
          onChange(next); onSave(next);
        }}>
          <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Łatwa</SelectItem>
            <SelectItem value="medium">Średnia</SelectItem>
            <SelectItem value="hard">Trudna</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
