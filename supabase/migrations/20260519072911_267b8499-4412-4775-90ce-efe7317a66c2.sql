
CREATE TABLE IF NOT EXISTS public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  name text NOT NULL,
  year text NOT NULL DEFAULT '2025/26',
  color text NOT NULL DEFAULT 'from-cyan-500 to-blue-600',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers view own classes" ON public.classes
  FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Teachers insert own classes" ON public.classes
  FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Teachers update own classes" ON public.classes
  FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Teachers delete own classes" ON public.classes
  FOR DELETE USING (auth.uid() = created_by);

CREATE TRIGGER classes_updated_at BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.class_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_user_id uuid,
  student_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage students of own classes" ON public.class_students
  FOR ALL USING (EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.created_by = auth.uid()));
