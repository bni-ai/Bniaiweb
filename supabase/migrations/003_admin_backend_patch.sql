-- Migration 003: Admin backend operational fields and uniqueness constraints

alter table weekly_briefs
  add column if not exists approved_at timestamptz;

create unique index if not exists keynote_talks_speaker_week_idx
  on keynote_talks (speaker_id, week_date);
