import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowUpDown,
  BarChart3,
  BookOpen,
  CalendarDays,
  Clock,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sigma,
  Target,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { ExamEditor } from "./ExamEditor";
import { confirmDialog } from "@/components/ConfirmDialog";

type Exam = {
  id: string;
  title: string;
  subject: string | null;
  status: "draft" | "published" | "archived";
  duration_minutes: number;
  passing_score: number;
  created_at: string;
  category?: string | null;
};

type ExamMeta = {
  questionCount: number;
  attemptCount: number;
  pin: string | null;
};

type StatusFilter = "all" | "published" | "draft";
type SortBy = "date" | "title" | "duration" | "questions";

function createPinCandidate() {
  const random = new Uint32Array(1);
  crypto.getRandomValues(random);
  return String(100000 + (random[0] % 900000));
}

async function insertUniqueExamPin(examId: string, userId: string) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const pinCode = createPinCandidate();
    const { data, error } = await supabase
      .from("exam_pins")
      .insert({
        exam_id: examId,
        pin_code: pinCode,
        active: true,
        max_uses: 100,
        used_count: 0,
        created_by: userId,
      })
      .select("id,pin_code")
      .single();

    if (!error && data) return data;
    if (error?.code !== "23505") throw error;
  }

  throw new Error("Nie udało się wygenerować unikalnego PIN-u. Spróbuj ponownie.");
}

export function Egzaminy() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [meta, setMeta] = useState<Record<string, ExamMeta>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openExamId, setOpenExamId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [busyExamId, setBusyExamId] = useState<string | null>(null);

  const load = useCallback(async (manual = false) => {
    manual ? setRefreshing(true) : setLoading(true);
    setLoadError(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Sesja użytkownika wygasła. Zaloguj się ponownie.");

      const { data: examRows, error: examsError } = await supabase
        .from("exams")
        .select("id,title,subject,status,duration_minutes,passing_score,created_at,category")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (examsError) throw examsError;

      const filteredExams = ((examRows ?? []) as Exam[]).filter(
        (exam) => exam.category !== "sprawdzian",
      );
      const examIds = filteredExams.map((exam) => exam.id);

      let nextMeta: Record<string, ExamMeta> = {};
      if (examIds.length) {
        const [questionsResult, attemptsResult, pinsResult] = await Promise.all([
          supabase.from("questions").select("exam_id,id").in("exam_id", examIds),
          supabase.from("attempts").select("exam_id,id").in("exam_id", examIds),
          supabase
            .from("exam_pins")
            .select("exam_id,pin_code,active,created_at")
            .in("exam_id", examIds)
            .order("created_at", { ascending: false }),
        ]);

        const firstError = questionsResult.error || attemptsResult.error || pinsResult.error;
        if (firstError) throw firstError;

        const questionCounts: Record<string, number> = {};
        const attemptCounts: Record<string, number> = {};
        const pins: Record<string, string> = {};

        for (const row of questionsResult.data ?? []) {
          questionCounts[row.exam_id] = (questionCounts[row.exam_id] ?? 0) + 1;
        }
        for (const row of attemptsResult.data ?? []) {
          attemptCounts[row.exam_id] = (attemptCounts[row.exam_id] ?? 0) + 1;
        }
        for (const row of pinsResult.data ?? []) {
          if (row.active && !pins[row.exam_id]) pins[row.exam_id] = row.pin_code;
        }

        nextMeta = Object.fromEntries(
          examIds.map((id) => [
            id,
            {
              questionCount: questionCounts[id] ?? 0,
              attemptCount: attemptCounts[id] ?? 0,
              pin: pins[id] ?? null,
            },
          ]),
        );
      }

      setExams(filteredExams);
      setMeta(nextMeta);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Nie udało się pobrać egzaminów.";
      setLoadError(message);
      if (manual) toast.error("Nie udało się odświeżyć egzaminów");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const ensurePin = async (examId: string, userId: string) => {
    const { data: existing, error } = await supabase
      .from("exam_pins")
      .select("id,pin_code")
      .eq("exam_id", examId)
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return existing ?? insertUniqueExamPin(examId, userId);
  };

  const toggleStatus = async (exam: Exam) => {
    setBusyExamId(exam.id);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Brak aktywnej sesji użytkownika.");

      const nextStatus = exam.status === "published" ? "draft" : "published";
      const { error } = await supabase
        .from("exams")
        .update({ status: nextStatus })
        .eq("id", exam.id)
        .eq("created_by", user.id);
      if (error) throw error;

      if (nextStatus === "published") {
        const pin = await ensurePin(exam.id, user.id);
        toast.success(`Egzamin opublikowany. PIN: ${pin.pin_code}`);
      } else {
        const { error: pinError } = await supabase
          .from("exam_pins")
          .update({ active: false })
          .eq("exam_id", exam.id)
          .eq("created_by", user.id);
        if (pinError) throw pinError;
        toast.success("Egzamin został przeniesiony do szkiców");
      }

      await load(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się zmienić statusu egzaminu");
    } finally {
      setBusyExamId(null);
    }
  };

  const copyPin = async (examId: string) => {
    const pin = meta[examId]?.pin;
    if (!pin) {
      toast.error("Ten egzamin nie ma aktywnego PIN-u. Opublikuj go lub wygeneruj nowy PIN.");
      return;
    }

    try {
      await navigator.clipboard.writeText(pin);
      toast.success(`PIN skopiowany: ${pin}`);
    } catch {
      toast.error("Przeglądarka nie pozwoliła skopiować PIN-u");
    }
  };

  const regeneratePin = async (examId: string) => {
    setBusyExamId(examId);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Brak aktywnej sesji użytkownika.");

      const newPin = await insertUniqueExamPin(examId, user.id);
      const { error: deactivateError } = await supabase
        .from("exam_pins")
        .update({ active: false })
        .eq("exam_id", examId)
        .eq("created_by", user.id)
        .neq("id", newPin.id);
      if (deactivateError) throw deactivateError;

      toast.success(`Wygenerowano nowy PIN: ${newPin.pin_code}`);
      await load(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się wygenerować PIN-u");
    } finally {
      setBusyExamId(null);
    }
  };

  const remove = async (exam: Exam) => {
    const confirmed = await confirmDialog({
      description: `Usunąć egzamin „${exam.title}”? Powiązane pytania, PIN-y i podejścia zostaną usunięte zgodnie z konfiguracją bazy.`,
    });
    if (!confirmed) return;

    setBusyExamId(exam.id);
    try {
      const { error } = await supabase.from("exams").delete().eq("id", exam.id);
      if (error) throw error;
      toast.success("Egzamin został usunięty");
      await load(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się usunąć egzaminu");
    } finally {
      setBusyExamId(null);
    }
  };

  const createNew = async () => {
    setBusyExamId("new");
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Brak aktywnej sesji użytkownika.");

      const { data, error } = await supabase
        .from("exams")
        .insert({
          title: "Nowy egzamin",
          duration_minutes: 60,
          passing_score: 50,
          created_by: user.id,
          category: "egzamin",
          status: "draft",
        })
        .select("id")
        .single();
      if (error) throw error;

      setOpenExamId(data.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się utworzyć egzaminu");
    } finally {
      setBusyExamId(null);
    }
  };

  const published = exams.filter((exam) => exam.status === "published").length;
  const drafts = exams.filter((exam) => exam.status === "draft").length;
  const totalQuestions = Object.values(meta).reduce((sum, item) => sum + item.questionCount, 0);
  const totalAttempts = Object.values(meta).reduce((sum, item) => sum + item.attemptCount, 0);
  const averageDuration = exams.length
    ? Math.round(exams.reduce((sum, exam) => sum + exam.duration_minutes, 0) / exams.length)
    : 0;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = exams.filter((exam) => {
      const matchesQuery =
        !query ||
        exam.title.toLowerCase().includes(query) ||
        exam.subject?.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || exam.status === statusFilter;
      return matchesQuery && matchesStatus;
    });

    if (sortBy === "title") result.sort((a, b) => a.title.localeCompare(b.title, "pl"));
    else if (sortBy === "duration") result.sort((a, b) => a.duration_minutes - b.duration_minutes);
    else if (sortBy === "questions") {
      result.sort(
        (a, b) => (meta[b.id]?.questionCount ?? 0) - (meta[a.id]?.questionCount ?? 0),
      );
    } else result.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));

    return result;
  }, [exams, meta, search, sortBy, statusFilter]);

  if (openExamId) {
    return (
      <ExamEditor
        examId={openExamId}
        onBack={() => {
          setOpenExamId(null);
          void load(true);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 text-slate-950">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0067b8]">Nauczanie</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Egzaminy</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Twórz pytania, publikuj egzamin, generuj aktywny PIN i analizuj liczbę podejść w jednym procesie.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void load(true)}
              disabled={refreshing}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Odśwież
            </button>
            <button
              type="button"
              onClick={() => void createNew()}
              disabled={busyExamId === "new"}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-[#0067b8] px-4 text-sm font-semibold text-white transition hover:bg-[#005a9e] disabled:opacity-60"
            >
              {busyExamId === "new" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Nowy egzamin
            </button>
          </div>
        </div>
      </section>

      {loadError && (
        <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-semibold">Nie udało się pobrać egzaminów</div>
            <div className="mt-1 text-xs leading-5">{loadError}</div>
          </div>
          <button
            type="button"
            onClick={() => void load(true)}
            className="h-9 rounded-md border border-red-300 bg-white px-3 text-xs font-semibold text-red-800"
          >
            Spróbuj ponownie
          </button>
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileText} label="Wszystkie egzaminy" value={exams.length} />
        <StatCard icon={Eye} label="Opublikowane" value={published} />
        <StatCard icon={Edit3} label="Szkice" value={drafts} />
        <StatCard icon={BarChart3} label="Średni czas" value={averageDuration ? `${averageDuration} min` : "—"} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <HelpCircle className="h-4 w-4 text-[#0067b8]" /> {totalQuestions} pytań
          </span>
          <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <Users className="h-4 w-4 text-[#0067b8]" /> {totalAttempts} podejść
          </span>
          <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <Sigma className="h-4 w-4 text-[#0067b8]" /> {exams.length ? Math.round(totalQuestions / exams.length) : 0} pytań średnio
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Szukaj po tytule lub przedmiocie"
              className="h-11 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#0067b8] focus:ring-1 focus:ring-[#0067b8]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "published", "draft"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`h-11 rounded-md border px-3 text-xs font-semibold transition ${
                  statusFilter === filter
                    ? "border-[#0067b8] bg-blue-50 text-[#0067b8]"
                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {filter === "all" ? "Wszystkie" : filter === "published" ? "Opublikowane" : "Szkice"}
              </button>
            ))}
            <label className="relative">
              <span className="sr-only">Sortowanie</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortBy)}
                className="h-11 appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-9 text-xs font-semibold text-slate-600 outline-none transition hover:border-slate-400 focus:border-[#0067b8]"
              >
                <option value="date">Najnowsze</option>
                <option value="title">Tytuł A–Z</option>
                <option value="duration">Najkrótszy czas</option>
                <option value="questions">Najwięcej pytań</option>
              </select>
              <ArrowUpDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        {loading ? (
          <div className="grid min-h-72 place-items-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#0067b8]" />
              <div className="mt-3 text-sm text-slate-600">Ładowanie egzaminów</div>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-14 text-center">
            <FileText className="mx-auto h-9 w-9 text-slate-400" />
            <div className="mt-4 text-sm font-semibold text-slate-900">
              {search || statusFilter !== "all" ? "Brak wyników dla wybranych filtrów" : "Nie masz jeszcze egzaminów"}
            </div>
            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
              {search || statusFilter !== "all"
                ? "Zmień wyszukiwanie lub filtr statusu."
                : "Utwórz pierwszy egzamin, dodaj pytania i opublikuj go z aktywnym kodem PIN."}
            </p>
            {!search && statusFilter === "all" && (
              <button
                type="button"
                onClick={() => void createNew()}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-xs font-semibold text-white"
              >
                <Plus className="h-4 w-4" /> Utwórz pierwszy egzamin
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((exam) => {
              const itemMeta = meta[exam.id] ?? { questionCount: 0, attemptCount: 0, pin: null };
              const busy = busyExamId === exam.id;
              return (
                <article
                  key={exam.id}
                  className="group flex min-h-[300px] flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_45px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-md bg-slate-950 text-white">
                      <FileText className="h-5 w-5" />
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${exam.status === "published" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                      {exam.status === "published" ? "Opublikowany" : "Szkic"}
                    </span>
                  </div>

                  <button type="button" onClick={() => setOpenExamId(exam.id)} className="mt-4 text-left">
                    <h3 className="line-clamp-2 text-lg font-semibold leading-6 text-slate-950 transition group-hover:text-[#0067b8]">
                      {exam.title || "Bez nazwy"}
                    </h3>
                    <div className="mt-2 inline-flex items-center gap-2 text-xs text-slate-500">
                      <BookOpen className="h-3.5 w-3.5" /> {exam.subject || "Bez przedmiotu"}
                    </div>
                  </button>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5"><Clock className="mb-1 h-3.5 w-3.5 text-[#0067b8]" />{exam.duration_minutes} min</div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5"><Target className="mb-1 h-3.5 w-3.5 text-[#0067b8]" />Próg {exam.passing_score}%</div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5"><HelpCircle className="mb-1 h-3.5 w-3.5 text-[#0067b8]" />{itemMeta.questionCount} pytań</div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5"><Users className="mb-1 h-3.5 w-3.5 text-[#0067b8]" />{itemMeta.attemptCount} podejść</div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.08em] text-slate-400">Aktywny PIN</div>
                      <div className="mt-0.5 font-semibold tracking-[0.12em] text-slate-900">{itemMeta.pin ?? "Brak"}</div>
                    </div>
                    {itemMeta.pin && (
                      <button type="button" onClick={() => void copyPin(exam.id)} className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 bg-white text-slate-600" aria-label="Kopiuj PIN">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="mt-auto pt-4">
                    <div className="mb-3 flex items-center gap-2 text-[10px] text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(exam.created_at).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}
                    </div>
                    <div className="grid grid-cols-5 gap-1 border-t border-slate-200 pt-3">
                      <ActionButton label={exam.status === "published" ? "Schowaj" : "Publikuj"} onClick={() => void toggleStatus(exam)} disabled={busy} icon={exam.status === "published" ? EyeOff : Eye} />
                      <ActionButton label="Kopiuj PIN" onClick={() => void copyPin(exam.id)} disabled={!itemMeta.pin || busy} icon={Copy} />
                      <ActionButton label="Nowy PIN" onClick={() => void regeneratePin(exam.id)} disabled={busy} icon={RefreshCw} />
                      <ActionButton label="Edytuj" onClick={() => setOpenExamId(exam.id)} disabled={busy} icon={Edit3} />
                      <ActionButton label="Usuń" onClick={() => void remove(exam)} disabled={busy} icon={Trash2} danger />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-slate-100 text-slate-800"><Icon className="h-5 w-5" /></div>
        <div><div className="text-xl font-semibold tracking-tight text-slate-950">{value}</div><div className="text-xs text-slate-500">{label}</div></div>
      </div>
    </div>
  );
}

function ActionButton({ label, icon: Icon, onClick, disabled, danger = false }: { label: string; icon: ComponentType<{ className?: string }>; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`grid h-9 place-items-center rounded-md transition disabled:cursor-not-allowed disabled:opacity-35 ${danger ? "text-red-600 hover:bg-red-50" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export const inputCls = "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#0067b8] focus:ring-1 focus:ring-[#0067b8]";

export function Field({ label, children }: { label: ReactNode; children: ReactNode }) {
  return <label className="mb-4 block"><span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>{children}</label>;
}

export function Modal({ title, children, onClose, wide }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={onClose} role="presentation">
      <div className={`w-full ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[92vh] overflow-auto rounded-xl border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.24)]`} onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <h3 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h3>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50" aria-label="Zamknij">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
