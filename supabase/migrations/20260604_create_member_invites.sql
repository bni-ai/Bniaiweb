create table if not exists public.member_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

create unique index if not exists member_invites_token_idx on public.member_invites (token);
