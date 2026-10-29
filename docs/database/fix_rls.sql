-- =====================================================================
-- CAMPUSCOINS: FIX RLS POLICIES (Run this in Supabase SQL Editor)
-- Resolves "infinite recursion detected in policy for relation profiles"
-- =====================================================================

-- 1. Helper Security Definer Functions (Bypasses RLS to prevent recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role IN ('staff', 'admin') FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

-- 2. Drop previous recursive policies
DROP POLICY IF EXISTS "Public profile view" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff read assigned student profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Leaderboard view public profiles" ON public.profiles;

DROP POLICY IF EXISTS "Students view own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Students insert complaints" ON public.complaints;
DROP POLICY IF EXISTS "Staff and admin update complaints" ON public.complaints;
DROP POLICY IF EXISTS "Staff view assigned complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admin view all complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admin update complaints" ON public.complaints;
DROP POLICY IF EXISTS "Staff update assigned complaints" ON public.complaints;
DROP POLICY IF EXISTS "Students update own complaints" ON public.complaints;

DROP POLICY IF EXISTS "Users view own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users view own transactions" ON public.coin_transactions;
DROP POLICY IF EXISTS "View active rewards" ON public.rewards;
DROP POLICY IF EXISTS "Admin manage rewards" ON public.rewards;
DROP POLICY IF EXISTS "Users view own redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Staff and admin verify redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "View active missions" ON public.missions;
DROP POLICY IF EXISTS "Admin manage missions" ON public.missions;
DROP POLICY IF EXISTS "Users view own user_missions" ON public.user_missions;
DROP POLICY IF EXISTS "Users update own user_missions" ON public.user_missions;

-- 3. Re-create clean, non-recursive policies
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT
    USING (
        auth.uid() = id 
        OR public.is_admin()
        OR public.is_staff()
        OR (leaderboard_visible = TRUE)
    );

CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin manage profiles" ON public.profiles FOR ALL
    USING (public.is_admin());

-- Complaints
CREATE POLICY "Students view own complaints" ON public.complaints FOR SELECT
    USING (student_id = auth.uid() OR public.is_staff());

CREATE POLICY "Staff view assigned complaints" ON public.complaints FOR SELECT
    USING (assigned_staff_id = auth.uid() OR public.is_staff());

CREATE POLICY "Admin view all complaints" ON public.complaints FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Students insert complaints" ON public.complaints FOR INSERT
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Staff update assigned complaints" ON public.complaints FOR UPDATE
    USING (assigned_staff_id = auth.uid() OR public.is_staff());

CREATE POLICY "Admin update complaints" ON public.complaints FOR ALL
    USING (public.is_admin());

CREATE POLICY "Students update own complaints" ON public.complaints FOR UPDATE
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- Wallets & Transactions
CREATE POLICY "Users view own wallet" ON public.wallets FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users view own transactions" ON public.coin_transactions FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

-- Rewards
CREATE POLICY "View active rewards" ON public.rewards FOR SELECT
    USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admin manage rewards" ON public.rewards FOR ALL
    USING (public.is_admin());

-- Redemptions
CREATE POLICY "Users view own redemptions" ON public.reward_redemptions FOR SELECT
    USING (auth.uid() = user_id OR public.is_staff());

CREATE POLICY "Staff and admin verify redemptions" ON public.reward_redemptions FOR UPDATE
    USING (public.is_staff())
    WITH CHECK (status IN ('fulfilled', 'cancelled'));

-- Missions
CREATE POLICY "View active missions" ON public.missions FOR SELECT
    USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admin manage missions" ON public.missions FOR ALL
    USING (public.is_admin());

CREATE POLICY "Users view own user_missions" ON public.user_missions FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users update own user_missions" ON public.user_missions FOR ALL
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());
