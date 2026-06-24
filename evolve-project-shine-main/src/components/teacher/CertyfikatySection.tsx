import { useState, useEffect } from "react";
import { Award, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function Certyfikaty() {
  const [attempts, setAttempts] = useState<Array<{
    id: string; exam_title: string; student_name: string;
    score: number; max_score: number; percent: number; submitted_at: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) { setLoading(false); return; }
      const { data: exams } = await supabase.from("exams").select("id, title").eq("created_by", user.user.id);
      if (!exams || exams.length === 0) { setLoading(false); return; }
      const examIds = exams.map((e) => e.id);
      const { data } = await supabase
        .from("attempts")
        .select("id, exam_id, student_name, score, max_score, percent, submitted_at")
        .in("exam_id", examIds)
        .eq("status", "submitted")
        .eq("passed", true)
        .order("submitted_at", { ascending: false })
        .limit(100);
      const titleMap: Record<string, string> = {};
      for (const e of exams) titleMap[e.id] = e.title;
      if (data) setAttempts(data.map((a) => ({ ...a, exam_title: titleMap[a.exam_id] ?? "Nieznany" })));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/10 via-accent/5 to-accent/10 p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue-500 grid place-items-center">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white">Certyfikaty uczniów</h2>
            <p className="text-xs text-white/50">Wystawione certyfikaty za zaliczone egzaminy</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-cyan-400"/></div>
      ) : attempts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-400/20 grid place-items-center mb-3">
            <Award className="w-5 h-5 text-amber-300" />
          </div>
          <p className="text-sm text-white/70">Brak certyfikatów</p>
          <p className="text-xs text-white/40 mt-1">Certyfikaty pojawią się, gdy uczniowie zaliczą egzaminy.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-white/50 uppercase tracking-wider">
                  <th className="text-left p-4 font-medium">Uczeń</th>
                  <th className="text-left p-4 font-medium">Egzamin</th>
                  <th className="text-left p-4 font-medium">Wynik</th>
                  <th className="text-left p-4 font-medium">Data</th>
                  <th className="text-left p-4 font-medium">Certyfikat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {attempts.map((a) => {
                  const raw = `${a.id}-${a.score}-${Math.round(a.percent)}-edunex-cert-v1`;
                  let hash = 0;
                  for (let i = 0; i < raw.length; i++) hash = ((hash << 5) - hash) + raw.charCodeAt(i);
                  const h = Math.abs(hash).toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
                  const id = a.id.replace(/-/g, "").slice(0, 6).toUpperCase();
                  const serial = `EDX-${id}-${h}`;
                  return (
                    <tr key={a.id} className="hover:bg-white/[0.01] transition">
                      <td className="p-4 text-white/90">{a.student_name}</td>
                      <td className="p-4 text-white/70">{a.exam_title}</td>
                      <td className="p-4">
                        <span className="text-emerald-300 font-mono">{a.score}/{a.max_score} ({Math.round(a.percent)}%)</span>
                      </td>
                      <td className="p-4 text-white/50 text-[11px]">
                        {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString("pl-PL") : "-"}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <a
                            href={`/verify/${serial}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-accent text-xs hover:bg-cyan-500/20 transition"
                          >
                            <ExternalLink className="w-3 h-3" />Sprawdź
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
