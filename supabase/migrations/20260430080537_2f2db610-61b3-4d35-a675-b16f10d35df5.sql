
-- Usuń stare niezgodne PIN-y (kasujemy zamiast UPDATE — żeby ominąć NOT VALID check)
DELETE FROM public.exam_pins WHERE pin_code !~ '^[0-9]{6}$';

-- Constraint: 6 cyfr
ALTER TABLE public.exam_pins DROP CONSTRAINT IF EXISTS exam_pins_pin_code_format;
ALTER TABLE public.exam_pins ADD CONSTRAINT exam_pins_pin_code_format CHECK (pin_code ~ '^[0-9]{6}$');

-- Indeksy
CREATE INDEX IF NOT EXISTS idx_exam_pins_pin_code_active ON public.exam_pins(pin_code) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_attempts_exam_status ON public.attempts(exam_id, status);
CREATE INDEX IF NOT EXISTS idx_proctoring_attempt ON public.proctoring_events(attempt_id, created_at DESC);

-- Seed kategorii
INSERT INTO public.question_categories (name, slug, color, icon) VALUES
  ('Matematyka', 'matematyka', 'cyan', '🔢'),
  ('Fizyka', 'fizyka', 'purple', '⚛️'),
  ('Chemia', 'chemia', 'green', '🧪'),
  ('Biologia', 'biologia', 'emerald', '🧬'),
  ('Historia', 'historia', 'amber', '🏛️'),
  ('Geografia', 'geografia', 'blue', '🌍'),
  ('Język angielski', 'jezyk-angielski', 'red', '🇬🇧'),
  ('Język polski', 'jezyk-polski', 'rose', '📖'),
  ('Informatyka', 'informatyka', 'violet', '💻'),
  ('WOS', 'wos', 'orange', '⚖️'),
  ('Język niemiecki', 'jezyk-niemiecki', 'yellow', '🇩🇪'),
  ('Przyroda', 'przyroda', 'lime', '🌿')
ON CONFLICT (slug) DO NOTHING;
