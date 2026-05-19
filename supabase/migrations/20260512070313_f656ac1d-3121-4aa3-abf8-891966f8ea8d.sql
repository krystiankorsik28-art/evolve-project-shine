
ALTER TABLE public.question_bank
  ADD COLUMN IF NOT EXISTS ai_validated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS usage_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.materials
  ADD COLUMN IF NOT EXISTS subject text,
  ADD COLUMN IF NOT EXISTS file_type text,
  ADD COLUMN IF NOT EXISTS file_size bigint;

CREATE TABLE IF NOT EXISTS public.question_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.question_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qtags_select_auth" ON public.question_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "qtags_insert_teacher_admin" ON public.question_tags FOR INSERT TO authenticated
  WITH CHECK ((has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin')) AND created_by = auth.uid());
CREATE POLICY "qtags_delete_owner_admin" ON public.question_tags FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR has_role(auth.uid(),'admin'));
