-- Run this in Supabase: SQL Editor → New query → paste → Run
-- Creates the shared calendar events table so everyone sees the same events.

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  date text not null check (date ~ '^\d{4}-\d{2}-\d{2}$'),
  title text not null,
  description text,
  type text not null check (type in ('lsm', 'boh', 'foh', 'visitor', 'holiday', 'birthday')),
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

alter table public.events enable row level security;

-- Any signed-in user can read all events (shared calendar)
create policy "Events are viewable by authenticated users"
  on public.events for select
  to authenticated
  using (true);

-- Any signed-in user can insert events
create policy "Authenticated users can insert events"
  on public.events for insert
  to authenticated
  with check (true);

-- Any signed-in user can update events (e.g. edit)
create policy "Authenticated users can update events"
  on public.events for update
  to authenticated
  using (true)
  with check (true);

-- Any signed-in user can delete events
create policy "Authenticated users can delete events"
  on public.events for delete
  to authenticated
  using (true);
