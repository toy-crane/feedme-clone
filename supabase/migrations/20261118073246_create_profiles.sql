-- One profile row per auth user, following Supabase's user-management pattern.
create table public.profiles (
  id uuid not null references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 50),
  updated_at timestamptz not null default now(),

  primary key (id)
);

-- Owners read and edit their own row. Rows are created only by the trigger
-- below and removed by the cascade, so no insert/delete grants are needed.
revoke all on table public.profiles from anon, authenticated;
grant select, update (display_name, updated_at) on table public.profiles to authenticated;
grant all on table public.profiles to service_role;

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Keep updated_at current on every edit.
create function public.set_profiles_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_profiles_updated_at();

-- Create the profile when a user signs up. It runs as the definer because the
-- signing-up user cannot insert into profiles; it is not callable via the API.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_profiles_updated_at() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
