import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Log {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  created_at: string;
  metadata: unknown;
}

export default function AdminAudit() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Logi audytu — EduNex.pl";
    (async () => {
      const { data } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      setLogs((data ?? []) as never);
      setLoading(false);
    })();
  }, []);

  return (
    <AppShell title="Logi audytu" subtitle="Ostatnie 200 zdarzeń systemowych">
      <Card>
        <CardHeader><CardTitle>Zdarzenia</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Brak zdarzeń.</p>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Czas</TableHead>
                    <TableHead>Akcja</TableHead>
                    <TableHead>Zasób</TableHead>
                    <TableHead>Użytkownik</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-xs font-mono">{new Date(l.created_at).toLocaleString("pl-PL")}</TableCell>
                      <TableCell><Badge variant="outline">{l.action}</Badge></TableCell>
                      <TableCell className="text-sm">{l.resource_type ?? "—"}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{l.user_id?.slice(0, 8) ?? "anon"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
