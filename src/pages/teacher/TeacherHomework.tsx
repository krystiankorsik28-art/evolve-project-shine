import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, FileCheck2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const tasks = [
  { title: "Esej: Pan Tadeusz — księga IV", due: "2026-05-20", subject: "Język polski", status: "Do zrobienia" },
  { title: "Zadania 12-18 str. 145", due: "2026-05-18", subject: "Matematyka", status: "W trakcie" },
  { title: "Prezentacja: Układ krwionośny", due: "2026-05-25", subject: "Biologia", status: "Do zrobienia" },
];

export default function TeacherHomework() {
  return (
    <AppShell title="Zadania domowe" subtitle="Twórz, oceniaj i monitoruj postępy uczniów">
      <div className="flex justify-end mb-4">
        <Button className="bg-gradient-cyber"><Plus className="h-4 w-4 mr-1" />Nowe zadanie</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="text-base flex items-start gap-2"><FileCheck2 className="h-4 w-4 text-accent mt-0.5" />{t.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Badge variant="secondary">{t.subject}</Badge>
                <div className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-3 w-3" />Termin: {t.due}</div>
                <Badge variant={t.status === "W trakcie" ? "default" : "outline"}>{t.status}</Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}
