-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing tables if they exist (clean start)
drop table if exists public.bookings;
drop table if exists public.specialists;
drop table if exists public.services;
drop table if exists public.salons;

-- 1. Salons Table
create table public.salons (
    id text primary key,
    name text not null,
    location text not null,
    rating numeric(3,2) default 0.0,
    reviews integer default 0,
    about text,
    description text,
    image_url text,
    tags text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Services Table
create table public.services (
    id uuid default gen_random_uuid() primary key,
    salon_id text references public.salons(id) on delete cascade,
    name text not null,
    duration text not null,
    price numeric(10,2) not null,
    image text,
    category text default 'Treatments' not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Specialists Table
create table public.specialists (
    id uuid default gen_random_uuid() primary key,
    salon_id text references public.salons(id) on delete cascade,
    name text not null,
    title text not null,
    rating numeric(3,2) default 0.0,
    image text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Bookings Table
create table public.bookings (
    id uuid default gen_random_uuid() primary key,
    salon_id text references public.salons(id) on delete cascade,
    specialist_id uuid references public.specialists(id) on delete set null,
    selected_services jsonb not null, -- Store selected services as JSON array
    booking_date date not null,
    booking_time text not null,
    client_name text not null,
    client_email text not null,
    client_phone text not null,
    notes text,
    total_price numeric(10,2) not null,
    status text default 'Confirmed' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security) on tables
alter table public.salons enable row level security;
alter table public.services enable row level security;
alter table public.specialists enable row level security;
alter table public.bookings enable row level security;

-- Create policies for public access
create policy "Allow public read access on salons" on public.salons for select using (true);
create policy "Allow public read access on services" on public.services for select using (true);
create policy "Allow public read access on specialists" on public.specialists for select using (true);

create policy "Allow public read access on bookings" on public.bookings for select using (true);
create policy "Allow public insert access on bookings" on public.bookings for insert with check (true);
create policy "Allow public update/delete access on bookings" on public.bookings for all using (true);
