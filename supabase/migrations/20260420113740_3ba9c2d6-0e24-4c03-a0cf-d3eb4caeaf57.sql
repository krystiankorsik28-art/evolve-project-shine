-- ============= ENUM ról =============
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');

-- ============= Funkcja updated_at =============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============= PROFILES =============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  language TEXT NOT NULL DEFAULT 'pl',
  two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= USER_ROLES =============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.get_primary_role(_user_id UUID)
RETURNS public.app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
  ORDER BY CASE role WHEN 'admin' THEN 1 WHEN 'teacher' THEN 2 WHEN 'student' THEN 3 END
  LIMIT 1;
$$;

-- ============= AUDIT LOGS =============
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ============= TRIGGER auto-profil =============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, display_name)
  VALUES (NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name',
      CONCAT_WS(' ', NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name'),
      NEW.email));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'student'));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS policies (profiles, user_roles, audit_logs)
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_admin_update_all" ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_admin_insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles_select_own_or_admin" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles_admin_all" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "audit_logs_select_own_or_admin" ON public.audit_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "audit_logs_insert_authenticated" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- ============= ENUMS egzaminów =============
CREATE TYPE public.question_type AS ENUM ('single_choice','multiple_choice','true_false','short_answer','essay','matching','drag_drop');
CREATE TYPE public.exam_status AS ENUM ('draft','published','archived');
CREATE TYPE public.attempt_status AS ENUM ('in_progress','submitted','graded');
CREATE TYPE public.difficulty_level AS ENUM ('easy','medium','hard');

CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, description TEXT, subject TEXT,
  status public.exam_status NOT NULL DEFAULT 'draft',
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  passing_score INTEGER NOT NULL DEFAULT 50,
  shuffle_questions BOOLEAN NOT NULL DEFAULT false,
  show_results BOOLEAN NOT NULL DEFAULT true,
  adaptive BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  available_from TIMESTAMPTZ, available_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_exams_created_by ON public.exams(created_by);
CREATE INDEX idx_exams_status ON public.exams(status);
CREATE TRIGGER trg_exams_updated_at BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  question_type public.question_type NOT NULL,
  prompt TEXT NOT NULL,
  options JSONB DEFAULT '[]'::jsonb,
  correct_answer JSONB, explanation TEXT,
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
CREATE TRIGGER trg_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.exam_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  pin_code TEXT NOT NULL UNIQUE,
  max_uses INTEGER, used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ, active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exam_pins ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_exam_pins_pin_code ON public.exam_pins(pin_code);

CREATE TABLE public.attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  pin_id UUID REFERENCES public.exam_pins(id) ON DELETE SET NULL,
  status public.attempt_status NOT NULL DEFAULT 'in_progress',
  score NUMERIC(6,2), max_score NUMERIC(6,2), percent NUMERIC(5,2), passed BOOLEAN,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ, graded_at TIMESTAMPTZ,
  proctoring_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_attempts_exam_id ON public.attempts(exam_id);
CREATE INDEX idx_attempts_student_id ON public.attempts(student_id);

CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  response JSONB, is_correct BOOLEAN, points_awarded NUMERIC(6,2),
  ai_feedback TEXT, graded_by_ai BOOLEAN NOT NULL DEFAULT false,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(attempt_id, question_id)
);
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_answers_attempt_id ON public.answers(attempt_id);

CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, description TEXT, subject TEXT,
  file_path TEXT NOT NULL, file_type TEXT, file_size BIGINT,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visible_to_students BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_materials_uploaded_by ON public.materials(uploaded_by);

CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, body TEXT NOT NULL,
  audience public.app_role,
  published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- RLS exams/questions/pins/attempts/answers/materials/announcements
CREATE POLICY "exams_teacher_admin_select_own" ON public.exams FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin') OR (status='published' AND public.has_role(auth.uid(),'student')));
CREATE POLICY "exams_teacher_admin_insert" ON public.exams FOR INSERT TO authenticated
  WITH CHECK ((public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin')) AND created_by=auth.uid());
CREATE POLICY "exams_owner_or_admin_update" ON public.exams FOR UPDATE TO authenticated
  USING (created_by=auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (created_by=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "exams_owner_or_admin_delete" ON public.exams FOR DELETE TO authenticated
  USING (created_by=auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "questions_select_via_exam" ON public.questions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id=exam_id AND (e.created_by=auth.uid() OR public.has_role(auth.uid(),'admin') OR (e.status='published' AND public.has_role(auth.uid(),'student')))));
CREATE POLICY "questions_modify_owner_or_admin" ON public.questions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id=exam_id AND (e.created_by=auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.exams e WHERE e.id=exam_id AND (e.created_by=auth.uid() OR public.has_role(auth.uid(),'admin'))));

CREATE POLICY "exam_pins_select_owner_or_admin" ON public.exam_pins FOR SELECT TO authenticated
  USING (created_by=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "exam_pins_insert_teacher_admin" ON public.exam_pins FOR INSERT TO authenticated
  WITH CHECK ((public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin')) AND created_by=auth.uid());
CREATE POLICY "exam_pins_update_owner_or_admin" ON public.exam_pins FOR UPDATE TO authenticated
  USING (created_by=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "exam_pins_delete_owner_or_admin" ON public.exam_pins FOR DELETE TO authenticated
  USING (created_by=auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "attempts_student_own_or_owner_admin" ON public.attempts FOR SELECT TO authenticated
  USING (student_id=auth.uid() OR public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.exams e WHERE e.id=exam_id AND e.created_by=auth.uid()));
CREATE POLICY "attempts_student_insert_own" ON public.attempts FOR INSERT TO authenticated
  WITH CHECK (student_id=auth.uid() OR student_id IS NULL);
CREATE POLICY "attempts_student_update_own_in_progress" ON public.attempts FOR UPDATE TO authenticated
  USING (student_id=auth.uid() OR public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.exams e WHERE e.id=exam_id AND e.created_by=auth.uid()));

CREATE POLICY "answers_select_via_attempt" ON public.answers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.attempts a WHERE a.id=attempt_id AND (a.student_id=auth.uid() OR public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.exams e WHERE e.id=a.exam_id AND e.created_by=auth.uid()))));
CREATE POLICY "answers_insert_own_attempt" ON public.answers FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.attempts a WHERE a.id=attempt_id AND (a.student_id=auth.uid() OR a.student_id IS NULL)));
CREATE POLICY "answers_update_own_or_grader" ON public.answers FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.attempts a WHERE a.id=attempt_id AND (a.student_id=auth.uid() OR public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.exams e WHERE e.id=a.exam_id AND e.created_by=auth.uid()))));

CREATE POLICY "materials_select_authenticated" ON public.materials FOR SELECT TO authenticated
  USING (visible_to_students=true OR uploaded_by=auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'teacher'));
CREATE POLICY "materials_insert_teacher_admin" ON public.materials FOR INSERT TO authenticated
  WITH CHECK ((public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin')) AND uploaded_by=auth.uid());
CREATE POLICY "materials_update_owner_or_admin" ON public.materials FOR UPDATE TO authenticated
  USING (uploaded_by=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "materials_delete_owner_or_admin" ON public.materials FOR DELETE TO authenticated
  USING (uploaded_by=auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "announcements_select_audience" ON public.announcements FOR SELECT TO authenticated
  USING (published=true AND (audience IS NULL OR public.has_role(auth.uid(), audience) OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "announcements_admin_all" ON public.announcements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============= STORAGE BUCKETS (private) =============
INSERT INTO storage.buckets (id, name, public) VALUES
  ('materials','materials',false),
  ('question-media','question-media',false),
  ('avatars','avatars',false)
ON CONFLICT (id) DO NOTHING;

-- materials bucket policies
CREATE POLICY "materials_storage_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='materials' AND (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "materials_storage_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id='materials' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'teacher')
    OR EXISTS (SELECT 1 FROM public.materials m WHERE m.file_path=name AND m.visible_to_students=true)));
CREATE POLICY "materials_storage_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='materials' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'teacher')));

-- question-media bucket
CREATE POLICY "qm_storage_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='question-media' AND (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "qm_storage_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id='question-media');

-- avatars bucket
CREATE POLICY "avatars_storage_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_storage_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id='avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_storage_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id='avatars');