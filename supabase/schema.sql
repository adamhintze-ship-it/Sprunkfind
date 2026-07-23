-- SprunkFind database schema
-- Run this in the Supabase SQL editor (Dashboard -> SQL -> New query),
-- or via the Supabase CLI. It creates the collections table and locks it
-- down with Row-Level Security so each user only sees their own rows.

create table if not exists public.collections (
  user_id      uuid not null references auth.users (id) on delete cascade,
  character_id text not null,
  status       text not null check (status in ('owned', 'wanted')),
  phase        text,
  updated_at   timestamptz not null default now(),
  primary key (user_id, character_id)
);

alter table public.collections enable row level security;

-- One policy covering select/insert/update/delete: rows must belong to the
-- authenticated user.
drop policy if exists "own rows" on public.collections;
create policy "own rows" on public.collections
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
