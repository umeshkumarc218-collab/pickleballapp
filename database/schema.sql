-- PickleBall Canada — Supabase Schema
-- Run this in the Supabase SQL editor

-- ─────────────────────────────────────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- Profiles (extends auth.users)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users on delete cascade,
  full_name    text,
  skill_level  text check (skill_level in ('Beginner','Intermediate','Advanced')),
  city         text,
  avatar_url   text,
  created_at   timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────────────────────
-- User Roles
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.user_roles (
  user_id  uuid primary key references auth.users on delete cascade,
  role     text not null check (role in ('admin', 'moderator'))
);

alter table public.user_roles enable row level security;

create policy "Admins can read all roles"
  on public.user_roles for select
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Sessions (populated by scraper)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.sessions (
  id             uuid primary key default uuid_generate_v4(),
  location_name  text not null,
  address        text,
  city           text not null,
  province       text,
  lat            float,
  lng            float,
  day_of_week    text,
  start_time     time,
  end_time       time,
  age_group      text,
  skill_level    text,
  phone          text,
  capacity       int default 20,
  is_active      boolean default true,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- Unique constraint for upsert
create unique index if not exists sessions_unique_slot
  on public.sessions (location_name, day_of_week, start_time)
  where is_active = true;

alter table public.sessions enable row level security;

create policy "Anyone can read active sessions"
  on public.sessions for select using (is_active = true);

-- Service role (backend) can write
create policy "Service role can manage sessions"
  on public.sessions for all
  using (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────────────────────
-- Bookings
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users on delete cascade,
  session_id        uuid not null references public.sessions on delete cascade,
  session_date      date not null,
  status            text not null default 'confirmed'
                      check (status in ('confirmed','cancelled','waitlisted')),
  waitlist_position int,
  created_at        timestamptz default now()
);

create index if not exists bookings_user_idx on public.bookings (user_id);
create index if not exists bookings_session_date_idx on public.bookings (session_id, session_date);

alter table public.bookings enable row level security;

create policy "Users can read their own bookings"
  on public.bookings for select using (auth.uid() = user_id);

create policy "Users can create bookings"
  on public.bookings for insert with check (auth.uid() = user_id);

create policy "Users can update their own bookings"
  on public.bookings for update using (auth.uid() = user_id);

-- Service role read for booking counts
create policy "Service role can read all bookings"
  on public.bookings for select using (auth.role() = 'service_role');

create policy "Service role can manage bookings"
  on public.bookings for all using (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────────────────────
-- Community Events
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.community_events (
  id               uuid primary key default uuid_generate_v4(),
  creator_id       uuid not null references auth.users on delete cascade,
  title            text not null,
  skill_level      text default 'All Levels',
  city             text not null,
  address          text,
  event_date       timestamptz,
  is_recurring     boolean default false,
  recurrence_rule  text,
  max_participants int,
  description      text,
  created_at       timestamptz default now()
);

alter table public.community_events enable row level security;

create policy "Anyone can read community events"
  on public.community_events for select using (true);

create policy "Authenticated users can create events"
  on public.community_events for insert
  with check (auth.uid() = creator_id);

create policy "Creators can update their events"
  on public.community_events for update using (auth.uid() = creator_id);

create policy "Creators can delete their events"
  on public.community_events for delete using (auth.uid() = creator_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Event Participants
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.event_participants (
  event_id   uuid not null references public.community_events on delete cascade,
  user_id    uuid not null references auth.users on delete cascade,
  joined_at  timestamptz default now(),
  primary key (event_id, user_id)
);

alter table public.event_participants enable row level security;

create policy "Anyone can read participants"
  on public.event_participants for select using (true);

create policy "Users can join events"
  on public.event_participants for insert
  with check (auth.uid() = user_id);

create policy "Users can leave events"
  on public.event_participants for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Session Reviews
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.session_reviews (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users on delete cascade,
  session_id  uuid not null references public.sessions on delete cascade,
  rating      int not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz default now(),
  unique (user_id, session_id)
);

alter table public.session_reviews enable row level security;

create policy "Anyone can read reviews"
  on public.session_reviews for select using (true);

create policy "Users can submit reviews"
  on public.session_reviews for insert
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Scrape Logs
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.scrape_logs (
  id                 uuid primary key default uuid_generate_v4(),
  city               text not null,
  status             text not null check (status in ('success','error')),
  sessions_found     int,
  sessions_upserted  int,
  error_message      text,
  scraped_at         timestamptz default now()
);

alter table public.scrape_logs enable row level security;

create policy "Service role can manage scrape_logs"
  on public.scrape_logs for all using (auth.role() = 'service_role');

create policy "Admins can read scrape_logs"
  on public.scrape_logs for select
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper: auto-update updated_at on sessions
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sessions_updated_at
  before update on public.sessions
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: promote a user to admin (run manually)
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('<your-user-uuid>', 'admin');
-- ─────────────────────────────────────────────────────────────────────────────
