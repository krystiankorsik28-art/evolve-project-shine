
-- 1. question_bank table
CREATE TABLE IF NOT EXISTS public.question_bank (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_type question_type NOT NULL,
  prompt text NOT NULL,
  options jsonb DEFAULT '[]'::jsonb,
  correct_answer jsonb,
  explanation text,
  difficulty difficulty_level NOT NULL DEFAULT 'medium',
  points numeric NOT NULL DEFAULT 1,
  category_id uuid REFERENCES public.question_categories(id) ON DELETE SET NULL,
  language text NOT NULL DEFAULT 'pl',
  ai_generated boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qb_select_teacher_admin" ON public.question_bank FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin'));

CREATE POLICY "qb_insert_teacher_admin" ON public.question_bank FOR INSERT TO authenticated
  WITH CHECK ((has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin')) AND created_by = auth.uid());

CREATE POLICY "qb_update_owner_or_admin" ON public.question_bank FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR has_role(auth.uid(),'admin'));

CREATE POLICY "qb_delete_owner_or_admin" ON public.question_bank FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_qb_updated_at BEFORE UPDATE ON public.question_bank
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Fix student freeze: allow authenticated anonymous students to read their attempt
CREATE POLICY "attempts_authenticated_read_active" ON public.attempts FOR SELECT TO authenticated
  USING (
    status = 'in_progress'
    AND (student_id IS NULL OR student_id = auth.uid())
  );

-- 3. Insert physics questions (69.1, 69.2, 69.3)
INSERT INTO public.question_bank (question_type, prompt, options, correct_answer, explanation, difficulty, points, category_id, language, created_by)
VALUES
(
  'ordering',
  'Zadanie 69.1 — Uporządkuj ośrodki według prędkości światła w tych ośrodkach (od najmniejszej do największej): K. powietrze, L. woda, M. próżnia, N. szkło. Wpisz litery w odpowiedniej kolejności.',
  '["N. szkło","L. woda","K. powietrze","M. próżnia"]'::jsonb,
  '["N. szkło","L. woda","K. powietrze","M. próżnia"]'::jsonb,
  'Prędkość światła jest największa w próżni (c ≈ 3·10⁸ m/s). W powietrzu jest praktycznie taka sama, w wodzie mniejsza (n≈1,33), a w szkle najmniejsza (n≈1,5). Im większy współczynnik załamania, tym mniejsza prędkość.',
  'medium', 2,
  'bb82f06c-ac45-49f5-be53-8866251eb08d', 'pl', '8f0eb1ba-a967-4b57-a112-9f782e2f73be'
),
(
  'multiple_choice',
  'Zadanie 69.2 — Czy rysunek poprawnie przedstawia przejście promienia świetlnego z powietrza do szkła? Szkło zaznaczono kolorem zielonym. Zaznacz wszystkie rysunki (a–f), na których przejście jest narysowane POPRAWNIE.',
  '["a) promień łamie się ku normalnej przy przejściu powietrze→szkło (poziome rozdzielenie ośrodków)","b) promień łamie się od normalnej (poziome rozdzielenie)","c) promień łamie się ku normalnej (poziome rozdzielenie)","d) promień łamie się ku normalnej przy przejściu powietrze→szkło (pionowe rozdzielenie)","e) promień nie zmienia kierunku przy ukośnej granicy ośrodków","f) promień łamie się ku normalnej przy ukośnej granicy"]'::jsonb,
  '[0,3,5]'::jsonb,
  'Przy przejściu z ośrodka rzadszego (powietrze) do gęstszego optycznie (szkło) promień załamuje się KU normalnej. Poprawne są więc tylko te rysunki, na których kąt załamania jest mniejszy od kąta padania (a, d, f).',
  'hard', 3,
  'bb82f06c-ac45-49f5-be53-8866251eb08d', 'pl', '8f0eb1ba-a967-4b57-a112-9f782e2f73be'
),
(
  'single_choice',
  'Zadanie 69.3 — Na którym z poniższych rysunków (a, b, c) obszar gęstszy optycznie został zacieniony POPRAWNIE? Pamiętaj: przy przejściu do ośrodka gęstszego optycznie promień załamuje się ku normalnej.',
  '["a) zacieniony obszar po prawej stronie pionowej granicy — promień załamuje się od normalnej","b) zacieniony obszar po lewej stronie pionowej granicy — promień załamuje się ku normalnej","c) zacieniony obszar po dolnej stronie poziomej granicy — promień nie zmienia kierunku"]'::jsonb,
  '1'::jsonb,
  'Gęstszy optycznie jest ten ośrodek, w którym promień załamuje się ku normalnej (kąt załamania mniejszy od kąta padania). Prawidłowo zacieniono ten obszar tylko na rysunku b).',
  'medium', 2,
  'bb82f06c-ac45-49f5-be53-8866251eb08d', 'pl', '8f0eb1ba-a967-4b57-a112-9f782e2f73be'
);
