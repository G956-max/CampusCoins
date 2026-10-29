-- 1. Helper Security Definer Functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()), FALSE);
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT role IN ('staff', 'admin') FROM public.profiles WHERE id = auth.uid()), FALSE);
$$;

-- 2. Profiles Policies
DROP POLICY IF EXISTS "Public profile view" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff read assigned student profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Leaderboard view public profiles" ON public.profiles;

CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin() OR public.is_staff() OR (leaderboard_visible = TRUE));

CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE
    USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin manage profiles" ON public.profiles FOR ALL
    USING (public.is_admin());

-- 3. Complaints Policies
DROP POLICY IF EXISTS "Students view own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Students insert complaints" ON public.complaints;
DROP POLICY IF EXISTS "Staff and admin update complaints" ON public.complaints;
DROP POLICY IF EXISTS "Staff view assigned complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admin view all complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admin update complaints" ON public.complaints;
DROP POLICY IF EXISTS "Staff update assigned complaints" ON public.complaints;
DROP POLICY IF EXISTS "Students update own complaints" ON public.complaints;

CREATE POLICY "Students view own complaints" ON public.complaints FOR SELECT
    USING (student_id = auth.uid() OR public.is_staff());

CREATE POLICY "Students insert complaints" ON public.complaints FOR INSERT
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Staff and admin update complaints" ON public.complaints FOR UPDATE
    USING (public.is_staff());

-- 4. Wallets & Transactions Policies
DROP POLICY IF EXISTS "Users view own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users view own transactions" ON public.coin_transactions;

CREATE POLICY "Users view own wallet" ON public.wallets FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users view own transactions" ON public.coin_transactions FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

-- 5. Rewards Policies
DROP POLICY IF EXISTS "View active rewards" ON public.rewards;
DROP POLICY IF EXISTS "Admin manage rewards" ON public.rewards;
DROP POLICY IF EXISTS "Users view own redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Staff and admin verify redemptions" ON public.reward_redemptions;

CREATE POLICY "View active rewards" ON public.rewards FOR SELECT
    USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admin manage rewards" ON public.rewards FOR ALL
    USING (public.is_admin());

CREATE POLICY "Users view own redemptions" ON public.reward_redemptions FOR SELECT
    USING (auth.uid() = user_id OR public.is_staff());

CREATE POLICY "Staff and admin verify redemptions" ON public.reward_redemptions FOR UPDATE
    USING (public.is_staff())
    WITH CHECK (status IN ('fulfilled', 'cancelled'));

-- 6. Missions Policies
DROP POLICY IF EXISTS "View active missions" ON public.missions;
DROP POLICY IF EXISTS "Admin manage missions" ON public.missions;
DROP POLICY IF EXISTS "Users view own user_missions" ON public.user_missions;
DROP POLICY IF EXISTS "Users update own user_missions" ON public.user_missions;

CREATE POLICY "View active missions" ON public.missions FOR SELECT
    USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admin manage missions" ON public.missions FOR ALL
    USING (public.is_admin());

CREATE POLICY "Users view own user_missions" ON public.user_missions FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users update own user_missions" ON public.user_missions FOR ALL
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());
