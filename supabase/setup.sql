create extension if not exists pgcrypto with schema extensions;

-- Обновляет поле updated_at перед изменением записи.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text default 'light',
  default_view text default 'dashboard',
  week_starts_on text default 'monday',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint user_settings_theme_check check (theme in ('light', 'dark')),
  constraint user_settings_default_view_check check (default_view in ('dashboard', 'projects', 'calendar', 'analytics')),
  constraint user_settings_week_starts_on_check check (week_starts_on in ('monday', 'sunday'))
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name varchar(120) not null,
  description text,
  color varchar(30),
  status varchar(30) default 'active',
  priority varchar(20) default 'medium',
  start_date date,
  due_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint projects_status_check check (status in ('active', 'completed', 'archived')),
  constraint projects_priority_check check (priority in ('low', 'medium', 'high'))
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title varchar(200) not null,
  description text,
  status varchar(30) default 'todo',
  priority varchar(20) default 'medium',
  due_date date,
  due_at timestamptz,
  position integer default 0,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint tasks_status_check check (status in ('backlog', 'todo', 'in_progress', 'done')),
  constraint tasks_priority_check check (priority in ('low', 'medium', 'high', 'urgent'))
);

alter table public.tasks
add column if not exists due_at timestamptz;

create index if not exists profiles_id_idx on public.profiles(id);
create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_status_idx on public.projects(status);
create index if not exists projects_priority_idx on public.projects(priority);
create index if not exists projects_due_date_idx on public.projects(due_date);
create index if not exists tasks_project_id_idx on public.tasks(project_id);
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_priority_idx on public.tasks(priority);
create index if not exists tasks_due_date_idx on public.tasks(due_date);
create index if not exists tasks_due_at_idx on public.tasks(due_at);
create index if not exists tasks_position_idx on public.tasks(position);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_user_settings_updated_at on public.user_settings;
create trigger set_user_settings_updated_at
before update on public.user_settings
for each row
execute function public.set_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

-- Создает профиль и настройки для нового пользователя Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();



-- Политики Row Level Security для your MaP.
-- Каждый авторизованный пользователь работает только со своими данными.

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "Users can select their own profile" on public.profiles;
create policy "Users can select their own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Users can select their own settings" on public.user_settings;
create policy "Users can select their own settings"
on public.user_settings
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert their own settings" on public.user_settings;
create policy "Users can insert their own settings"
on public.user_settings
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update their own settings" on public.user_settings;
create policy "Users can update their own settings"
on public.user_settings
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can select their own projects" on public.projects;
create policy "Users can select their own projects"
on public.projects
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert their own projects" on public.projects;
create policy "Users can insert their own projects"
on public.projects
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update their own projects" on public.projects;
create policy "Users can update their own projects"
on public.projects
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete their own projects" on public.projects;
create policy "Users can delete their own projects"
on public.projects
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can select their own tasks" on public.tasks;
create policy "Users can select their own tasks"
on public.tasks
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert their own tasks" on public.tasks;
create policy "Users can insert their own tasks"
on public.tasks
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update their own tasks" on public.tasks;
create policy "Users can update their own tasks"
on public.tasks
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete their own tasks" on public.tasks;
create policy "Users can delete their own tasks"
on public.tasks
for delete
to authenticated
using (user_id = auth.uid());
