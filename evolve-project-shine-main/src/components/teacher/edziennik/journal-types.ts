import type { Tables } from "@/integrations/supabase/types";

export type JournalTab =
  | "overview"
  | "classes"
  | "lessons"
  | "attendance"
  | "grades"
  | "notes"
  | "communication"
  | "integrations"
  | "history";

export type SchoolClass = Tables<"classes">;
export type ClassStudent = Tables<"class_students">;
export type JournalLesson = Tables<"journal_lessons">;
export type AttendanceEntry = Tables<"journal_attendance">;
export type JournalGrade = Tables<"journal_grades">;
export type JournalNote = Tables<"journal_notes">;
export type JournalActivity = Tables<"journal_activity_log">;
export type Announcement = Tables<"announcements">;
export type CalendarEvent = Tables<"calendar_events">;

export type AttendanceStatus = "present" | "absent" | "late" | "excused" | "remote";
export type LessonStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
export type NoteKind = "positive" | "neutral" | "negative";

export type JournalSnapshot = {
  classes: SchoolClass[];
  students: ClassStudent[];
  lessons: JournalLesson[];
  attendance: AttendanceEntry[];
  grades: JournalGrade[];
  notes: JournalNote[];
  activity: JournalActivity[];
  announcements: Announcement[];
  events: CalendarEvent[];
  unreadMessages: number;
};

export const EMPTY_SNAPSHOT: JournalSnapshot = {
  classes: [],
  students: [],
  lessons: [],
  attendance: [],
  grades: [],
  notes: [],
  activity: [],
  announcements: [],
  events: [],
  unreadMessages: 0,
};

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  present: "Obecny",
  absent: "Nieobecny",
  late: "Spóźniony",
  excused: "Usprawiedliwiony",
  remote: "Zdalnie",
};

export const ATTENDANCE_SHORT_LABELS: Record<AttendanceStatus, string> = {
  present: "OB",
  absent: "NB",
  late: "SP",
  excused: "U",
  remote: "ZD",
};

export const LESSON_STATUS_LABELS: Record<LessonStatus, string> = {
  scheduled: "Zaplanowana",
  in_progress: "W toku",
  completed: "Zakończona",
  cancelled: "Odwołana",
};

export function studentLabel(student?: ClassStudent | null) {
  return student?.student_name?.trim() || "Uczeń bez nazwy";
}

export function classLabel(schoolClass?: SchoolClass | null) {
  return schoolClass ? `${schoolClass.name} · ${schoolClass.year}` : "Bez klasy";
}

export function toDateInputValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDay(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}
