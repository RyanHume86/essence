-- Personal Task Layer v1 — Postgres schema, indexes, triggers and RLS.
--
-- Streams (fixed):  clinical, locum, uct, dev, content, health, life
-- Contexts (fixed): at_hospital, at_desk, errand, low_energy
--
-- Streams and contexts are modelled as check constraints rather than tables
-- because they are a fixed, stable set. Projects are a small table because the
-- dev and UCT sub-groupings genuinely change over time.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  stream text not null check (stream in ('clinical','locum','uct','dev','content','health','life')),
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  stream text check (stream in ('clinical','locum','uct','dev','content','health','life')),
  context text check (context in ('at_hospital','at_desk','errand','low_energy')),
  project_id uuid references projects (id) on delete set null,
  due_date date,
  status text not null default 'inbox' check (status in ('inbox','active','done','dropped')),
  recurrence text check (recurrence in ('daily','weekdays','weekly')),
  sort_order double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Indexes — one per common access path (status / context / stream / due_date)
-- ---------------------------------------------------------------------------

create index if not exists tasks_user_status_idx  on tasks (user_id, status);
create index if not exists tasks_user_context_idx on tasks (user_id, context);
create index if not exists tasks_user_stream_idx  on tasks (user_id, stream);
create index if not exists tasks_user_due_idx     on tasks (user_id, due_date);

-- ---------------------------------------------------------------------------
-- Keep updated_at honest
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_updated_at on tasks;
create trigger tasks_updated_at
  before update on tasks
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — single user per row, owned by auth.uid()
-- ---------------------------------------------------------------------------

alter table tasks    enable row level security;
alter table projects enable row level security;

drop policy if exists tasks_owner on tasks;
create policy tasks_owner on tasks
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists projects_owner on projects;
create policy projects_owner on projects
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
