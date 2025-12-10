-- Create users table (extends auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz default now()
);

alter table public.users enable row level security;

create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_insert_own"
  on public.users for insert
  with check (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id);

-- Create events table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  date timestamptz not null,
  recurrence_rule jsonb,
  status text not null default 'open' check (status in ('open', 'closed')),
  slug text not null unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.events enable row level security;

-- Organizers can CRUD their own events
create policy "events_select_own"
  on public.events for select
  using (auth.uid() = user_id);

create policy "events_insert_own"
  on public.events for insert
  with check (auth.uid() = user_id);

create policy "events_update_own"
  on public.events for update
  using (auth.uid() = user_id);

create policy "events_delete_own"
  on public.events for delete
  using (auth.uid() = user_id);

-- Anyone can view events (for public signup page)
create policy "events_select_public"
  on public.events for select
  using (true);

-- Create slots table
create table if not exists public.slots (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  capacity integer not null,
  available integer not null,
  created_at timestamptz default now()
);

alter table public.slots enable row level security;

-- Organizers can manage slots for their events
create policy "slots_select_own_event"
  on public.slots for select
  using (
    exists (
      select 1 from public.events
      where events.id = slots.event_id
      and events.user_id = auth.uid()
    )
  );

create policy "slots_insert_own_event"
  on public.slots for insert
  with check (
    exists (
      select 1 from public.events
      where events.id = slots.event_id
      and events.user_id = auth.uid()
    )
  );

create policy "slots_update_own_event"
  on public.slots for update
  using (
    exists (
      select 1 from public.events
      where events.id = slots.event_id
      and events.user_id = auth.uid()
    )
  );

create policy "slots_delete_own_event"
  on public.slots for delete
  using (
    exists (
      select 1 from public.events
      where events.id = slots.event_id
      and events.user_id = auth.uid()
    )
  );

-- Anyone can view slots (for public signup page)
create policy "slots_select_public"
  on public.slots for select
  using (true);

-- Create signups table
create table if not exists public.signups (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  slot_id uuid not null references public.slots(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  manage_token text not null unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.signups enable row level security;

-- Organizers can view signups for their events
create policy "signups_select_own_event"
  on public.signups for select
  using (
    exists (
      select 1 from public.events
      where events.id = signups.event_id
      and events.user_id = auth.uid()
    )
  );

-- Anyone can create signups (public signup page)
create policy "signups_insert_public"
  on public.signups for insert
  with check (true);

-- Anyone with the manage token can view/update their signup
create policy "signups_select_by_token"
  on public.signups for select
  using (true);

create policy "signups_update_by_token"
  on public.signups for update
  using (true);

-- Create waitlist table
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  slot_id uuid not null references public.slots(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  position integer not null,
  manage_token text not null unique,
  created_at timestamptz default now()
);

alter table public.waitlist enable row level security;

-- Organizers can view waitlist for their events
create policy "waitlist_select_own_event"
  on public.waitlist for select
  using (
    exists (
      select 1 from public.events
      where events.id = waitlist.event_id
      and events.user_id = auth.uid()
    )
  );

-- Anyone can join waitlist (public signup page)
create policy "waitlist_insert_public"
  on public.waitlist for insert
  with check (true);

-- Anyone can view waitlist
create policy "waitlist_select_public"
  on public.waitlist for select
  using (true);

-- Create indexes for performance
create index if not exists idx_events_user_id on public.events(user_id);
create index if not exists idx_events_slug on public.events(slug);
create index if not exists idx_slots_event_id on public.slots(event_id);
create index if not exists idx_signups_event_id on public.signups(event_id);
create index if not exists idx_signups_slot_id on public.signups(slot_id);
create index if not exists idx_signups_manage_token on public.signups(manage_token);
create index if not exists idx_waitlist_event_id on public.waitlist(event_id);
create index if not exists idx_waitlist_slot_id on public.waitlist(slot_id);
create index if not exists idx_waitlist_manage_token on public.waitlist(manage_token);
