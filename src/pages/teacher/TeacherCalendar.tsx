import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

interface ExamRow { id: string; title: string; available_from: string | null; available_until: string | null; status: string; }

export default function TeacherCalendar() {
  const [exams, setExams] = useState<ExamRow[]>([]);

  useEffect(() => {
    supabase.from("exams").select("id,title,available_from,available_until,status").order("available_from", { ascending: true }).then(({ data }) => {
      setExams((data as ExamRow[]) ?? []);
    });
  }, []);

  const grouped = exams.reduce<Record<string, ExamRow[]>>((acc, e) => {
    const d = e.available_from ? new Date(e.available_from).toLocaleDateString("pl-PL", { month: "long", year: "numeric" }) : "Bez daty";
    (acc[d] ||= []).push(e);
    return acc;
  }, {});

  return (
    <AppShell title="Kalendarz egzaminów" subtitle="Wszystkie zaplanowane terminy">
      <div className="space-y-8">
        {Object.entries(grouped).map(([month, items]) => (
          <div key={month}>
            <h2 className="font-display text-xl mb-3 capitalize text-gradient-cyber">{month}</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {items.map((e, i) => (
                <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="hover-lift">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-accent" />{e.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-3 w-3" />{e.available_from ? new Date(e.available_from).toLocaleString("pl-PL") : "—"}</div>
                      <Badge variant={e.status === "published" ? "default" : "secondary"}>{e.status}</Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
        {exams.length === 0 && <p className="text-muted-foreground">Brak zaplanowanych egzaminów.</p>}
      </div>
    </AppShell>
  );
}
