import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Bell, Shield, Globe, Palette } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  return (
    <AppShell title="Ustawienia" subtitle="Personalizuj swoje konto">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-accent" />Konto</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Email</Label><Input value={user?.email ?? ""} readOnly /></div>
            <div><Label>Nowe hasło</Label><Input type="password" placeholder="••••••••" /></div>
            <Button className="bg-gradient-cyber">Zapisz</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-accent" />Powiadomienia</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {["Nowe egzaminy", "Wyniki", "Przypomnienia o terminach", "Wiadomości na forum"].map((l) => (
              <div key={l} className="flex items-center justify-between"><Label>{l}</Label><Switch defaultChecked /></div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-accent" />Język i region</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Język interfejsu</Label><Input value="Polski" readOnly /></div>
            <div><Label>Strefa czasowa</Label><Input value="Europe/Warsaw" readOnly /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-accent" />Wygląd</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between"><Label>Tryb ciemny</Label><Switch /></div>
            <div className="flex items-center justify-between"><Label>Animacje</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>Dźwięki</Label><Switch /></div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
