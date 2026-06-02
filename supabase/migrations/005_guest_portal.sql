-- Migration 005: Structured guest-facing content

create table if not exists guest_content_items (
  id uuid default gen_random_uuid() primary key,
  chapter_id uuid not null references chapters(id) on delete cascade,
  title text not null,
  summary text,
  body text,
  video_url text,
  visibility text not null default 'public'
    check (visibility in ('public', 'guest_only')),
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists guest_content_items_chapter_status_idx
  on guest_content_items (chapter_id, status, visibility, published_at desc);
