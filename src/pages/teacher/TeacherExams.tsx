import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileText, Edit, Trash2, Loader2, Rocket, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";

interface Exam {
  id: string; title: string; subject: string | null; status: string;
  duration_minutes: number; created_at: string;
}

export default function TeacherExams() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "", description: "", duration_minutes: 60 });
  const [creating, setCreating] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("exams").select("*").eq("created_by", user.id).order("created_at", { ascending: false });
    setExams((data ?? []) as never);
    setLoading(false);
  };

  useEffect(() => {
    document.title = "Egzaminy — EduNex.pl";
    load();
  }, [user]);

  const create = async () => {
    if (!user || !form.title.trim()) { toast.error("Tytuł jest wymagany"); return; }
    setCreating(true);
    const { data, error } = await supabase.from("exams").insert({
      title: form.title.trim(),
      subject: form.subject.trim() || null,
      description: form.description.trim() || null,
      duration_minutes: Math.max(1, Math.min(600, form.duration_minutes)),
      created_by: user.id,
    }).select().single();
    setCreating(false);
    if (error) { toast.error(error.message); return; }
    await logAudit("exam_created", { resource_type: "exam", resource_id: data.id });
    toast.success("Egzamin utworzony");
    setOpen(false);
    navigate(`/teacher/exams/${data.id}`);
  };

  const remove = async (id: string) => {
    if (!confirm("Usunąć egzamin? Operacji nie można cofnąć.")) return;
    const { error } = await supabase.from("exams").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    await logAudit("exam_deleted", { resource_type: "exam", resource_id: id });
    toast.success("Usunięto");
    load();
  };

  const publishAndShare = async (e: Exam) => {
    if (!user) return;
    if (e.status !== "published") {
      const { error } = await supabase.from("exams").update({ status: "published" }).eq("id", e.id);
      if (error) { toast.error(error.message); return; }
    }
    const { data: existing } = await supabase.from("exam_pins").select("pin_code").eq("exam_id", e.id).eq("active", true).maybeSingle();
    let code = existing?.pin_code as string | undefined;
    if (!code) {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      code = String(buf[0] % 1000000).padStart(6, "0");
      const { error: pErr } = await supabase.from("exam_pins").insert({ exam_id: e.id, pin_code: code, created_by: user.id });
      if (pErr) { toast.error(pErr.message); return; }
    }
    await logAudit("exam_published", { resource_type: "exam", resource_id: e.id });
    try {
      await navigator.clipboard.writeText(`Egzamin: ${e.title}\nPIN: ${code}\n${window.location.origin}/`);
      toast.success(`Opublikowano! PIN ${code} skopiowano do schowka`);
    } catch {
      toast.success(`Opublikowano! PIN: ${code}`);
    }
    load();
  };

  return (
    <AppShell title="Egzaminy" subtitle="Twórz, edytuj i publikuj egzaminy">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Nowy egzamin</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nowy egzamin</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="t">Tytuł *</Label>
                  <Input id="t" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={150} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s">Przedmiot</Label>
                  <Input id="s" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d">Opis</Label>
                  <Textarea id="d" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={1000} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dur">Czas (min)</Label>
                  <Input id="dur" type="number" min={1} max={600} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 60 })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Anuluj</Button>
                <Button onClick={create} disabled={creating}>{creating ? "Tworzenie..." : "Utwórz i edytuj"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
        ) : exams.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">Nie masz jeszcze żadnych egzaminów.</p>
              <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" /> Utwórz pierwszy egzamin</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((e) => (
              <Card key={e.id} className="hover:shadow-elegant transition-smooth">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg">{e.title}</CardTitle>
                    <Badge variant={e.status === "published" ? "default" : "secondary"}>{e.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-1">{e.subject ?? "Bez przedmiotu"}</p>
                  <p className="text-xs text-muted-foreground mb-4">{e.duration_minutes} min · {new Date(e.created_at).toLocaleDateString("pl-PL")}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="default" asChild><Link to={`/teacher/exams/${e.id}`}><Edit className="h-3.5 w-3.5 mr-1.5" /> Edytuj</Link></Button>
                    <Button size="sm" onClick={() => publishAndShare(e)} className="bg-gradient-cyber text-white hover:opacity-90 shadow-cyber">
                      <Rocket className="h-3.5 w-3.5 mr-1.5" /> {e.status === "published" ? "Udostępnij" : "Opublikuj"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(e.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
