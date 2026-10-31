-- ========================================================
-- CAMPUSCOINS: FIX COMPLAINTS RLS POLICIES
-- Platform: Supabase / PostgreSQL 15+
-- ========================================================

-- 1. Enable Full Access on Complaints Table
ALTER TABLE IF EXISTS public.complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students view own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Staff view assigned complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admin view all complaints" ON public.complaints;
DROP POLICY IF EXISTS "Public view complaints" ON public.complaints;
CREATE POLICY "Public view complaints" ON public.complaints FOR SELECT USING (true);

DROP POLICY IF EXISTS "Students insert complaints" ON public.complaints;
DROP POLICY IF EXISTS "Public insert complaints" ON public.complaints;
CREATE POLICY "Public insert complaints" ON public.complaints FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Staff update assigned complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admin update complaints" ON public.complaints;
DROP POLICY IF EXISTS "Students update own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Public update complaints" ON public.complaints;
CREATE POLICY "Public update complaints" ON public.complaints FOR UPDATE USING (true);

-- 2. Enable Full Access on Updates & Evidence
ALTER TABLE IF EXISTS public.complaint_updates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read complaint_updates" ON public.complaint_updates;
DROP POLICY IF EXISTS "Public manage complaint_updates" ON public.complaint_updates;
CREATE POLICY "Public manage complaint_updates" ON public.complaint_updates FOR ALL USING (true);

ALTER TABLE IF EXISTS public.complaint_evidence ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read complaint_evidence" ON public.complaint_evidence;
DROP POLICY IF EXISTS "Public manage complaint_evidence" ON public.complaint_evidence;
CREATE POLICY "Public manage complaint_evidence" ON public.complaint_evidence FOR ALL USING (true);
