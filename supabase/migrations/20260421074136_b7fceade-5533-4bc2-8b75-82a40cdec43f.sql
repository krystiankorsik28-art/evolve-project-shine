-- 1. Approval status enum + columns on user_roles
DO $$ BEGIN
  CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS approval_status public.approval_status NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

-- 2. Helper: is approved teacher
CREATE OR REPLACE FUNCTION public.is_approved_teacher(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('teacher','admin')
      AND approval_status = 'approved'
  );
$$;

-- 3. Extend question_type enum
DO $$ BEGIN
  ALTER TYPE public.question_type ADD VALUE IF NOT EXISTS 'fill_in_blank';
EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE public.question_type ADD VALUE IF NOT EXISTS 'ordering';
EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE public.question_type ADD VALUE IF NOT EXISTS 'numeric';
EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE public.question_type ADD VALUE IF NOT EXISTS 'code';
EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE public.question_type ADD VALUE IF NOT EXISTS 'hotspot';
EXCEPTION WHEN others THEN NULL; END $$;

-- 4. Categories
CREATE TABLE IF NOT EXISTS public.question_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  color text DEFAULT 'cyan',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.question_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_all_auth" ON public.question_categories
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "categories_insert_teacher_admin" ON public.question_categories
  FOR INSERT TO authenticated
  WITH CHECK (public.is_approved_teacher(auth.uid()));
CREATE POLICY "categories_update_admin" ON public.question_categories
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "categories_delete_admin" ON public.question_categories
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- 5. Tags
CREATE TABLE IF NOT EXISTS public.question_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.question_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags_select_all_auth" ON public.question_tags
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "tags_insert_teacher_admin" ON public.question_tags
  FOR INSERT TO authenticated WITH CHECK (public.is_approved_teacher(auth.uid()));
CREATE POLICY "tags_delete_admin" ON public.question_tags
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- 6. Question Bank (reusable)
CREATE TABLE IF NOT EXISTS public.question_bank (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.question_categories(id) ON DELETE SET NULL,
  question_type public.question_type NOT NULL,
  prompt text NOT NULL,
  options jsonb DEFAULT '[]'::jsonb,
  correct_answer jsonb,
  explanation text,
  points numeric NOT NULL DEFAULT 1,
  difficulty public.difficulty_level NOT NULL DEFAULT 'medium',
  media_url text,
  language text NOT NULL DEFAULT 'pl',
  ai_generated boolean NOT NULL DEFAULT false,
  ai_validated boolean NOT NULL DEFAULT false,
  usage_count integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_qbank_category ON public.question_bank(category_id);
CREATE INDEX IF NOT EXISTS idx_qbank_creator ON public.question_bank(created_by);
CREATE INDEX IF NOT EXISTS idx_qbank_type ON public.question_bank(question_type);

CREATE POLICY "qbank_select_teacher_admin" ON public.question_bank
  FOR SELECT TO authenticated
  USING (public.is_approved_teacher(auth.uid()));
CREATE POLICY "qbank_insert_teacher_admin" ON public.question_bank
  FOR INSERT TO authenticated
  WITH CHECK (public.is_approved_teacher(auth.uid()) AND created_by = auth.uid());
CREATE POLICY "qbank_update_owner_or_admin" ON public.question_bank
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "qbank_delete_owner_or_admin" ON public.question_bank
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- 7. Bank ↔ Tags
CREATE TABLE IF NOT EXISTS public.question_bank_tags (
  question_id uuid NOT NULL REFERENCES public.question_bank(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.question_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, tag_id)
);
ALTER TABLE public.question_bank_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qbank_tags_select_teacher" ON public.question_bank_tags
  FOR SELECT TO authenticated USING (public.is_approved_teacher(auth.uid()));
CREATE POLICY "qbank_tags_modify_owner_or_admin" ON public.question_bank_tags
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.question_bank qb WHERE qb.id = question_id AND (qb.created_by = auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.question_bank qb WHERE qb.id = question_id AND (qb.created_by = auth.uid() OR public.has_role(auth.uid(),'admin'))));

-- 8. Exam schedules
CREATE TABLE IF NOT EXISTS public.exam_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.exam_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedules_select_owner_admin" ON public.exam_schedules
  FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "schedules_insert_owner" ON public.exam_schedules
  FOR INSERT TO authenticated
  WITH CHECK (public.is_approved_teacher(auth.uid()) AND created_by = auth.uid());
CREATE POLICY "schedules_update_owner_admin" ON public.exam_schedules
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "schedules_delete_owner_admin" ON public.exam_schedules
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- 9. Proctoring events
CREATE TABLE IF NOT EXISTS public.proctoring_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.proctoring_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "proctor_insert_during_attempt" ON public.proctoring_events
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.attempts a WHERE a.id = attempt_id AND (a.student_id = auth.uid() OR a.student_id IS NULL)));
CREATE POLICY "proctor_select_owner_teacher_admin" ON public.proctoring_events
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.attempts a
    JOIN public.exams e ON e.id = a.exam_id
    WHERE a.id = attempt_id AND (e.created_by = auth.uid() OR public.has_role(auth.uid(),'admin'))
  ));

-- 10. Update handle_new_user: teacher = pending
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _role public.app_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'student');
  _approval public.approval_status := CASE WHEN _role = 'teacher' THEN 'pending' ELSE 'approved' END;
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, display_name)
  VALUES (NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name',
      CONCAT_WS(' ', NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name'),
      NEW.email));
  INSERT INTO public.user_roles (user_id, role, approval_status, approved_at)
  VALUES (NEW.id, _role, _approval, CASE WHEN _approval='approved' THEN now() ELSE NULL END);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Tighten exams/questions/exam_pins inserts to approved teachers only
DROP POLICY IF EXISTS exams_teacher_admin_insert ON public.exams;
CREATE POLICY "exams_teacher_admin_insert" ON public.exams
  FOR INSERT TO authenticated
  WITH CHECK (public.is_approved_teacher(auth.uid()) AND created_by = auth.uid());

DROP POLICY IF EXISTS exam_pins_insert_teacher_admin ON public.exam_pins;
CREATE POLICY "exam_pins_insert_teacher_admin" ON public.exam_pins
  FOR INSERT TO authenticated
  WITH CHECK (public.is_approved_teacher(auth.uid()) AND created_by = auth.uid());

DROP POLICY IF EXISTS materials_insert_teacher_admin ON public.materials;
CREATE POLICY "materials_insert_teacher_admin" ON public.materials
  FOR INSERT TO authenticated
  WITH CHECK (public.is_approved_teacher(auth.uid()) AND uploaded_by = auth.uid());

-- 12. updated_at trigger for question_bank
DROP TRIGGER IF EXISTS qbank_updated_at ON public.question_bank;
CREATE TRIGGER qbank_updated_at BEFORE UPDATE ON public.question_bank
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 13. Seed default categories
INSERT INTO public.question_categories (name, slug, icon, color) VALUES
  ('Matematyka','matematyka','Calculator','cyan'),
  ('Język polski','jezyk-polski','BookOpen','rose'),
  ('Historia','historia','Landmark','amber'),
  ('Geografia','geografia','Globe','emerald'),
  ('Biologia','biologia','Leaf','green'),
  ('Chemia','chemia','FlaskConical','violet'),
  ('Fizyka','fizyka','Atom','sky'),
  ('Informatyka','informatyka','Cpu','indigo'),
  ('Język angielski','jezyk-angielski','Languages','red'),
  ('Wiedza o społeczeństwie','wos','Users','yellow'),
  ('Język niemiecki','jezyk-niemiecki','Languages','orange'),
  ('Filozofia','filozofia','Brain','fuchsia')
ON CONFLICT (slug) DO NOTHING;