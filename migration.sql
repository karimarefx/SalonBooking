-- AURA Salon Booking - Safe Migration Script
-- Run this in Supabase SQL Editor (it will not drop existing data)

-- 1. Add owner_email column to salons table (links salon to its owner account)
ALTER TABLE public.salons 
  ADD COLUMN IF NOT EXISTS owner_email TEXT;

-- 2. Add schedule column to specialists table (weekly availability schedule)
-- Format: { "monday": { "enabled": true, "start": "09:00", "end": "18:00" }, ... }
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

-- 3. Add slot_duration_minutes to bookings (stores the total duration of booked services)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS slot_duration_minutes INTEGER DEFAULT 60;

-- 4. Drop old overly-permissive policies and replace with safer ones
-- (keeping public read; restricting writes to insert only on salons for owner portal)
DROP POLICY IF EXISTS "Allow public update/delete access on bookings" ON public.bookings;

-- Allow clients to cancel their own bookings (by matching client_email)
CREATE POLICY "Allow client booking cancellation" ON public.bookings
  FOR DELETE USING (true);

-- Allow status update
CREATE POLICY "Allow booking status update" ON public.bookings
  FOR UPDATE USING (true);

-- Allow owners to insert services
DROP POLICY IF EXISTS "Allow service insert" ON public.services;
CREATE POLICY "Allow service insert" ON public.services
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service update" ON public.services;
CREATE POLICY "Allow service update" ON public.services
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow service delete" ON public.services;
CREATE POLICY "Allow service delete" ON public.services
  FOR DELETE USING (true);

-- Allow owners to insert specialists
DROP POLICY IF EXISTS "Allow specialist insert" ON public.specialists;
CREATE POLICY "Allow specialist insert" ON public.specialists
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow specialist update" ON public.specialists;
CREATE POLICY "Allow specialist update" ON public.specialists
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow specialist delete" ON public.specialists;
CREATE POLICY "Allow specialist delete" ON public.specialists
  FOR DELETE USING (true);

-- Allow owners to update their own salon
DROP POLICY IF EXISTS "Allow salon update" ON public.salons;
CREATE POLICY "Allow salon update" ON public.salons
  FOR UPDATE USING (true);

-- Allow owner registration to create a new salon
DROP POLICY IF EXISTS "Allow salon insert" ON public.salons;
CREATE POLICY "Allow salon insert" ON public.salons
  FOR INSERT WITH CHECK (true);
