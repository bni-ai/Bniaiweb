-- Migration 004: Chapter week locks for member weekly brief read-only state

create table if not exists chapter_week_locks (
  id uuid default gen_random_uuid() primary key,
  chapter_id uuid not null references chapters(id) on delete cascade,
  week_date date not null,
  locked_at timestamptz not null default now(),
  locked_by uuid references members(id),
  reason text,
  created_at timestamptz default now(),
  unique (chapter_id, week_date)
);
