insert into storage.buckets (id, name, public) values ('question-media', 'question-media', true) on conflict (id) do nothing;

create policy "qmedia_public_read" on storage.objects for select using (bucket_id = 'question-media');

create policy "qmedia_teacher_insert" on storage.objects for insert to authenticated with check (bucket_id = 'question-media' and (public.has_role(auth.uid(), 'teacher') or public.has_role(auth.uid(), 'admin')));

create policy "qmedia_owner_update" on storage.objects for update to authenticated using (bucket_id = 'question-media' and owner = auth.uid());

create policy "qmedia_owner_delete" on storage.objects for delete to authenticated using (bucket_id = 'question-media' and (owner = auth.uid() or public.has_role(auth.uid(), 'admin')));