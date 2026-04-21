import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ShieldCheck, ShieldX, Search, Mail, Calendar, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { logAudit } from "@/lib/audit";
import { useAuth } from "@/lib/auth";

interface PendingTeacher {
  user_id: string;
  approval_status: "pending" | "approved" | "rejected";
  created_at: string;
  rejection_reason: string | null;
  profile: {
    first_name: string | null;
    last_name: string | null;
    display_name: string | null;
  } | null;
  email: string | null;
}

export default function AdminTeacherApprovals() {
  const { user } = useAuth();
  const [list, setList] = useState<PendingTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [rejectOpen, setRejectOpen] = useState<PendingTeacher | null>(null);
  const [reason, setReason] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage-users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ action: "list_users" }),
      });
      const j = await r.json();
      const teachers = (j.users ?? [])
        .filter((u: { role?: { role?: string } | null }) => u.role?.role === "teacher")
        .map((u: { id: string; email: string; created_at: string; profile: { first_name: string | null; last_name: string | null; display_name: string | null } | null; role: { approval_status: "pending" | "approved" | "rejected"; rejection_reason: string | null } }) => ({
          user_id: u.id,
          email: u.email,
          created_at: u.created_at,
          profile: u.profile,
          approval_status: u.role.approval_status,
          rejection_reason: u.role.rejection_reason,
        }));
      setList(teachers);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Błąd ładowania");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Zatwierdzanie nauczycieli — EduNex.pl";
    load();
  }, []);

  const approve = async (t: PendingTeacher) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage-users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ action: "approve_teacher", user_id: t.user_id, approver_id: user?.id }),
      });
      if (!r.ok) throw new Error("Błąd serwera");
      await logAudit("teacher_approved", { resource_type: "user", resource_id: t.user_id });
      toast.success(`Zatwierdzono ${t.profile?.display_name ?? t.email}`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Błąd");
    }
  };

  const reject = async () => {
    if (!rejectOpen) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage-users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ action: "reject_teacher", user_id: rejectOpen.user_id, reason: reason.trim() || "Brak uzasadnienia", approver_id: user?.id }),
      });
      if (!r.ok) throw new Error("Błąd serwera");
      await logAudit("teacher_rejected", { resource_type: "user", resource_id: rejectOpen.user_id });
      toast.success("Konto odrzucone");
      setRejectOpen(null);
      setReason("");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Błąd");
    }
  };

  const filtered = list.filter((t) => {
    if (filter !== "all" && t.approval_status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (t.email?.toLowerCase().includes(s) || t.profile?.display_name?.toLowerCase().includes(s));
    }
    return true;
  });

  const counts = {
    pending: list.filter((t) => t.approval_status === "pending").length,
    approved: list.filter((t) => t.approval_status === "approved").length,
    rejected: list.filter((t) => t.approval_status === "rejected").length,
  };

  return (
    <AppShell title="Akceptacja nauczycieli" subtitle="Zatwierdzaj nowe rejestracje">
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            { k: "pending" as const, label: "Oczekujący", count: counts.pending, color: "warning" },
            { k: "approved" as const, label: "Zatwierdzeni", count: counts.approved, color: "success" },
            { k: "rejected" as const, label: "Odrzuceni", count: counts.rejected, color: "destructive" },
          ].map((c) => (
            <Card key={c.k} role="button" onClick={() => setFilter(c.k)}
              className={`cursor-pointer transition-smooth ${filter === c.k ? "ring-2 ring-primary shadow-elegant" : "hover:shadow-card"}`}>
              <CardContent className="p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
                <div className={`text-4xl font-display font-bold mt-1 text-${c.color === "warning" ? "warning" : c.color === "success" ? "success" : "destructive"}`}>{c.count}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle>Nauczyciele ({filtered.length})</CardTitle>
              <div className="flex gap-2 items-center">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9 w-64" placeholder="Szukaj email/imię..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Button variant="outline" size="icon" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
                <Button variant={filter === "all" ? "default" : "ghost"} size="sm" onClick={() => setFilter("all")}>Wszyscy</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">Brak nauczycieli do wyświetlenia.</p>
            ) : (
              <div className="space-y-2">
                {filtered.map((t) => (
                  <div key={t.user_id} className="flex items-center gap-4 p-4 border border-border rounded-xl hover:bg-secondary/30 transition-smooth">
                    <div className="h-12 w-12 rounded-full bg-gradient-cyber text-white flex items-center justify-center font-bold flex-shrink-0">
                      {(t.profile?.first_name?.[0] ?? t.email?.[0] ?? "?").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{t.profile?.display_name ?? "Bez imienia"}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{t.email}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(t.created_at).toLocaleDateString("pl-PL")}</span>
                      </div>
                      {t.rejection_reason && t.approval_status === "rejected" && (
                        <div className="text-xs text-destructive mt-1">Powód: {t.rejection_reason}</div>
                      )}
                    </div>
                    <Badge variant={t.approval_status === "approved" ? "default" : t.approval_status === "rejected" ? "destructive" : "secondary"}>
                      {t.approval_status === "pending" ? "OCZEKUJE" : t.approval_status === "approved" ? "ZATWIERDZONY" : "ODRZUCONY"}
                    </Badge>
                    {t.approval_status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => approve(t)}>
                          <ShieldCheck className="h-4 w-4 mr-1" /> Akceptuj
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setRejectOpen(t)}>
                          <ShieldX className="h-4 w-4 mr-1" /> Odrzuć
                        </Button>
                      </div>
                    )}
                    {t.approval_status === "rejected" && (
                      <Button size="sm" variant="outline" onClick={() => approve(t)}>
                        <ShieldCheck className="h-4 w-4 mr-1" /> Aktywuj
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!rejectOpen} onOpenChange={(o) => !o && setRejectOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Odrzuć rejestrację</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Odrzucasz konto: <strong>{rejectOpen?.email}</strong>
            </p>
            <Textarea placeholder="Powód odrzucenia (widoczny dla nauczyciela)..." value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={500} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(null)}>Anuluj</Button>
            <Button variant="destructive" onClick={reject}>Odrzuć konto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
