-- Ethereal Editorial — Supabase schema
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- Safe to re-run: every object is created with "if not exists" / "or replace".

create extension if not exists pgcrypto;

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  email         text not null,
  name          text not null default '',
  role          text not null default 'author' check (role in ('author', 'reader', 'admin')),
  reader_status text check (reader_status in ('pending', 'approved', 'declined')),
  country       text,
  pace          text,
  experience    text,
  genres        text[] not null default '{}',
  skills        text[] not null default '{}',
  why           text,
  link          text,
  about         text,
  created_at    timestamptz not null default now()
);

create table if not exists public.manuscripts (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null default auth.uid() references public.profiles on delete cascade,
  title         text not null check (length(title) between 1 and 200),
  pen_name      text not null check (length(pen_name) between 1 and 120),
  genre         text,
  audience      text,
  stage         text,
  blurb         text,
  content_notes text,
  wants         text,
  word_count    int  not null default 0,
  chapter_count int  not null default 0,  -- kept in sync by a trigger; readers can't count locked chapters
  listed        boolean not null default true,
  spots         int  not null default 12 check (spots between 1 and 100),
  read_weeks    int  not null default 4 check (read_weeks between 1 and 26),
  file_path     text,
  created_at    timestamptz not null default now()
);

-- Invite codes live apart from manuscripts so only the author can read them.
create table if not exists public.manuscript_invites (
  manuscript_id uuid primary key references public.manuscripts on delete cascade,
  code          text not null default encode(gen_random_bytes(8), 'hex')
);

create table if not exists public.chapters (
  id            uuid primary key default gen_random_uuid(),
  manuscript_id uuid not null references public.manuscripts on delete cascade,
  idx           int  not null check (idx >= 1),
  title         text not null,
  body          text not null default '',
  word_count    int  not null default 0,
  unique (manuscript_id, idx)
);

create table if not exists public.questions (
  id            uuid primary key default gen_random_uuid(),
  manuscript_id uuid not null references public.manuscripts on delete cascade,
  idx           int  not null default 0,
  body          text not null check (length(body) between 1 and 500),
  frequency     text not null default 'chapter' check (frequency in ('chapter', 'end')),
  is_rating     boolean not null default false
);

create table if not exists public.access (
  id            uuid primary key default gen_random_uuid(),
  manuscript_id uuid not null references public.manuscripts on delete cascade,
  reader_id     uuid not null default auth.uid() references public.profiles on delete cascade,
  status        text not null default 'requested' check (status in ('requested', 'accepted', 'declined', 'removed')),
  note          text check (length(note) <= 2000),
  unlocked      int  not null default 1,
  finished      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (manuscript_id, reader_id)
);

create table if not exists public.comments (
  id            uuid primary key default gen_random_uuid(),
  manuscript_id uuid not null references public.manuscripts on delete cascade,
  chapter_idx   int  not null,
  para_idx      int  not null,
  quote         text,
  reaction      text check (reaction in ('Loved this', 'Confused', 'Slow here', 'Typo')),
  body          text check (length(body) <= 4000),
  reader_id     uuid not null default auth.uid() references public.profiles on delete cascade,
  created_at    timestamptz not null default now(),
  check (reaction is not null or length(coalesce(body, '')) > 0)
);

create table if not exists public.answers (
  id            uuid primary key default gen_random_uuid(),
  manuscript_id uuid not null references public.manuscripts on delete cascade,
  question_id   uuid not null references public.questions on delete cascade,
  chapter_idx   int  not null default 0,
  reader_id     uuid not null default auth.uid() references public.profiles on delete cascade,
  score         int  check (score between 1 and 5),
  body          text check (length(body) <= 4000),
  created_at    timestamptz not null default now(),
  unique (question_id, chapter_idx, reader_id)
);

create table if not exists public.sample_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid default auth.uid() references public.profiles on delete set null,
  name        text not null check (length(name) between 1 and 200),
  email       text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  book_title  text not null check (length(book_title) between 1 and 200),
  genre       text,
  word_count  int,
  edit_type   text,
  notes       text check (length(notes) <= 5000),
  file_path   text,
  status      text not null default 'new' check (status in ('new', 'sent')),
  created_at  timestamptz not null default now()
);

create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references public.profiles on delete cascade,
  reference   text not null default ('EE-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6))),
  book_title  text not null,
  package     text not null check (package in ('line', 'copy', 'proof')),
  word_count  int  not null check (word_count between 1000 and 2000000),
  plan        text not null default 'deposit' check (plan in ('deposit', 'full')),
  method      text,
  turnaround  text,
  rate        numeric(10,2),
  total       numeric(12,2),
  due_now     numeric(12,2),
  payer_name  text,
  sent_on     date,
  status      text not null default 'awaiting_payment' check (status in ('awaiting_payment', 'payment_sent', 'confirmed', 'delivered', 'cancelled')),
  created_at  timestamptz not null default now()
);

create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  thread_id   uuid not null references public.profiles on delete cascade,  -- the customer's profile id
  sender_id   uuid not null default auth.uid() references public.profiles on delete cascade,
  body        text not null check (length(body) between 1 and 5000),
  created_at  timestamptz not null default now()
);

alter table public.manuscripts add column if not exists chapter_count int not null default 0;

create index if not exists access_reader_idx   on public.access (reader_id);
create index if not exists access_ms_idx       on public.access (manuscript_id);
create index if not exists comments_ms_idx     on public.comments (manuscript_id, chapter_idx);
create index if not exists answers_ms_idx      on public.answers (manuscript_id);
create index if not exists messages_thread_idx on public.messages (thread_id, created_at);
create index if not exists orders_user_idx     on public.orders (user_id);

-- ============================================================
-- Helper functions (security definer so policies don't recurse)
-- ============================================================

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_author() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('author', 'admin'));
$$;

create or replace function public.is_approved_reader() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'reader' and reader_status = 'approved');
$$;

create or replace function public.is_author_of(m uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from manuscripts where id = m and author_id = auth.uid());
$$;

create or replace function public.is_listed(m uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from manuscripts where id = m and listed);
$$;

-- Highest chapter the current reader may open; 0 when not accepted.
create or replace function public.reader_unlocked(m uuid) returns int
language sql stable security definer set search_path = public as $$
  select coalesce((select unlocked from access
                   where manuscript_id = m and reader_id = auth.uid() and status = 'accepted'), 0);
$$;

create or replace function public.can_see_profile(p uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select p = auth.uid()
      or public.is_admin()
      or exists (select 1 from access a join manuscripts m on m.id = a.manuscript_id
                 where a.reader_id = p and m.author_id = auth.uid());
$$;

-- ============================================================
-- Triggers
-- ============================================================

-- New auth user → profile. Role comes from sign-up metadata, but never "admin".
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  r text  := m->>'role';
  g text[] := '{}';
begin
  if r is distinct from 'reader' then r := 'author'; end if;
  if jsonb_typeof(m->'genres') = 'array' then
    g := array(select jsonb_array_elements_text(m->'genres'));
  end if;
  insert into profiles (id, email, name, role, reader_status, country, pace, experience, genres, why, link)
  values (new.id, new.email,
          coalesce(nullif(m->>'name', ''), nullif(m->>'full_name', ''), split_part(new.email, '@', 1)),
          r, case when r = 'reader' then 'pending' end,
          m->>'country', m->>'pace', m->>'experience', g, m->>'why', m->>'link')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Users can edit their profile but not their own role or approval status.
-- (auth.uid() is null in the SQL editor, so the owner can still promote an admin there.)
create or replace function public.protect_profile() returns trigger
language plpgsql set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
    new.reader_status := old.reader_status;
    new.email := old.email;
  end if;
  return new;
end $$;

drop trigger if exists protect_profile on public.profiles;
create trigger protect_profile before update on public.profiles
  for each row execute function public.protect_profile();

-- Every manuscript gets an invite code.
create or replace function public.create_invite() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into manuscript_invites (manuscript_id) values (new.id) on conflict do nothing;
  return new;
end $$;

drop trigger if exists create_invite on public.manuscripts;
create trigger create_invite after insert on public.manuscripts
  for each row execute function public.create_invite();

-- Prices are set by the database, never trusted from the browser.
create or replace function public.price_order() returns trigger
language plpgsql set search_path = public as $$
begin
  new.rate := case new.package when 'line' then 70 when 'copy' then 50 when 'proof' then 30 end;
  new.total := round(new.word_count / 1000.0 * new.rate, 2);
  new.due_now := case when new.plan = 'full' then new.total else round(new.total / 2, 2) end;
  if auth.uid() is not null and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.status := 'awaiting_payment';
    elsif new.status not in ('awaiting_payment', 'payment_sent') or old.status not in ('awaiting_payment', 'payment_sent') then
      new.status := old.status;
    end if;
    if tg_op = 'UPDATE' then
      new.user_id := old.user_id;
      new.reference := old.reference;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists price_order on public.orders;
create trigger price_order before insert or update on public.orders
  for each row execute function public.price_order();

create or replace function public.sync_chapter_count() returns trigger
language plpgsql security definer set search_path = public as $$
declare m uuid := coalesce(new.manuscript_id, old.manuscript_id);
begin
  update manuscripts set chapter_count = (select count(*) from chapters where manuscript_id = m) where id = m;
  return null;
end $$;

drop trigger if exists sync_chapter_count on public.chapters;
create trigger sync_chapter_count after insert or delete on public.chapters
  for each row execute function public.sync_chapter_count();

create or replace function public.touch_access() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists touch_access on public.access;
create trigger touch_access before update on public.access
  for each row execute function public.touch_access();

-- ============================================================
-- RPCs
-- ============================================================

-- Reader submits a chapter: unlock the next one (only from the current chapter).
create or replace function public.advance_chapter(m uuid, ch int) returns int
language plpgsql security definer set search_path = public as $$
declare
  a access%rowtype;
  total int;
begin
  select * into a from access where manuscript_id = m and reader_id = auth.uid() and status = 'accepted';
  if not found then raise exception 'No access to this manuscript'; end if;
  select count(*) into total from chapters where manuscript_id = m;
  if ch = a.unlocked then
    if ch >= total then
      update access set finished = true where id = a.id;
      return a.unlocked;
    end if;
    update access set unlocked = ch + 1 where id = a.id;
    return ch + 1;
  end if;
  return a.unlocked;
end $$;

-- Approved reader opens an author's private invite link → accepted straight away.
create or replace function public.join_with_invite(m uuid, code text) returns text
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_approved_reader() then return 'not_approved'; end if;
  if not exists (select 1 from manuscript_invites i where i.manuscript_id = m and i.code = join_with_invite.code) then
    return 'bad_code';
  end if;
  insert into access (manuscript_id, reader_id, status)
  values (m, auth.uid(), 'accepted')
  on conflict (manuscript_id, reader_id) do update set status = 'accepted'
    where access.status <> 'removed';
  return 'ok';
end $$;

-- Public list for Discover, with how many spots are already taken.
create or replace function public.discover_books()
returns table (id uuid, title text, pen_name text, genre text, audience text, stage text, blurb text,
               word_count int, spots int, read_weeks int, taken int, chapters int, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select m.id, m.title, m.pen_name, m.genre, m.audience, m.stage, m.blurb, m.word_count, m.spots, m.read_weeks,
         (select count(*)::int from access a where a.manuscript_id = m.id and a.status = 'accepted'),
         m.chapter_count,
         m.created_at
  from manuscripts m
  where m.listed
  order by m.created_at desc;
$$;

grant execute on function public.discover_books() to anon, authenticated;
grant execute on function public.advance_chapter(uuid, int) to authenticated;
grant execute on function public.join_with_invite(uuid, text) to authenticated;

-- ============================================================
-- Row level security
-- ============================================================

alter table public.profiles           enable row level security;
alter table public.manuscripts        enable row level security;
alter table public.manuscript_invites enable row level security;
alter table public.chapters           enable row level security;
alter table public.questions          enable row level security;
alter table public.access             enable row level security;
alter table public.comments           enable row level security;
alter table public.answers            enable row level security;
alter table public.sample_requests    enable row level security;
alter table public.orders             enable row level security;
alter table public.messages           enable row level security;

-- profiles
drop policy if exists "profiles read"   on public.profiles;
drop policy if exists "profiles update" on public.profiles;
create policy "profiles read"   on public.profiles for select using (public.can_see_profile(id));
create policy "profiles update" on public.profiles for update using (id = auth.uid() or public.is_admin());

-- manuscripts
drop policy if exists "ms read"   on public.manuscripts;
drop policy if exists "ms insert" on public.manuscripts;
drop policy if exists "ms update" on public.manuscripts;
drop policy if exists "ms delete" on public.manuscripts;
create policy "ms read" on public.manuscripts for select using (
  listed or author_id = auth.uid() or public.is_admin()
  or exists (select 1 from access a where a.manuscript_id = manuscripts.id and a.reader_id = auth.uid())
);
create policy "ms insert" on public.manuscripts for insert with check (author_id = auth.uid() and public.is_author());
create policy "ms update" on public.manuscripts for update using (author_id = auth.uid());
create policy "ms delete" on public.manuscripts for delete using (author_id = auth.uid());

-- invites
drop policy if exists "invite read" on public.manuscript_invites;
create policy "invite read" on public.manuscript_invites for select using (public.is_author_of(manuscript_id));

-- chapters: author, admin, the free first chapter of listed books, and unlocked chapters for accepted readers
drop policy if exists "ch read"  on public.chapters;
drop policy if exists "ch write" on public.chapters;
create policy "ch read" on public.chapters for select using (
  public.is_author_of(manuscript_id) or public.is_admin()
  or (idx = 1 and public.is_listed(manuscript_id))
  or idx <= public.reader_unlocked(manuscript_id)
);
create policy "ch write" on public.chapters for all
  using (public.is_author_of(manuscript_id)) with check (public.is_author_of(manuscript_id));

-- questions
drop policy if exists "q read"  on public.questions;
drop policy if exists "q write" on public.questions;
create policy "q read" on public.questions for select using (
  public.is_author_of(manuscript_id) or public.is_listed(manuscript_id) or public.reader_unlocked(manuscript_id) > 0 or public.is_admin()
);
create policy "q write" on public.questions for all
  using (public.is_author_of(manuscript_id)) with check (public.is_author_of(manuscript_id));

-- access
drop policy if exists "acc read"          on public.access;
drop policy if exists "acc request"       on public.access;
drop policy if exists "acc author update" on public.access;
drop policy if exists "acc withdraw"      on public.access;
create policy "acc read" on public.access for select using (
  reader_id = auth.uid() or public.is_author_of(manuscript_id) or public.is_admin()
);
create policy "acc request" on public.access for insert with check (
  reader_id = auth.uid() and status = 'requested' and unlocked = 1 and not finished
  and public.is_approved_reader() and public.is_listed(manuscript_id)
);
create policy "acc author update" on public.access for update using (public.is_author_of(manuscript_id));
create policy "acc withdraw" on public.access for delete using (reader_id = auth.uid() and status = 'requested');

-- comments
drop policy if exists "c read"   on public.comments;
drop policy if exists "c insert" on public.comments;
drop policy if exists "c delete" on public.comments;
create policy "c read" on public.comments for select using (
  reader_id = auth.uid() or public.is_author_of(manuscript_id) or public.is_admin()
);
create policy "c insert" on public.comments for insert with check (
  reader_id = auth.uid() and chapter_idx between 1 and public.reader_unlocked(manuscript_id)
);
create policy "c delete" on public.comments for delete using (reader_id = auth.uid());

-- answers
drop policy if exists "a read"   on public.answers;
drop policy if exists "a insert" on public.answers;
drop policy if exists "a update" on public.answers;
create policy "a read" on public.answers for select using (
  reader_id = auth.uid() or public.is_author_of(manuscript_id) or public.is_admin()
);
create policy "a insert" on public.answers for insert with check (
  reader_id = auth.uid() and public.reader_unlocked(manuscript_id) > 0
);
create policy "a update" on public.answers for update using (reader_id = auth.uid());

-- sample requests: anyone can send one, only the owner and admin read them
drop policy if exists "s insert" on public.sample_requests;
drop policy if exists "s read"   on public.sample_requests;
drop policy if exists "s update" on public.sample_requests;
create policy "s insert" on public.sample_requests for insert to anon, authenticated with check (
  status = 'new' and (user_id is null or user_id = auth.uid())
);
create policy "s read"   on public.sample_requests for select using (public.is_admin() or (user_id is not null and user_id = auth.uid()));
create policy "s update" on public.sample_requests for update using (public.is_admin());

-- orders
drop policy if exists "o read"   on public.orders;
drop policy if exists "o insert" on public.orders;
drop policy if exists "o update" on public.orders;
create policy "o read"   on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "o insert" on public.orders for insert with check (user_id = auth.uid());
create policy "o update" on public.orders for update using (user_id = auth.uid() or public.is_admin());

-- messages: each customer has one private thread with Ethereal Editorial
drop policy if exists "m read"   on public.messages;
drop policy if exists "m insert" on public.messages;
create policy "m read"   on public.messages for select using (thread_id = auth.uid() or public.is_admin());
create policy "m insert" on public.messages for insert with check (
  sender_id = auth.uid() and (thread_id = auth.uid() or public.is_admin())
);

-- Live chat updates
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; when undefined_object then null;
end $$;

-- ============================================================
-- File storage
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit)
values ('samples', 'samples', false, 10485760),          -- 10 MB
       ('manuscripts', 'manuscripts', false, 52428800)   -- 50 MB
on conflict (id) do nothing;

drop policy if exists "samples upload"     on storage.objects;
drop policy if exists "samples admin read" on storage.objects;
drop policy if exists "ms upload"          on storage.objects;
drop policy if exists "ms read"            on storage.objects;
drop policy if exists "ms delete"          on storage.objects;

create policy "samples upload" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'samples');
create policy "samples admin read" on storage.objects for select to authenticated
  using (bucket_id = 'samples' and public.is_admin());
create policy "ms upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'manuscripts' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "ms read" on storage.objects for select to authenticated
  using (bucket_id = 'manuscripts' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy "ms delete" on storage.objects for delete to authenticated
  using (bucket_id = 'manuscripts' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- Make the owner an admin (run AFTER signing up on the site with this email)
-- ============================================================
-- update public.profiles set role = 'admin', reader_status = null where email = 'etherealeditorial2@gmail.com';
