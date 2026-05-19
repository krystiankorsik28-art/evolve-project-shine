import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, GraduationCap, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

interface Klasa { id: string; name: string; year: string; color: string; students: number; }

const COLORS = [
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-fuchsia-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-pink-500 to-rose-600",
  "from-indigo-500 to-purple-600",
];

export default function TeacherClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Klasa[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    setLoading(true);
    const { data: rows, error } = await supabase
      .from("classes")
      .select("id,name,year,color")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); setLoading(false); return; }
    const ids = (rows ?? []).map((r) => r.id);
    let counts: Record<string, number> = {};
    if (ids.length) {
      const { data: cs } = await supabase
        .from("class_students")
        .select("class_id")
        .in("class_id", ids);
      (cs ?? []).forEach((s: any) => { counts[s.class_id] = (counts[s.class_id] || 0) + 1; });
    }
    setClasses((rows ?? []).map((r: any) => ({ ...r, students: counts[r.id] || 0 })));
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  async function addClass() {
    if (!name.trim() || !user) return;
    const color = COLORS[classes.length % COLORS.length];
    const { error } = await supabase.from("classes").insert({
      name: name.trim(), year: "2025/26", color, created_by: user.id,
    });
    if (error) return toast.error(error.message);
    setName("");
    toast.success("Klasa utworzona");
    load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("classes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Usunięto klasę");
    load();
  }

  return (
    <AppShell title="Klasy i grupy" subtitle="Zarządzaj klasami, przypisuj egzaminy i materiały">
      <div className="space-y-6">
        <Card className="shadow-card">
          <CardHeader><CardTitle>Nowa klasa</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <Input placeholder="np. 4D — Geografia" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addClass()} />
            <Button onClick={addClass} className="bg-gradient-cyber"><Plus className="h-4 w-4 mr-1" />Dodaj</Button>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Ładowanie…</div>
        ) : classes.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">Brak klas. Dodaj pierwszą powyżej.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((k, i) => (
              <motion.div key={k.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="overflow-hidden hover-lift">
                  <div className={`h-24 bg-gradient-to-br ${k.color} flex items-end p-4`}>
                    <GraduationCap className="h-8 w-8 text-white/90" />
                  </div>
                  <CardContent className="pt-4 space-y-2">
                    <div className="font-display font-bold text-lg">{k.name}</div>
                    <div className="text-xs text-muted-foreground">Rok szkolny {k.year}</div>
                    <div className="flex items-center justify-between pt-2">
                      <Badge variant="secondary" className="gap-1"><Users className="h-3 w-3" />{k.students} uczniów</Badge>
                      <Button size="sm" variant="ghost" onClick={() => remove(k.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
