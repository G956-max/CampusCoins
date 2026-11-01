-- ========================================================
-- CAMPUSCOINS: FIX DATABASE POLICIES, SEEDS & ACTIVATE ADMIN
-- Run this in Supabase SQL Editor (Green "Run" button)
-- ========================================================

-- 1. Enable RLS and Configure Public / Student Access
ALTER TABLE IF EXISTS public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.complaint_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.complaint_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read departments" ON public.departments;
CREATE POLICY "Public read departments" ON public.departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read buildings" ON public.buildings;
CREATE POLICY "Public read buildings" ON public.buildings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read floors" ON public.floors;
CREATE POLICY "Public read floors" ON public.floors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read rooms" ON public.rooms;
CREATE POLICY "Public read rooms" ON public.rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Students insert complaints" ON public.complaints;
CREATE POLICY "Students insert complaints" ON public.complaints FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Public read complaints" ON public.complaints;
CREATE POLICY "Public read complaints" ON public.complaints FOR SELECT USING (true);

-- Remove restrictive FK constraints so building incharges can be assigned directly
ALTER TABLE public.complaints DROP CONSTRAINT IF EXISTS complaints_assigned_staff_id_fkey;
ALTER TABLE public.complaint_assignments DROP CONSTRAINT IF EXISTS complaint_assignments_staff_id_fkey;

DROP POLICY IF EXISTS "Public update complaints" ON public.complaints;
CREATE POLICY "Public update complaints" ON public.complaints FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public manage complaint_evidence" ON public.complaint_evidence;
CREATE POLICY "Public manage complaint_evidence" ON public.complaint_evidence FOR ALL USING (true);

DROP POLICY IF EXISTS "Public manage complaint_updates" ON public.complaint_updates;
CREATE POLICY "Public manage complaint_updates" ON public.complaint_updates FOR ALL USING (true);

-- 2. Seed Departments (ON CONFLICT prevents duplicate key error)
INSERT INTO public.departments (id, name, code, description) VALUES
('d1000000-0000-0000-0000-000000000001', 'Computer Science & Engineering', 'CSE', 'Department of Computer Science & Engineering'),
('d1000000-0000-0000-0000-000000000002', 'Information Technology', 'IT', 'Department of Information Technology'),
('d1000000-0000-0000-0000-000000000003', 'Electronics & Communication', 'ECE', 'Department of Electronics & Communication Engineering'),
('d1000000-0000-0000-0000-000000000004', 'Mechanical Engineering', 'MECH', 'Department of Mechanical Engineering'),
('d1000000-0000-0000-0000-000000000005', 'Campus Facilities & Maintenance', 'FAC', 'Estate office and maintenance services')
ON CONFLICT (id) DO NOTHING;

-- 3. ACTIVATE ADMIN ACCOUNT & SET ROLE
-- Confirms email immediately so login succeeds without requiring email inbox verification
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'admin.campuscoins@gmail.com';

-- Inserts / Updates profile with 'admin' role
INSERT INTO public.profiles (id, email, full_name, role, is_active)
SELECT id, email, 'Dr. Eleanor Vance (Admin)', 'admin', true
FROM auth.users 
WHERE email = 'admin.campuscoins@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', is_active = true;

