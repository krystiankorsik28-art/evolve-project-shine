import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";

const threads = [
  { author: "Anna K.", role: "Uczeń", title: "Jak rozwiązać równanie kwadratowe z deltą ujemną?", replies: 8, likes: 12, tag: "Matematyka", time: "2h" },
  { author: "Tomasz W.", role: "Nauczyciel", title: "Materiały do matury próbnej z biologii — link", replies: 23, likes: 47, tag: "Biologia", time: "1d" },
  { author: "Karolina M.", role: "Uczeń", title: "Czy będzie powtórka z chemii organicznej?", replies: 4, likes: 6, tag: "Chemia", time: "3d" },
];

export default function Forum() {
  return (
    <AppShell title="Forum klasowe" subtitle="Pytania, dyskusje, ogłoszenia">
      <div className="space-y-3">
        {threads.map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="hover-lift cursor-pointer">
              <CardContent className="p-5 flex gap-4 items-start">
                <Avatar className="h-10 w-10"><AvatarFallback className="bg-gradient-cyber text-white text-xs">{t.author.split(" ").map(s => s[0]).join("")}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <span className="font-medium text-foreground">{t.author}</span>
                    <Badge variant="outline" className="text-[10px]">{t.role}</Badge>
                    <span>•</span>
                    <span>{t.time} temu</span>
                  </div>
                  <div className="font-display font-semibold mb-2">{t.title}</div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Badge variant="secondary">{t.tag}</Badge>
                    <span className="inline-flex items-center gap-1"><MessageSquare className="h-3 w-3" />{t.replies}</span>
                    <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{t.likes}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}
