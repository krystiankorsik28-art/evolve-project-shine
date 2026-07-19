import { useMemo, useState } from "react";
import {
  Award,
  Eye,
  EyeOff,
  FileWarning,
  Loader2,
  MessageSquareText,
  Pencil,
  Plus,
  Search,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { confirmDialog } from "@/components/ConfirmDialog";
import {
  classLabel,
  formatDay,
  studentLabel,
  type JournalSnapshot,
  type NoteKind,
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

type Props = {
  snapshot: JournalSnapshot;
  selectedClassId: string;
  onClassChange: (classId: string) => void;
  actions: JournalActions;
};

export function JournalGradesPanel({ snapshot, selectedClassId, onClassChange, actions }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    studentId: "",
    subject: "",
    category: "Sprawdzian",
    title: "",
    value: "5",
    weight: "1",
    comment: "",
    visibleToStudent: true,
  });
  const selectedClass = snapshot.classes.find((item) => item.id === selectedClassId);
  const students = snapshot.students.filter((student) => student.class_id === selectedClassId);
  const grades = snapshot.grades.filter((grade) => grade.class_id === selectedClassId);

  const rows = useMemo(
    () =>
      students
        .filter((student) =>
          studentLabel(student).toLocaleLowerCase("pl").includes(search.toLocaleLowerCase("pl")),
        )
        .map((student) => {
          const studentGrades = grades.filter((grade) => grade.student_id === student.id);
          const weight = studentGrades.reduce((sum, grade) => sum + grade.weight, 0);
          const average = weight
            ? studentGrades.reduce((sum, grade) => sum + grade.value * grade.weight, 0) / weight
            : null;
          return { student, grades: studentGrades, average };
        }),
    [grades, search, students],
  );

  const openModal = (studentId = "", gradeId?: string) => {
    const grade = gradeId ? snapshot.grades.find((item) => item.id === gradeId) : null;
    setEditingGradeId(grade?.id || null);
    setForm((current) =>
      grade
        ? {
            studentId: grade.student_id,
            subject: grade.subject,
            category: grade.category,
            title: grade.title,
            value: String(grade.value),
            weight: String(grade.weight),
            comment: grade.comment || "",
            visibleToStudent: grade.visible_to_student,
          }
        : { ...current, studentId },
    );
    setModalOpen(true);
  };

  const submit = async () => {
    const value = Number(form.value);
    const weight = Number(form.weight);
    if (!selectedClass || !form.studentId || !form.subject.trim() || !form.title.trim()) {
      toast.error("Wybierz ucznia i uzupełnij przedmiot oraz nazwę oceny.");
      return;
    }
    if (
      !Number.isFinite(value) ||
      value < 1 ||
      value > 6 ||
      !Number.isFinite(weight) ||
      weight <= 0 ||
      weight > 10
    ) {
      toast.error("Ocena musi mieścić się w zakresie 1–6, a waga 0,1–10.");
      return;
    }
    setBusy(true);
    try {
      const input = {
        classId: selectedClass.id,
        studentId: form.studentId,
        subject: form.subject,
        category: form.category,
        title: form.title,
        value,
        weight,
        comment: form.comment,
        visibleToStudent: form.visibleToStudent,
      };
      if (editingGradeId) await actions.updateGrade(editingGradeId, input);
      else await actions.createGrade(input);
      toast.success(editingGradeId ? "Ocena została zaktualizowana." : "Ocena została wystawiona.");
      setForm({ ...form, title: "", comment: "" });
      setEditingGradeId(null);
      setModalOpen(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (gradeId: string) => {
    if (
      !(await confirmDialog({
        title: "Usunąć ocenę?",
        description: "Tej operacji nie można cofnąć.",
      }))
    )
      return;
    try {
      await actions.deleteGrade(gradeId);
      toast.success("Ocena została usunięta.");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="space-y-5">
      <section className={`${journalCard} p-5 sm:p-6`}>
        <JournalSectionHeader
          eyebrow="Ocenianie"
          title="Dziennik ocen"
          description="Oceny cząstkowe, wagi, komentarze i automatyczna średnia ważona."
          action={
            <PrimaryButton
              disabled={!selectedClass || students.length === 0}
              onClick={() => openModal()}
            >
              <Plus className="h-4 w-4" />
              Wystaw ocenę
            </PrimaryButton>
          }
        />
        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(240px,360px)_1fr]">
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
            Klasa
            <select
              value={selectedClassId}
              onChange={(event) => onClassChange(event.target.value)}
              className={journalInput}
            >
              <option value="">Wybierz klasę</option>
              {snapshot.classes.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>
                  {classLabel(schoolClass)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
            Wyszukaj ucznia
            <span className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className={`${journalInput} pl-9`}
                placeholder="Imię i nazwisko"
              />
            </span>
          </label>
        </div>
      </section>

      {!selectedClass ? (
        <JournalEmpty
          icon={Users}
          title="Wybierz klasę"
          description="Dziennik ocen jest zawsze przypisany do konkretnej klasy."
        />
      ) : students.length === 0 ? (
        <JournalEmpty
          icon={Users}
          title="Brak uczniów"
          description="Dodaj uczniów do klasy, aby móc wystawiać oceny."
        />
      ) : (
        <section className={`${journalCard} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500 dark:bg-white/[0.03] dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3">Uczeń</th>
                  <th className="px-5 py-3">Oceny</th>
                  <th className="px-5 py-3 text-center">Średnia</th>
                  <th className="px-5 py-3 text-right">Akcja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {rows.map(({ student, grades: studentGrades, average }) => (
                  <tr key={student.id}>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-950 dark:text-slate-100">
                        {studentLabel(student)}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-400">
                        {studentGrades.length} ocen
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex max-w-xl flex-wrap gap-1.5">
                        {studentGrades.slice(0, 12).map((grade) => (
                          <span
                            key={grade.id}
                            className="group relative inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-2 text-sm font-semibold text-blue-800 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200"
                            title={`${grade.subject} · ${grade.title} · waga ${grade.weight}`}
                          >
                            {Number.isInteger(grade.value) ? grade.value : grade.value.toFixed(1)}
                            <span className="absolute -right-2 -top-2 hidden items-center overflow-hidden rounded-lg bg-slate-950 text-white shadow group-hover:flex dark:bg-white dark:text-slate-950">
                              <button
                                type="button"
                                onClick={() => openModal(grade.student_id, grade.id)}
                                aria-label={`Edytuj ocenę ${grade.value}`}
                                className="grid h-6 w-6 place-items-center hover:bg-white/15 dark:hover:bg-slate-200"
                              >
                                <Pencil className="h-2.5 w-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => remove(grade.id)}
                                aria-label={`Usuń ocenę ${grade.value}`}
                                className="grid h-6 w-6 place-items-center hover:bg-rose-600 hover:text-white"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          </span>
                        ))}
                        {studentGrades.length === 0 && (
                          <span className="text-xs text-slate-400">Brak ocen</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex min-w-14 justify-center rounded-full px-3 py-1 text-sm font-semibold ${average === null ? "bg-slate-100 text-slate-400 dark:bg-white/5" : average >= 4.5 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300" : average < 2.5 ? "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300" : "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"}`}
                      >
                        {average?.toFixed(2) ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openModal(student.id)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Dodaj
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {modalOpen && selectedClass && (
        <JournalModal
          title={editingGradeId ? "Edytuj ocenę" : "Wystaw ocenę"}
          description={classLabel(selectedClass)}
          onClose={() => {
            setEditingGradeId(null);
            setModalOpen(false);
          }}
          wide
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <JournalField label="Uczeń">
              <select
                value={form.studentId}
                onChange={(event) => setForm({ ...form, studentId: event.target.value })}
                className={journalInput}
              >
                <option value="">Wybierz ucznia</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {studentLabel(student)}
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
            <JournalField label="Kategoria">
              <select
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                className={journalInput}
              >
                {[
                  "Sprawdzian",
                  "Kartkówka",
                  "Odpowiedź",
                  "Zadanie domowe",
                  "Aktywność",
                  "Projekt",
                ].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </JournalField>
            <JournalField label="Nazwa wpisu">
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                className={journalInput}
                placeholder="np. Ułamki zwykłe"
              />
            </JournalField>
            <JournalField label="Ocena" hint="1–6">
              <input
                type="number"
                min="1"
                max="6"
                step="0.5"
                value={form.value}
                onChange={(event) => setForm({ ...form, value: event.target.value })}
                className={journalInput}
              />
            </JournalField>
            <JournalField label="Waga" hint="0,1–10">
              <input
                type="number"
                min="0.1"
                max="10"
                step="0.5"
                value={form.weight}
                onChange={(event) => setForm({ ...form, weight: event.target.value })}
                className={journalInput}
              />
            </JournalField>
            <div className="sm:col-span-2">
              <JournalField label="Komentarz" hint="opcjonalnie">
                <textarea
                  rows={3}
                  value={form.comment}
                  onChange={(event) => setForm({ ...form, comment: event.target.value })}
                  className={`${journalInput} h-auto py-3`}
                  placeholder="Informacja zwrotna dla ucznia"
                />
              </JournalField>
            </div>
            <label className="sm:col-span-2 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-white/10">
              <span>
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-slate-100">
                  {form.visibleToStudent ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                  Widoczna dla ucznia
                </span>
                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                  Uczeń zobaczy ocenę i komentarz na swoim koncie.
                </span>
              </span>
              <input
                type="checkbox"
                checked={form.visibleToStudent}
                onChange={(event) => setForm({ ...form, visibleToStudent: event.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-blue-600"
              />
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <SecondaryButton onClick={() => setModalOpen(false)}>Anuluj</SecondaryButton>
            <PrimaryButton disabled={busy} onClick={submit}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingGradeId ? "Zapisz ocenę" : "Wystaw ocenę"}
            </PrimaryButton>
          </div>
        </JournalModal>
      )}
    </div>
  );
}

export function JournalNotesPanel({ snapshot, selectedClassId, onClassChange, actions }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    kind: "positive" as NoteKind,
    title: "",
    body: "",
    points: "1",
    eventDate: new Date().toISOString().slice(0, 10),
    visibleToStudent: true,
  });
  const selectedClass = snapshot.classes.find((item) => item.id === selectedClassId);
  const students = snapshot.students.filter((student) => student.class_id === selectedClassId);
  const notes = snapshot.notes.filter((note) => note.class_id === selectedClassId);

  const submit = async () => {
    if (!selectedClass || !form.studentId || !form.title.trim()) {
      toast.error("Wybierz ucznia i wpisz tytuł uwagi.");
      return;
    }
    setBusy(true);
    try {
      const input = {
        classId: selectedClass.id,
        studentId: form.studentId,
        kind: form.kind,
        title: form.title,
        body: form.body,
        points: Number(form.points) || 0,
        eventDate: form.eventDate,
        visibleToStudent: form.visibleToStudent,
      };
      if (editingNoteId) await actions.updateNote(editingNoteId, input);
      else await actions.createNote(input);
      toast.success(editingNoteId ? "Wpis został zaktualizowany." : "Wpis został dodany.");
      setForm({ ...form, title: "", body: "" });
      setEditingNoteId(null);
      setModalOpen(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const openNoteEditor = (noteId: string) => {
    const note = snapshot.notes.find((item) => item.id === noteId);
    if (!note) return;
    setEditingNoteId(note.id);
    setForm({
      studentId: note.student_id,
      kind: note.kind as NoteKind,
      title: note.title,
      body: note.body || "",
      points: String(note.points),
      eventDate: note.event_date,
      visibleToStudent: note.visible_to_student,
    });
    setModalOpen(true);
  };

  const remove = async (noteId: string) => {
    if (
      !(await confirmDialog({
        title: "Usunąć wpis?",
        description: "Tej operacji nie można cofnąć.",
      }))
    )
      return;
    try {
      await actions.deleteNote(noteId);
      toast.success("Wpis został usunięty.");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="space-y-5">
      <section className={`${journalCard} p-5 sm:p-6`}>
        <JournalSectionHeader
          eyebrow="Rozwój i zachowanie"
          title="Uwagi i pochwały"
          description="Dokumentuj ważne sytuacje, sukcesy i informacje wychowawcze."
          action={
            <PrimaryButton
              disabled={!selectedClass || students.length === 0}
              onClick={() => setModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Nowy wpis
            </PrimaryButton>
          }
        />
        <div className="mt-5 max-w-sm">
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
            Klasa
            <select
              value={selectedClassId}
              onChange={(event) => onClassChange(event.target.value)}
              className={journalInput}
            >
              <option value="">Wybierz klasę</option>
              {snapshot.classes.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>
                  {classLabel(schoolClass)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {!selectedClass ? (
        <JournalEmpty
          icon={Users}
          title="Wybierz klasę"
          description="Wpisy są przypisywane do ucznia i jego klasy."
        />
      ) : notes.length === 0 ? (
        <JournalEmpty
          icon={MessageSquareText}
          title="Brak uwag i pochwał"
          description="Pierwszy wpis pojawi się tutaj wraz z datą, punktami i widocznością."
          action={
            students.length ? (
              <PrimaryButton onClick={() => setModalOpen(true)}>Dodaj pierwszy wpis</PrimaryButton>
            ) : undefined
          }
        />
      ) : (
        <section className="grid gap-3 lg:grid-cols-2">
          {notes.map((note) => {
            const student = students.find((item) => item.id === note.student_id);
            const meta = noteMeta(note.kind as NoteKind);
            const Icon = meta.icon;
            return (
              <article key={note.id} className={`${journalCard} p-5`}>
                <div className="flex items-start gap-3">
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${meta.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                        {meta.label}
                      </span>
                      <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDay(note.event_date)}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-slate-950 dark:text-slate-100">
                      {note.title}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                      {studentLabel(student)}
                    </p>
                    {note.body && (
                      <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {note.body}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`rounded-full px-2.5 py-1 font-semibold ${note.points > 0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300" : note.points < 0 ? "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300" : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"}`}
                      >
                        {note.points > 0 ? "+" : ""}
                        {note.points} pkt
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        {note.visible_to_student ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                        {note.visible_to_student ? "Widoczne" : "Prywatne"}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => openNoteEditor(note.id)}
                      aria-label={`Edytuj wpis ${note.title}`}
                      className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-400/10 dark:hover:text-blue-300"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(note.id)}
                      aria-label={`Usuń wpis ${note.title}`}
                      className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-400/10 dark:hover:text-rose-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {modalOpen && selectedClass && (
        <JournalModal
          title={editingNoteId ? "Edytuj uwagę lub pochwałę" : "Nowa uwaga lub pochwała"}
          description={classLabel(selectedClass)}
          onClose={() => {
            setEditingNoteId(null);
            setModalOpen(false);
          }}
          wide
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <JournalField label="Uczeń">
              <select
                value={form.studentId}
                onChange={(event) => setForm({ ...form, studentId: event.target.value })}
                className={journalInput}
              >
                <option value="">Wybierz ucznia</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {studentLabel(student)}
                  </option>
                ))}
              </select>
            </JournalField>
            <JournalField label="Rodzaj wpisu">
              <select
                value={form.kind}
                onChange={(event) => setForm({ ...form, kind: event.target.value as NoteKind })}
                className={journalInput}
              >
                <option value="positive">Pochwała</option>
                <option value="neutral">Informacja</option>
                <option value="negative">Uwaga</option>
              </select>
            </JournalField>
            <div className="sm:col-span-2">
              <JournalField label="Tytuł">
                <input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  className={journalInput}
                  placeholder="np. Aktywna praca na lekcji"
                />
              </JournalField>
            </div>
            <div className="sm:col-span-2">
              <JournalField label="Opis" hint="opcjonalnie">
                <textarea
                  rows={4}
                  value={form.body}
                  onChange={(event) => setForm({ ...form, body: event.target.value })}
                  className={`${journalInput} h-auto py-3`}
                  placeholder="Szczegóły zdarzenia"
                />
              </JournalField>
            </div>
            <JournalField label="Data zdarzenia">
              <input
                type="date"
                value={form.eventDate}
                onChange={(event) => setForm({ ...form, eventDate: event.target.value })}
                className={journalInput}
              />
            </JournalField>
            <JournalField label="Punkty" hint="od -100 do 100">
              <input
                type="number"
                min="-100"
                max="100"
                value={form.points}
                onChange={(event) => setForm({ ...form, points: event.target.value })}
                className={journalInput}
              />
            </JournalField>
            <label className="sm:col-span-2 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-white/10">
              <span>
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-slate-100">
                  {form.visibleToStudent ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                  Widoczne dla ucznia
                </span>
                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                  Prywatne wpisy widzi tylko nauczyciel.
                </span>
              </span>
              <input
                type="checkbox"
                checked={form.visibleToStudent}
                onChange={(event) => setForm({ ...form, visibleToStudent: event.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-blue-600"
              />
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <SecondaryButton onClick={() => setModalOpen(false)}>Anuluj</SecondaryButton>
            <PrimaryButton disabled={busy} onClick={submit}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingNoteId ? "Zapisz wpis" : "Dodaj wpis"}
            </PrimaryButton>
          </div>
        </JournalModal>
      )}
    </div>
  );
}

function noteMeta(kind: NoteKind) {
  if (kind === "positive")
    return {
      label: "Pochwała",
      icon: ThumbsUp,
      color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
    };
  if (kind === "negative")
    return {
      label: "Uwaga",
      icon: ThumbsDown,
      color: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300",
    };
  return {
    label: "Informacja",
    icon: FileWarning,
    color: "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300",
  };
}
