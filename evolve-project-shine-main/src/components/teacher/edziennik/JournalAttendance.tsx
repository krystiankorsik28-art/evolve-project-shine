import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ClipboardCheck,
  Clock3,
  Laptop,
  Loader2,
  Save,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserMinus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { confirmDialog } from "@/components/ConfirmDialog";
import {
  ATTENDANCE_LABELS,
  ATTENDANCE_SHORT_LABELS,
  classLabel,
  formatDateTime,
  studentLabel,
  type AttendanceStatus,
  type JournalSnapshot,
} from "./journal-types";
import type { JournalActions } from "./use-journal-data";
import {
  JournalEmpty,
  JournalSectionHeader,
  PrimaryButton,
  journalCard,
  journalInput,
} from "./journal-ui";

type Props = {
  snapshot: JournalSnapshot;
  selectedClassId: string;
  onClassChange: (classId: string) => void;
  actions: JournalActions;
};

type AttendanceDraft = Record<
  string,
  { status: AttendanceStatus; minutesLate: number; note: string }
>;

const statuses: { value: AttendanceStatus; icon: typeof Check; color: string }[] = [
  {
    value: "present",
    icon: Check,
    color:
      "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200",
  },
  {
    value: "absent",
    icon: UserMinus,
    color:
      "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200",
  },
  {
    value: "late",
    icon: Clock3,
    color:
      "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200",
  },
  {
    value: "excused",
    icon: ShieldCheck,
    color:
      "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-200",
  },
  {
    value: "remote",
    icon: Laptop,
    color:
      "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-200",
  },
];

export function JournalAttendance({ snapshot, selectedClassId, onClassChange, actions }: Props) {
  const classLessons = useMemo(
    () =>
      snapshot.lessons
        .filter((lesson) => !selectedClassId || lesson.class_id === selectedClassId)
        .sort((a, b) => b.starts_at.localeCompare(a.starts_at)),
    [selectedClassId, snapshot.lessons],
  );
  const [lessonId, setLessonId] = useState("");
  const [draft, setDraft] = useState<AttendanceDraft>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!classLessons.some((lesson) => lesson.id === lessonId)) {
      setLessonId(classLessons[0]?.id || "");
    }
  }, [classLessons, lessonId]);

  const lesson = snapshot.lessons.find((item) => item.id === lessonId);
  const effectiveClassId = lesson?.class_id || selectedClassId;
  const students = useMemo(
    () => snapshot.students.filter((student) => student.class_id === effectiveClassId),
    [effectiveClassId, snapshot.students],
  );
  const savedRows = useMemo(
    () => snapshot.attendance.filter((entry) => entry.lesson_id === lessonId),
    [lessonId, snapshot.attendance],
  );

  useEffect(() => {
    const next: AttendanceDraft = {};
    students.forEach((student) => {
      const existing = savedRows.find((entry) => entry.student_id === student.id);
      next[student.id] = {
        status: (existing?.status as AttendanceStatus) || "present",
        minutesLate: existing?.minutes_late || 0,
        note: existing?.note || "",
      };
    });
    setDraft(next);
  }, [savedRows, students]);

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setDraft((current) => ({
      ...current,
      [studentId]: {
        ...(current[studentId] || { minutesLate: 0, note: "" }),
        status,
        minutesLate: status === "late" ? current[studentId]?.minutesLate || 5 : 0,
      },
    }));
  };

  const markAllPresent = () => {
    setDraft(
      Object.fromEntries(
        students.map((student) => [student.id, { status: "present", minutesLate: 0, note: "" }]),
      ) as AttendanceDraft,
    );
  };

  const save = async () => {
    if (!lesson || students.length === 0) return;
    setBusy(true);
    try {
      await actions.saveAttendance(
        lesson.id,
        students.map((student) => ({ studentId: student.id, ...draft[student.id] })),
      );
      toast.success(`Zapisano frekwencję dla ${students.length} uczniów.`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    if (!lesson || savedRows.length === 0) return;
    const confirmed = await confirmDialog({
      title: "Wyczyścić listę obecności?",
      description: `Usuniętych zostanie ${savedRows.length} zapisanych wpisów dla lekcji „${lesson.topic}”.`,
      confirmText: "Wyczyść frekwencję",
    });
    if (!confirmed) return;
    setBusy(true);
    try {
      await actions.clearAttendance(lesson.id);
      toast.success("Lista obecności została wyczyszczona.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const summary = statuses.map((status) => ({
    ...status,
    count: Object.values(draft).filter((entry) => entry.status === status.value).length,
  }));

  if (snapshot.classes.length === 0) {
    return (
      <JournalEmpty
        icon={Users}
        title="Najpierw dodaj klasę"
        description="Frekwencję zapisuje się dla uczniów przypisanych do konkretnej klasy i lekcji."
      />
    );
  }

  return (
    <div className="space-y-5">
      <section className={`${journalCard} p-5 sm:p-6`}>
        <JournalSectionHeader
          eyebrow="Frekwencja"
          title="Lista obecności"
          description="Wybierz lekcję, oznacz status każdego ucznia i zapisz kompletny wpis."
          action={
            lesson && students.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {savedRows.length > 0 && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={clear}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-400/20 dark:bg-rose-400/5 dark:text-rose-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    Wyczyść
                  </button>
                )}
                <PrimaryButton disabled={busy} onClick={save}>
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Zapisz obecność
                </PrimaryButton>
              </div>
            ) : undefined
          }
        />

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
            Klasa
            <select
              value={selectedClassId}
              onChange={(event) => onClassChange(event.target.value)}
              className={journalInput}
            >
              <option value="">Wszystkie klasy</option>
              {snapshot.classes.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>
                  {classLabel(schoolClass)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
            Lekcja
            <select
              value={lessonId}
              onChange={(event) => setLessonId(event.target.value)}
              className={journalInput}
            >
              <option value="">Wybierz lekcję</option>
              {classLessons.map((item) => (
                <option key={item.id} value={item.id}>
                  {formatDateTime(item.starts_at)} · {item.subject} · {item.topic}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {!lesson ? (
        <JournalEmpty
          icon={ClipboardCheck}
          title="Wybierz lekcję"
          description="Jeśli lista jest pusta, najpierw zaplanuj lekcję w zakładce Lekcje."
        />
      ) : students.length === 0 ? (
        <JournalEmpty
          icon={Users}
          title="Brak uczniów w klasie"
          description="Dodaj uczniów do klasy, aby wygenerować listę obecności."
        />
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {summary.map(({ value, icon: Icon, color, count }) => (
              <article key={value} className={`${journalCard} flex items-center gap-3 p-4`}>
                <div className={`grid h-9 w-9 place-items-center rounded-xl border ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xl font-semibold text-slate-950 dark:text-slate-100">
                    {count}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {ATTENDANCE_LABELS[value]}
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className={`${journalCard} overflow-hidden`}>
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                  {lesson.subject} · {lesson.topic}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {formatDateTime(lesson.starts_at)} · {students.length} uczniów
                </p>
              </div>
              <button
                type="button"
                onClick={markAllPresent}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200"
              >
                <UserCheck className="h-4 w-4" />
                Zaznacz wszystkich obecnych
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {students.map((student, index) => {
                const current = draft[student.id] || {
                  status: "present" as AttendanceStatus,
                  minutesLate: 0,
                  note: "",
                };
                return (
                  <div
                    key={student.id}
                    className="grid gap-3 p-4 sm:grid-cols-[34px_minmax(180px,1fr)_auto] sm:items-center sm:px-5"
                  >
                    <div className="text-xs font-medium text-slate-400">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                        {studentLabel(student)}
                      </div>
                      {current.status === "late" && (
                        <label className="mt-2 inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          Minuty spóźnienia
                          <input
                            type="number"
                            min={1}
                            max={240}
                            value={current.minutesLate}
                            onChange={(event) =>
                              setDraft((all) => ({
                                ...all,
                                [student.id]: {
                                  ...current,
                                  minutesLate: Number(event.target.value),
                                },
                              }))
                            }
                            className="h-8 w-20 rounded-lg border border-slate-300 bg-white px-2 text-slate-950 outline-none focus:border-amber-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                          />
                        </label>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {statuses.map(({ value, icon: Icon, color }) => {
                        const active = current.status === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setStatus(student.id, value)}
                            aria-label={`${studentLabel(student)}: ${ATTENDANCE_LABELS[value]}`}
                            aria-pressed={active}
                            title={ATTENDANCE_LABELS[value]}
                            className={`inline-flex h-9 min-w-10 items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-semibold transition ${active ? color : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/5"}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{ATTENDANCE_SHORT_LABELS[value]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
