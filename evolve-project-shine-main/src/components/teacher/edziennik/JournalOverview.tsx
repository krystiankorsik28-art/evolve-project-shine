import { useMemo, type ComponentType } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  MessageCircle,
  Plus,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import {
  ATTENDANCE_LABELS,
  LESSON_STATUS_LABELS,
  classLabel,
  formatDateTime,
  studentLabel,
  type JournalSnapshot,
  type JournalTab,
  type LessonStatus,
} from "./journal-types";
import { JournalEmpty, JournalSectionHeader, PrimaryButton, journalCard } from "./journal-ui";

type Props = {
  snapshot: JournalSnapshot;
  selectedClassId: string;
  onTabChange: (tab: JournalTab) => void;
  onNewLesson: () => void;
};

function sameLocalDay(value: string, day: Date) {
  const date = new Date(value);
  return (
    date.getFullYear() === day.getFullYear() &&
    date.getMonth() === day.getMonth() &&
    date.getDate() === day.getDate()
  );
}

export function JournalOverview({ snapshot, selectedClassId, onTabChange, onNewLesson }: Props) {
  const selectedClass = snapshot.classes.find((item) => item.id === selectedClassId);
  const classStudents = snapshot.students.filter((item) => item.class_id === selectedClassId);
  const classLessons = snapshot.lessons.filter((item) => item.class_id === selectedClassId);
  const lessonIds = new Set(classLessons.map((item) => item.id));
  const classAttendance = snapshot.attendance.filter((item) => lessonIds.has(item.lesson_id));
  const classGrades = snapshot.grades.filter((item) => item.class_id === selectedClassId);
  const today = new Date();
  const todayLessons = classLessons
    .filter((item) => sameLocalDay(item.starts_at, today))
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const upcomingLessons = classLessons
    .filter((item) => new Date(item.starts_at).getTime() >= Date.now() - 60 * 60 * 1000)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .slice(0, 5);

  const countedAttendance = classAttendance.filter((item) => item.status !== "excused");
  const presentAttendance = countedAttendance.filter((item) =>
    ["present", "late", "remote"].includes(item.status),
  );
  const attendanceRate = countedAttendance.length
    ? Math.round((presentAttendance.length / countedAttendance.length) * 100)
    : 0;
  const weightedGradeTotal = classGrades.reduce((sum, item) => sum + item.value * item.weight, 0);
  const gradeWeight = classGrades.reduce((sum, item) => sum + item.weight, 0);
  const average = gradeWeight ? weightedGradeTotal / gradeWeight : 0;

  const studentSignals = useMemo(
    () =>
      classStudents
        .map((student) => {
          const grades = classGrades.filter((item) => item.student_id === student.id);
          const attendance = classAttendance.filter((item) => item.student_id === student.id);
          const counted = attendance.filter((item) => item.status !== "excused");
          const present = counted.filter((item) =>
            ["present", "late", "remote"].includes(item.status),
          );
          const attendancePercent = counted.length ? (present.length / counted.length) * 100 : null;
          const weight = grades.reduce((sum, item) => sum + item.weight, 0);
          const gradeAverage = weight
            ? grades.reduce((sum, item) => sum + item.value * item.weight, 0) / weight
            : null;
          const needsAttention =
            (attendancePercent !== null && attendancePercent < 80) ||
            (gradeAverage !== null && gradeAverage < 2.5);
          return { student, attendancePercent, gradeAverage, needsAttention };
        })
        .filter((item) => item.needsAttention)
        .slice(0, 5),
    [classAttendance, classGrades, classStudents],
  );

  const recentActivity = [
    ...classGrades.slice(0, 3).map((grade) => ({
      id: `grade-${grade.id}`,
      icon: TrendingUp,
      title: `${studentLabel(classStudents.find((student) => student.id === grade.student_id))}: ${grade.value.toFixed(1)}`,
      description: `${grade.subject} · ${grade.title}`,
      date: grade.graded_at,
    })),
    ...snapshot.notes
      .filter((note) => note.class_id === selectedClassId)
      .slice(0, 3)
      .map((note) => ({
        id: `note-${note.id}`,
        icon: Sparkles,
        title: note.title,
        description: studentLabel(classStudents.find((student) => student.id === note.student_id)),
        date: note.created_at,
      })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  if (!selectedClass) {
    return (
      <JournalEmpty
        icon={GraduationCap}
        title="Zacznij od utworzenia klasy"
        description="Klasa łączy uczniów, lekcje, frekwencję, oceny, uwagi i komunikację w jednym miejscu."
        action={
          <PrimaryButton onClick={() => onTabChange("classes")}>Przejdź do klas</PrimaryButton>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={BookOpenCheck}
          label="Lekcje dzisiaj"
          value={String(todayLessons.length)}
          detail={
            todayLessons[0]
              ? `Najbliższa ${new Date(todayLessons[0].starts_at).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}`
              : "Brak zaplanowanych"
          }
          tone="blue"
        />
        <MetricCard
          icon={UserCheck}
          label="Frekwencja"
          value={countedAttendance.length ? `${attendanceRate}%` : "—"}
          detail={
            countedAttendance.length
              ? `${presentAttendance.length} obecności w rejestrze`
              : "Brak wpisów"
          }
          tone="emerald"
        />
        <MetricCard
          icon={TrendingUp}
          label="Średnia klasy"
          value={gradeWeight ? average.toFixed(2) : "—"}
          detail={classGrades.length ? `${classGrades.length} wystawionych ocen` : "Brak ocen"}
          tone="violet"
        />
        <MetricCard
          icon={MessageCircle}
          label="Wiadomości"
          value={String(snapshot.unreadMessages)}
          detail={snapshot.unreadMessages ? "Nieprzeczytane wiadomości" : "Skrzynka uporządkowana"}
          tone="amber"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
        <div className={`${journalCard} p-5 sm:p-6`}>
          <JournalSectionHeader
            eyebrow="Dzisiaj"
            title="Plan dnia"
            description={classLabel(selectedClass)}
            action={
              <PrimaryButton onClick={onNewLesson}>
                <Plus className="h-4 w-4" />
                Nowa lekcja
              </PrimaryButton>
            }
          />

          {todayLessons.length === 0 ? (
            <div className="mt-5">
              <JournalEmpty
                icon={CalendarDays}
                title="Spokojny dzień"
                description="Nie ma lekcji zaplanowanych na dzisiaj. Dodaj lekcję albo sprawdź kolejne terminy."
                action={
                  <button
                    type="button"
                    onClick={() => onTabChange("lessons")}
                    className="text-sm font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300"
                  >
                    Otwórz wszystkie lekcje
                  </button>
                }
              />
            </div>
          ) : (
            <div className="mt-5 space-y-2">
              {todayLessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => onTabChange("attendance")}
                  className="group grid w-full grid-cols-[56px_1fr_auto] items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50 dark:border-white/10 dark:hover:border-blue-400/30 dark:hover:bg-blue-400/5"
                >
                  <div className="text-center">
                    <div className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                      {new Date(lesson.starts_at).toLocaleTimeString("pl-PL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">
                      {index + 1}. lekcja
                    </div>
                  </div>
                  <div className="min-w-0 border-l border-slate-200 pl-3 dark:border-white/10">
                    <div className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100">
                      {lesson.subject}
                    </div>
                    <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {lesson.topic}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <LessonBadge status={lesson.status as LessonStatus} />
                    <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={`${journalCard} p-5 sm:p-6`}>
          <JournalSectionHeader
            eyebrow="Kontrola"
            title="Wymaga uwagi"
            description="Wczesne sygnały z ocen i frekwencji"
          />
          {studentSignals.length === 0 ? (
            <div className="mt-7 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <div className="text-sm font-semibold">Brak alarmujących sygnałów</div>
                <p className="mt-1 text-xs leading-5 text-emerald-800/80 dark:text-emerald-200/75">
                  System pokaże tu uczniów ze średnią poniżej 2,50 lub frekwencją poniżej 80%.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-2">
              {studentSignals.map(({ student, attendancePercent, gradeAverage }) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 rounded-xl bg-amber-50 p-3 dark:bg-amber-400/10"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100">
                      {studentLabel(student)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {attendancePercent !== null && `Frekwencja ${Math.round(attendancePercent)}%`}
                      {attendancePercent !== null && gradeAverage !== null && " · "}
                      {gradeAverage !== null && `Średnia ${gradeAverage.toFixed(2)}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className={`${journalCard} p-5 sm:p-6`}>
          <JournalSectionHeader eyebrow="Następne" title="Terminy i wydarzenia" />
          <div className="mt-5 space-y-2">
            {[
              ...upcomingLessons.map((lesson) => ({
                id: `lesson-${lesson.id}`,
                title: lesson.subject,
                description: lesson.topic,
                date: lesson.starts_at,
                icon: BookOpenCheck,
              })),
              ...snapshot.events.map((event) => ({
                id: `event-${event.id}`,
                title: event.title,
                description: event.description || "Wydarzenie szkolne",
                date: event.starts_at,
                icon: CalendarDays,
              })),
            ]
              .sort((a, b) => a.date.localeCompare(b.date))
              .slice(0, 5)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-white/10"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100">
                        {item.title}
                      </div>
                      <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {item.description}
                      </div>
                    </div>
                    <time className="text-right text-xs font-medium text-slate-500 dark:text-slate-400">
                      {formatDateTime(item.date)}
                    </time>
                  </div>
                );
              })}
            {upcomingLessons.length === 0 && snapshot.events.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Brak nadchodzących terminów.
              </p>
            )}
          </div>
        </div>

        <div className={`${journalCard} p-5 sm:p-6`}>
          <JournalSectionHeader eyebrow="Ostatnie zmiany" title="Aktywność klasy" />
          <div className="mt-5 space-y-2">
            {recentActivity.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-white/10"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100">
                      {item.title}
                    </div>
                    <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {item.description}
                    </div>
                  </div>
                  <time className="text-xs text-slate-400">{formatDateTime(item.date)}</time>
                </div>
              );
            })}
            {recentActivity.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Aktywność pojawi się po dodaniu ocen lub uwag.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className={`${journalCard} p-5 sm:p-6`}>
        <JournalSectionHeader eyebrow="Szybkie działania" title="Najczęstsze procesy" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickAction
            icon={ClipboardCheck}
            title="Sprawdź obecność"
            description="Otwórz listę klasy i zapisz frekwencję."
            onClick={() => onTabChange("attendance")}
          />
          <QuickAction
            icon={TrendingUp}
            title="Wystaw ocenę"
            description="Dodaj ocenę, wagę i komentarz dla ucznia."
            onClick={() => onTabChange("grades")}
          />
          <QuickAction
            icon={Users}
            title="Lista uczniów"
            description={`${classStudents.length} uczniów w wybranej klasie.`}
            onClick={() => onTabChange("classes")}
          />
          <QuickAction
            icon={MessageCircle}
            title="Komunikacja"
            description="Ogłoszenia klasowe i wiadomości bezpośrednie."
            onClick={() => onTabChange("communication")}
          />
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
  tone: "blue" | "emerald" | "violet" | "amber";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300",
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
    violet: "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
  };
  return (
    <article className={`${journalCard} p-4 sm:p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
            {label}
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-slate-100">
            {value}
          </div>
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 truncate text-xs text-slate-500 dark:text-slate-400">{detail}</p>
    </article>
  );
}

function LessonBadge({ status }: { status: LessonStatus }) {
  const styles: Record<LessonStatus, string> = {
    scheduled: "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300",
    in_progress: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
    completed: "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300",
    cancelled: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300",
  };
  return (
    <span
      className={`hidden rounded-full px-2.5 py-1 text-[10px] font-semibold sm:inline ${styles[status]}`}
    >
      {LESSON_STATUS_LABELS[status]}
    </span>
  );
}

function QuickAction({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-slate-200 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-white/10 dark:hover:border-blue-400/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
          <Icon className="h-4 w-4" />
        </div>
        <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
      </div>
      <div className="mt-4 text-sm font-semibold text-slate-950 dark:text-slate-100">{title}</div>
      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p>
    </button>
  );
}
