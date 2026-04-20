import { useEffect, useState, useRef } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload, FileText, Trash2, Loader2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

interface Material {
  id: string; title: string; description: string | null; subject: string | null;
  file_path: string; file_type: string | null; file_size: number | null;
  visible_to_students: boolean; created_at: string;
}

export default function TeacherMaterials() {
  const { user } = useAuth();
  const [items, setItems] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [visible, setVisible] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("materials").select("*").eq("uploaded_by", user.id).order("created_at", { ascending: false });
    setItems((data ?? []) as never);
    setLoading(false);
  };

  useEffect(() => { document.title = "Materiały — EduNex.pl"; load(); }, [user]);

  const upload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !user) { toast.error("Wybierz plik"); return; }
    if (!title.trim()) { toast.error("Podaj tytuł"); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error("Maks 50MB"); return; }
    setUploading(true);
    try {
      const path = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("materials").upload(path, file);
      if (upErr) throw upErr;
      const { error } = await supabase.from("materials").insert({
        title: title.trim(), subject: subject.trim() || null,
        file_path: path, file_type: file.type, file_size: file.size,
        visible_to_students: visible, uploaded_by: user.id,
      });
      if (error) throw error;
      await logAudit("material_uploaded", { resource_type: "material", metadata: { name: file.name } });
      toast.success("Materiał wgrany");
      setTitle(""); setSubject(""); if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd uploadu");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (m: Material) => {
    if (!confirm(`Usunąć "${m.title}"?`)) return;
    await supabase.storage.from("materials").remove([m.file_path]);
    await supabase.from("materials").delete().eq("id", m.id);
    await logAudit("material_deleted", { resource_type: "material", resource_id: m.id });
    toast.success("Usunięto");
    load();
  };

  const view = async (m: Material) => {
    const { data } = await supabase.storage.from("materials").createSignedUrl(m.file_path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  return (
    <AppShell title="Materiały edukacyjne" subtitle="Wgrywaj i zarządzaj zasobami dla uczniów">
      <div className="space-y-6 max-w-5xl">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Wgraj nowy materiał</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Tytuł *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} /></div>
              <div className="space-y-2"><Label>Przedmiot</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={100} /></div>
            </div>
            <div className="space-y-2"><Label>Plik (max 50MB)</Label><Input type="file" ref={fileRef} accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" /></div>
            <div className="flex items-center gap-2"><Switch checked={visible} onCheckedChange={setVisible} /><Label>Widoczny dla uczniów</Label></div>
            <Button onClick={upload} disabled={uploading}>{uploading ? "Wgrywanie..." : "Wgraj"}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Twoje materiały ({items.length})</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
              : items.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Brak materiałów.</p>
              : <div className="space-y-2">{items.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/30 transition-smooth">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{m.title}</div>
                    <div className="text-xs text-muted-foreground">{m.subject ?? "—"} · {m.file_type ?? "?"} · {((m.file_size ?? 0) / 1024 / 1024).toFixed(2)} MB · {m.visible_to_students ? "👁 widoczny" : "🚫 ukryty"}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => view(m)}><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(m)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}</div>}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
