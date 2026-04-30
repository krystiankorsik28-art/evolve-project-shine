import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { Loader2, Download, Search } from "lucide-react";

interface Row {
  user_id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  role: string | null;
}

export default function AdminUsers() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filtered = rows.filter((r) => {
    if (roleFilter !== "all" && (r.role ?? "") !== roleFilter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (r.display_name ?? "").toLowerCase().includes(s)
      || (r.first_name ?? "").toLowerCase().includes(s)
      || (r.last_name ?? "").toLowerCase().includes(s);
  });

  const exportCSV = () => {
    const header = ["display_name", "first_name", "last_name", "role", "created_at"];
    const rowsCsv = filtered.map((r) => [
      JSON.stringify(r.display_name ?? ""), JSON.stringify(r.first_name ?? ""),
      JSON.stringify(r.last_name ?? ""), r.role ?? "", r.created_at,
    ].join(","));
    const csv = [header.join(","), ...rowsCsv].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `uzytkownicy-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Wyeksportowano ${filtered.length} użytkowników`);
  };

  const load = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, first_name, last_name, created_at")
      .order("created_at", { ascending: false });

    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const roleMap = new Map<string, string>();
    roles?.forEach((r) => roleMap.set(r.user_id, r.role));

    setRows((profiles ?? []).map((p) => ({ ...p, role: roleMap.get(p.user_id) ?? null })));
    setLoading(false);
  };

  useEffect(() => {
    document.title = "Użytkownicy — EduNex.pl";
    load();
  }, []);

  const changeRole = async (userId: string, newRole: "admin" | "teacher" | "student") => {
    const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (delErr) { toast.error(delErr.message); return; }
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
    if (error) { toast.error(error.message); return; }
    await logAudit("admin_change_role", { resource_type: "user", resource_id: userId, metadata: { newRole } });
    toast.success("Rola zaktualizowana");
    load();
  };

  return (
    <AppShell title="Użytkownicy" subtitle="Zarządzaj rolami i kontami">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle>Użytkownicy ({filtered.length} / {rows.length})</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9 w-56" placeholder="Szukaj po imieniu/nazwisku..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie role</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="teacher">Nauczyciel</SelectItem>
                  <SelectItem value="student">Uczeń</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-2" /> CSV</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Brak użytkowników.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nazwa</TableHead>
                  <TableHead>Rola</TableHead>
                  <TableHead>Zarejestrowany</TableHead>
                  <TableHead className="text-right">Zmień rolę</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.user_id}>
                    <TableCell className="font-medium">{r.display_name || `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() || "—"}</TableCell>
                    <TableCell><Badge variant={r.role === "admin" ? "destructive" : r.role === "teacher" ? "default" : "secondary"}>{r.role ?? "brak"}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString("pl-PL")}</TableCell>
                    <TableCell className="text-right">
                      <Select onValueChange={(v) => changeRole(r.user_id, v as never)} value={r.role ?? undefined}>
                        <SelectTrigger className="w-32 ml-auto"><SelectValue placeholder="Wybierz" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="teacher">Nauczyciel</SelectItem>
                          <SelectItem value="student">Uczeń</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
