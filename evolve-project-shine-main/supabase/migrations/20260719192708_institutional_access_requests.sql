-- Dane z user_metadata są wyłącznie wnioskiem. Nigdy nie służą do autoryzacji.
create table if not exists public.institution_access_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  requested_role text not null check (requested_role in ('admin', 'organization_admin')),
  first_name text not null,
  last_name text not null,
  contact_email text not null,
  contact_phone text not null,
  institution_name text not null,
  institution_rspo text not null check (institution_rspo ~ '^[0-9]{4,10}$'),
  institution_regon text not null check (institution_regon ~ '^([0-9]{9}|[0-9]{14})$'),
  institution_nip text null check (institution_nip is null or institution_nip ~ '^[0-9]{10}$'),
  institution_website text null,
  position_title text not null,
  authorization_basis text not null,
  invitation_code text null,
  requires_manual_review boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'in_review', 'approved', 'rejected')),
  verified_by uuid null references auth.users(id) on delete set null,
  verified_at timestamptz null,
  rejection_reason text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.institution_access_requests enable row level security;

revoke all on table public.institution_access_requests from anon, authenticated;
grant select on table public.institution_access_requests to authenticated;

drop policy if exists "requesters read own institutional request" on public.institution_access_requests;
create policy "requesters read own institutional request"
on public.institution_access_requests
for select
to authenticated
using (user_id = (select auth.uid()));

create or replace function public.capture_institution_access_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  requested text := metadata ->> 'requested_role';
begin
  if requested not in ('admin', 'organization_admin') then
    return new;
  end if;

  insert into public.institution_access_requests (
    user_id,
    requested_role,
    first_name,
    last_name,
    contact_email,
    contact_phone,
    institution_name,
    institution_rspo,
    institution_regon,
    institution_nip,
    institution_website,
    position_title,
    authorization_basis,
    invitation_code,
    requires_manual_review
  ) values (
    new.id,
    requested,
    left(coalesce(metadata ->> 'first_name', ''), 120),
    left(coalesce(metadata ->> 'last_name', ''), 120),
    lower(coalesce(new.email, '')),
    left(coalesce(metadata ->> 'phone', ''), 40),
    left(coalesce(metadata ->> 'school', ''), 240),
    left(coalesce(metadata ->> 'institution_rspo', ''), 10),
    left(coalesce(metadata ->> 'institution_regon', ''), 14),
    nullif(left(coalesce(metadata ->> 'institution_nip', ''), 10), ''),
    nullif(left(coalesce(metadata ->> 'institution_website', ''), 300), ''),
    left(coalesce(metadata ->> 'position', ''), 160),
    left(coalesce(metadata ->> 'authorization_basis', ''), 500),
    nullif(left(coalesce(metadata ->> 'access_code', ''), 100), ''),
    coalesce((metadata ->> 'institution_manual_review')::boolean, false)
  )
  on conflict (user_id) do update set
    contact_phone = excluded.contact_phone,
    institution_name = excluded.institution_name,
    institution_rspo = excluded.institution_rspo,
    institution_regon = excluded.institution_regon,
    institution_nip = excluded.institution_nip,
    institution_website = excluded.institution_website,
    position_title = excluded.position_title,
    authorization_basis = excluded.authorization_basis,
    invitation_code = excluded.invitation_code,
    requires_manual_review = excluded.requires_manual_review,
    status = 'pending',
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_capture_institution_request on auth.users;
create trigger on_auth_user_capture_institution_request
after insert or update of raw_user_meta_data on auth.users
for each row execute procedure public.capture_institution_access_request();

comment on table public.institution_access_requests is
  'Wnioski o dostęp uprzywilejowany. Rekord nie nadaje roli; autoryzacja nadal korzysta wyłącznie z user_roles/app_metadata.';
