alter table public.weekly_briefs
  add column if not exists submitted_late boolean not null default false;

create table if not exists public.chapter_settings (
  chapter_id uuid primary key references public.chapters(id) on delete cascade,
  meeting_time text,
  submission_deadline_day int not null default 4 check (submission_deadline_day between 0 and 6),
  submission_deadline_time text not null default '23:59',
  reminder_day int not null default 3 check (reminder_day between 0 and 6),
  reminder_time text not null default '18:00',
  bni_connect_username_encrypted text,
  bni_connect_password_encrypted text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.reminder_logs (
  id uuid default gen_random_uuid() primary key,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  week_date date not null,
  message text not null,
  trigger_type text not null default 'manual' check (trigger_type in ('manual', 'scheduled')),
  sent_at timestamptz not null default now(),
  created_at timestamptz default now()
);

create table if not exists public.sync_logs (
  id uuid default gen_random_uuid() primary key,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  week_date date not null,
  brief_id uuid references public.weekly_briefs(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'success', 'failed')),
  trigger_type text not null default 'submission' check (trigger_type in ('submission', 'manual')),
  triggered_by uuid references public.members(id) on delete set null,
  payload jsonb default '{}'::jsonb,
  error_message text,
  synced_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists reminder_logs_week_member_idx
  on public.reminder_logs (chapter_id, week_date, member_id, sent_at desc);

create index if not exists sync_logs_week_status_idx
  on public.sync_logs (chapter_id, week_date, status, created_at desc);

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists chapter_settings_updated_at on public.chapter_settings;
create trigger chapter_settings_updated_at
  before update on public.chapter_settings
  for each row execute function public.update_updated_at();
