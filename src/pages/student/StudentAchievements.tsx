import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Flame, Star, Target, Trophy, Zap, BookOpen, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const achievements = [
  { icon: Trophy, label: "Pierwsze 100%", desc: "Egzamin bez błędu", color: "from-amber-400 to-yellow-600", earned: true },
  { icon: Flame, label: "7 dni z rzędu", desc: "Tydzień nauki", color: "from-orange-500 to-red-600", earned: true },
  { icon: Star, label: "Top 3 klasy", desc: "Miejsce w rankingu", color: "from-violet-500 to-fuchsia-600", earned: true },
  { icon: Target, label: "Snajper", desc: "10 trafionych pytań pod rząd", color: "from-emerald-500 to-teal-600", earned: false },
  { icon: Zap, label: "Błyskawica", desc: "Egzamin <50% czasu", color: "from-cyan-400 to-blue-600", earned: false },
  { icon: BookOpen, label: "Mól książkowy", desc: "100 pytań rozwiązanych", color: "from-pink-500 to-rose-600", earned: true },
  { icon: GraduationCap, label: "Maturzysta", desc: "Ukończ kurs maturalny", color: "from-indigo-500 to-purple-600", earned: false },
  { icon: Award, label: "Mistrz przedmiotu", desc: "Średnia >90%", color: "from-amber-500 to-orange-600", earned: false },
];

export default function StudentAchievements() {
  return (
    <AppShell title="Osiągnięcia" subtitle="Twoje odznaki i postępy">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {achievements.map((a, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
            <Card className={`hover-lift ${!a.earned ? "opacity-50 grayscale" : ""}`}>
              <CardContent className="p-5 text-center space-y-3">
                <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center shadow-elegant`}>
                  <a.icon className="h-8 w-8 text-white" />
                </div>
                <div className="font-display font-bold">{a.label}</div>
                <div className="text-xs text-muted-foreground">{a.desc}</div>
                {a.earned ? (
                  <div className="text-[10px] uppercase tracking-widest text-accent font-bold">✓ Zdobyte</div>
                ) : (
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Zablokowane</div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}
