-- Zmień buckety na prywatne (pliki dostępne przez signed URLs lub authenticated requests)
UPDATE storage.buckets SET public = false WHERE id IN ('materials','question-media','avatars');

-- Usuń dotychczasowe publiczne SELECT polityki
DROP POLICY IF EXISTS "materials_public_read" ON storage.objects;
DROP POLICY IF EXISTS "qm_public_read" ON storage.objects;
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;

-- materials: zalogowany czyta jeśli ma uprawnienia (admin/teacher = wszystko, student = visible_to_students)
CREATE POLICY "materials_select_authenticated_role" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'materials'
    AND (
      public.has_role(auth.uid(),'admin')
      OR public.has_role(auth.uid(),'teacher')
      OR EXISTS (
        SELECT 1 FROM public.materials m
        WHERE m.file_path = name AND m.visible_to_students = true
      )
    )
  );

-- question-media: tylko zalogowani widzą (uczeń podczas egzaminu, nauczyciel/admin)
CREATE POLICY "qm_select_authenticated" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'question-media');

-- avatars: zalogowani widzą wszystkie avatary (typowy use case społecznościowy)
CREATE POLICY "avatars_select_authenticated" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'avatars');
