import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Download, Upload, Trash2, Sparkles, Tag as TagIcon, FolderPlus, Edit3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { QuestionTypeEditor, QUESTION_TYPE_LABELS, QUESTION_TYPE_ICONS, QType } from "@/components/QuestionTypeEditor";

type Difficulty = "easy" | "medium" | "hard";

interface Category { id: string; name: string; slug: string; color: string | null; icon: string | null; }
interface Tag { id: string; name: string; }
interface BankQuestion {
  id: string; prompt: string; question_type: QType; difficulty: Difficulty;
  points: number; options: unknown; correct_answer: unknown; explanation: string | null;
  category_id: string | null; ai_generated: boolean; ai_validated: boolean; usage_count: number;
  created_at: string; language: string;
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "bg-success/20 text-success border-success/30",
  medium: "bg-warning/20 text-warning border-warning/30",
  hard: "bg-destructive/20 text-destructive border-destructive/30",
};

export default function TeacherQuestionBank() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [editor, setEditor] = useState<BankQuestion | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", slug: "", color: "cyan", icon: "📚" });
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState("");

  const [aiOpen, setAiOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(5);
  const [aiType, setAiType] = useState<QType>("single_choice");
  const [aiDifficulty, setAiDifficulty] = useState<Difficulty>("medium");
  const [aiCategory, setAiCategory] = useState<string>("none");
  const [aiLoading, setAiLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [q, c, t] = await Promise.all([
      supabase.from("question_bank").select("*").order("created_at", { ascending: false }),
      supabase.from("question_categories").select("*").order("name"),
      supabase.from("question_tags").select("*").order("name"),
    ]);
    setQuestions((q.data ?? []) as BankQuestion[]);
    setCategories((c.data ?? []) as Category[]);
    setTags((t.data ?? []) as Tag[]);
    setLoading(false);
  };

  useEffect(() => { document.title = "Bank pytań — EduNex.pl"; load(); }, []);

  const filtered = useMemo(() => questions.filter((q) => {
    if (search && !q.prompt.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== "all" && q.question_type !== filterType) return false;
    if (filterDifficulty !== "all" && q.difficulty !== filterDifficulty) return false;
    if (filterCategory !== "all" && q.category_id !== filterCategory) return false;
    return true;
  }), [questions, search, filterType, filterDifficulty, filterCategory]);

  const createBlank = (type: QType = "single_choice"): BankQuestion => ({
    id: "", prompt: "", question_type: type, difficulty: "medium", points: 1,
    options: type === "true_false" ? ["Prawda", "Fałsz"] : (type === "single_choice" || type === "multiple_choice") ? ["Opcja A", "Opcja B"] : [],
    correct_answer: null, explanation: null, category_id: null,
    ai_generated: false, ai_validated: false, usage_count: 0,
    created_at: new Date().toISOString(), language: "pl",
  });

  const openNew = () => { setEditor(createBlank()); setEditorOpen(true); };
  const openEdit = (q: BankQuestion) => { setEditor({ ...q }); setEditorOpen(true); };

  const saveQuestion = async () => {
    if (!editor || !user) return;
    if (!editor.prompt.trim()) { toast.error("Treść pytania jest wymagana"); return; }
    const payload = {
      prompt: editor.prompt, question_type: editor.question_type,
      options: (editor.options ?? []) as never, correct_answer: editor.correct_answer as never,
      points: editor.points, difficulty: editor.difficulty, explanation: editor.explanation,
      category_id: editor.category_id, language: editor.language,
    };
    if (editor.id) {
      const { error } = await supabase.from("question_bank").update(payload).eq("id", editor.id);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from("question_bank").insert({ ...payload, created_by: user.id });
      if (error) { toast.error(error.message); return; }
    }
    toast.success("Zapisano");
    setEditorOpen(false); load();
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm("Usunąć to pytanie z banku?")) return;
    const { error } = await supabase.from("question_bank").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Usunięto"); load();
  };

  const createCategory = async () => {
    if (!newCat.name.trim() || !user) return;
    const slug = newCat.slug.trim() || newCat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const { error } = await supabase.from("question_categories").insert({
      name: newCat.name, slug, color: newCat.color, icon: newCat.icon, created_by: user.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Kategoria dodana");
    setCatDialogOpen(false); setNewCat({ name: "", slug: "", color: "cyan", icon: "📚" }); load();
  };

  const createTag = async () => {
    if (!newTag.trim() || !user) return;
    const { error } = await supabase.from("question_tags").insert({ name: newTag, created_by: user.id });
    if (error) { toast.error(error.message); return; }
    toast.success("Tag dodany"); setNewTag(""); setTagDialogOpen(false); load();
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `bank-pytan-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Wyeksportowano ${filtered.length} pytań`);
  };

  const exportCSV = () => {
    const header = ["prompt", "type", "difficulty", "points", "options", "correct_answer", "explanation"];
    const rows = filtered.map((q) => [
      JSON.stringify(q.prompt), q.question_type, q.difficulty, q.points,
      JSON.stringify(q.options ?? []), JSON.stringify(q.correct_answer ?? null),
      JSON.stringify(q.explanation ?? ""),
    ].join(","));
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `bank-pytan-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Wyeksportowano CSV: ${filtered.length}`);
  };

  const importJSON = async (file: File) => {
    if (!user) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const arr = Array.isArray(data) ? data : [data];
      const rows = arr.map((q: BankQuestion) => ({
        prompt: q.prompt, question_type: q.question_type ?? "single_choice",
        options: (q.options ?? []) as never, correct_answer: q.correct_answer as never,
        difficulty: q.difficulty ?? "medium", points: q.points ?? 1,
        explanation: q.explanation ?? null, language: q.language ?? "pl",
        created_by: user.id,
      }));
      const { error } = await supabase.from("question_bank").insert(rows);
      if (error) throw error;
      toast.success(`Zaimportowano ${rows.length} pytań`); load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd importu");
    }
  };

  const generateAi = async () => {
    if (!aiTopic.trim()) { toast.error("Podaj temat"); return; }
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-questions", {
        body: {
          to_bank: true, topic: aiTopic.trim(), count: aiCount,
          question_type: aiType, difficulty: aiDifficulty,
          category_id: aiCategory === "none" ? null : aiCategory,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error ?? "Błąd AI");
      toast.success(`Wygenerowano ${data.count} pytań do banku`);
      setAiOpen(false); setAiTopic(""); load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Błąd";
      if (msg.includes("429")) toast.error("Limit AI przekroczony.");
      else if (msg.includes("402")) toast.error("Wymagane doładowanie kredytów AI.");
      else toast.error(msg);
    } finally { setAiLoading(false); }
  };

  return (
    <AppShell title="Bank pytań" subtitle="Centralna biblioteka pytań wielokrotnego użytku">
      <Tabs defaultValue="questions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="questions">Pytania ({questions.length})</TabsTrigger>
          <TabsTrigger value="categories">Kategorie ({categories.length})</TabsTrigger>
          <TabsTrigger value="tags">Tagi ({tags.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          {/* Filters bar */}
          <Card>
            <CardContent className="pt-6 grid md:grid-cols-5 gap-3">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Szukaj pytań..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger><SelectValue placeholder="Typ" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie typy</SelectItem>
                  {(Object.keys(QUESTION_TYPE_LABELS) as QType[]).map((t) => (
                    <SelectItem key={t} value={t}>{QUESTION_TYPE_ICONS[t]} {QUESTION_TYPE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger><SelectValue placeholder="Trudność" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="easy">Łatwe</SelectItem>
                  <SelectItem value="medium">Średnie</SelectItem>
                  <SelectItem value="hard">Trudne</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger><SelectValue placeholder="Kategoria" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Action bar */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Nowe pytanie</Button>
            <Dialog open={aiOpen} onOpenChange={setAiOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Sparkles className="h-4 w-4 mr-2 text-accent" /> Generuj AI</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Generowanie pytań AI do banku</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Temat</Label><Textarea value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} rows={3} placeholder="np. Algorytmy sortowania, złożoność O(n log n)" /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Liczba</Label><Input type="number" min={1} max={20} value={aiCount} onChange={(e) => setAiCount(parseInt(e.target.value) || 5)} /></div>
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
                    <div><Label>Trudność</Label>
                      <Select value={aiDifficulty} onValueChange={(v) => setAiDifficulty(v as Difficulty)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Łatwa</SelectItem>
                          <SelectItem value="medium">Średnia</SelectItem>
                          <SelectItem value="hard">Trudna</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Kategoria</Label>
                      <Select value={aiCategory} onValueChange={setAiCategory}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Brak</SelectItem>
                          {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
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
            <Button variant="outline" onClick={exportJSON}><Download className="h-4 w-4 mr-2" /> Export JSON</Button>
            <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-2" /> Export CSV</Button>
            <label className="inline-flex">
              <input type="file" accept=".json" hidden onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])} />
              <Button variant="outline" asChild><span><Upload className="h-4 w-4 mr-2" /> Import JSON</span></Button>
            </label>
          </div>

          {/* Questions grid */}
          {loading ? <p className="text-center text-muted-foreground py-8">Ładowanie...</p> :
           filtered.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              Brak pytań. Dodaj pierwsze lub wygeneruj AI.
            </CardContent></Card>
           ) : (
            <div className="grid gap-3">
              {filtered.map((q) => {
                const cat = categories.find((c) => c.id === q.category_id);
                return (
                  <Card key={q.id} className="hover:border-primary/50 transition-smooth">
                    <CardContent className="pt-6">
                      <div className="flex justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            <Badge variant="secondary">{QUESTION_TYPE_ICONS[q.question_type]} {QUESTION_TYPE_LABELS[q.question_type]}</Badge>
                            <Badge variant="outline" className={DIFFICULTY_COLORS[q.difficulty]}>{q.difficulty}</Badge>
                            <Badge variant="outline">{q.points} pkt</Badge>
                            {cat && <Badge variant="outline">{cat.icon} {cat.name}</Badge>}
                            {q.ai_generated && <Badge className="bg-accent/20 text-accent border-accent/30">AI</Badge>}
                            {q.usage_count > 0 && <Badge variant="outline">użyto {q.usage_count}×</Badge>}
                          </div>
                          <p className="text-sm line-clamp-2">{q.prompt}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(q)}><Edit3 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteQuestion(q.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
           )
          }
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
            <DialogTrigger asChild><Button><FolderPlus className="h-4 w-4 mr-2" /> Nowa kategoria</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nowa kategoria</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Nazwa</Label><Input value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} /></div>
                <div><Label>Slug (opcjonalnie)</Label><Input value={newCat.slug} onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })} placeholder="auto-generated" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Ikona (emoji)</Label><Input value={newCat.icon} onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })} /></div>
                  <div><Label>Kolor</Label>
                    <Select value={newCat.color} onValueChange={(v) => setNewCat({ ...newCat, color: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["cyan", "primary", "accent", "success", "warning", "destructive"].map((c) =>
                          <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter><Button onClick={createCategory}>Dodaj</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((c) => {
              const count = questions.filter((q) => q.category_id === c.id).length;
              return (
                <Card key={c.id}><CardContent className="pt-6">
                  <div className="text-3xl mb-2">{c.icon ?? "📚"}</div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.slug} • {count} pytań</div>
                </CardContent></Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="tags" className="space-y-4">
          <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
            <DialogTrigger asChild><Button><TagIcon className="h-4 w-4 mr-2" /> Nowy tag</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nowy tag</DialogTitle></DialogHeader>
              <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="np. matura-2025" />
              <DialogFooter><Button onClick={createTag}>Dodaj</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => <Badge key={t.id} variant="outline" className="text-sm py-1 px-3">#{t.name}</Badge>)}
            {tags.length === 0 && <p className="text-sm text-muted-foreground">Brak tagów.</p>}
          </div>
        </TabsContent>
      </Tabs>

      {/* Editor dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editor?.id ? "Edytuj pytanie" : "Nowe pytanie"}</DialogTitle></DialogHeader>
          {editor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Typ pytania</Label>
                  <Select value={editor.question_type} onValueChange={(v) => {
                    const type = v as QType;
                    const defaults = createBlank(type);
                    setEditor({ ...editor, question_type: type, options: defaults.options, correct_answer: null });
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(QUESTION_TYPE_LABELS) as QType[]).map((t) => (
                        <SelectItem key={t} value={t}>{QUESTION_TYPE_ICONS[t]} {QUESTION_TYPE_LABELS[t]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Trudność</Label>
                  <Select value={editor.difficulty} onValueChange={(v) => setEditor({ ...editor, difficulty: v as Difficulty })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Łatwa</SelectItem>
                      <SelectItem value="medium">Średnia</SelectItem>
                      <SelectItem value="hard">Trudna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Punkty</Label>
                  <Input type="number" min={0} step={0.5} value={editor.points}
                    onChange={(e) => setEditor({ ...editor, points: parseFloat(e.target.value) || 1 })} /></div>
                <div><Label>Kategoria</Label>
                  <Select value={editor.category_id ?? "none"} onValueChange={(v) =>
                    setEditor({ ...editor, category_id: v === "none" ? null : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Brak</SelectItem>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Treść pytania</Label>
                <Textarea value={editor.prompt} onChange={(e) => setEditor({ ...editor, prompt: e.target.value })} rows={3} /></div>
              <div className="border-t border-border pt-3">
                <QuestionTypeEditor type={editor.question_type} options={editor.options} correctAnswer={editor.correct_answer}
                  onChange={(patch) => setEditor({ ...editor, ...patch } as BankQuestion)} />
              </div>
              <div><Label>Wyjaśnienie (opcjonalnie)</Label>
                <Textarea value={editor.explanation ?? ""} onChange={(e) => setEditor({ ...editor, explanation: e.target.value })} rows={2}
                  placeholder="Pokazane uczniowi po zaliczeniu" /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>Anuluj</Button>
            <Button onClick={saveQuestion}>Zapisz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
