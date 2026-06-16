import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck, ShieldX, Loader2, GraduationCap, Award,
  CheckCircle2, XCircle, Clock, ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { parseSerial, getVerifyUrl, type CertData } from "@/lib/certificate";

export const Route = createFileRoute("/verify/$serial")({
  component: VerifyPage,
  head: () => ({ meta: [{ title: "Weryfikacja certyfikatu | EduNex" }] }),
});

function VerifyPage() {
  const { serial } = Route.useParams();
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "error">("loading");
  const [cert, setCert] = useState<CertData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const attemptId = parseSerial(serial);
        if (!attemptId) { setStatus("invalid"); return; }

        const { data: attempt, error } = await supabase
          .from("attempts")
          .select("id, exam_id, student_name, score, max_score, percent, passed, status, submitted_at, created_at")
          .eq("id", attemptId)
          .maybeSingle();

        if (error || !attempt) { setStatus("invalid"); return; }
        if (attempt.status !== "submitted") { setStatus("invalid"); return; }

        const { data: exam } = await supabase
          .from("exams")
          .select("title")
          .eq("id", attempt.exam_id)
          .maybeSingle();

        setCert({
          attempt_id: attempt.id,
          exam_title: exam?.title ?? "Nieznany egzamin",
          student_name: attempt.student_name,
          score: attempt.score ?? 0,
          max_score: attempt.max_score ?? 0,
          percent: Math.round(attempt.percent ?? 0),
          passed: attempt.passed ?? false,
          completed_at: attempt.submitted_at ?? attempt.created_at,
        });
        setStatus("valid");
      } catch {
        setStatus("error");
      }
    })();
  }, [serial]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (status === "invalid" || status === "error") {
    return (
      <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center animate-fadeIn">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-red-500/15 border border-red-400/30 grid place-items-center">
            <ShieldX className="w-10 h-10 text-red-300" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-2">Certyfikat nie znaleziony</h1>
          <p className="text-white/50 text-sm mb-6">
            {status === "error"
              ? "Wystąpił błąd podczas weryfikacji. Spróbuj ponownie później."
              : "Ten numer seryjny nie odpowiada żadnemu ważnemu certyfikatowi. Sprawdź poprawność kodu."}
          </p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold text-sm transition">
            ← Strona główna
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center p-4 md:p-6">
      <div className="max-w-lg w-full animate-fadeIn">
        {/* Verified badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-mono tracking-wider">
            <ShieldCheck className="w-4 h-4" />CERTYFIKAT ZWERYFIKOWANY
          </div>
        </div>

        {/* Certificate card */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-emerald-500/5 backdrop-blur p-8 text-center">
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative">
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-500 grid place-items-center shadow-xl shadow-emerald-400/20">
              <Award className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-2xl font-display font-bold mb-1">Certyfikat ukończenia</h1>
            <p className="text-emerald-300/70 text-sm mb-6">{cert?.exam_title}</p>

            {/* Student name */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-6">
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-mono mb-1">Wydany dla</p>
              <p className="text-xl font-display font-bold text-white">{cert?.student_name}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3">
                <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-300" />
                <div className="text-lg font-bold">{cert?.score}/{cert?.max_score}</div>
                <div className="text-[10px] text-white/50">Wynik</div>
              </div>
              <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3">
                <Award className="w-4 h-4 mx-auto mb-1 text-accent" />
                <div className="text-lg font-bold">{cert?.percent}%</div>
                <div className="text-[10px] text-white/50">Procent</div>
              </div>
            </div>

            {/* Status */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm mb-6 ${
              cert?.passed ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30" : "bg-red-500/15 text-red-300 border border-red-400/30"
            }`}>
              {cert?.passed ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              {cert?.passed ? "ZALICZONY" : "NIEZALICZONY"}
            </div>

            {/* Date */}
            {cert && (
              <p className="text-xs text-white/40 flex items-center justify-center gap-1.5 mb-6">
                <Clock className="w-3.5 h-3.5" />
                Data ukończenia: {new Date(cert.completed_at).toLocaleDateString("pl-PL", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            )}

            {/* Serial + QR */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-accent font-mono mb-2">Kod QR</p>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(getVerifyUrl(serial))}`}
                  alt="QR Code"
                  className="rounded-xl border border-white/10 mx-auto"
                  width={120}
                  height={120}
                />
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-accent font-mono mb-2">Nr seryjny</p>
                <p className="text-sm font-mono text-accent bg-white/[0.03] px-3 py-2 rounded-lg border border-white/10">{serial}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-white/30">
          <GraduationCap className="w-4 h-4 mx-auto mb-1 opacity-50" />
          <p>EduNex — platforma egzaminacyjna</p>
          <Link to="/" className="inline-flex items-center gap-1 text-accent hover:text-accent mt-2 transition">
            Strona główna <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
