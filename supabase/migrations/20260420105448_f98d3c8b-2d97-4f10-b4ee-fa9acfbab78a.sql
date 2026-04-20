-- ============= ENUMS =============
CREATE TYPE public.question_type AS ENUM (
  'single_choice','multiple_choice','true_false','short_answer','essay','matching','drag_drop'
);

CREATE TYPE public.exam_status AS ENUM ('draft','published','archived');
CREATE TYPE public.attempt_status AS ENUM ('in_progress','submitted','graded');
CREATE TYPE public.difficulty_level AS ENUM ('easy','medium','hard');

-- ============= EXAMS =============
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  status public.exam_status NOT NULL DEFAULT 'draft',
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  passing_score INTEGER NOT NULL DEFAULT 50,
  shuffle_questions BOOLEAN NOT NULL DEFAULT false,
  show_results BOOLEAN NOT NULL DEFAULT true,
  adaptive BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_exams_created_by ON public.exams(created_by);
CREATE INDEX idx_exams_status ON public.exams(status);
CREATE TRIGGER trg_exams_updated_at BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= QUESTIONS =============
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  question_type public.question_type NOT NULL,
  prompt TEXT NOT NULL,
  options JSONB DEFAULT '[]'::jsonb,
  correct_answer JSONB,
  explanation TEXT,
  points NUMERIC(6,2) NOT NULL DEFAULT 1,
  difficulty public.difficulty_level NOT NULL DEFAULT 'medium',
  order_index INTEGER NOT NULL DEFAULT 0,
  media_url TEXT,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_questions_exam_id ON public.questions(exam_id);
CREATE TRIGGER trg_questions_updated_at BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= EXAM PINS =============
CREATE TABLE public.exam_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  pin_code TEXT NOT NULL UNIQUE,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exam_pins ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_exam_pins_pin_code ON public.exam_pins(pin_code);

-- ============= ATTEMPTS =============
CREATE TABLE public.attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  pin_id UUID REFERENCES public.exam_pins(id) ON DELETE SET NULL,
  status public.attempt_status NOT NULL DEFAULT 'in_progress',
  score NUMERIC(6,2),
  max_score NUMERIC(6,2),
  percent NUMERIC(5,2),
  passed BOOLEAN,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  proctoring_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_attempts_exam_id ON public.attempts(exam_id);
CREATE INDEX idx_attempts_student_id ON public.attempts(student_id);

-- ============= ANSWERS =============
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  response JSONB,
  is_correct BOOLEAN,
  points_awarded NUMERIC(6,2),
  ai_feedback TEXT,
  graded_by_ai BOOLEAN NOT NULL DEFAULT false,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(attempt_id, question_id)
);
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_answers_attempt_id ON public.answers(attempt_id);

-- ============= MATERIALS =============
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visible_to_students BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_materials_uploaded_by ON public.materials(uploaded_by);

-- ============= ANNOUNCEMENTS =============
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience public.app_role,
  published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- ============= RLS: EXAMS =============
CREATE POLICY "exams_teacher_admin_select_own" ON public.exams
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR (status = 'published' AND public.has_role(auth.uid(), 'student'))
  );

CREATE POLICY "exams_teacher_admin_insert" ON public.exams
  FOR INSERT TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'))
    AND created_by = auth.uid()
  );

CREATE POLICY "exams_owner_or_admin_update" ON public.exams
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "exams_owner_or_admin_delete" ON public.exams
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ============= RLS: QUESTIONS =============
CREATE POLICY "questions_select_via_exam" ON public.questions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = exam_id
        AND (
          e.created_by = auth.uid()
          OR public.has_role(auth.uid(), 'admin')
          OR (e.status = 'published' AND public.has_role(auth.uid(), 'student'))
        )
    )
  );

CREATE POLICY "questions_modify_owner_or_admin" ON public.questions
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.exams e WHERE e.id = exam_id AND (e.created_by = auth.uid() OR public.has_role(auth.uid(),'admin')))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.exams e WHERE e.id = exam_id AND (e.created_by = auth.uid() OR public.has_role(auth.uid(),'admin')))
  );

-- ============= RLS: EXAM_PINS =============
CREATE POLICY "exam_pins_select_owner_or_admin" ON public.exam_pins
  FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "exam_pins_insert_teacher_admin" ON public.exam_pins
  FOR INSERT TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'))
    AND created_by = auth.uid()
  );

CREATE POLICY "exam_pins_update_owner_or_admin" ON public.exam_pins
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "exam_pins_delete_owner_or_admin" ON public.exam_pins
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- ============= RLS: ATTEMPTS =============
CREATE POLICY "attempts_student_own_or_owner_admin" ON public.attempts
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.exams e WHERE e.id = exam_id AND e.created_by = auth.uid())
  );

CREATE POLICY "attempts_student_insert_own" ON public.attempts
  FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid() OR student_id IS NULL);

CREATE POLICY "attempts_student_update_own_in_progress" ON public.attempts
  FOR UPDATE TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.exams e WHERE e.id = exam_id AND e.created_by = auth.uid()));

-- ============= RLS: ANSWERS =============
CREATE POLICY "answers_select_via_attempt" ON public.answers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.attempts a
      WHERE a.id = attempt_id
        AND (
          a.student_id = auth.uid()
          OR public.has_role(auth.uid(),'admin')
          OR EXISTS (SELECT 1 FROM public.exams e WHERE e.id = a.exam_id AND e.created_by = auth.uid())
        )
    )
  );

CREATE POLICY "answers_insert_own_attempt" ON public.answers
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.attempts a WHERE a.id = attempt_id AND (a.student_id = auth.uid() OR a.student_id IS NULL))
  );

CREATE POLICY "answers_update_own_or_grader" ON public.answers
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.attempts a
      WHERE a.id = attempt_id
        AND (
          a.student_id = auth.uid()
          OR public.has_role(auth.uid(),'admin')
          OR EXISTS (SELECT 1 FROM public.exams e WHERE e.id = a.exam_id AND e.created_by = auth.uid())
        )
    )
  );

-- ============= RLS: MATERIALS =============
CREATE POLICY "materials_select_authenticated" ON public.materials
  FOR SELECT TO authenticated
  USING (
    visible_to_students = true
    OR uploaded_by = auth.uid()
    OR public.has_role(auth.uid(),'admin')
  );

CREATE POLICY "materials_insert_teacher_admin" ON public.materials
  FOR INSERT TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'))
    AND uploaded_by = auth.uid()
  );

CREATE POLICY "materials_update_owner_or_admin" ON public.materials
  FOR UPDATE TO authenticated
  USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "materials_delete_owner_or_admin" ON public.materials
  FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- ============= RLS: ANNOUNCEMENTS =============
CREATE POLICY "announcements_select_published_or_admin" ON public.announcements
  FOR SELECT TO authenticated
  USING (
    published = true
    OR created_by = auth.uid()
    OR public.has_role(auth.uid(),'admin')
  );

CREATE POLICY "announcements_admin_teacher_insert" ON public.announcements
  FOR INSERT TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'teacher'))
    AND created_by = auth.uid()
  );

CREATE POLICY "announcements_owner_admin_update" ON public.announcements
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "announcements_owner_admin_delete" ON public.announcements
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- ============= STORAGE BUCKETS =============
INSERT INTO storage.buckets (id, name, public) VALUES ('materials','materials', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('question-media','question-media', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars','avatars', true);

-- materials bucket
CREATE POLICY "materials_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'materials');

CREATE POLICY "materials_upload_teacher_admin" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'materials'
    AND (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'))
  );

CREATE POLICY "materials_update_owner" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'materials' AND owner = auth.uid()
  );

CREATE POLICY "materials_delete_owner_admin" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'materials' AND (owner = auth.uid() OR public.has_role(auth.uid(),'admin'))
  );

-- question-media bucket
CREATE POLICY "qm_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'question-media');

CREATE POLICY "qm_upload_teacher_admin" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'question-media'
    AND (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'))
  );

CREATE POLICY "qm_modify_owner_admin" ON storage.objects
  FOR ALL TO authenticated USING (
    bucket_id = 'question-media' AND (owner = auth.uid() OR public.has_role(auth.uid(),'admin'))
  );

-- avatars bucket
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_user_manage_own" ON storage.objects
  FOR ALL TO authenticated USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  ) WITH CHECK (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );
