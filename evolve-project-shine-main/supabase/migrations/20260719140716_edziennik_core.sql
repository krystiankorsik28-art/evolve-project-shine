-- Pełny moduł E-dziennika: lekcje, frekwencja, oceny i uwagi.
-- Wszystkie tabele są dostępne przez Data API wyłącznie dla zalogowanych użytkowników
-- i chronione politykami RLS opartymi na właścicielu danych lub przypisaniu ucznia do klasy.

CREATE TABLE public.journal_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject text NOT NULL,
  topic text NOT NULL,
  room text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  status text NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT journal_lessons_time_order CHECK (ends_at IS NULL OR ends_at > starts_at)
);

CREATE TABLE public.journal_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.journal_lessons(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.class_students(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'present'
    CHECK (status IN ('present', 'absent', 'late', 'excused', 'remote')),
  minutes_late integer NOT NULL DEFAULT 0 CHECK (minutes_late BETWEEN 0 AND 240),
  note text,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, student_id)
);

CREATE TABLE public.journal_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.class_students(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  subject text NOT NULL,
  category text NOT NULL DEFAULT 'Aktywność',
  title text NOT NULL,
  value numeric(3,2) NOT NULL CHECK (value BETWEEN 1 AND 6),
  weight numeric(4,2) NOT NULL DEFAULT 1 CHECK (weight > 0 AND weight <= 10),
  points numeric(8,2),
  max_points numeric(8,2),
  comment text,
  visible_to_student boolean NOT NULL DEFAULT true,
  graded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT journal_grades_points_valid CHECK (
    (points IS NULL AND max_points IS NULL)
    OR (points IS NOT NULL AND max_points IS NOT NULL AND max_points > 0 AND points BETWEEN 0 AND max_points)
  )
);

CREATE TABLE public.journal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.class_students(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  kind text NOT NULL DEFAULT 'neutral' CHECK (kind IN ('positive', 'neutral', 'negative')),
  title text NOT NULL,
  body text,
  points integer NOT NULL DEFAULT 0 CHECK (points BETWEEN -100 AND 100),
  visible_to_student boolean NOT NULL DEFAULT true,
  event_date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_lessons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_attendance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_grades TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_notes TO authenticated;

GRANT ALL ON public.journal_lessons TO service_role;
GRANT ALL ON public.journal_attendance TO service_role;
GRANT ALL ON public.journal_grades TO service_role;
GRANT ALL ON public.journal_notes TO service_role;

ALTER TABLE public.journal_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journal_lessons_select_allowed"
ON public.journal_lessons FOR SELECT TO authenticated
USING (
  created_by = (SELECT auth.uid())
  OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
  OR EXISTS (
    SELECT 1
    FROM public.class_students cs
    WHERE cs.class_id = journal_lessons.class_id
      AND cs.student_user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "journal_lessons_insert_teacher"
ON public.journal_lessons FOR INSERT TO authenticated
WITH CHECK (
  created_by = (SELECT auth.uid())
  AND (
    public.has_role((SELECT auth.uid()), 'teacher'::app_role)
    OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
  )
  AND (
    public.has_role((SELECT auth.uid()), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = journal_lessons.class_id
        AND c.created_by = (SELECT auth.uid())
    )
  )
);

CREATE POLICY "journal_lessons_update_owner"
ON public.journal_lessons FOR UPDATE TO authenticated
USING (
  created_by = (SELECT auth.uid())
  OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
)
WITH CHECK (
  (
    created_by = (SELECT auth.uid())
    OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
  )
  AND (
    public.has_role((SELECT auth.uid()), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = journal_lessons.class_id
        AND c.created_by = (SELECT auth.uid())
    )
  )
);

CREATE POLICY "journal_lessons_delete_owner"
ON public.journal_lessons FOR DELETE TO authenticated
USING (
  created_by = (SELECT auth.uid())
  OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
);

CREATE POLICY "journal_attendance_select_allowed"
ON public.journal_attendance FOR SELECT TO authenticated
USING (
  created_by = (SELECT auth.uid())
  OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
  OR EXISTS (
    SELECT 1
    FROM public.class_students cs
    WHERE cs.id = journal_attendance.student_id
      AND cs.student_user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "journal_attendance_insert_teacher"
ON public.journal_attendance FOR INSERT TO authenticated
WITH CHECK (
  created_by = (SELECT auth.uid())
  AND (
    public.has_role((SELECT auth.uid()), 'teacher'::app_role)
    OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
  )
  AND EXISTS (
    SELECT 1
    FROM public.journal_lessons lesson
    JOIN public.class_students student ON student.class_id = lesson.class_id
    WHERE lesson.id = journal_attendance.lesson_id
      AND student.id = journal_attendance.student_id
      AND (
        lesson.created_by = (SELECT auth.uid())
        OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
      )
  )
);

CREATE POLICY "journal_attendance_update_owner"
ON public.journal_attendance FOR UPDATE TO authenticated
USING (
  created_by = (SELECT auth.uid())
  OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
)
WITH CHECK (
  (
    created_by = (SELECT auth.uid())
    OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
  )
  AND EXISTS (
    SELECT 1
    FROM public.journal_lessons lesson
    JOIN public.class_students student ON student.class_id = lesson.class_id
    WHERE lesson.id = journal_attendance.lesson_id
      AND student.id = journal_attendance.student_id
      AND (
        lesson.created_by = (SELECT auth.uid())
        OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
      )
  )
);

CREATE POLICY "journal_attendance_delete_owner"
ON public.journal_attendance FOR DELETE TO authenticated
USING (
  created_by = (SELECT auth.uid())
  OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
);

CREATE POLICY "journal_grades_select_allowed"
ON public.journal_grades FOR SELECT TO authenticated
USING (
  created_by = (SELECT auth.uid())
  OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
  OR (
    visible_to_student = true
    AND EXISTS (
      SELECT 1
      FROM public.class_students cs
      WHERE cs.id = journal_grades.student_id
        AND cs.student_user_id = (SELECT auth.uid())
    )
  )
);

CREATE POLICY "journal_grades_insert_teacher"
ON public.journal_grades FOR INSERT TO authenticated
WITH CHECK (
  created_by = (SELECT auth.uid())
  AND (
    public.has_role((SELECT auth.uid()), 'teacher'::app_role)
    OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
  )
  AND EXISTS (
    SELECT 1
    FROM public.class_students cs
    JOIN public.classes c ON c.id = cs.class_id
    WHERE cs.id = journal_grades.student_id
      AND cs.class_id = journal_grades.class_id
      AND (
        c.created_by = (SELECT auth.uid())
        OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
      )
  )
);

CREATE POLICY "journal_grades_update_owner"
ON public.journal_grades FOR UPDATE TO authenticated
USING (
  created_by = (SELECT auth.uid())
  OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
)
WITH CHECK (
  (
    created_by = (SELECT auth.uid())
    OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
  )
  AND EXISTS (
    SELECT 1
    FROM public.class_students cs
    JOIN public.classes c ON c.id = cs.class_id
    WHERE cs.id = journal_grades.student_id
      AND cs.class_id = journal_grades.class_id
      AND (
        c.created_by = (SELECT auth.uid())
        OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
      )
  )
);

CREATE POLICY "journal_grades_delete_owner"
ON public.journal_grades FOR DELETE TO authenticated
USING (
  created_by = (SELECT auth.uid())
  OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
);

CREATE POLICY "journal_notes_select_allowed"
ON public.journal_notes FOR SELECT TO authenticated
USING (
  created_by = (SELECT auth.uid())
  OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
  OR (
    visible_to_student = true
    AND EXISTS (
      SELECT 1
      FROM public.class_students cs
      WHERE cs.id = journal_notes.student_id
        AND cs.student_user_id = (SELECT auth.uid())
    )
  )
);

CREATE POLICY "journal_notes_insert_teacher"
ON public.journal_notes FOR INSERT TO authenticated
WITH CHECK (
  created_by = (SELECT auth.uid())
  AND (
    public.has_role((SELECT auth.uid()), 'teacher'::app_role)
    OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
  )
  AND EXISTS (
    SELECT 1
    FROM public.class_students cs
    JOIN public.classes c ON c.id = cs.class_id
    WHERE cs.id = journal_notes.student_id
      AND cs.class_id = journal_notes.class_id
      AND (
        c.created_by = (SELECT auth.uid())
        OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
      )
  )
);

CREATE POLICY "journal_notes_update_owner"
ON public.journal_notes FOR UPDATE TO authenticated
USING (
  created_by = (SELECT auth.uid())
  OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
)
WITH CHECK (
  (
    created_by = (SELECT auth.uid())
    OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
  )
  AND EXISTS (
    SELECT 1
    FROM public.class_students cs
    JOIN public.classes c ON c.id = cs.class_id
    WHERE cs.id = journal_notes.student_id
      AND cs.class_id = journal_notes.class_id
      AND (
        c.created_by = (SELECT auth.uid())
        OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
      )
  )
);

CREATE POLICY "journal_notes_delete_owner"
ON public.journal_notes FOR DELETE TO authenticated
USING (
  created_by = (SELECT auth.uid())
  OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
);

CREATE TRIGGER trg_journal_lessons_updated_at
BEFORE UPDATE ON public.journal_lessons
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_journal_attendance_updated_at
BEFORE UPDATE ON public.journal_attendance
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_journal_grades_updated_at
BEFORE UPDATE ON public.journal_grades
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_journal_notes_updated_at
BEFORE UPDATE ON public.journal_notes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_journal_lessons_owner_date
  ON public.journal_lessons(created_by, starts_at DESC);
CREATE INDEX idx_journal_lessons_class_date
  ON public.journal_lessons(class_id, starts_at DESC);
CREATE INDEX idx_journal_attendance_lesson
  ON public.journal_attendance(lesson_id, status);
CREATE INDEX idx_journal_attendance_student
  ON public.journal_attendance(student_id, recorded_at DESC);
CREATE INDEX idx_journal_grades_class_subject
  ON public.journal_grades(class_id, subject, graded_at DESC);
CREATE INDEX idx_journal_grades_student
  ON public.journal_grades(student_id, graded_at DESC);
CREATE INDEX idx_journal_notes_class_date
  ON public.journal_notes(class_id, event_date DESC);
CREATE INDEX idx_journal_notes_student
  ON public.journal_notes(student_id, event_date DESC);
