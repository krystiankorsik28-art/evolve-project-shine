import { useEffect, useState } from "react";
import {
  BookOpenCheck,
  CalendarClock,
  Check,
  Clock3,
  Copy,
  DoorOpen,
  GraduationCap,
  Loader2,
  Pencil,
  Play,
  Plus,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { confirmDialog } from "@/components/ConfirmDialog";
import {
  LESSON_STATUS_LABELS,
  classLabel,
  formatDateTime,
  studentLabel,
  toDateInputValue,
  type JournalSnapshot,
  type LessonStatus,
} from "./journal-types";
import type { JournalActions } from "./use-journal-data";
import {
  JournalEmpty,
  JournalField,
  JournalModal,
  JournalSectionHeader,
  PrimaryButton,
  SecondaryButton,
  journalCard,
  journalInput,
} from "./journal-ui";
import { lessonTimeError } from "./journal-validation";

type CommonProps = {
  snapshot: JournalSnapshot;
  selectedClassId: string;
  onClassChange: (classId: string) => void;
  actions: JournalActions;
};

function defaultLessonStart() {
  const next = new Date();
  next.setMinutes(Math.ceil(next.getMinutes() / 15) * 15, 0, 0);
  return toDateInputValue(next);
}

export function JournalClassesPanel({
  snapshot,
  selectedClassId,
  onClassChange,
  actions,
}: CommonProps) {
  const [classModal, setClassModal] = useState(false);
  const [studentModal, setStudentModal] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [className, setClassName] = useState("");
  const [schoolYear, setSchoolYear] = useState("2026/27");
  const [studentName, setStudentName] = useState("");
  const selectedClass = snapshot.classes.find((item) => item.id === selectedClassId);
  const students = snapshot.students.filter((item) => item.class_id === selectedClassId);

  const submitClass = async () => {
    if (!className.trim() || !schoolYear.trim()) {
      toast.error("Podaj nazwę klasy i rok szkolny.");
      return;
    }
    setBusy(true);
    try {
      if (editingClassId) {
        await actions.updateClass(editingClassId, className, schoolYear);
        toast.success("Dane klasy zostały zaktualizowane.");
      } else {
        await actions.createClass(className, schoolYear);
        toast.success("Klasa została utworzona.");
      }
      setClassName("");
      setEditingClassId(null);
      setClassModal(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const submitStudent = async () => {
    if (!selectedClass || !studentName.trim()) return;
    setBusy(true);
    try {
      if (editingStudentId) {
        await actions.updateStudent(editingStudentId, studentName);
        toast.success("Dane ucznia zostały zaktualizowane.");
      } else {
        await actions.addStudent(selectedClass.id, studentName);
        toast.success("Uczeń został dodany do klasy.");
      }
      setStudentName("");
      setEditingStudentId(null);
      setStudentModal(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const openClassEditor = () => {
    if (!selectedClass) return;
    setEditingClassId(selectedClass.id);
    setClassName(selectedClass.name);
    setSchoolYear(selectedClass.year);
    setClassModal(true);
  };

  const removeClass = async () => {
    if (!selectedClass) return;
    const confirmed = await confirmDialog({
      title: `Usunąć klasę ${selectedClass.name}?`,
      description:
        "Usunięta zostanie lista uczniów oraz powiązane lekcje, frekwencja, oceny i wpisy. Operacja zostanie odnotowana w historii zmian.",
      confirmText: "Usuń klasę i dane",
    });
    if (!confirmed) return;
    setBusy(true);
    try {
      await actions.deleteClass(selectedClass.id);
      onClassChange("");
      toast.success("Klasa i powiązane dane zostały usunięte.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const openStudentEditor = (studentId: string, name: string | null) => {
    setEditingStudentId(studentId);
    setStudentName(name?.trim() || "");
    setStudentModal(true);
  };

  const removeStudent = async (studentId: string, name: string) => {
    const confirmed = await confirmDialog({
      title: `Usunąć ucznia ${name}?`,
      description:
        "Usunięte zostaną także jego wpisy frekwencji, oceny i uwagi w tej klasie. Operacja zostanie zapisana w historii.",
      confirmText: "Usuń ucznia",
    });
    if (!confirmed) return;
    setBusy(true);
    try {
      await actions.deleteStudent(studentId);
      toast.success("Uczeń i powiązane wpisy zostały usunięte.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className={`${journalCard} p-5 sm:p-6`}>
        <JournalSectionHeader
          eyebrow="Struktura szkoły"
          title="Klasy i grupy"
          description="Zarządzaj oddziałami, rokiem szkolnym i listami uczniów."
          action={
            <PrimaryButton onClick={() => setClassModal(true)}>
              <Plus className="h-4 w-4" />
              Nowa klasa
            </PrimaryButton>
          }
        />
        {snapshot.classes.length === 0 ? (
          <div className="mt-5">
            <JournalEmpty
              icon={GraduationCap}
              title="Nie masz jeszcze klas"
              description="Utwórz pierwszy oddział, a następnie dodaj uczniów."
              action={
                <PrimaryButton onClick={() => setClassModal(true)}>Utwórz klasę</PrimaryButton>
              }
            />
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {snapshot.classes.map((schoolClass) => {
              const count = snapshot.students.filter(
                (student) => student.class_id === schoolClass.id,
              ).length;
              const selected = schoolClass.id === selectedClassId;
              return (
                <button
                  key={schoolClass.id}
                  type="button"
                  onClick={() => onClassChange(schoolClass.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selected
                      ? "border-blue-300 bg-blue-50 shadow-[0_0_0_1px_rgba(37,99,235,0.12)] dark:border-blue-400/40 dark:bg-blue-400/10"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`grid h-11 w-11 place-items-center rounded-xl ${selected ? "bg-blue-700 text-white dark:bg-blue-400 dark:text-slate-950" : "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300"}`}
                    >
                      <Users className="h-5 w-5" />
                    </div>
                    {selected && <Check className="h-4 w-4 text-blue-700 dark:text-blue-300" />}
                  </div>
                  <div className="mt-4 text-base font-semibold text-slate-950 dark:text-slate-100">
                    {schoolClass.name}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{schoolClass.year}</span>
                    <span>
                      {count} {count === 1 ? "uczeń" : "uczniów"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {selectedClass && (
        <section className={`${journalCard} overflow-hidden`}>
          <div className="border-b border-slate-200 p-5 dark:border-white/10 sm:p-6">
            <JournalSectionHeader
              eyebrow="Lista uczniów"
              title={classLabel(selectedClass)}
              description={`${students.length} osób przypisanych do klasy`}
              action={
                <div className="flex flex-wrap gap-2">
                  <SecondaryButton onClick={openClassEditor}>
                    <Pencil className="h-4 w-4" />
                    Edytuj klasę
                  </SecondaryButton>
                  <SecondaryButton
                    onClick={() => {
                      setEditingStudentId(null);
                      setStudentName("");
                      setStudentModal(true);
                    }}
                  >
                    <UserPlus className="h-4 w-4" />
                    Dodaj ucznia
                  </SecondaryButton>
                  <button
                    type="button"
                    onClick={removeClass}
                    disabled={busy}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-400/20 dark:bg-rose-400/5 dark:text-rose-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    Usuń klasę
                  </button>
                </div>
              }
            />
          </div>
          {students.length === 0 ? (
            <div className="p-5 sm:p-6">
              <JournalEmpty
                icon={UserPlus}
                title="Lista jest pusta"
                description="Dodaj uczniów ręcznie. Później można powiązać ich z kontami EduNex."
                action={
                  <PrimaryButton onClick={() => setStudentModal(true)}>
                    Dodaj pierwszego ucznia
                  </PrimaryButton>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500 dark:bg-white/[0.03] dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Lp.</th>
                    <th className="px-5 py-3">Uczeń</th>
                    <th className="px-5 py-3">Konto EduNex</th>
                    <th className="px-5 py-3">Oceny</th>
                    <th className="px-5 py-3">Wpisy frekwencji</th>
                    <th className="px-5 py-3 text-right">Zarządzanie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {students.map((student, index) => (
                    <tr key={student.id} className="text-slate-700 dark:text-slate-300">
                      <td className="px-5 py-3 text-slate-400">{index + 1}</td>
                      <td className="px-5 py-3 font-semibold text-slate-950 dark:text-slate-100">
                        {studentLabel(student)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${student.student_user_id ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"}`}
                        >
                          {student.student_user_id ? "Połączone" : "Niepołączone"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {snapshot.grades.filter((grade) => grade.student_id === student.id).length}
                      </td>
                      <td className="px-5 py-3">
                        {
                          snapshot.attendance.filter((entry) => entry.student_id === student.id)
                            .length
                        }
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openStudentEditor(student.id, student.student_name)}
                            aria-label={`Edytuj ucznia ${studentLabel(student)}`}
                            className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-400/10 dark:hover:text-blue-300"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeStudent(student.id, studentLabel(student))}
                            aria-label={`Usuń ucznia ${studentLabel(student)}`}
                            className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-400/10 dark:hover:text-rose-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {classModal && (
        <JournalModal
          title={editingClassId ? "Edytuj klasę" : "Nowa klasa"}
          description={
            editingClassId
              ? "Zmień nazwę oddziału lub rok szkolny."
              : "Utwórz oddział lub grupę zajęciową."
          }
          onClose={() => {
            setEditingClassId(null);
            setClassModal(false);
          }}
        >
          <div className="grid gap-4">
            <JournalField label="Nazwa klasy">
              <input
                autoFocus
                value={className}
                onChange={(event) => setClassName(event.target.value)}
                className={journalInput}
                placeholder="np. 7A"
              />
            </JournalField>
            <JournalField label="Rok szkolny">
              <input
                value={schoolYear}
                onChange={(event) => setSchoolYear(event.target.value)}
                className={journalInput}
                placeholder="2026/27"
              />
            </JournalField>
            <div className="mt-2 flex justify-end gap-2">
              <SecondaryButton onClick={() => setClassModal(false)}>Anuluj</SecondaryButton>
              <PrimaryButton disabled={busy} onClick={submitClass}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingClassId ? "Zapisz zmiany" : "Utwórz klasę"}
              </PrimaryButton>
            </div>
          </div>
        </JournalModal>
      )}

      {studentModal && selectedClass && (
        <JournalModal
          title={editingStudentId ? "Edytuj ucznia" : "Dodaj ucznia"}
          description={
            editingStudentId
              ? `Aktualizacja danych w klasie ${selectedClass.name}.`
              : `Nowa osoba w klasie ${selectedClass.name}.`
          }
          onClose={() => {
            setEditingStudentId(null);
            setStudentModal(false);
          }}
        >
          <div className="grid gap-4">
            <JournalField label="Imię i nazwisko">
              <input
                autoFocus
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                className={journalInput}
                placeholder="np. Julia Kowalska"
              />
            </JournalField>
            <div className="mt-2 flex justify-end gap-2">
              <SecondaryButton onClick={() => setStudentModal(false)}>Anuluj</SecondaryButton>
              <PrimaryButton disabled={busy} onClick={submitStudent}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingStudentId ? "Zapisz dane" : "Dodaj ucznia"}
              </PrimaryButton>
            </div>
          </div>
        </JournalModal>
      )}
    </div>
  );
}

export function JournalLessonsPanel({
  snapshot,
  selectedClassId,
  onClassChange,
  actions,
  composerOpen,
  onComposerChange,
}: CommonProps & { composerOpen: boolean; onComposerChange: (open: boolean) => void }) {
  const [busy, setBusy] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [form, setForm] = useState({
    classId: selectedClassId,
    subject: "",
    topic: "",
    room: "",
    startsAt: defaultLessonStart(),
    endsAt: "",
    notes: "",
  });
  const lessons = snapshot.lessons
    .filter((item) => !selectedClassId || item.class_id === selectedClassId)
    .sort((a, b) => b.starts_at.localeCompare(a.starts_at));

  const openComposer = () => {
    setEditingLessonId(null);
    setForm((current) => ({
      ...current,
      classId: selectedClassId || snapshot.classes[0]?.id || "",
      startsAt: defaultLessonStart(),
    }));
    onComposerChange(true);
  };

  useEffect(() => {
    if (!composerOpen || editingLessonId) return;
    setForm((current) => ({
      ...current,
      classId: current.classId || selectedClassId || snapshot.classes[0]?.id || "",
      startsAt: current.startsAt || defaultLessonStart(),
    }));
  }, [composerOpen, editingLessonId, selectedClassId, snapshot.classes]);

  const openEditor = (lessonId: string) => {
    const lesson = snapshot.lessons.find((item) => item.id === lessonId);
    if (!lesson) return;
    setEditingLessonId(lesson.id);
    setForm({
      classId: lesson.class_id,
      subject: lesson.subject,
      topic: lesson.topic,
      room: lesson.room || "",
      startsAt: toDateInputValue(new Date(lesson.starts_at)),
      endsAt: lesson.ends_at ? toDateInputValue(new Date(lesson.ends_at)) : "",
      notes: lesson.notes || "",
    });
    onComposerChange(true);
  };

  const submit = async () => {
    if (!form.classId || !form.subject.trim() || !form.topic.trim() || !form.startsAt) {
      toast.error("Wybierz klasę i uzupełnij przedmiot, temat oraz termin.");
      return;
    }
    const timeError = lessonTimeError(form.startsAt, form.endsAt);
    if (timeError) {
      toast.error(timeError);
      return;
    }
    setBusy(true);
    try {
      if (editingLessonId) await actions.updateLesson(editingLessonId, form);
      else await actions.createLesson(form);
      onClassChange(form.classId);
      toast.success(
        editingLessonId ? "Lekcja została zaktualizowana." : "Lekcja została zaplanowana.",
      );
      setForm({ ...form, subject: "", topic: "", room: "", notes: "", endsAt: "" });
      setEditingLessonId(null);
      onComposerChange(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const duplicate = async (lessonId: string) => {
    try {
      await actions.duplicateLesson(lessonId);
      toast.success("Utworzono kopię lekcji w terminie za 7 dni.");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const changeStatus = async (lessonId: string, status: LessonStatus) => {
    try {
      await actions.setLessonStatus(lessonId, status);
      toast.success(`Status: ${LESSON_STATUS_LABELS[status]}.`);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const remove = async (lessonId: string, topic: string) => {
    const confirmed = await confirmDialog({
      title: "Usunąć lekcję?",
      description: `Temat: ${topic}. Usunięte zostaną też wpisy frekwencji.`,
    });
    if (!confirmed) return;
    try {
      await actions.deleteLesson(lessonId);
      toast.success("Lekcja została usunięta.");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="space-y-5">
      <section className={`${journalCard} p-5 sm:p-6`}>
        <JournalSectionHeader
          eyebrow="Dziennik lekcyjny"
          title="Lekcje i tematy"
          description="Planuj zajęcia, wpisuj realizowane tematy i pilnuj statusu lekcji."
          action={
            <PrimaryButton onClick={openComposer}>
              <Plus className="h-4 w-4" />
              Nowa lekcja
            </PrimaryButton>
          }
        />
        <div className="mt-5 max-w-sm">
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
            Pokaż klasę
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
        </div>
      </section>

      {lessons.length === 0 ? (
        <JournalEmpty
          icon={BookOpenCheck}
          title="Brak lekcji"
          description="Dodaj pierwszą lekcję, aby rozpocząć prowadzenie tematów i frekwencji."
          action={<PrimaryButton onClick={openComposer}>Zaplanuj lekcję</PrimaryButton>}
        />
      ) : (
        <section className={`${journalCard} overflow-hidden`}>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {lessons.map((lesson) => {
              const schoolClass = snapshot.classes.find((item) => item.id === lesson.class_id);
              const status = lesson.status as LessonStatus;
              return (
                <article
                  key={lesson.id}
                  className="grid gap-4 p-4 sm:grid-cols-[76px_1fr_auto] sm:items-center sm:px-5"
                >
                  <div className="rounded-xl bg-slate-50 px-2 py-3 text-center dark:bg-white/[0.04]">
                    <div className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                      {new Date(lesson.starts_at).toLocaleTimeString("pl-PL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                      {new Date(lesson.starts_at).toLocaleDateString("pl-PL", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100">
                        {lesson.subject}
                      </h3>
                      <LessonStatusPill status={status} />
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-300">
                      {lesson.topic}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {schoolClass?.name || "Klasa"}
                      </span>
                      {lesson.room && (
                        <span className="inline-flex items-center gap-1">
                          <DoorOpen className="h-3.5 w-3.5" />
                          Sala {lesson.room}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {formatDateTime(lesson.starts_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 sm:justify-end">
                    {status === "scheduled" && (
                      <button
                        type="button"
                        onClick={() => changeStatus(lesson.id, "in_progress")}
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-300"
                      >
                        <Play className="h-3.5 w-3.5" />
                        Rozpocznij
                      </button>
                    )}
                    {status === "in_progress" && (
                      <button
                        type="button"
                        onClick={() => changeStatus(lesson.id, "completed")}
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-400/10 dark:text-blue-300"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Zakończ
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(lesson.id, lesson.topic)}
                      aria-label={`Usuń lekcję ${lesson.topic}`}
                      className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-400/10 dark:hover:text-rose-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicate(lesson.id)}
                      aria-label={`Powiel lekcję ${lesson.topic}`}
                      className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditor(lesson.id)}
                      aria-label={`Edytuj lekcję ${lesson.topic}`}
                      className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-400/10 dark:hover:text-blue-300"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {composerOpen && (
        <JournalModal
          title={editingLessonId ? "Edytuj lekcję" : "Nowa lekcja"}
          description={
            editingLessonId
              ? "Aktualizuj termin, temat i dane organizacyjne."
              : "Zapisz termin, klasę i temat realizowanych zajęć."
          }
          onClose={() => {
            setEditingLessonId(null);
            onComposerChange(false);
          }}
          wide
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <JournalField label="Klasa">
              <select
                value={form.classId}
                onChange={(event) => setForm({ ...form, classId: event.target.value })}
                className={journalInput}
              >
                <option value="">Wybierz klasę</option>
                {snapshot.classes.map((schoolClass) => (
                  <option key={schoolClass.id} value={schoolClass.id}>
                    {classLabel(schoolClass)}
                  </option>
                ))}
              </select>
            </JournalField>
            <JournalField label="Przedmiot">
              <input
                value={form.subject}
                onChange={(event) => setForm({ ...form, subject: event.target.value })}
                className={journalInput}
                placeholder="np. Matematyka"
              />
            </JournalField>
            <div className="sm:col-span-2">
              <JournalField label="Temat lekcji">
                <input
                  value={form.topic}
                  onChange={(event) => setForm({ ...form, topic: event.target.value })}
                  className={journalInput}
                  placeholder="np. Równania liniowe — utrwalenie"
                />
              </JournalField>
            </div>
            <JournalField label="Początek">
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) => setForm({ ...form, startsAt: event.target.value })}
                className={journalInput}
              />
            </JournalField>
            <JournalField label="Koniec" hint="opcjonalnie">
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={(event) => setForm({ ...form, endsAt: event.target.value })}
                className={journalInput}
              />
            </JournalField>
            <JournalField label="Sala" hint="opcjonalnie">
              <input
                value={form.room}
                onChange={(event) => setForm({ ...form, room: event.target.value })}
                className={journalInput}
                placeholder="np. 204"
              />
            </JournalField>
            <JournalField label="Notatka organizacyjna" hint="opcjonalnie">
              <input
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                className={journalInput}
                placeholder="Materiały, zastępstwo..."
              />
            </JournalField>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <SecondaryButton onClick={() => onComposerChange(false)}>Anuluj</SecondaryButton>
            <PrimaryButton disabled={busy} onClick={submit}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingLessonId ? "Zapisz zmiany" : "Zapisz lekcję"}
            </PrimaryButton>
          </div>
        </JournalModal>
      )}
    </div>
  );
}

function LessonStatusPill({ status }: { status: LessonStatus }) {
  const styles: Record<LessonStatus, string> = {
    scheduled: "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300",
    in_progress: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
    completed: "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300",
    cancelled: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      {LESSON_STATUS_LABELS[status]}
    </span>
  );
}
