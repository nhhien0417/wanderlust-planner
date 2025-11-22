-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Public profiles for users)
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
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- TRIP MEMBERS (Collaboration)
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
  created_at timestamp with time zone default now()
);

-- ROW LEVEL SECURITY (RLS)
alter table profiles enable row level security;
alter table trips enable row level security;
alter table trip_members enable row level security;
alter table trip_days enable row level security;
alter table activities enable row level security;

-- POLICIES

-- Profiles: Public read, Self update
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Trips: Viewable by members
create policy "Trips are viewable by members."
  on trips for select
  using (
    exists (
      select 1 from trip_members
      where trip_members.trip_id = trips.id
      and trip_members.user_id = auth.uid()
    )
  );

create policy "Users can create trips."
  on trips for insert
  with check ( auth.uid() = created_by );

create policy "Owners can update trips."
  on trips for update
  using (
    exists (
      select 1 from trip_members
      where trip_members.trip_id = trips.id
      and trip_members.user_id = auth.uid()
      and trip_members.role = 'owner'
    )
  );

create policy "Owners can delete trips."
  on trips for delete
  using (
    exists (
      select 1 from trip_members
      where trip_members.trip_id = trips.id
      and trip_members.user_id = auth.uid()
      and trip_members.role = 'owner'
    )
  );

-- Trip Members: Viewable by members
create policy "Trip members are viewable by members."
  on trip_members for select
  using (
    exists (
      select 1 from trip_members as members
      where members.trip_id = trip_members.trip_id
      and members.user_id = auth.uid()
    )
  );

-- Trip Days & Activities: Viewable by members
create policy "Days viewable by members."
  on trip_days for select
  using (
    exists (
      select 1 from trip_members
      where trip_members.trip_id = trip_days.trip_id
      and trip_members.user_id = auth.uid()
    )
  );

create policy "Activities viewable by members."
  on activities for select
  using (
    exists (
      select 1 from trip_members
      where trip_members.trip_id = activities.trip_id
      and trip_members.user_id = auth.uid()
    )
  );

-- TRIGGER: Create profile on signup
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
