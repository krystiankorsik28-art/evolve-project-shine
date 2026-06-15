import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  GraduationCap, LogOut, User, KeyRound, Loader2,
  Clock, CheckCircle2, XCircle, BookOpen, ArrowLeft,
  History, Zap, Award, Download, ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateSerial, getQrUrl, downloadCertPdf } from "@/lib/certificate";
import { toast } from "sonner";
import { studentPinLogin } from "@/lib/student-auth.functions";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/student/dashboard")({
  component: StudentDashboard,
  head: () => ({ meta: [{ title: "Panel ucznia | EduNex" }] }),
});

type AttemptSummary = {
  id: string;
  exam_title: string;
  status: string;
  score: number | null;
  max_score: number | null;
  percent: number | null;
  passed: boolean | null;
  started_at: string;
};

function StudentDashboard() {
  const navigate = useNavigate();
  const login = useServerFn(studentPinLogin);

  const [user, setUser] = useState<{ id: string; email?: string; first_name?: string; last_name?: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [pinLoading, setPinLoading] = useState(false);
  const [history, setHistory] = useState<AttemptSummary[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate({ to: "/auth/student" });
        return;
      }
      const meta = session.user.user_metadata || {};
      setUser({
        id: session.user.id,
        email: session.user.email,
        first_name: meta.first_name || "",
        last_name: meta.last_name || "",
      });
      setChecking(false);
    };
    check();
  }, [navigate]);

  // load attempts
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("attempts")
        .select("id, exam_id, status, score, max_score, percent, passed, created_at")
        .eq("student_name", `${user.first_name} ${user.last_name}`)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) {
        const examIds = [...new Set(data.map((a) => a.exam_id).filter(Boolean))];
        const { data: exams } = await supabase
          .from("exams")
          .select("id, title")
          .in("id", examIds);
        const titleMap: Record<string, string> = {};
        for (const e of exams ?? []) titleMap[e.id] = e.title;
        setHistory(data.map((a) => ({
          id: a.id,
          exam_title: titleMap[a.exam_id] ?? "Nieznany egzamin",
          status: a.status,
          score: a.score,
          max_score: a.max_score,
          percent: a.percent,
          passed: a.passed,
          started_at: a.created_at,
        } as AttemptSummary)));
      }
      setLoadingHistory(false);
    })();
  }, [user]);

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.email || "Uczeń";

  const pin = pinDigits.join("");
  const pinReady = pin.length === 6;

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinReady) { toast.error("Wpisz pełny 6-cyfrowy PIN"); return; }
    setPinLoading(true);
    try {
      const nameParts = displayName.split(" ");
      const res = await login({
        data: {
          first_name: nameParts[0] || "Uczeń",
          last_name: nameParts.slice(1).join(" ") || "",
          pin,
        },
      });
      sessionStorage.setItem("edunex_student", JSON.stringify({ ...res }));
      toast.success(`Egzamin: ${res.exam_title}`);
      await navigate({ to: "/student/exam/$attemptId", params: { attemptId: res.attempt_id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd");
      setPinLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth/student" });
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#05080f] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05080f] text-white">
      <Toaster theme="dark" />

      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-[#05080f]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4"/>EduNex
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-white/70">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-blue-500 grid place-items-center">
                <User className="w-4 h-4 text-[#05080f]" />
              </div>
              <span className="text-white/90 font-medium">{displayName}</span>
            </div>
            <button onClick={handleLogout} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/60 hover:text-white transition">
              <LogOut className="w-3.5 h-3.5"/>Wyloguj
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-accent/10 via-accent/5 to-accent/10 p-6 md:p-8">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-blue-500 grid place-items-center shadow-xl shadow-accent/20">
              <GraduationCap className="w-8 h-8 text-[#05080f]" />
            </div>
            <div>
              <div className="text-[10px] tracking-[0.25em] text-accent/70 uppercase font-mono">Panel ucznia</div>
              <h1 className="text-2xl md:text-3xl font-display font-bold mt-1">Witaj, {displayName.split(" ")[0]}!</h1>
              <p className="text-white/50 text-sm mt-1">Wprowadź PIN, aby rozpocząć egzamin, lub przejrzyj historię.</p>
            </div>
          </div>
        </div>

        {/* PIN entry card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue-500 grid place-items-center">
              <KeyRound className="w-5 h-5 text-[#05080f]" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg">Rozpocznij egzamin</h2>
              <p className="text-xs text-white/50">Wpisz 6-cyfrowy kod PIN od nauczyciela</p>
            </div>
          </div>
          <form onSubmit={handlePinSubmit} className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex gap-2 flex-1">
              {pinDigits.map((d, i) => (
                <input
                  key={i}
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(-1);
                    const next = [...pinDigits]; next[i] = v; setPinDigits(next);
                    if (v && i < 5) document.getElementById(`pin-${i+1}`)?.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !d && i > 0) document.getElementById(`pin-${i-1}`)?.focus();
                  }}
                  id={`pin-${i}`}
                  className="w-full max-w-[52px] aspect-square text-center text-xl font-mono bg-white/[0.04] border border-white/[0.08] rounded-xl outline-none focus:border-accent/40 focus:bg-white/[0.06] transition-all"
                  autoComplete="off"
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={!pinReady || pinLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-blue-500 hover:from-accent hover:to-blue-500 text-[#05080f] font-semibold text-sm disabled:opacity-40 transition shadow-lg shadow-accent/20"
            >
              {pinLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Zap className="w-4 h-4"/>}
              {pinLoading ? "Sprawdzam..." : "Rozpocznij"}
            </button>
          </form>
        </div>

        {/* Exam history */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue-500 grid place-items-center">
                <History className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-lg">Historia egzaminów</h2>
                <p className="text-xs text-white/50">Twoje ostatnie próby</p>
              </div>
            </div>
          </div>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent"/></div>
          ) : history.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-400/20 grid place-items-center mb-3">
                <BookOpen className="w-5 h-5 text-amber-300" />
              </div>
              <p className="text-sm text-white/70">Brak historii egzaminów</p>
              <p className="text-xs text-white/40 mt-1">Użyj kodu PIN od nauczyciela, aby rozpocząć pierwszy egzamin.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {history.map((h) => (
                <div key={h.id} className="flex items-center gap-4 py-3">
                  <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${
                    h.passed === true ? "bg-emerald-500/15 text-emerald-300" :
                    h.passed === false ? "bg-pink-500/15 text-pink-300" :
                    "bg-white/5 text-white/40"
                  }`}>
                    {h.passed === true ? <CheckCircle2 className="w-5 h-5" /> :
                     h.passed === false ? <XCircle className="w-5 h-5" /> :
                     <Clock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{h.exam_title}</div>
                    <div className="text-[11px] text-white/40 flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(h.started_at).toLocaleString("pl-PL", { dateStyle: "medium" })}
                      {h.score != null && <><span>·</span><span>{h.score}/{h.max_score} ({h.percent}%)</span></>}
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    h.status === "submitted" ? "text-emerald-300 bg-emerald-500/10 border-emerald-400/25" :
                    h.status === "in_progress" ? "text-amber-300 bg-amber-500/10 border-amber-400/25" :
                    "text-white/40 bg-white/5 border-white/10"
                  }`}>
                    {h.status === "submitted" ? "Wysłany" : h.status === "in_progress" ? "W trakcie" : h.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certificates */}
        {history.some((h) => h.passed === true) && (
          <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/5 via-cyan-500/5 to-emerald-500/5 backdrop-blur p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 grid place-items-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-lg">Moje certyfikaty</h2>
                <p className="text-xs text-white/50">Pobierz certyfikat ukończenia egzaminu</p>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {history.filter((h) => h.passed === true).map((h) => {
                const serial = generateSerial({
                  attempt_id: h.id,
                  exam_title: h.exam_title,
                  student_name: displayName,
                  score: h.score ?? 0,
                  max_score: h.max_score ?? 0,
                  percent: h.percent ?? 0,
                  passed: true,
                  completed_at: h.started_at,
                });
                return (
                  <div key={h.id} className="flex items-center gap-4 py-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 grid place-items-center shrink-0">
                      <Award className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{h.exam_title}</div>
                      <div className="text-[11px] text-white/40 font-mono mt-0.5">{serial}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadCertPdf({
                          attempt_id: h.id,
                          exam_title: h.exam_title,
                          student_name: displayName,
                          score: h.score ?? 0,
                          max_score: h.max_score ?? 0,
                          percent: h.percent ?? 0,
                          passed: true,
                          completed_at: h.started_at,
                        }, serial)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-semibold transition"
                      >
                        <Download className="w-3.5 h-3.5" />PDF
                      </button>
                      <a
                        href={`/verify/${serial}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/60 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
