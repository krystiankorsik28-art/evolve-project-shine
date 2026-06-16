import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Shield, LogOut, Users, FileText, Activity, Loader2, CheckCircle2, XCircle, Sparkles, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPanel,
  head: () => ({ meta: [{ title: "Admin — EduNex" }] }),
});

type PendingTeacher = { id: string; user_id: string; role: string; approval_status: string; created_at: string };

function AdminPanel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState<PendingTeacher[]>([]);
  const [stats, setStats] = useState({ exams: 0, attempts: 0, messages: 0 });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate({ to: "/auth/admin" }); return; }
      setEmail(user.email ?? "");
      const [{ data: roles }, { count: examCount }, { count: attemptCount }] = await Promise.all([
        supabase.from("user_roles").select("id,user_id,role,approval_status,created_at").eq("approval_status","pending"),
        supabase.from("exams").select("*", { count: "exact", head: true }),
        supabase.from("attempts").select("*", { count: "exact", head: true }),
      ]);
      setPending((roles ?? []) as PendingTeacher[]);
      setStats({ exams: examCount ?? 0, attempts: attemptCount ?? 0, messages: 0 });
      setLoading(false);
    })();
  }, [navigate]);

  const decide = async (id: string, approve: boolean) => {
    const { error } = await supabase.from("user_roles").update({
      approval_status: approve ? "approved" : "rejected",
      approved_at: approve ? new Date().toISOString() : null,
    }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setPending((p) => p.filter((x) => x.id !== id));
    toast.success(approve ? "Approved" : "Rejected");
  };

  const logout = async () => { await supabase.auth.signOut(); await navigate({ to: "/" }); };

  if (loading) return <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-cyan-400"/></div>;

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      <Toaster theme="dark" />
      <div className="flex flex-col min-h-screen">
        <div className="h-14 border-b border-white/[0.06] bg-[#0c0c16]/90 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold">EduNex</span>
            <ChevronRight className="w-3 h-3 text-white/20" />
            <span className="text-xs text-cyan-400/60">Admin</span>
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-white/40 hidden sm:inline">{email}</span>
            <button onClick={logout} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white transition">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 lg:p-8 max-w-5xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-lg font-semibold">Admin Console</h1>
            <p className="text-sm text-white/40 mt-1">Manage teachers, monitor system, audit logs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <AdminStat icon={Users} label="Pending Teachers" value={String(pending.length)} accent="from-amber-400 to-orange-500" />
            <AdminStat icon={FileText} label="Total Exams" value={String(stats.exams)} accent="from-cyan-400 to-blue-500" />
            <AdminStat icon={Activity} label="Student Attempts" value={String(stats.attempts)} accent="from-emerald-400 to-teal-500" />
          </div>

          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Users className="w-4.5 h-4.5 text-[#0a0a12]" style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Teacher Approvals</h2>
                <p className="text-xs text-white/40">Review pending teacher registration requests</p>
              </div>
            </div>
            {pending.length === 0 ? (
              <div className="text-center py-8 text-sm text-white/30">No pending requests.</div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {pending.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-3">
                    <div className="text-sm">
                      <div className="text-white/80 font-mono text-xs">{p.user_id}</div>
                      <div className="text-white/30 text-[11px] mt-0.5">Requested: {new Date(p.created_at).toLocaleString("pl-PL")}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>decide(p.id, true)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs border border-emerald-400/20 transition">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button onClick={()=>decide(p.id, false)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 text-xs border border-pink-400/20 transition">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function AdminStat({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.12] transition">
      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center mb-3`}>
        <Icon className="w-4.5 h-4.5 text-[#0a0a12]" style={{ width: 18, height: 18 }} />
      </div>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-white/40 mt-0.5">{label}</div>
    </div>
  );
}
