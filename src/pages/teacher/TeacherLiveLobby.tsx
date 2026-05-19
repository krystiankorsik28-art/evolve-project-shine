import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Radio, Users, Zap, Play } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function TeacherLiveLobby() {
  const [pin] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());

  return (
    <AppShell title="Tryb Live Quiz" subtitle="Uczniowie dołączają PIN-em — wyniki w czasie rzeczywistym">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-gradient-hero text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <CardContent className="p-8 relative">
            <div className="flex items-center gap-2 text-cyan-300 text-sm uppercase tracking-widest font-semibold mb-2"><Radio className="h-4 w-4 animate-pulse" />Lobby aktywne</div>
            <h2 className="font-display text-3xl mb-6">Dołącz przez edunex.pl/join</h2>
            <div className="text-center py-8">
              <div className="text-xs uppercase tracking-widest text-cyan-200 mb-2">PIN dostępu</div>
              <motion.div className="font-mono text-7xl font-bold text-gradient-gold" animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                {pin}
              </motion.div>
            </div>
            <Button size="lg" className="w-full bg-white text-primary hover:bg-white/90"><Play className="h-5 w-5 mr-2" />Rozpocznij quiz</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-display text-xl flex items-center gap-2"><Users className="h-5 w-5 text-accent" />Uczestnicy</h3>
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Czekamy na pierwszych uczestników…</p>
            </div>
            <Input placeholder="Wybierz egzamin do trybu live…" />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
