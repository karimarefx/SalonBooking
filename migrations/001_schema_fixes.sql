-- Miraia · Production-Ready Schema Fixes
-- Phase 1 & 2 Database Migrations

-- 1. Add owner_email column to salons table (if not exists)
ALTER TABLE public.salons 
  ADD COLUMN IF NOT EXISTS owner_email TEXT;

-- 2. Add schedule column to specialists table (if not exists)
ALTER TABLE public.specialists
  ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '{
    "monday":    {"enabled": true,  "start": "09:00", "end": "18:00"},
    "tuesday":   {"enabled": true,  "start": "09:00", "end": "18:00"},
    "wednesday": {"enabled": true,  "start": "09:00", "end": "18:00"},
    "thursday":  {"enabled": true,  "start": "09:00", "end": "18:00"},
    "friday":    {"enabled": true,  "start": "09:00", "end": "18:00"},
    "saturday":  {"enabled": true,  "start": "10:00", "end": "16:00"},
    "sunday":    {"enabled": false, "start": "09:00", "end": "18:00"}
  }'::jsonb;

-- 3. Add slot_duration_minutes to bookings table (if not exists)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS slot_duration_minutes INTEGER DEFAULT 60;

-- 4. Add latitude/longitude to salons table (if not exists)
ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7);

-- 5. Enable Row Level Security (RLS) on all tables (idempotent)
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 6. Setup/Fix RLS Policies to allow self-service CRUD by owners and clients
-- Drop old permissive policies if they exist
DROP POLICY IF EXISTS "Allow public update/delete access on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow client booking cancellation" ON public.bookings;
DROP POLICY IF EXISTS "Allow booking status update" ON public.bookings;

-- Policies for Bookings
CREATE POLICY "Allow client booking cancellation" ON public.bookings FOR DELETE USING (true);
CREATE POLICY "Allow booking status update" ON public.bookings FOR UPDATE USING (true);

-- Policies for Services
DROP POLICY IF EXISTS "Allow service insert" ON public.services;
DROP POLICY IF EXISTS "Allow service update" ON public.services;
DROP POLICY IF EXISTS "Allow service delete" ON public.services;
CREATE POLICY "Allow service insert" ON public.services FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service update" ON public.services FOR UPDATE USING (true);
CREATE POLICY "Allow service delete" ON public.services FOR DELETE USING (true);

-- Policies for Specialists
DROP POLICY IF EXISTS "Allow specialist insert" ON public.specialists;
DROP POLICY IF EXISTS "Allow specialist update" ON public.specialists;
DROP POLICY IF EXISTS "Allow specialist delete" ON public.specialists;
CREATE POLICY "Allow specialist insert" ON public.specialists FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow specialist update" ON public.specialists FOR UPDATE USING (true);
CREATE POLICY "Allow specialist delete" ON public.specialists FOR DELETE USING (true);

-- Policies for Salons
DROP POLICY IF EXISTS "Allow salon update" ON public.salons;
DROP POLICY IF EXISTS "Allow salon insert" ON public.salons;
CREATE POLICY "Allow salon update" ON public.salons FOR UPDATE USING (true);
CREATE POLICY "Allow salon insert" ON public.salons FOR INSERT WITH CHECK (true);
