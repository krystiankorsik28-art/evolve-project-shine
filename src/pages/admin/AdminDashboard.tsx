import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, ScrollText, Activity, ShieldCheck, AlertTriangle, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Setup2FA } from "@/components/Setup2FA";

interface Stats { users: number; exams: number; attempts: number; recentAudits: number; }

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ users: 0, exams: 0, attempts: 0, recentAudits: 0 });
  const [hasMfa, setHasMfa] = useState(true);

  useEffect(() => {
    document.title = "Pulpit administratora — EduNex.pl";
    (async () => {
      const [u, e, a, l] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("exams").select("*", { count: "exact", head: true }),
        supabase.from("attempts").select("*", { count: "exact", head: true }),
        supabase.from("audit_logs").select("*", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString()),
      ]);
      setStats({
        users: u.count ?? 0,
        exams: e.count ?? 0,
        attempts: a.count ?? 0,
        recentAudits: l.count ?? 0,
      });
      const { data: factors } = await supabase.auth.mfa.listFactors();
      setHasMfa(!!factors?.totp?.find((f) => f.status === "verified"));
    })();
  }, []);

  const tiles = [
    { icon: Users, label: "Użytkownicy", value: stats.users, color: "from-primary to-primary-glow" },
    { icon: FileText, label: "Egzaminy", value: stats.exams, color: "from-accent to-warning" },
    { icon: ScrollText, label: "Podejścia", value: stats.attempts, color: "from-success to-primary-glow" },
    { icon: Activity, label: "Audyt 24h", value: stats.recentAudits, color: "from-warning to-destructive" },
  ];

  return (
    <AppShell title="Pulpit administratora" subtitle={`Witaj, ${user?.email ?? ""}`}>
      <div className="space-y-6">
        {!hasMfa && (
          <Card className="border-warning/40 bg-warning/5">
            <CardHeader className="flex-row items-center gap-3 space-y-0 pb-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <CardTitle className="text-base">Skonfiguruj uwierzytelnianie dwuskładnikowe (2FA)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Konto administratora wymaga 2FA dla bezpieczeństwa platformy. Zeskanuj kod QR aplikacją uwierzytelniającą.</p>
              <Setup2FA onDone={() => setHasMfa(true)} />
            </CardContent>
          </Card>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiles.map((t) => (
            <Card key={t.label} className="overflow-hidden relative">
              <div className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-br ${t.color} opacity-10 rounded-bl-full`} />
              <CardContent className="pt-6">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${t.color} mb-3 shadow-md`}>
                  <t.icon className="h-5 w-5 text-white drop-shadow" />
                </div>
                <div className="text-3xl font-display font-bold">{t.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{t.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Użytkownicy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Przyznawaj role, edytuj profile, dezaktywuj konta.</p>
              <Button asChild><Link to="/admin/users">Otwórz</Link></Button>
            </CardContent>
          </Card>
          <Card className="border-warning/30 bg-warning/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning"><UserCheck className="h-5 w-5" /> Akceptacje nauczycieli</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Zatwierdź lub odrzuć wnioski o konta nauczycielskie.</p>
              <Button asChild variant="outline"><Link to="/admin/approvals">Przejrzyj</Link></Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Logi audytu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Pełna historia operacji w systemie z możliwością filtrowania.</p>
              <Button asChild><Link to="/admin/audit">Zobacz logi</Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
