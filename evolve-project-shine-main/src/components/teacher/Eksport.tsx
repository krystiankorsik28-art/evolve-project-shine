import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, FileSpreadsheet, FileText, Loader2, Info, Database } from "lucide-react";
import jsPDF from "jspdf";

type Exam = { id: string; title: string; subject: string | null; passing_score: number };
type Attempt = { id: string; exam_id: string; student_name: string; score: number | null; max_score: number | null; percent: number | null; passed: boolean | null; submitted_at: string | null; graded_at: string | null };

type Format = "vulcan_csv" | "librus_csv" | "generic_csv" | "pdf_report";

const FORMAT_INFO: Record<Format, { label: string; desc: string; ext: string; icon: typeof FileSpreadsheet }> = {
  vulcan_csv: { label: "Vulcan UONET+ (CSV)", desc: "Import w module Oceny → Import z pliku CSV. Kolumny: PESEL/Nazwisko/Imię/Ocena.", ext: "csv", icon: FileSpreadsheet },
  librus_csv: { label: "Librus Synergia (CSV)", desc: "Format akceptowany w panelu nauczyciela → Oceny → Import. Librus nie ma publicznego API, więc import CSV to oficjalna ścieżka.", ext: "csv", icon: FileSpreadsheet },
  generic_csv: { label: "Uniwersalny CSV (Excel)", desc: "Wszystkie kolumny — do otwarcia w Excelu, Numbers, Google Sheets.", ext: "csv", icon: FileSpreadsheet },
  pdf_report: { label: "Raport PDF", desc: "Sformatowany dokument do druku / archiwizacji.", ext: "pdf", icon: FileText },
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (/[",;\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function pctToGrade(p: number): number {
  // Polska skala 1-6
  if (p >= 95) return 6;
  if (p >= 85) return 5;
  if (p >= 70) return 4;
  if (p >= 55) return 3;
  if (p >= 40) return 2;
  return 1;
}

export function Eksport() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [examId, setExamId] = useState("");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [format, setFormat] = useState<Format>("vulcan_csv");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("exams").select("id,title,subject,passing_score").order("created_at", { ascending: false });
      setExams((data as Exam[]) ?? []);
      if (data?.[0]) setExamId(data[0].id);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!examId) return;
    (async () => {
      const { data } = await supabase.from("attempts").select("id,exam_id,student_name,score,max_score,percent,passed,submitted_at,graded_at").eq("exam_id", examId).order("submitted_at", { ascending: false });
      setAttempts((data as Attempt[]) ?? []);
    })();
  }, [examId]);

  const exam = exams.find(e => e.id === examId);
  const finished = attempts.filter(a => a.percent != null);

  const exportNow = async () => {
    if (!exam) return;
    if (finished.length === 0) { toast.error("Brak ukończonych podejść do eksportu"); return; }
    setBusy(true);
    try {
      const dateStr = new Date().toISOString().slice(0, 10);
      const safeTitle = exam.title.replace(/[^\w\s.-]/g, "").trim().slice(0, 60) || "egzamin";
      const filename = `${safeTitle}_${dateStr}.${FORMAT_INFO[format].ext}`;

      if (format === "pdf_report") {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold"); doc.setFontSize(16);
        doc.text(`Raport: ${exam.title}`, 14, 18);
        doc.setFontSize(10); doc.setFont("helvetica", "normal");
        doc.text(`Przedmiot: ${exam.subject ?? "-"}`, 14, 26);
        doc.text(`Data wygenerowania: ${new Date().toLocaleString("pl-PL")}`, 14, 32);
        doc.text(`Liczba podejsc: ${finished.length}`, 14, 38);
        const avg = finished.reduce((s, a) => s + (a.percent ?? 0), 0) / Math.max(finished.length, 1);
        const passed = finished.filter(a => (a.percent ?? 0) >= exam.passing_score).length;
        doc.text(`Srednia: ${avg.toFixed(1)}%   Zdawalnosc: ${Math.round((passed / finished.length) * 100)}%`, 14, 44);

        doc.setFont("helvetica", "bold");
        doc.text("Uczen", 14, 56); doc.text("Wynik", 110, 56); doc.text("Procent", 140, 56); doc.text("Ocena", 175, 56);
        doc.line(14, 58, 196, 58);
        doc.setFont("helvetica", "normal");
        let y = 64;
        finished.forEach((a) => {
          if (y > 280) { doc.addPage(); y = 20; }
          const g = pctToGrade(a.percent ?? 0);
          doc.text(String(a.student_name).slice(0, 50), 14, y);
          doc.text(`${a.score ?? 0}/${a.max_score ?? 0}`, 110, y);
          doc.text(`${Math.round(a.percent ?? 0)}%`, 140, y);
          doc.text(String(g), 175, y);
          y += 6;
        });
        const blob = doc.output("blob");
        downloadBlob(blob, filename);
      } else {
        let csv = "";
        if (format === "vulcan_csv") {
          csv = "Nazwisko;Imie;Ocena;Procent;Data\n";
          finished.forEach(a => {
            const parts = a.student_name.trim().split(/\s+/);
            const imie = parts[0] ?? "";
            const nazwisko = parts.slice(1).join(" ") || "-";
            csv += `${csvEscape(nazwisko)};${csvEscape(imie)};${pctToGrade(a.percent ?? 0)};${Math.round(a.percent ?? 0)};${(a.submitted_at ?? "").slice(0, 10)}\n`;
          });
        } else if (format === "librus_csv") {
          csv = "Uczen,Ocena,Waga,Kategoria,Data,Komentarz\n";
          finished.forEach(a => {
            csv += `${csvEscape(a.student_name)},${pctToGrade(a.percent ?? 0)},1,Sprawdzian,${(a.submitted_at ?? "").slice(0, 10)},${csvEscape(`Wynik ${Math.round(a.percent ?? 0)}% (${a.score ?? 0}/${a.max_score ?? 0})`)}\n`;
          });
        } else {
          csv = "Uczen,Punkty,Maks,Procent,Ocena,Zdane,Data ukonczenia\n";
          finished.forEach(a => {
            csv += `${csvEscape(a.student_name)},${a.score ?? 0},${a.max_score ?? 0},${Math.round(a.percent ?? 0)},${pctToGrade(a.percent ?? 0)},${a.passed ? "TAK" : "NIE"},${(a.submitted_at ?? "").slice(0, 16).replace("T", " ")}\n`;
          });
        }
        const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
        downloadBlob(blob, filename);
      }

      // log export
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("grade_exports").insert({
          created_by: user.id,
          exam_id: exam.id,
          name: filename,
          format,
          row_count: finished.length,
          metadata: { exam_title: exam.title },
        });
      }
      toast.success(`Wyeksportowano ${finished.length} ocen`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="py-12 text-center text-white/40"><Loader2 className="w-5 h-5 animate-spin inline"/></div>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-white inline-flex items-center gap-2"><Database className="w-5 h-5 text-cyan-300"/>Eksport ocen do e-dziennika</h2>
        <p className="text-sm text-white/50 mt-1">Pobierz oceny w formacie zgodnym z Vulcan UONET+ lub Librus Synergia, albo wygeneruj raport PDF.</p>
      </div>

      <div className="rounded-2xl border border-amber-400/20 bg-amber-500/5 p-4 text-sm text-amber-100/80 flex gap-3">
        <Info className="w-5 h-5 shrink-0 text-amber-300 mt-0.5"/>
        <div>
          <b className="text-amber-200">Librus i Vulcan nie mają publicznego API</b> dla aplikacji trzecich. Standardową ścieżką jest import pliku CSV w panelu nauczyciela. EduNex przygotowuje plik dokładnie w formacie wymaganym przez te systemy — wystarczy go zaimportować.
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
          <label className="block text-xs uppercase tracking-widest text-white/40 mb-1">Egzamin</label>
          <select value={examId} onChange={(e) => setExamId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/40">
            {exams.map(e => <option key={e.id} value={e.id}>{e.title}{e.subject ? ` · ${e.subject}` : ""}</option>)}
          </select>

          <label className="block text-xs uppercase tracking-widest text-white/40 mb-1 mt-3">Format</label>
          <div className="grid gap-2">
            {(Object.keys(FORMAT_INFO) as Format[]).map((f) => {
              const meta = FORMAT_INFO[f]; const Icon = meta.icon;
              return (
                <button key={f} onClick={() => setFormat(f)} className={`text-left p-3 rounded-lg border transition ${format === f ? "border-accent/40 bg-cyan-500/10" : "border-white/10 bg-white/[0.02] hover:bg-white/5"}`}>
                  <div className="flex items-center gap-2 mb-1"><Icon className="w-4 h-4 text-cyan-300"/><span className="font-medium text-white text-sm">{meta.label}</span></div>
                  <div className="text-xs text-white/50">{meta.desc}</div>
                </button>
              );
            })}
          </div>

          <button onClick={exportNow} disabled={busy || !exam} className="w-full mt-3 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-accent to-blue-500 text-slate-900 font-semibold disabled:opacity-50 hover:brightness-110 transition">
            {busy ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}
            Pobierz plik
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="font-display font-bold text-white mb-3">Podgląd ({finished.length} podejść)</h3>
          {finished.length === 0 ? (
            <div className="text-sm text-white/40 py-8 text-center">Brak ukończonych podejść.</div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="text-[10px] uppercase tracking-widest text-white/40 sticky top-0 bg-[#0a0f1f]">
                  <tr><th className="text-left py-2">Uczeń</th><th className="text-right">%</th><th className="text-right pr-2">Ocena</th></tr>
                </thead>
                <tbody>
                  {finished.map(a => (
                    <tr key={a.id} className="border-t border-white/5">
                      <td className="py-2 text-white/80">{a.student_name}</td>
                      <td className="text-right text-white/60 font-mono">{Math.round(a.percent ?? 0)}%</td>
                      <td className="text-right pr-2 font-bold text-white">{pctToGrade(a.percent ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
