-- Historia operacji NexDziennika. Rejestr jest tylko do odczytu dla autora
-- operacji i administratora; wpisy tworzą wyłącznie triggery bazodanowe.

create table if not exists public.journal_activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  class_id uuid references public.classes(id) on delete set null,
  entity_type text not null check (
    entity_type in (
      'class',
      'student',
      'lesson',
      'attendance',
      'grade',
      'note',
      'announcement'
    )
  ),
  entity_id uuid not null,
  action text not null check (action in ('created', 'updated', 'deleted')),
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_journal_activity_actor_date
  on public.journal_activity_log(actor_id, created_at desc);
create index if not exists idx_journal_activity_class_date
  on public.journal_activity_log(class_id, created_at desc);

alter table public.journal_activity_log enable row level security;

revoke all on table public.journal_activity_log from anon, authenticated;
grant select on table public.journal_activity_log to authenticated;
grant all on table public.journal_activity_log to service_role;

drop policy if exists "journal_activity_read_own_or_admin"
  on public.journal_activity_log;
create policy "journal_activity_read_own_or_admin"
on public.journal_activity_log
for select
to authenticated
using (
  actor_id = (select auth.uid())
  or public.has_role((select auth.uid()), 'admin'::public.app_role)
);

create or replace function public.capture_journal_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_data jsonb;
  resolved_actor uuid := (select auth.uid());
  resolved_class uuid;
  resolved_entity text;
  resolved_action text;
  resolved_summary text;
begin
  if resolved_actor is null then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  row_data := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  resolved_entity := case tg_table_name
    when 'classes' then 'class'
    when 'class_students' then 'student'
    when 'journal_lessons' then 'lesson'
    when 'journal_attendance' then 'attendance'
    when 'journal_grades' then 'grade'
    when 'journal_notes' then 'note'
    when 'announcements' then 'announcement'
  end;
  resolved_action := case tg_op
    when 'INSERT' then 'created'
    when 'UPDATE' then 'updated'
    else 'deleted'
  end;

  if tg_table_name = 'classes' then
    resolved_class := (row_data ->> 'id')::uuid;
  elsif row_data ? 'class_id' and nullif(row_data ->> 'class_id', '') is not null then
    resolved_class := (row_data ->> 'class_id')::uuid;
  elsif tg_table_name = 'journal_attendance' then
    select lesson.class_id
      into resolved_class
      from public.journal_lessons lesson
     where lesson.id = (row_data ->> 'lesson_id')::uuid;
  end if;

  -- Przy usuwaniu klasy lub kaskadowym usuwaniu jej rekordów identyfikator
  -- może już nie wskazywać istniejącego wiersza. Historia ma wtedy pozostać
  -- kompletna, ale bez łamania klucza obcego.
  if resolved_class is not null
    and not exists (
      select 1 from public.classes school_class where school_class.id = resolved_class
    )
  then
    resolved_class := null;
  end if;

  resolved_summary := left(
    coalesce(
      nullif(row_data ->> 'name', ''),
      nullif(row_data ->> 'student_name', ''),
      nullif(row_data ->> 'topic', ''),
      nullif(row_data ->> 'title', ''),
      case
        when resolved_entity = 'attendance' then 'Lista obecności'
        else initcap(resolved_entity)
      end
    ),
    240
  );

  insert into public.journal_activity_log (
    actor_id,
    class_id,
    entity_type,
    entity_id,
    action,
    summary,
    metadata
  )
  values (
    resolved_actor,
    resolved_class,
    resolved_entity,
    (row_data ->> 'id')::uuid,
    resolved_action,
    resolved_summary,
    jsonb_strip_nulls(
      jsonb_build_object(
        'status', row_data ->> 'status',
        'subject', row_data ->> 'subject',
        'kind', row_data ->> 'kind',
        'student_id', row_data ->> 'student_id',
        'lesson_id', row_data ->> 'lesson_id'
      )
    )
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke execute on function public.capture_journal_activity()
  from public, anon, authenticated;
grant execute on function public.capture_journal_activity() to postgres;

drop trigger if exists trg_journal_activity_classes on public.classes;
create trigger trg_journal_activity_classes
after insert or update or delete on public.classes
for each row execute function public.capture_journal_activity();

drop trigger if exists trg_journal_activity_students on public.class_students;
create trigger trg_journal_activity_students
after insert or update or delete on public.class_students
for each row execute function public.capture_journal_activity();

drop trigger if exists trg_journal_activity_lessons on public.journal_lessons;
create trigger trg_journal_activity_lessons
after insert or update or delete on public.journal_lessons
for each row execute function public.capture_journal_activity();

drop trigger if exists trg_journal_activity_attendance on public.journal_attendance;
create trigger trg_journal_activity_attendance
after insert or update or delete on public.journal_attendance
for each row execute function public.capture_journal_activity();

drop trigger if exists trg_journal_activity_grades on public.journal_grades;
create trigger trg_journal_activity_grades
after insert or update or delete on public.journal_grades
for each row execute function public.capture_journal_activity();

drop trigger if exists trg_journal_activity_notes on public.journal_notes;
create trigger trg_journal_activity_notes
after insert or update or delete on public.journal_notes
for each row execute function public.capture_journal_activity();

drop trigger if exists trg_journal_activity_announcements on public.announcements;
create trigger trg_journal_activity_announcements
after insert or update or delete on public.announcements
for each row execute function public.capture_journal_activity();

comment on table public.journal_activity_log is
  'Niezmienny dziennik operacji CRUD wykonywanych w NexDzienniku.';
