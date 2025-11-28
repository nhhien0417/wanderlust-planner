-- MASTER REBUILD SCRIPT
-- WARNING: THIS WILL DELETE ALL DATA AND TABLES AND RECREATE THEM FROM SCRATCH.

-- 1. DROP EVERYTHING (Clean Slate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_trip_member(UUID) CASCADE;

DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.trip_days CASCADE;
DROP TABLE IF EXISTS public.trip_members CASCADE;
DROP TABLE IF EXISTS public.trips CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. RE-CREATE TABLES

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- TRIPS
create table trips (
  id uuid default uuid_generate_v4() primary key,
  created_by uuid references profiles(id) not null,
  title text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  cover_image text,
  budget numeric default 0,
  tasks jsonb[] default array[]::jsonb[],
  expenses jsonb[] default array[]::jsonb[],
  packing_list jsonb[] default array[]::jsonb[],
  weather jsonb[] default array[]::jsonb[],
  photos jsonb[] default array[]::jsonb[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- TRIP MEMBERS
create table trip_members (
  trip_id uuid references trips(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text check (role in ('owner', 'editor', 'viewer')) not null,
  primary key (trip_id, user_id)
);

-- TRIP DAYS
create table trip_days (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references trips(id) on delete cascade not null,
  date date not null,
  created_at timestamp with time zone default now()
);

-- ACTIVITIES
create table activities (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references trips(id) on delete cascade not null,
  day_id uuid references trip_days(id) on delete cascade not null,
  title text not null,
  description text,
  category text not null,
  location_name text,
  location_lat double precision,
  location_lng double precision,
  start_time time,
  end_time time,
  cost numeric,
  order_index integer default 0,
  created_at timestamp with time zone default now()
);

-- 3. ENABLE RLS
alter table profiles enable row level security;
alter table trips enable row level security;
alter table trip_members enable row level security;
alter table trip_days enable row level security;
alter table activities enable row level security;

-- 4. HELPER FUNCTIONS (For RLS)
CREATE OR REPLACE FUNCTION public.is_trip_member(_trip_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.trip_members
    WHERE trip_id = _trip_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS POLICIES

-- PROFILES
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- TRIPS
-- Allow creators to view their own trips (CRITICAL FIX)
create policy "Creators can view their own trips." on trips for select using ( auth.uid() = created_by );
-- Allow members to view trips
create policy "Members can view trips." on trips for select using ( public.is_trip_member(id) );
-- Allow users to create trips
create policy "Users can create trips." on trips for insert with check ( auth.uid() = created_by );
-- Allow owners to update trips
create policy "Owners can update trips." on trips for update using (
  exists (select 1 from trip_members where trip_id = trips.id and user_id = auth.uid() and role = 'owner')
);
-- Allow owners to delete trips
create policy "Owners can delete trips." on trips for delete using (
  exists (select 1 from trip_members where trip_id = trips.id and user_id = auth.uid() and role = 'owner')
);

-- TRIP MEMBERS
-- Viewable by members
create policy "Trip members are viewable by members." on trip_members for select using ( public.is_trip_member(trip_id) );
-- Creators and Owners can add members
create policy "Trip creators and owners can add members." on trip_members for insert with check (
  auth.uid() IN (SELECT created_by FROM public.trips WHERE id = trip_id) OR
  EXISTS (SELECT 1 FROM public.trip_members m WHERE m.trip_id = trip_members.trip_id AND m.user_id = auth.uid() AND m.role = 'owner')
);
-- Owners can update members
create policy "Owners can update members." on trip_members for update using (
  EXISTS (SELECT 1 FROM public.trip_members m WHERE m.trip_id = trip_members.trip_id AND m.user_id = auth.uid() AND m.role = 'owner')
);
-- Owners can remove members or members can leave
create policy "Owners can remove members or members can leave." on trip_members for delete using (
  EXISTS (SELECT 1 FROM public.trip_members m WHERE m.trip_id = trip_members.trip_id AND m.user_id = auth.uid() AND m.role = 'owner') OR
  auth.uid() = user_id
);

-- TRIP DAYS
-- Viewable by members
create policy "Days viewable by members." on trip_days for select using (
  auth.uid() IN (SELECT created_by FROM public.trips WHERE id = trip_id) OR
  public.is_trip_member(trip_id)
);
-- Members can insert/update/delete
create policy "Members can modify days." on trip_days for all using (
  auth.uid() IN (SELECT created_by FROM public.trips WHERE id = trip_id) OR
  EXISTS (SELECT 1 FROM public.trip_members m WHERE m.trip_id = trip_days.trip_id AND m.user_id = auth.uid() AND m.role IN ('owner', 'editor'))
);

-- ACTIVITIES
-- Viewable by members
create policy "Activities viewable by members." on activities for select using (
  auth.uid() IN (SELECT created_by FROM public.trips WHERE id = trip_id) OR
  public.is_trip_member(trip_id)
);
-- Members can insert/update/delete
create policy "Members can modify activities." on activities for all using (
  auth.uid() IN (SELECT created_by FROM public.trips WHERE id = trip_id) OR
  EXISTS (SELECT 1 FROM public.trip_members m WHERE m.trip_id = activities.trip_id AND m.user_id = auth.uid() AND m.role IN ('owner', 'editor'))
);

-- 6. TRIGGERS
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. RESTORE PROFILES (If any exist in Auth)
INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'full_name', 
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
