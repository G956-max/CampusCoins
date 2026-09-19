-- =====================================================================
-- CAMPUSCOINS DATABASE SCHEMA (PHASE 2 FOUNDATION)
-- Platform: Supabase / PostgreSQL 15+
-- Core Philosophy: Report. Resolve. Earn. Improve.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. EXTENSIONS & PREREQUISITES
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------
-- 2. ENUMS & DOMAIN CHECKS
-- ---------------------------------------------------------------------
-- Note: Using TEXT with CHECK constraints allows easier migration & flexibility

-- ---------------------------------------------------------------------
-- 3. CORE INFRASTRUCTURE TABLES
-- ---------------------------------------------------------------------

-- Table 1: DEPARTMENTS
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2: PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'staff', 'admin')),
    student_id TEXT NULL,
    staff_id TEXT NULL,
    department_id UUID NULL REFERENCES public.departments(id) ON DELETE SET NULL,
    profile_image_url TEXT NULL,
    year TEXT NULL,
    section TEXT NULL,
    phone TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 3: BUILDINGS
CREATE TABLE IF NOT EXISTS public.buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    latitude NUMERIC(10, 7) NULL,
    longitude NUMERIC(10, 7) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 4: FLOORS
CREATE TABLE IF NOT EXISTS public.floors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
    floor_number INTEGER NOT NULL,
    floor_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_building_floor UNIQUE (building_id, floor_number)
);

-- Table 5: ROOMS
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    floor_id UUID NOT NULL REFERENCES public.floors(id) ON DELETE CASCADE,
    room_number TEXT NOT NULL,
    room_name TEXT,
    room_type TEXT CHECK (room_type IN ('classroom', 'lab', 'office', 'library', 'canteen', 'restroom', 'medical', 'auditorium', 'other')),
    capacity INTEGER NULL,
    latitude NUMERIC(10, 7) NULL,
    longitude NUMERIC(10, 7) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 4. COMPLAINT & TICKET WORKFLOW TABLES
-- ---------------------------------------------------------------------

-- Table 6: COMPLAINTS
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'verified', 'reopened', 'rejected')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    building_id UUID NULL REFERENCES public.buildings(id) ON DELETE SET NULL,
    floor_id UUID NULL REFERENCES public.floors(id) ON DELETE SET NULL,
    room_id UUID NULL REFERENCES public.rooms(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ NULL
);

-- Table 7: COMPLAINT EVIDENCE
CREATE TABLE IF NOT EXISTS public.complaint_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 8: COMPLAINT UPDATES
CREATE TABLE IF NOT EXISTS public.complaint_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    updated_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 9: COMPLAINT ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.complaint_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ NULL
);

-- ---------------------------------------------------------------------
-- 5. CAMPUSCOINS & REWARD SYSTEM TABLES
-- ---------------------------------------------------------------------

-- Table 10: WALLETS
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance INTEGER DEFAULT 0 CHECK (balance >= 0),
    lifetime_earned INTEGER DEFAULT 0 CHECK (lifetime_earned >= 0),
    lifetime_spent INTEGER DEFAULT 0 CHECK (lifetime_spent >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 11: COIN TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'penalty', 'bonus', 'refund')),
    reference_id UUID NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 12: REWARDS
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    coin_cost INTEGER NOT NULL CHECK (coin_cost > 0),
    stock INTEGER NULL CHECK (stock IS NULL OR stock >= 0),
    image_url TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 13: REWARD REDEMPTIONS
CREATE TABLE IF NOT EXISTS public.reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
    coins_spent INTEGER NOT NULL CHECK (coins_spent > 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'fulfilled', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 6. GAMIFICATION & MISSIONS TABLES
-- ---------------------------------------------------------------------

-- Table 14: BADGES
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT NULL,
    criteria TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 15: USER BADGES
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_badge UNIQUE (user_id, badge_id)
);

-- Table 16: MISSIONS
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    reward_coins INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 17: USER MISSIONS
CREATE TABLE IF NOT EXISTS public.user_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'claimed')),
    progress INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ NULL,
    CONSTRAINT uq_user_mission UNIQUE (user_id, mission_id)
);

-- Table 18: BOUNTIES
CREATE TABLE IF NOT EXISTS public.bounties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    total_reward INTEGER NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'expired', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 19: BOUNTY CONTRIBUTIONS
CREATE TABLE IF NOT EXISTS public.bounty_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bounty_id UUID NOT NULL REFERENCES public.bounties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 7. NOTIFICATIONS, AUDIT & TIMETABLE TABLES
-- ---------------------------------------------------------------------

-- Table 20: NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 21: AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID NULL,
    metadata JSONB NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 22: TIMETABLES
CREATE TABLE IF NOT EXISTS public.timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7),
    subject_name TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_id UUID NULL REFERENCES public.rooms(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 8. PERFORMANCE INDEXES
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_department_id ON public.profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_complaints_student_id ON public.complaints(student_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON public.complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_building_id ON public.complaints(building_id);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaint_assignments_staff_id ON public.complaint_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON public.coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);

-- ---------------------------------------------------------------------
-- 9. FUNCTIONS & TRIGGERS (AUTO-CREATE PROFILE & WALLET)
-- ---------------------------------------------------------------------

-- Trigger function to auto-update 'updated_at' columns
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach updated_at triggers
DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_complaints_updated_at ON public.complaints;
CREATE TRIGGER tr_complaints_updated_at
    BEFORE UPDATE ON public.complaints
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Security definer function to get current user role without triggering recursive RLS
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role
    FROM public.profiles
    WHERE id = auth.uid();
    RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger Function: Auto-create Profile & Wallet on new user registration in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_full_name TEXT;
BEGIN
    -- Extract role from metadata, sanitizing to prevent unauthorized admin creation
    v_role := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'student'));
    
    -- IMPORTANT SECURITY RULE: Never allow public registration to create 'admin'
    IF v_role NOT IN ('student', 'staff') THEN
        v_role := 'student';
    END IF;

    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1));

    -- 1. Create Profile
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        role,
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        v_full_name,
        NEW.email,
        v_role,
        TRUE,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;

    -- 2. Create Wallet for student/staff
    INSERT INTO public.wallets (
        user_id,
        balance,
        lifetime_earned,
        lifetime_spent,
        created_at
    )
    VALUES (
        NEW.id,
        0,
        0,
        0,
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------

-- Enable RLS across all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bounties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bounty_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;

-- 10.1 DEPARTMENTS POLICIES
-- Everyone authenticated can view active departments
CREATE POLICY "Allow read access to active departments"
    ON public.departments FOR SELECT
    TO authenticated
    USING (is_active = true OR public.get_user_role() = 'admin');

CREATE POLICY "Allow admin manage departments"
    ON public.departments FOR ALL
    TO authenticated
    USING (public.get_user_role() = 'admin');

-- 10.2 PROFILES POLICIES
-- Users can view their own profile; staff & admin can view profiles for assignment/auditing
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid() OR public.get_user_role() IN ('staff', 'admin'));

-- Users can update safe fields in their own profile
CREATE POLICY "Users can update own safe profile fields"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid() AND
        -- Ensure role and is_active are NOT changed by non-admins
        (role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) OR public.get_user_role() = 'admin') AND
        (is_active = (SELECT p.is_active FROM public.profiles p WHERE p.id = auth.uid()) OR public.get_user_role() = 'admin')
    );

CREATE POLICY "Admin can manage all profiles"
    ON public.profiles FOR ALL
    TO authenticated
    USING (public.get_user_role() = 'admin');

-- 10.3 BUILDINGS, FLOORS, ROOMS POLICIES
-- Read-only for all authenticated users; Admin can manage
CREATE POLICY "Authenticated users can view buildings"
    ON public.buildings FOR SELECT
    TO authenticated
    USING (is_active = true OR public.get_user_role() = 'admin');

CREATE POLICY "Authenticated users can view floors"
    ON public.floors FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can view rooms"
    ON public.rooms FOR SELECT
    TO authenticated
    USING (is_active = true OR public.get_user_role() = 'admin');

CREATE POLICY "Admin can manage campus locations"
    ON public.buildings FOR ALL
    TO authenticated
    USING (public.get_user_role() = 'admin');

-- 10.4 COMPLAINTS POLICIES
-- Students can read their own complaints; Staff & Admin can view all
CREATE POLICY "Students can view own complaints"
    ON public.complaints FOR SELECT
    TO authenticated
    USING (
        student_id = auth.uid() OR
        public.get_user_role() IN ('staff', 'admin')
    );

-- Students can create complaints
CREATE POLICY "Students can create complaints"
    ON public.complaints FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

-- Staff & Admin can update complaints
CREATE POLICY "Staff and admin can update complaints"
    ON public.complaints FOR UPDATE
    TO authenticated
    USING (public.get_user_role() IN ('staff', 'admin'));

-- 10.5 COMPLAINT EVIDENCE & UPDATES POLICIES
CREATE POLICY "Users can view evidence of visible complaints"
    ON public.complaint_evidence FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.complaints c
            WHERE c.id = complaint_id
            AND (c.student_id = auth.uid() OR public.get_user_role() IN ('staff', 'admin'))
        )
    );

CREATE POLICY "Users can upload evidence"
    ON public.complaint_evidence FOR INSERT
    TO authenticated
    WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can view complaint updates"
    ON public.complaint_updates FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.complaints c
            WHERE c.id = complaint_id
            AND (c.student_id = auth.uid() OR public.get_user_role() IN ('staff', 'admin'))
        )
    );

CREATE POLICY "Staff and students can add updates"
    ON public.complaint_updates FOR INSERT
    TO authenticated
    WITH CHECK (updated_by = auth.uid());

-- 10.6 WALLETS & TRANSACTIONS POLICIES
-- Users can only view their own wallet
CREATE POLICY "Users can view own wallet"
    ON public.wallets FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR public.get_user_role() = 'admin');

-- Direct wallet update disallowed from client side (strictly admin/service-role)
CREATE POLICY "Admin can manage wallets"
    ON public.wallets FOR ALL
    TO authenticated
    USING (public.get_user_role() = 'admin');

-- Users can only view their own coin transactions
CREATE POLICY "Users can view own coin transactions"
    ON public.coin_transactions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR public.get_user_role() = 'admin');

-- 10.7 NOTIFICATIONS POLICIES
-- Users can view and mark read only their own notifications
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 10.8 REWARDS & TIMETABLES POLICIES
CREATE POLICY "Authenticated users can view active rewards"
    ON public.rewards FOR SELECT
    TO authenticated
    USING (is_active = true OR public.get_user_role() = 'admin');

CREATE POLICY "Users can view own redemptions"
    ON public.reward_redemptions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR public.get_user_role() = 'admin');

CREATE POLICY "Students can view own timetable"
    ON public.timetables FOR SELECT
    TO authenticated
    USING (student_id = auth.uid() OR public.get_user_role() = 'admin');

-- ---------------------------------------------------------------------
-- 11. INITIAL SEED DATA (COLLEGE DEPARTMENTS)
-- ---------------------------------------------------------------------
INSERT INTO public.departments (name, code, description)
VALUES
    ('Computer Science and Engineering', 'CSE', 'Department of Computer Science & Software Engineering'),
    ('Artificial Intelligence and Machine Learning', 'AIML', 'Department of AI, Data Science and Machine Learning'),
    ('Information Technology', 'IT', 'Department of Information Technology and Networks'),
    ('Electronics and Communication Engineering', 'ECE', 'Department of Electronics and Communications'),
    ('Electrical and Electronics Engineering', 'EEE', 'Department of Electrical Power and Circuits'),
    ('Mechanical Engineering', 'ME', 'Department of Mechanical and Industrial Engineering'),
    ('Civil Engineering', 'CE', 'Department of Civil and Structural Engineering'),
    ('Administration', 'ADM', 'Central Campus Administration & Registrar Office'),
    ('Maintenance & Facilities', 'MNT', 'Campus Civil, Electrical, and Sanitation Maintenance Operations')
ON CONFLICT (code) DO NOTHING;

-- =====================================================================
-- END OF CAMPUSCOINS SCHEMA
-- =====================================================================
