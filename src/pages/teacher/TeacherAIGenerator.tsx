import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Loader2,
  Wand2,
  Save,
  Trash2,
  RefreshCw,
  Download,
  Plus,
  FileText,
  CheckCircle2,
  XCircle,
  Pencil,
  Library,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

type QType =
  | "single_choice"
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "fill_in_blank"
  | "numeric"
  | "essay"
  | "ordering";

interface GenQ {
  question_type: QType;
  prompt: string;
  options?: string[];
  correct: any;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
  points?: number;
  hint?: string;
  tags?: string[];
  bloom?: string;
}

const TYPE_LABELS: Record<QType, string> = {
  single_choice: "Jednokrotny wybór",
  multiple_choice: "Wielokrotny wybór",
  true_false: "Prawda / Fałsz",
  short_answer: "Krótka odpowiedź",
  fill_in_blank: "Uzupełnij lukę",
  numeric: "Numeryczne",
  essay: "Otwarte (esej)",
  ordering: "Uporządkuj",
};

const DIFF_COLOR: Record<string, string> = {
  easy: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  hard: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

export default function TeacherAIGenerator() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [audience, setAudience] = useState("");
  const [count, setCount] = useState(8);
  const [difficulty, setDifficulty] = useState<"mixed" | "easy" | "medium" | "hard">("mixed");
  const [language, setLanguage] = useState("pl");
  const [style, setStyle] = useState("egzaminacyjny");
  const [bloom, setBloom] = useState("mixed");
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<QType[]>(["single_choice"]);

  const [loading, setLoading] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [creatingExam, setCreatingExam] = useState(false);
  const [questions, setQuestions] = useState<GenQ[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<GenQ | null>(null);

  const [examTitle, setExamTitle] = useState("");
  const [examOpen, setExamOpen] = useState(false);

  const stats = useMemo(() => {
    const by: Record<string, number> = {};
    questions.forEach((q) => {
      by[q.difficulty || "medium"] = (by[q.difficulty || "medium"] || 0) + 1;
    });
    const points = questions.reduce((s, q) => s + (q.points || 1), 0);
    return { total: questions.length, by, points };
  }, [questions]);

  function toggleType(t: QType) {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function toggleSelect(i: number) {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  }
  function selectAll() {
    setSelected(new Set(questions.map((_, i) => i)));
  }
  function clearSelection() {
    setSelected(new Set());
  }

  async function generate(append = false) {
    if (!topic.trim()) {
      toast.error("Podaj temat");
      return;
    }
    if (!selectedTypes.length) {
      toast.error("Wybierz co najmniej jeden typ pytania");
      return;
    }
    setLoading(true);
    if (!append) {
      setQuestions([]);
      setSelected(new Set());
    }
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate-questions", {
        body: {
          topic,
          count,
          difficulty,
          language,
          types: selectedTypes,
          sourceText,
          audience,
          bloom,
          style,
          includeExplanations,
        },
      });
      if (error) throw error;
      const qs: GenQ[] = (data as any)?.questions ?? [];
      if (!qs.length) {
        toast.error("AI nie zwróciło pytań. Spróbuj zmienić temat.");
      } else {
        setQuestions((prev) => (append ? [...prev, ...qs] : qs));
        toast.success(`Wygenerowano ${qs.length} pytań`);
      }
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (msg.includes("429")) toast.error("Limit zapytań AI. Spróbuj za chwilę.");
      else if (msg.includes("402")) toast.error("Wyczerpane kredyty AI w workspace.");
      else toast.error(`Błąd AI: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  async function regenerateOne(i: number) {
    const q = questions[i];
    if (!q) return;
    toast.loading("Regeneruję pytanie...", { id: `regen-${i}` });
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate-questions", {
        body: {
          topic: `${topic} — alternatywna wersja pytania: ${q.prompt}`,
          count: 1,
          difficulty: q.difficulty || difficulty,
          language,
          types: [q.question_type],
          sourceText,
          audience,
          bloom,
          style,
          includeExplanations,
        },
      });
      if (error) throw error;
      const newQ = (data as any)?.questions?.[0];
      if (newQ) {
        setQuestions((prev) => prev.map((qq, idx) => (idx === i ? newQ : qq)));
        toast.success("Pytanie zaktualizowane", { id: `regen-${i}` });
      } else {
        toast.error("Brak odpowiedzi AI", { id: `regen-${i}` });
      }
    } catch (e: any) {
      toast.error(`Błąd: ${e?.message ?? e}`, { id: `regen-${i}` });
    }
  }

  function removeOne(i: number) {
    setQuestions((prev) => prev.filter((_, idx) => idx !== i));
    setSelected((prev) => {
      const n = new Set<number>();
      prev.forEach((x) => {
        if (x < i) n.add(x);
        else if (x > i) n.add(x - 1);
      });
      return n;
    });
  }

  function startEdit(i: number) {
    setEditIdx(i);
    setEditDraft(JSON.parse(JSON.stringify(questions[i])));
  }
  function saveEdit() {
    if (editIdx === null || !editDraft) return;
    setQuestions((prev) => prev.map((q, i) => (i === editIdx ? editDraft : q)));
    setEditIdx(null);
    setEditDraft(null);
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(questions, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-pytania-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function pickedQuestions(): GenQ[] {
    if (selected.size === 0) return questions;
    return questions.filter((_, i) => selected.has(i));
  }

  async function saveToBank() {
    if (!user) return;
    const picked = pickedQuestions();
    if (!picked.length) return;
    setSavingBank(true);
    try {
      const rows = picked.map((q) => ({
        question_type: q.question_type as any,
        prompt: q.prompt,
        options: q.options ?? [],
        correct_answer: q.correct,
        explanation: q.explanation ?? null,
        difficulty: (q.difficulty ?? "medium") as any,
        points: q.points ?? 1,
        ai_generated: true,
        created_by: user.id,
      }));
      const { error } = await supabase.from("question_bank").insert(rows);
      if (error) throw error;
      toast.success(`Zapisano ${rows.length} pytań do banku`);
    } catch (e: any) {
      toast.error(`Nie udało się zapisać: ${e?.message ?? e}`);
    } finally {
      setSavingBank(false);
    }
  }

  async function createExam() {
    if (!user) return;
    const picked = pickedQuestions();
    if (!picked.length) {
      toast.error("Brak pytań do utworzenia egzaminu");
      return;
    }
    if (!examTitle.trim()) {
      toast.error("Podaj tytuł egzaminu");
      return;
    }
    setCreatingExam(true);
    try {
      const { data: exam, error: examErr } = await supabase
        .from("exams")
        .insert({
          title: examTitle,
          description: `Egzamin wygenerowany przez AI na temat: ${topic}`,
          subject: topic.slice(0, 80),
          created_by: user.id,
          status: "draft",
        })
        .select()
        .single();
      if (examErr) throw examErr;

      const rows = picked.map((q, idx) => ({
        exam_id: exam.id,
        question_type: q.question_type as any,
        prompt: q.prompt,
        options: q.options ?? [],
        correct_answer: q.correct,
        explanation: q.explanation ?? null,
        difficulty: (q.difficulty ?? "medium") as any,
        points: q.points ?? 1,
        order_index: idx,
        ai_generated: true,
      }));
      const { error: qErr } = await supabase.from("questions").insert(rows);
      if (qErr) throw qErr;

      toast.success("Egzamin utworzony");
      setExamOpen(false);
      navigate(`/teacher/exams/${exam.id}`);
    } catch (e: any) {
      toast.error(`Nie udało się utworzyć egzaminu: ${e?.message ?? e}`);
    } finally {
      setCreatingExam(false);
    }
  }

  return (
    <AppShell
      title="AI Generator pytań"
      subtitle="Twórz różnorodne pytania egzaminacyjne z pomocą AI"
    >
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        {/* CONFIG */}
        <Card className="bg-gradient-card shadow-elegant h-fit lg:sticky lg:top-4">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-cyber">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-display text-xl">Konfiguracja</h2>
            </div>

            <Tabs defaultValue="basic">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="basic">Podstawy</TabsTrigger>
                <TabsTrigger value="types">Typy</TabsTrigger>
                <TabsTrigger value="advanced">Zaawansowane</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Temat / zakres</Label>
                  <Textarea
                    rows={3}
                    placeholder="np. Bitwa pod Grunwaldem 1410 — przyczyny, przebieg, skutki"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Liczba pytań</Label>
                    <span className="text-sm font-mono text-accent">{count}</span>
                  </div>
                  <Slider
                    value={[count]}
                    min={1}
                    max={30}
                    step={1}
                    onValueChange={(v) => setCount(v[0])}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Trudność</Label>
                    <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mixed">Mieszana</SelectItem>
                        <SelectItem value="easy">Łatwa</SelectItem>
                        <SelectItem value="medium">Średnia</SelectItem>
                        <SelectItem value="hard">Trudna</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Język</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pl">Polski</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="uk">Українська</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="types" className="space-y-3 pt-4">
                <Label className="text-sm">Dozwolone typy pytań</Label>
                <div className="grid grid-cols-1 gap-2">
                  {(Object.keys(TYPE_LABELS) as QType[]).map((t) => (
                    <label
                      key={t}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition ${
                        selectedTypes.includes(t)
                          ? "border-accent bg-accent/10"
                          : "border-border hover:bg-muted/40"
                      }`}
                    >
                      <Checkbox
                        checked={selectedTypes.includes(t)}
                        onCheckedChange={() => toggleType(t)}
                      />
                      <span className="text-sm">{TYPE_LABELS[t]}</span>
                    </label>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Odbiorca (klasa / poziom)</Label>
                  <Input
                    placeholder="np. liceum klasa 2, kurs Java podstawy"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Poziom taksonomii Blooma</Label>
                  <Select value={bloom} onValueChange={setBloom}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">Mieszany</SelectItem>
                      <SelectItem value="remember">Pamiętanie</SelectItem>
                      <SelectItem value="understand">Zrozumienie</SelectItem>
                      <SelectItem value="apply">Zastosowanie</SelectItem>
                      <SelectItem value="analyze">Analiza</SelectItem>
                      <SelectItem value="evaluate">Ocena</SelectItem>
                      <SelectItem value="create">Tworzenie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Styl pytań</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="egzaminacyjny">Egzaminacyjny</SelectItem>
                      <SelectItem value="praktyczny">Praktyczny / case study</SelectItem>
                      <SelectItem value="quizowy">Quizowy / lekki</SelectItem>
                      <SelectItem value="akademicki">Akademicki</SelectItem>
                      <SelectItem value="zawodowy">Zawodowy / certyfikacyjny</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Materiał źródłowy (opcjonalnie)</Label>
                  <Textarea
                    rows={5}
                    placeholder="Wklej tekst, notatki lub fragment podręcznika. AI oprze pytania na tej treści."
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {sourceText.length} znaków (max ~8000)
                  </p>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label>Dołącz wyjaśnienia</Label>
                    <p className="text-xs text-muted-foreground">
                      AI doda krótkie uzasadnienie odpowiedzi
                    </p>
                  </div>
                  <Switch
                    checked={includeExplanations}
                    onCheckedChange={setIncludeExplanations}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2 pt-2 border-t">
              <Button
                className="w-full bg-gradient-cyber"
                onClick={() => generate(false)}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                Generuj pytania
              </Button>
              {questions.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => generate(true)}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Dogeneruj kolejne
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* RESULTS */}
        <div className="space-y-4">
          {questions.length > 0 && (
            <Card>
              <CardContent className="p-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 mr-auto flex-wrap">
                  <Badge variant="secondary">
                    <FileText className="h-3 w-3 mr-1" />
                    {stats.total} pytań
                  </Badge>
                  <Badge variant="outline">{stats.points} pkt łącznie</Badge>
                  {stats.by.easy && (
                    <Badge className={DIFF_COLOR.easy}>{stats.by.easy} łatwe</Badge>
                  )}
                  {stats.by.medium && (
                    <Badge className={DIFF_COLOR.medium}>{stats.by.medium} średnie</Badge>
                  )}
                  {stats.by.hard && (
                    <Badge className={DIFF_COLOR.hard}>{stats.by.hard} trudne</Badge>
                  )}
                  {selected.size > 0 && (
                    <Badge variant="default">Zaznaczono: {selected.size}</Badge>
                  )}
                </div>
                <Button size="sm" variant="ghost" onClick={selectAll}>
                  Zaznacz wszystkie
                </Button>
                <Button size="sm" variant="ghost" onClick={clearSelection}>
                  Wyczyść
                </Button>
                <Button size="sm" variant="outline" onClick={exportJSON}>
                  <Download className="h-4 w-4 mr-1" />
                  Eksport JSON
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={saveToBank}
                  disabled={savingBank}
                >
                  {savingBank ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Library className="h-4 w-4 mr-1" />
                  )}
                  Do banku ({pickedQuestions().length})
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-cyber"
                  onClick={() => {
                    setExamTitle(topic.slice(0, 80) || "Egzamin AI");
                    setExamOpen(true);
                  }}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Utwórz egzamin
                </Button>
              </CardContent>
            </Card>
          )}

          <AnimatePresence mode="popLayout">
            {questions.map((q, i) => (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
              >
                <Card
                  className={
                    selected.has(i) ? "ring-2 ring-accent shadow-elegant" : ""
                  }
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selected.has(i)}
                        onCheckedChange={() => toggleSelect(i)}
                        className="mt-1"
                      />
                      <div className="text-xs font-mono px-2 py-1 rounded bg-accent/10 text-accent shrink-0">
                        #{i + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="secondary" className="text-xs">
                            {TYPE_LABELS[q.question_type] || q.question_type}
                          </Badge>
                          {q.difficulty && (
                            <Badge
                              className={`text-xs ${DIFF_COLOR[q.difficulty] || ""}`}
                            >
                              {q.difficulty}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {q.points ?? 1} pkt
                          </Badge>
                          {q.bloom && (
                            <Badge variant="outline" className="text-xs">
                              {q.bloom}
                            </Badge>
                          )}
                        </div>
                        <div className="font-medium">{q.prompt}</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => startEdit(i)}
                          title="Edytuj"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => regenerateOne(i)}
                          title="Regeneruj"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeOne(i)}
                          title="Usuń"
                        >
                          <Trash2 className="h-4 w-4 text-rose-400" />
                        </Button>
                      </div>
                    </div>

                    <QuestionPreview q={q} />

                    {q.explanation && (
                      <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border-l-2 border-accent">
                        <span className="font-semibold text-accent">Wyjaśnienie: </span>
                        {q.explanation}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {questions.length === 0 && !loading && (
            <div className="text-muted-foreground text-center py-20 border-2 border-dashed rounded-xl">
              <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Skonfiguruj generator i utwórz pytania.</p>
              <p className="text-xs mt-1">Obsługa 8 typów pytań, banku i egzaminów.</p>
            </div>
          )}
          {loading && (
            <div className="text-muted-foreground text-center py-12 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generuję pytania…
            </div>
          )}
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={editIdx !== null} onOpenChange={(o) => !o && setEditIdx(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edytuj pytanie</DialogTitle>
          </DialogHeader>
          {editDraft && (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label>Treść</Label>
                <Textarea
                  rows={3}
                  value={editDraft.prompt}
                  onChange={(e) =>
                    setEditDraft({ ...editDraft, prompt: e.target.value })
                  }
                />
              </div>
              {editDraft.options && editDraft.options.length > 0 && (
                <div className="space-y-2">
                  <Label>Opcje</Label>
                  {editDraft.options.map((o, idx) => (
                    <Input
                      key={idx}
                      value={o}
                      onChange={(e) => {
                        const opts = [...(editDraft.options || [])];
                        opts[idx] = e.target.value;
                        setEditDraft({ ...editDraft, options: opts });
                      }}
                    />
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <Label>Poprawna odpowiedź (JSON)</Label>
                <Textarea
                  rows={2}
                  value={JSON.stringify(editDraft.correct)}
                  onChange={(e) => {
                    try {
                      setEditDraft({ ...editDraft, correct: JSON.parse(e.target.value) });
                    } catch {
                      setEditDraft({ ...editDraft, correct: e.target.value });
                    }
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Trudność</Label>
                  <Select
                    value={editDraft.difficulty || "medium"}
                    onValueChange={(v: any) =>
                      setEditDraft({ ...editDraft, difficulty: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Łatwa</SelectItem>
                      <SelectItem value="medium">Średnia</SelectItem>
                      <SelectItem value="hard">Trudna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Punkty</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editDraft.points ?? 1}
                    onChange={(e) =>
                      setEditDraft({ ...editDraft, points: +e.target.value || 0 })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Wyjaśnienie</Label>
                <Textarea
                  rows={3}
                  value={editDraft.explanation || ""}
                  onChange={(e) =>
                    setEditDraft({ ...editDraft, explanation: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditIdx(null)}>
              Anuluj
            </Button>
            <Button onClick={saveEdit}>Zapisz zmiany</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create exam dialog */}
      <Dialog open={examOpen} onOpenChange={setExamOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Utwórz egzamin z wygenerowanych pytań</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Tytuł egzaminu</Label>
              <Input
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="np. Sprawdzian: Grunwald"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Zostanie utworzony egzamin (status: szkic) z {pickedQuestions().length}{" "}
              pytaniami.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setExamOpen(false)}>
              Anuluj
            </Button>
            <Button
              className="bg-gradient-cyber"
              onClick={createExam}
              disabled={creatingExam}
            >
              {creatingExam ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Utwórz egzamin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function QuestionPreview({ q }: { q: GenQ }) {
  if (q.question_type === "single_choice" && q.options) {
    return (
      <div className="grid gap-2 pl-9">
        {q.options.map((o, j) => (
          <div
            key={j}
            className={`text-sm p-2 rounded-lg border flex items-start gap-2 ${
              j === q.correct
                ? "border-accent bg-accent/10 text-foreground"
                : "border-border text-muted-foreground"
            }`}
          >
            {j === q.correct ? (
              <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            ) : (
              <span className="w-4" />
            )}
            <span>
              {String.fromCharCode(65 + j)}. {o}
            </span>
          </div>
        ))}
      </div>
    );
  }
  if (q.question_type === "multiple_choice" && q.options) {
    const correctArr: number[] = Array.isArray(q.correct) ? q.correct : [];
    return (
      <div className="grid gap-2 pl-9">
        {q.options.map((o, j) => (
          <div
            key={j}
            className={`text-sm p-2 rounded-lg border flex items-start gap-2 ${
              correctArr.includes(j)
                ? "border-accent bg-accent/10 text-foreground"
                : "border-border text-muted-foreground"
            }`}
          >
            {correctArr.includes(j) ? (
              <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            ) : (
              <span className="w-4" />
            )}
            <span>
              {String.fromCharCode(65 + j)}. {o}
            </span>
          </div>
        ))}
      </div>
    );
  }
  if (q.question_type === "true_false") {
    return (
      <div className="flex gap-2 pl-9">
        <div
          className={`text-sm px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
            q.correct === true
              ? "border-accent bg-accent/10"
              : "border-border text-muted-foreground"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" /> Prawda
        </div>
        <div
          className={`text-sm px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
            q.correct === false
              ? "border-accent bg-accent/10"
              : "border-border text-muted-foreground"
          }`}
        >
          <XCircle className="h-4 w-4" /> Fałsz
        </div>
      </div>
    );
  }
  if (q.question_type === "ordering" && q.options) {
    return (
      <ol className="grid gap-1.5 pl-9 list-decimal list-inside">
        {q.options.map((o, j) => (
          <li
            key={j}
            className="text-sm p-2 rounded-lg border border-accent/40 bg-accent/5"
          >
            {o}
          </li>
        ))}
      </ol>
    );
  }
  // short_answer / fill_in_blank / numeric / essay
  return (
    <div className="pl-9">
      <div className="text-sm p-2.5 rounded-lg border border-accent/40 bg-accent/5">
        <span className="text-xs uppercase tracking-wide text-accent font-semibold mr-2">
          Odpowiedź:
        </span>
        <span className="font-mono">
          {typeof q.correct === "object"
            ? JSON.stringify(q.correct)
            : String(q.correct)}
        </span>
      </div>
    </div>
  );
}
