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
