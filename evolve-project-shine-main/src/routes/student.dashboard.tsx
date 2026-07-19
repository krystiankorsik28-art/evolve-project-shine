import { useEffect, useMemo, useState, type ComponentType, type FormEvent, type ReactNode } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  GraduationCap,
  History,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  LogOut,
  MessageSquareText,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TimerReset,
  UserRound,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { generateSerial, downloadCertPdf } from "@/lib/certificate";
import { studentPinLogin } from "@/lib/student-auth.functions";
import { supabase } from "@/integrations/supabase/client";
import { resolveUserDisplayName } from "@/lib/auth/user-display-name";

export const Route = createFileRoute("/student/dashboard")({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/auth", replace: true });
  },
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

type TabKey = "overview" | "exams" | "certificates" | "account";

type StudentProfile = {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name: string;
};

const tabs: Array<{ id: TabKey; label: string; icon: ComponentType<{ className?: string }> }> = [
  { id: "overview", label: "Pulpit", icon: LayoutDashboard },
  { id: "exams", label: "Egzaminy", icon: FileText },
  { id: "certificates", label: "Certyfikaty", icon: Award },
  { id: "account", label: "Konto", icon: Settings },
];

const learningNotes = [
  {
    title: "Tryb egzaminu",
    text: "Po wpisaniu PIN-u system przenosi Cię bezpośrednio do egzaminu przypisanego przez nauczyciela.",
    icon: TimerReset,
  },
  {
    title: "Wyniki i historia",
    text: "Po zakończeniu podejścia wynik trafia do historii i może zostać wykorzystany do certyfikatu.",
    icon: History,
  },
  {
    title: "Bezpieczny dostęp",
    text: "Uczeń korzysta z konta lub PIN-u, bez dostępu do ustawień szkoły i danych innych osób.",
    icon: ShieldCheck,
  },
];

function StudentDashboard() {
  const navigate = useNavigate();
  const login = useServerFn(studentPinLogin);

  const [user, setUser] = useState<StudentProfile | null>(null);
  const [checking, setChecking] = useState(true);
  const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [pinLoading, setPinLoading] = useState(false);
  const [history, setHistory] = useState<AttemptSummary[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [tab, setTab] = useState<TabKey>("overview");
  const [query, setQuery] = useState("");
  const [assistantPrompt, setAssistantPrompt] = useState("");

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate({ to: "/auth/student" });
        return;
      }

      const meta = session.user.user_metadata || {};
      if (!meta.onboarding_completed) {
        navigate({ to: "/onboarding" });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name,first_name,last_name")
        .eq("user_id", session.user.id)
        .maybeSingle();

      const firstName =
        profile?.first_name?.trim() ||
        (typeof meta.first_name === "string" ? meta.first_name.trim() : "");
      const lastName =
        profile?.last_name?.trim() ||
        (typeof meta.last_name === "string" ? meta.last_name.trim() : "");

      setUser({
        id: session.user.id,
        email: session.user.email,
        first_name: firstName,
        last_name: lastName,
        display_name: resolveUserDisplayName({
          profile,
          metadata: meta,
          role: "student",
        }),
      });
      setChecking(false);
    };

    check();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    let active = true;
    (async () => {
      const { data } = await supabase
        .from("attempts")
        .select("id, exam_id, status, score, max_score, percent, passed, created_at")
        .eq("student_name", user.display_name)
        .order("created_at", { ascending: false })
        .limit(30);

      if (!active) return;

      if (data) {
        const examIds = [...new Set(data.map((attempt) => attempt.exam_id).filter(Boolean))];
        const { data: exams } = examIds.length
          ? await supabase.from("exams").select("id, title").in("id", examIds)
          : { data: [] };

        const titleMap: Record<string, string> = {};
        for (const exam of exams ?? []) titleMap[exam.id] = exam.title;

        setHistory(data.map((attempt) => ({
          id: attempt.id,
          exam_title: titleMap[attempt.exam_id] ?? "Egzamin",
          status: attempt.status,
          score: attempt.score,
          max_score: attempt.max_score,
          percent: attempt.percent,
          passed: attempt.passed,
          started_at: attempt.created_at,
        })));
      }

      setLoadingHistory(false);
    })();

    return () => { active = false; };
  }, [user]);

  const displayName = user?.display_name || "Uczniu";

  const pin = pinDigits.join("");
  const pinReady = pin.length === 6;

  const completed = history.filter((item) => item.status === "submitted").length;
  const passed = history.filter((item) => item.passed === true).length;
  const inProgress = history.filter((item) => item.status === "in_progress").length;
  const scored = history.filter((item) => item.percent != null);
  const average = scored.length
    ? Math.round(scored.reduce((sum, item) => sum + (item.percent ?? 0), 0) / scored.length)
    : 0;

  const filteredHistory = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return history;
    return history.filter((item) =>
      item.exam_title.toLowerCase().includes(term) ||
      item.status.toLowerCase().includes(term),
    );
  }, [history, query]);

  const passedExams = history.filter((item) => item.passed === true);

  const handlePinSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!pinReady) {
      toast.error("Wpisz pełny 6-cyfrowy PIN.");
      return;
    }

    setPinLoading(true);
    try {
      const nameParts = displayName === "Uczniu" ? [] : displayName.split(" ");
      const result = await login({
        data: {
          first_name: nameParts[0] || "Uczeń",
          last_name: nameParts.slice(1).join(" ") || "",
          pin,
        },
      });

      sessionStorage.setItem("edunex_student", JSON.stringify({ ...result }));
      toast.success(`Otwieram egzamin: ${result.exam_title}`);
      await navigate({ to: "/student/exam/$attemptId", params: { attemptId: result.attempt_id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się uruchomić egzaminu.");
      setPinLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await navigate({ to: "/auth" });
  };

  const fillAssistantPrompt = (text: string) => {
    setAssistantPrompt(text);
    toast.info("Wpisano temat do konsultacji. Integrację AI można podpiąć w kolejnym etapie.");
  };

  if (checking) {
    return (
      <div className="edunex-next-gen-panel edunex-student-workspace grid min-h-screen place-items-center bg-slate-50 text-slate-900">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-blue-700" />
          <span className="text-sm font-medium">Sprawdzanie dostępu ucznia...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="edunex-next-gen-panel edunex-student-workspace min-h-screen bg-[#f6f8fb] text-slate-950">
      <Toaster richColors />
      <header className="student-topbar border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">EduNex</div>
              <div className="text-xs text-slate-500">Panel ucznia</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 sm:flex">
              <UserRound className="h-3.5 w-3.5 text-blue-700" />
              {displayName}
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Wyloguj
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="student-hero overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="student-hero-banner border-b border-slate-200 px-6 py-7 text-slate-950">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
                <Sparkles className="h-3.5 w-3.5 text-blue-700" />
                Bezpieczny dostęp do egzaminów
              </div>
              <h1 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                Dzień dobry, {displayName}.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Wpisz kod PIN od nauczyciela, rozpocznij przypisany egzamin i wróć do wyników lub certyfikatów bez zbędnych elementów.
              </p>
            </div>

            <div className="grid gap-px bg-slate-100 sm:grid-cols-4">
              <SummaryTile icon={FileCheck2} label="Ukończone" value={String(completed)} note="podejścia" tone="blue" />
              <SummaryTile icon={CheckCircle2} label="Zaliczone" value={String(passed)} note="egzaminy" tone="emerald" />
              <SummaryTile icon={Clock} label="W toku" value={String(inProgress)} note="rozpoczęte" tone="amber" />
              <SummaryTile icon={BookOpen} label="Średnia" value={average ? `${average}%` : "-"} note="z ocenionych" tone="slate" />
            </div>
          </motion.div>

          <motion.form
            onSubmit={handlePinSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="student-pin-card rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Start egzaminu</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">Wpisz 6-cyfrowy PIN przekazany przez nauczyciela.</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-700">
                <KeyRound className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-6 gap-2">
              {pinDigits.map((digit, index) => (
                <input
                  key={index}
                  id={`student-pin-${index}`}
                  aria-label={`Cyfra PIN ${index + 1}`}
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => {
                    const nextValue = event.target.value.replace(/\D/g, "").slice(-1);
                    const next = [...pinDigits];
                    next[index] = nextValue;
                    setPinDigits(next);
                    if (nextValue && index < 5) document.getElementById(`student-pin-${index + 1}`)?.focus();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Backspace" && !digit && index > 0) {
                      document.getElementById(`student-pin-${index - 1}`)?.focus();
                    }
                  }}
                  className="aspect-square min-w-0 rounded-lg border border-slate-200 bg-slate-50 text-center font-mono text-lg font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  autoComplete="off"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={!pinReady || pinLoading}
              className="student-focus-button mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {pinLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
              {pinLoading ? "Sprawdzanie kodu..." : "Rozpocznij egzamin"}
            </button>

            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-3 text-xs leading-5 text-blue-900">
              PIN działa tylko dla egzaminu przypisanego przez nauczyciela. Jeżeli kod wygasł, poproś prowadzącego o nowy.
            </div>
          </motion.form>
        </section>

        <nav className="student-tabs mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm" aria-label="Sekcje panelu ucznia">
          <div className="flex min-w-max gap-1">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                aria-current={tab === item.id ? "page" : undefined}
                className={`relative inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition ${
                  tab === item.id ? "text-slate-950" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {tab === item.id && (
                  <motion.span
                    layoutId="student-tab"
                    className="absolute inset-0 rounded-md bg-slate-100"
                    transition={{ type: "spring", stiffness: 350, damping: 32 }}
                  />
                )}
                <item.icon className="relative h-4 w-4" />
                <span className="relative">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.section
              key="overview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]"
            >
              <div className="space-y-6">
                <Panel title="Ostatnie wyniki" icon={History} action={<button onClick={() => setTab("exams")} className="text-sm font-semibold text-blue-700">Pokaż wszystkie</button>}>
                  <HistoryList history={history.slice(0, 5)} loading={loadingHistory} emptyTitle="Brak historii egzaminów" emptyText="Po pierwszym podejściu zobaczysz tutaj wynik." />
                </Panel>

                <div className="grid gap-4 md:grid-cols-3">
                  {learningNotes.map((item) => (
                    <InfoCard key={item.title} {...item} />
                  ))}
                </div>
              </div>

              <aside className="space-y-6">
                <Panel title="Asystent nauki" icon={MessageSquareText}>
                  <div className="space-y-3">
                    <p className="text-sm leading-6 text-slate-600">
                      Przygotuj pytanie lub temat do omówienia. Ten panel zachowuje miejsce na integrację AI Tutor bez zmiany bazy danych.
                    </p>
                    <textarea
                      value={assistantPrompt}
                      onChange={(event) => setAssistantPrompt(event.target.value)}
                      rows={4}
                      className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      placeholder="Np. wyjaśnij równania kwadratowe krok po kroku"
                    />
                    <div className="flex flex-wrap gap-2">
                      {["Powtórka przed egzaminem", "Błędy z ostatniego testu", "Plan nauki na tydzień"].map((topic) => (
                        <button
                          key={topic}
                          onClick={() => fillAssistantPrompt(topic)}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                </Panel>

                <Panel title="Dzisiaj" icon={CalendarDays}>
                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3">
                      <span>Data</span>
                      <span className="font-medium text-slate-900">{new Date().toLocaleDateString("pl-PL")}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3">
                      <span>Status konta</span>
                      <span className="font-medium text-emerald-700">Aktywne</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3">
                      <span>Ostatni wynik</span>
                      <span className="font-medium text-slate-900">{history[0]?.percent != null ? `${history[0].percent}%` : "-"}</span>
                    </div>
                  </div>
                </Panel>
              </aside>
            </motion.section>
          )}

          {tab === "exams" && (
            <motion.section
              key="exams"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="student-panel mt-6 rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-950">Historia egzaminów</h2>
                  <p className="mt-1 text-sm text-slate-500">Lista podejść zapisanych dla Twojego profilu.</p>
                </div>
                <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:w-80">
                  <Search className="h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                    placeholder="Szukaj egzaminu"
                  />
                </div>
              </div>
              <HistoryList history={filteredHistory} loading={loadingHistory} emptyTitle="Brak pasujących egzaminów" emptyText="Zmień wyszukiwanie albo rozpocznij egzamin kodem PIN." />
            </motion.section>
          )}

          {tab === "certificates" && (
            <motion.section
              key="certificates"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="student-panel mt-6 rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-950">Certyfikaty</h2>
                <p className="mt-1 text-sm text-slate-500">Dokumenty można pobrać po zaliczonym egzaminie.</p>
              </div>
              {passedExams.length ? (
                <div className="divide-y divide-slate-200">
                  {passedExams.map((item) => {
                    const serial = generateSerial({
                      attempt_id: item.id,
                      exam_title: item.exam_title,
                      student_name: displayName,
                      score: item.score ?? 0,
                      max_score: item.max_score ?? 0,
                      percent: item.percent ?? 0,
                      passed: true,
                      completed_at: item.started_at,
                    });

                    return (
                      <article key={item.id} className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
                        <div className="flex min-w-0 gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                            <Award className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-slate-950">{item.exam_title}</h3>
                            <p className="mt-1 font-mono text-xs text-slate-500">{serial}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => downloadCertPdf({
                              attempt_id: item.id,
                              exam_title: item.exam_title,
                              student_name: displayName,
                              score: item.score ?? 0,
                              max_score: item.max_score ?? 0,
                              percent: item.percent ?? 0,
                              passed: true,
                              completed_at: item.started_at,
                            }, serial)}
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                          >
                            <Download className="h-3.5 w-3.5" />
                            PDF
                          </button>
                          <a
                            href={`/verify/${serial}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Weryfikuj
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <EmptyState icon={Award} title="Brak certyfikatów" text="Certyfikaty pojawią się po zaliczonych egzaminach." />
              )}
            </motion.section>
          )}

          {tab === "account" && (
            <motion.section
              key="account"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]"
            >
              <Panel title="Dane konta" icon={UserRound}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <DataRow label="Imię i nazwisko" value={displayName} />
                  <DataRow label="Adres e-mail" value={user?.email || "-"} />
                  <DataRow label="Identyfikator" value={user?.id || "-"} mono />
                  <DataRow label="Dostęp" value="Uczeń" />
                </div>
              </Panel>

              <Panel title="Sesja" icon={LockKeyhole}>
                <p className="text-sm leading-6 text-slate-600">
                  Po zakończonej pracy wyloguj się, szczególnie na komputerze szkolnym lub współdzielonym.
                </p>
                <button
                  onClick={handleLogout}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                >
                  <LogOut className="h-4 w-4" />
                  Wyloguj z EduNex
                </button>
              </Panel>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  note: string;
  tone: "blue" | "emerald" | "amber" | "slate";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-100 text-slate-700",
  }[tone];

  return (
    <div className="student-summary-tile border border-transparent bg-white p-5">
      <div className={`mb-4 grid h-9 w-9 place-items-center rounded-lg ${toneClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-2xl font-semibold text-slate-950">{value}</div>
      <div className="mt-1 text-sm font-medium text-slate-700">{label}</div>
      <div className="mt-1 text-xs text-slate-500">{note}</div>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="student-panel rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-blue-700" />
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function HistoryList({
  history,
  loading,
  emptyTitle,
  emptyText,
}: {
  history: AttemptSummary[];
  loading: boolean;
  emptyTitle: string;
  emptyText: string;
}) {
  if (loading) {
    return (
      <div className="grid min-h-40 place-items-center">
        <Loader2 className="h-5 w-5 animate-spin text-blue-700" />
      </div>
    );
  }

  if (!history.length) {
    return <EmptyState icon={BookOpen} title={emptyTitle} text={emptyText} />;
  }

  return (
    <div className="divide-y divide-slate-200">
      {history.map((item) => (
        <article key={item.id} className="grid gap-4 px-5 py-4 transition hover:bg-slate-50/80 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex min-w-0 gap-3">
            <StatusIcon item={item} />
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-slate-950">{item.exam_title}</h3>
              <p className="mt-1 text-xs text-slate-500">
                {new Date(item.started_at).toLocaleDateString("pl-PL")}
                {item.score != null ? ` • ${item.score}/${item.max_score} (${item.percent ?? 0}%)` : " • oczekuje na wynik"}
              </p>
            </div>
          </div>
          <StatusBadge item={item} />
        </article>
      ))}
    </div>
  );
}

function StatusIcon({ item }: { item: AttemptSummary }) {
  if (item.passed === true) {
    return (
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
        <CheckCircle2 className="h-4 w-4" />
      </div>
    );
  }

  if (item.passed === false) {
    return (
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-rose-50 text-rose-700">
        <XCircle className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700">
      <Clock className="h-4 w-4" />
    </div>
  );
}

function StatusBadge({ item }: { item: AttemptSummary }) {
  const label = item.status === "submitted"
    ? "Zakończony"
    : item.status === "in_progress"
      ? "W toku"
      : item.status;

  const classes = item.status === "submitted"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : item.status === "in_progress"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${classes}`}>
      {label}
      <ChevronRight className="h-3 w-3" />
    </span>
  );
}

function InfoCard({
  title,
  text,
  icon: Icon,
}: {
  title: string;
  text: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="student-info-card rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-700">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  );
}

function DataRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 break-words text-sm font-medium text-slate-950 ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
