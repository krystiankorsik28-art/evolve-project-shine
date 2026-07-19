import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
import {
  EMPTY_SNAPSHOT,
  type AttendanceStatus,
  type JournalSnapshot,
  type LessonStatus,
  type NoteKind,
} from "./journal-types";

export type NewLesson = {
  classId: string;
  subject: string;
  topic: string;
  room?: string;
  startsAt: string;
  endsAt?: string;
  notes?: string;
};

type AttendanceDraft = {
  studentId: string;
  status: AttendanceStatus;
  minutesLate?: number;
  note?: string;
};

export type NewGrade = {
  classId: string;
  studentId: string;
  subject: string;
  category: string;
  title: string;
  value: number;
  weight: number;
  comment?: string;
  visibleToStudent: boolean;
};

export type NewNote = {
  classId: string;
  studentId: string;
  kind: NoteKind;
  title: string;
  body?: string;
  points: number;
  eventDate: string;
  visibleToStudent: boolean;
};

export type NewAnnouncement = {
  classId?: string;
  title: string;
  body: string;
  priority: "info" | "important" | "urgent";
};

function isMissingJournalSchema(message?: string) {
  if (!message) return false;
  return /journal_(lessons|attendance|grades|notes|activity_log)|schema cache|does not exist/i.test(
    message,
  );
}

export function useJournalData() {
  const [snapshot, setSnapshot] = useState<JournalSnapshot>(EMPTY_SNAPSHOT);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [schemaReady, setSchemaReady] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
      setError("Nie udało się potwierdzić sesji nauczyciela.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setUserId(user.id);

    const classesResult = await supabase
      .from("classes")
      .select("*")
      .eq("created_by", user.id)
      .order("name", { ascending: true });

    if (classesResult.error) {
      setError(classesResult.error.message);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const classes = classesResult.data ?? [];
    const classIds = classes.map((item) => item.id);
    const studentsRequest = classIds.length
      ? supabase
          .from("class_students")
          .select("*")
          .in("class_id", classIds)
          .order("student_name", { ascending: true })
      : Promise.resolve({ data: [], error: null });

    const [
      studentsResult,
      lessonsResult,
      attendanceResult,
      gradesResult,
      notesResult,
      activityResult,
      announcementsResult,
      eventsResult,
      messagesResult,
    ] = await Promise.all([
      studentsRequest,
      supabase
        .from("journal_lessons")
        .select("*")
        .eq("created_by", user.id)
        .order("starts_at", { ascending: false })
        .limit(500),
      supabase
        .from("journal_attendance")
        .select("*")
        .eq("created_by", user.id)
        .order("recorded_at", { ascending: false })
        .limit(5000),
      supabase
        .from("journal_grades")
        .select("*")
        .eq("created_by", user.id)
        .order("graded_at", { ascending: false })
        .limit(5000),
      supabase
        .from("journal_notes")
        .select("*")
        .eq("created_by", user.id)
        .order("event_date", { ascending: false })
        .limit(1000),
      supabase
        .from("journal_activity_log")
        .select("*")
        .eq("actor_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("announcements")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("calendar_events")
        .select("*")
        .eq("created_by", user.id)
        .gte("starts_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("starts_at", { ascending: true })
        .limit(12),
      supabase
        .from("direct_messages")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .is("read_at", null),
    ]);

    const journalErrors = [
      lessonsResult.error,
      attendanceResult.error,
      gradesResult.error,
      notesResult.error,
      activityResult.error,
    ].filter(Boolean);
    const journalSchemaReady = !journalErrors.some((journalError) =>
      isMissingJournalSchema(journalError?.message),
    );
    setSchemaReady(journalSchemaReady);

    const firstError = [
      studentsResult.error,
      ...journalErrors,
      announcementsResult.error,
      eventsResult.error,
      messagesResult.error,
    ].find((queryError) => queryError && !isMissingJournalSchema(queryError.message));

    if (firstError) setError(firstError.message);

    setSnapshot({
      classes,
      students: studentsResult.data ?? [],
      lessons: lessonsResult.data ?? [],
      attendance: attendanceResult.data ?? [],
      grades: gradesResult.data ?? [],
      notes: notesResult.data ?? [],
      activity: activityResult.data ?? [],
      announcements: announcementsResult.data ?? [],
      events: eventsResult.data ?? [],
      unreadMessages: messagesResult.count ?? 0,
    });
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const requireUser = useCallback(() => {
    if (!userId)
      throw new Error("Sesja nauczyciela wygasła. Odśwież stronę i zaloguj się ponownie.");
    return userId;
  }, [userId]);

  const createClass = useCallback(
    async (name: string, year: string) => {
      const createdBy = requireUser();
      const { error: mutationError } = await supabase.from("classes").insert({
        name: name.trim(),
        year: year.trim(),
        color: "from-blue-600 to-cyan-500",
        created_by: createdBy,
      });
      if (mutationError) throw mutationError;
      await load(true);
    },
    [load, requireUser],
  );

  const updateClass = useCallback(
    async (classId: string, name: string, year: string) => {
      const { data, error: mutationError } = await supabase
        .from("classes")
        .update({ name: name.trim(), year: year.trim() })
        .eq("id", classId)
        .select("id")
        .single();
      if (mutationError) throw mutationError;
      if (!data) throw new Error("Nie znaleziono klasy lub nie masz prawa jej edytować.");
      await load(true);
    },
    [load],
  );

  const deleteClass = useCallback(
    async (classId: string) => {
      const { data, error: mutationError } = await supabase
        .from("classes")
        .delete()
        .eq("id", classId)
        .select("id")
        .single();
      if (mutationError) throw mutationError;
      if (!data) throw new Error("Nie znaleziono klasy lub nie masz prawa jej usunąć.");
      await load(true);
    },
    [load],
  );

  const addStudent = useCallback(
    async (classId: string, name: string) => {
      const { error: mutationError } = await supabase.from("class_students").insert({
        class_id: classId,
        student_name: name.trim(),
      });
      if (mutationError) throw mutationError;
      await load(true);
    },
    [load],
  );

  const updateStudent = useCallback(
    async (studentId: string, name: string) => {
      const { data, error: mutationError } = await supabase
        .from("class_students")
        .update({ student_name: name.trim() })
        .eq("id", studentId)
        .select("id")
        .single();
      if (mutationError) throw mutationError;
      if (!data) throw new Error("Nie znaleziono ucznia lub nie masz prawa go edytować.");
      await load(true);
    },
    [load],
  );

  const deleteStudent = useCallback(
    async (studentId: string) => {
      const { data, error: mutationError } = await supabase
        .from("class_students")
        .delete()
        .eq("id", studentId)
        .select("id")
        .single();
      if (mutationError) throw mutationError;
      if (!data) throw new Error("Nie znaleziono ucznia lub nie masz prawa go usunąć.");
      await load(true);
    },
    [load],
  );

  const createLesson = useCallback(
    async (input: NewLesson) => {
      const createdBy = requireUser();
      const payload: TablesInsert<"journal_lessons"> = {
        class_id: input.classId,
        created_by: createdBy,
        subject: input.subject.trim(),
        topic: input.topic.trim(),
        room: input.room?.trim() || null,
        starts_at: new Date(input.startsAt).toISOString(),
        ends_at: input.endsAt ? new Date(input.endsAt).toISOString() : null,
        notes: input.notes?.trim() || null,
      };
      const { error: mutationError } = await supabase.from("journal_lessons").insert(payload);
      if (mutationError) throw mutationError;
      await load(true);
    },
    [load, requireUser],
  );

  const updateLesson = useCallback(
    async (lessonId: string, input: NewLesson) => {
      const { data, error: mutationError } = await supabase
        .from("journal_lessons")
        .update({
          class_id: input.classId,
          subject: input.subject.trim(),
          topic: input.topic.trim(),
          room: input.room?.trim() || null,
          starts_at: new Date(input.startsAt).toISOString(),
          ends_at: input.endsAt ? new Date(input.endsAt).toISOString() : null,
          notes: input.notes?.trim() || null,
        })
        .eq("id", lessonId)
        .select("id")
        .single();
      if (mutationError) throw mutationError;
      if (!data) throw new Error("Nie znaleziono lekcji lub nie masz prawa jej edytować.");
      await load(true);
    },
    [load],
  );

  const duplicateLesson = useCallback(
    async (lessonId: string) => {
      const lesson = snapshot.lessons.find((item) => item.id === lessonId);
      if (!lesson) throw new Error("Nie znaleziono lekcji do skopiowania.");
      const start = new Date(lesson.starts_at);
      const end = lesson.ends_at ? new Date(lesson.ends_at) : null;
      start.setDate(start.getDate() + 7);
      end?.setDate(end.getDate() + 7);
      await createLesson({
        classId: lesson.class_id,
        subject: lesson.subject,
        topic: lesson.topic,
        room: lesson.room || undefined,
        startsAt: start.toISOString(),
        endsAt: end?.toISOString(),
        notes: lesson.notes || undefined,
      });
    },
    [createLesson, snapshot.lessons],
  );

  const setLessonStatus = useCallback(
    async (lessonId: string, status: LessonStatus) => {
      const { error: mutationError } = await supabase
        .from("journal_lessons")
        .update({ status })
        .eq("id", lessonId);
      if (mutationError) throw mutationError;
      await load(true);
    },
    [load],
  );

  const deleteLesson = useCallback(
    async (lessonId: string) => {
      const { error: mutationError } = await supabase
        .from("journal_lessons")
        .delete()
        .eq("id", lessonId);
      if (mutationError) throw mutationError;
      await load(true);
    },
    [load],
  );

  const saveAttendance = useCallback(
    async (lessonId: string, rows: AttendanceDraft[]) => {
      const createdBy = requireUser();
      const payload: TablesInsert<"journal_attendance">[] = rows.map((row) => ({
        lesson_id: lessonId,
        student_id: row.studentId,
        created_by: createdBy,
        status: row.status,
        minutes_late: row.status === "late" ? Math.max(0, row.minutesLate ?? 0) : 0,
        note: row.note?.trim() || null,
        recorded_at: new Date().toISOString(),
      }));
      const { error: mutationError } = await supabase
        .from("journal_attendance")
        .upsert(payload, { onConflict: "lesson_id,student_id" });
      if (mutationError) throw mutationError;
      await load(true);
    },
    [load, requireUser],
  );

  const clearAttendance = useCallback(
    async (lessonId: string) => {
      const { error: mutationError } = await supabase
        .from("journal_attendance")
        .delete()
        .eq("lesson_id", lessonId);
      if (mutationError) throw mutationError;
      await load(true);
    },
    [load],
  );

  const createGrade = useCallback(
    async (input: NewGrade) => {
      const createdBy = requireUser();
      const { error: mutationError } = await supabase.from("journal_grades").insert({
        class_id: input.classId,
        student_id: input.studentId,
        created_by: createdBy,
        subject: input.subject.trim(),
        category: input.category.trim(),
        title: input.title.trim(),
        value: input.value,
        weight: input.weight,
        comment: input.comment?.trim() || null,
        visible_to_student: input.visibleToStudent,
      });
      if (mutationError) throw mutationError;
      await load(true);
    },
    [load, requireUser],
  );

  const deleteGrade = useCallback(
    async (gradeId: string) => {
      const { error: mutationError } = await supabase
        .from("journal_grades")
        .delete()
        .eq("id", gradeId);
      if (mutationError) throw mutationError;
      await load(true);
    },
    [load],
  );

  const updateGrade = useCallback(
    async (gradeId: string, input: NewGrade) => {
      const { data, error: mutationError } = await supabase
        .from("journal_grades")
        .update({
          class_id: input.classId,
          student_id: input.studentId,
          subject: input.subject.trim(),
          category: input.category.trim(),
          title: input.title.trim(),
          value: input.value,
          weight: input.weight,
          comment: input.comment?.trim() || null,
          visible_to_student: input.visibleToStudent,
        })
        .eq("id", gradeId)
        .select("id")
        .single();
      if (mutationError) throw mutationError;
      if (!data) throw new Error("Nie znaleziono oceny lub nie masz prawa jej edytować.");
      await load(true);
    },
    [load],
  );

  const createNote = useCallback(
    async (input: NewNote) => {
      const createdBy = requireUser();
      const { error: mutationError } = await supabase.from("journal_notes").insert({
        class_id: input.classId,
        student_id: input.studentId,
        created_by: createdBy,
        kind: input.kind,
        title: input.title.trim(),
        body: input.body?.trim() || null,
        points: input.points,
        event_date: input.eventDate,
        visible_to_student: input.visibleToStudent,
      });
      if (mutationError) throw mutationError;
      await load(true);
    },
    [load, requireUser],
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      const { error: mutationError } = await supabase
        .from("journal_notes")
        .delete()
        .eq("id", noteId);
      if (mutationError) throw mutationError;
      await load(true);
    },
    [load],
  );

  const updateNote = useCallback(
    async (noteId: string, input: NewNote) => {
      const { data, error: mutationError } = await supabase
        .from("journal_notes")
        .update({
          class_id: input.classId,
          student_id: input.studentId,
          kind: input.kind,
          title: input.title.trim(),
          body: input.body?.trim() || null,
          points: input.points,
          event_date: input.eventDate,
          visible_to_student: input.visibleToStudent,
        })
        .eq("id", noteId)
        .select("id")
        .single();
      if (mutationError) throw mutationError;
      if (!data) throw new Error("Nie znaleziono wpisu lub nie masz prawa go edytować.");
      await load(true);
    },
    [load],
  );

  const createAnnouncement = useCallback(
    async (input: NewAnnouncement) => {
      const createdBy = requireUser();
      const { error: mutationError } = await supabase.from("announcements").insert({
        created_by: createdBy,
        class_id: input.classId || null,
        title: input.title.trim(),
        body: input.body.trim(),
        priority: input.priority,
        published: true,
      });
      if (mutationError) throw mutationError;
      await load(true);
    },
    [load, requireUser],
  );

  const updateAnnouncement = useCallback(
    async (announcementId: string, input: NewAnnouncement) => {
      const { data, error: mutationError } = await supabase
        .from("announcements")
        .update({
          class_id: input.classId || null,
          title: input.title.trim(),
          body: input.body.trim(),
          priority: input.priority,
        })
        .eq("id", announcementId)
        .select("id")
        .single();
      if (mutationError) throw mutationError;
      if (!data) throw new Error("Nie znaleziono ogłoszenia lub nie masz prawa go edytować.");
      await load(true);
    },
    [load],
  );

  const deleteAnnouncement = useCallback(
    async (announcementId: string) => {
      const { data, error: mutationError } = await supabase
        .from("announcements")
        .delete()
        .eq("id", announcementId)
        .select("id")
        .single();
      if (mutationError) throw mutationError;
      if (!data) throw new Error("Nie znaleziono ogłoszenia lub nie masz prawa go usunąć.");
      await load(true);
    },
    [load],
  );

  return {
    snapshot,
    loading,
    refreshing,
    schemaReady,
    error,
    refresh: () => load(true),
    createClass,
    updateClass,
    deleteClass,
    addStudent,
    updateStudent,
    deleteStudent,
    createLesson,
    updateLesson,
    duplicateLesson,
    setLessonStatus,
    deleteLesson,
    saveAttendance,
    clearAttendance,
    createGrade,
    updateGrade,
    deleteGrade,
    createNote,
    updateNote,
    deleteNote,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  };
}

export type JournalActions = ReturnType<typeof useJournalData>;
