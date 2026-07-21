create extension if not exists "pgcrypto";

create table questions (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  difficulty int not null check (difficulty between 1 and 3),
  text text not null,
  options jsonb not null,
  correct_index int not null check (correct_index between 0 and 3),
  explanation text not null,
  igor_comment text not null
);

create table duels (
  id uuid primary key default gen_random_uuid(),
  question_ids jsonb not null,
  created_by bigint not null,
  created_at timestamptz not null default now()
);

create table runs (
  id uuid primary key default gen_random_uuid(),
  duel_id uuid not null references duels(id) on delete cascade,
  tg_user_id bigint not null,
  display_name text not null,
  photo_url text,
  score int not null check (score between 0 and 10),
  total_time_ms int not null,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create index runs_duel_id_idx on runs(duel_id);
create index runs_leaderboard_idx on runs(score desc, total_time_ms asc);

alter table questions enable row level security;
alter table duels enable row level security;
alter table runs enable row level security;

create policy "read questions" on questions for select to anon using (true);
create policy "read duels"     on duels     for select to anon using (true);
create policy "read runs"      on runs      for select to anon using (true);
create policy "create duels"   on duels     for insert to anon with check (true);
create policy "create runs"    on runs      for insert to anon with check (true);

-- Намеренно нет политик update / delete: записи неизменяемы после вставки.

-- Разовая загрузка вопросов через seed-скрипт (content/seed.mjs) под anon-ключом:
-- временно открыть insert, после загрузки — удалить политику.
--   create policy "seed questions" on questions for insert to anon with check (true);
--   drop policy   "seed questions" on questions;
