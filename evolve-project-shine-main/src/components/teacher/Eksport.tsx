import { useEffect, useState, type ComponentType } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  Info,
  Loader2,
  Table2,
} from "lucide-react";
import jsPDF from "jspdf";

type Exam = { id: string; title: string; subject: string | null; passing_score: number };
type Attempt = {
  id: string;
  exam_id: string;
  student_name: string;
  score: number | null;
  max_score: number | null;
  percent: number | null;
  passed: boolean | null;
  submitted_at: string | null;
  graded_at: string | null;
};

type Format = "vulcan_csv" | "librus_csv" | "generic_csv" | "pdf_report";

const FORMAT_INFO: Record<Format, { label: string; desc: string; ext: string; icon: ComponentType<{ className?: string }> }> = {
  vulcan_csv: {
    label: "Vulcan UONET+ (CSV)",
    desc: "Plik do importu w module ocen. Kolumny: nazwisko, imię, ocena, procent i data.",
    ext: "csv",
    icon: FileSpreadsheet,
  },
  librus_csv: {
    label: "Librus Synergia (CSV)",
    desc: "Format arkusza dla importu ocen w panelu nauczyciela Librus.",
    ext: "csv",
    icon: FileSpreadsheet,
  },
  generic_csv: {
    label: "Uniwersalny CSV",
    desc: "Kompletna tabela do Excela, Numbers lub Google Sheets.",
    ext: "csv",
    icon: Table2,
  },
  pdf_report: {
    label: "Raport PDF",
    desc: "Dokument do druku, archiwizacji lub przekazania dyrekcji.",
    ext: "pdf",
    icon: FileText,
  },
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvEscape(value: unknown): string {
  const text = value == null ? "" : String(value);
  if (/[",;\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function pctToGrade(percent: number): number {
  if (percent >= 95) return 6;
  if (percent >= 85) return 5;
  if (percent >= 70) return 4;
  if (percent >= 55) return 3;
  if (percent >= 40) return 2;
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
      const { data } = await supabase
        .from("exams")
        .select("id,title,subject,passing_score")
        .order("created_at", { ascending: false });

      setExams((data as Exam[]) ?? []);
      if (data?.[0]) setExamId(data[0].id);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!examId) return;

    (async () => {
      const { data } = await supabase
        .from("attempts")
        .select("id,exam_id,student_name,score,max_score,percent,passed,submitted_at,graded_at")
        .eq("exam_id", examId)
        .order("submitted_at", { ascending: false });

      setAttempts((data as Attempt[]) ?? []);
    })();
  }, [examId]);

  const exam = exams.find((item) => item.id === examId);
  const finished = attempts.filter((attempt) => attempt.percent != null);
  const average = finished.length
    ? finished.reduce((sum, attempt) => sum + (attempt.percent ?? 0), 0) / finished.length
    : 0;
  const passed = exam ? finished.filter((attempt) => (attempt.percent ?? 0) >= exam.passing_score).length : 0;

  const exportNow = async () => {
    if (!exam) return;
    if (finished.length === 0) {
      toast.error("Brak ukończonych podejść do eksportu.");
      return;
    }

    setBusy(true);
    try {
      const dateStr = new Date().toISOString().slice(0, 10);
      const safeTitle = exam.title.replace(/[^\w\s.-]/g, "").trim().slice(0, 60) || "egzamin";
      const filename = `${safeTitle}_${dateStr}.${FORMAT_INFO[format].ext}`;

      if (format === "pdf_report") {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(`Raport: ${exam.title}`, 14, 18);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Przedmiot: ${exam.subject ?? "-"}`, 14, 26);
        doc.text(`Data wygenerowania: ${new Date().toLocaleString("pl-PL")}`, 14, 32);
        doc.text(`Liczba podejsc: ${finished.length}`, 14, 38);
        doc.text(`Srednia: ${average.toFixed(1)}%   Zdawalnosc: ${Math.round((passed / finished.length) * 100)}%`, 14, 44);

        doc.setFont("helvetica", "bold");
        doc.text("Uczen", 14, 56);
        doc.text("Wynik", 110, 56);
        doc.text("Procent", 140, 56);
        doc.text("Ocena", 175, 56);
        doc.line(14, 58, 196, 58);
        doc.setFont("helvetica", "normal");

        let y = 64;
        finished.forEach((attempt) => {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(String(attempt.student_name).slice(0, 50), 14, y);
          doc.text(`${attempt.score ?? 0}/${attempt.max_score ?? 0}`, 110, y);
          doc.text(`${Math.round(attempt.percent ?? 0)}%`, 140, y);
          doc.text(String(pctToGrade(attempt.percent ?? 0)), 175, y);
          y += 6;
        });

        downloadBlob(doc.output("blob"), filename);
      } else {
        let csv = "";
        if (format === "vulcan_csv") {
          csv = "Nazwisko;Imie;Ocena;Procent;Data\n";
          finished.forEach((attempt) => {
            const parts = attempt.student_name.trim().split(/\s+/);
            const firstName = parts[0] ?? "";
            const lastName = parts.slice(1).join(" ") || "-";
            csv += `${csvEscape(lastName)};${csvEscape(firstName)};${pctToGrade(attempt.percent ?? 0)};${Math.round(attempt.percent ?? 0)};${(attempt.submitted_at ?? "").slice(0, 10)}\n`;
          });
        } else if (format === "librus_csv") {
          csv = "Uczen,Ocena,Waga,Kategoria,Data,Komentarz\n";
          finished.forEach((attempt) => {
            csv += `${csvEscape(attempt.student_name)},${pctToGrade(attempt.percent ?? 0)},1,Sprawdzian,${(attempt.submitted_at ?? "").slice(0, 10)},${csvEscape(`Wynik ${Math.round(attempt.percent ?? 0)}% (${attempt.score ?? 0}/${attempt.max_score ?? 0})`)}\n`;
          });
        } else {
          csv = "Uczen,Punkty,Maks,Procent,Ocena,Zdane,Data ukonczenia\n";
          finished.forEach((attempt) => {
            csv += `${csvEscape(attempt.student_name)},${attempt.score ?? 0},${attempt.max_score ?? 0},${Math.round(attempt.percent ?? 0)},${pctToGrade(attempt.percent ?? 0)},${attempt.passed ? "TAK" : "NIE"},${(attempt.submitted_at ?? "").slice(0, 16).replace("T", " ")}\n`;
          });
        }

        downloadBlob(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }), filename);
      }

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

      toast.success(`Wyeksportowano ${finished.length} ocen.`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-48 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-blue-700" />
          Ładowanie egzaminów...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-950">
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-px bg-slate-200 lg:grid-cols-[1fr_360px]">
          <div className="bg-white p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Eksport ocen do e-dziennika</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Pobierz oceny w formacie zgodnym z Vulcan UONET+, Librus Synergia albo uniwersalnym arkuszem CSV.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-px bg-slate-200">
            <Metric label="Podejścia" value={String(finished.length)} />
            <Metric label="Średnia" value={average ? `${average.toFixed(1)}%` : "-"} />
            <Metric label="Zdane" value={String(passed)} />
          </div>
        </div>
      </section>

      <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          Librus i Vulcan zwykle nie udostępniają publicznego API dla aplikacji trzecich. Najpewniejszą ścieżką jest eksport CSV i import w panelu nauczyciela.
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Egzamin
            <select
              value={examId}
              onChange={(event) => setExamId(event.target.value)}
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {exams.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}{item.subject ? ` - ${item.subject}` : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-5">
            <div className="mb-2 text-sm font-semibold text-slate-700">Format pliku</div>
            <div className="grid gap-2">
              {(Object.keys(FORMAT_INFO) as Format[]).map((key) => {
                const meta = FORMAT_INFO[key];
                const Icon = meta.icon;
                const active = format === key;

                return (
                  <button
                    key={key}
                    onClick={() => setFormat(key)}
                    className={`rounded-lg border p-3 text-left transition ${
                      active
                        ? "border-blue-200 bg-blue-50 text-blue-950"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Icon className={`h-4 w-4 ${active ? "text-blue-700" : "text-slate-500"}`} />
                      {meta.label}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{meta.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={exportNow}
            disabled={busy || !exam}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Pobierz plik
          </button>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div>
              <h3 className="text-base font-semibold text-slate-950">Podgląd danych</h3>
              <p className="mt-1 text-sm text-slate-500">Wiersze, które trafią do eksportu.</p>
            </div>
            {finished.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Gotowe
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                <AlertTriangle className="h-3 w-3" />
                Brak danych
              </span>
            )}
          </div>

          {finished.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-slate-500">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <h4 className="mt-4 text-sm font-semibold text-slate-950">Brak ukończonych podejść</h4>
              <p className="mt-1 text-sm text-slate-500">Wybierz inny egzamin albo poczekaj na przesłane wyniki.</p>
            </div>
          ) : (
            <div className="max-h-[520px] overflow-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Uczeń</th>
                    <th className="px-4 py-3 text-right font-semibold">Wynik</th>
                    <th className="px-4 py-3 text-right font-semibold">Procent</th>
                    <th className="px-4 py-3 text-right font-semibold">Ocena</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {finished.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-medium text-slate-950">{attempt.student_name}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">{attempt.score ?? 0}/{attempt.max_score ?? 0}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">{Math.round(attempt.percent ?? 0)}%</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-950">{pctToGrade(attempt.percent ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-5">
      <div className="text-2xl font-semibold text-slate-950">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}
