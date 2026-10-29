-- =====================================================================
-- CAMPUSCOINS COMPLETE DATABASE MIGRATION (CONSOLIDATED PRODUCTION READY)
-- Platform: Supabase / PostgreSQL 15+
-- Core Philosophy: Report. Resolve. Earn. Improve.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. EXTENSIONS
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------
-- 2. CORE INFRASTRUCTURE TABLES
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
    leaderboard_visible BOOLEAN DEFAULT TRUE,
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
    facility_type TEXT DEFAULT 'academic',
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

-- Table 5b: CAMPUS FACILITIES & AMENITIES
CREATE TABLE IF NOT EXISTS public.campus_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    building_id UUID NULL REFERENCES public.buildings(id) ON DELETE SET NULL,
    floor_id UUID NULL REFERENCES public.floors(id) ON DELETE SET NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    description TEXT,
    is_accessible BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 3. COMPLAINT & TICKET WORKFLOW TABLES
-- ---------------------------------------------------------------------

-- Table 6: COMPLAINTS
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_code TEXT UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'verified', 'reopened', 'rejected')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    building_id UUID NULL REFERENCES public.buildings(id) ON DELETE SET NULL,
    floor_id UUID NULL REFERENCES public.floors(id) ON DELETE SET NULL,
    room_id UUID NULL REFERENCES public.rooms(id) ON DELETE SET NULL,
    general_location TEXT NULL,
    latitude NUMERIC(10, 7) NULL,
    longitude NUMERIC(10, 7) NULL,
    assigned_staff_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    rejection_reason TEXT NULL,
    reopen_reason TEXT NULL,
    resolution_comment TEXT NULL,
    duplicate_of UUID NULL REFERENCES public.complaints(id) ON DELETE SET NULL,
    is_duplicate BOOLEAN DEFAULT FALSE,
    is_spam BOOLEAN DEFAULT FALSE,
    sla_breached BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_at TIMESTAMPTZ NULL,
    in_progress_at TIMESTAMPTZ NULL,
    resolved_at TIMESTAMPTZ NULL,
    verified_at TIMESTAMPTZ NULL
);

-- Table 7: COMPLAINT_UPDATES (Timeline / Work notes)
CREATE TABLE IF NOT EXISTS public.complaint_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    updated_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 8: COMPLAINT_EVIDENCE (Files / Attachments)
CREATE TABLE IF NOT EXISTS public.complaint_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NULL,
    evidence_type TEXT DEFAULT 'initial' CHECK (evidence_type IN ('initial', 'in_progress', 'resolution', 'verification')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 9: COMPLAINT_DUPLICATES (Smart Detection records)
CREATE TABLE IF NOT EXISTS public.complaint_duplicates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    duplicate_of_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    similarity_score NUMERIC(5, 4) NOT NULL,
    match_signals JSONB DEFAULT '{}'::jsonb,
    is_confirmed BOOLEAN DEFAULT FALSE,
    confirmed_by UUID NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 10: SLA_CONFIGS & SLA_ESCALATIONS
CREATE TABLE IF NOT EXISTS public.sla_configs (
    priority TEXT PRIMARY KEY CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    target_response_hours INTEGER NOT NULL,
    target_resolution_hours INTEGER NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sla_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    priority TEXT NOT NULL,
    target_hours INTEGER NOT NULL,
    elapsed_hours NUMERIC(6, 2) NOT NULL,
    status TEXT DEFAULT 'escalated',
    notified_roles JSONB DEFAULT '["staff", "admin"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_sla_complaint_escalation UNIQUE (complaint_id, priority)
);

-- ---------------------------------------------------------------------
-- 4. WALLET, COIN TRANSACTIONS & GAMIFICATION TABLES
-- ---------------------------------------------------------------------

-- Table 11: WALLETS
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance INTEGER DEFAULT 0 CHECK (balance >= 0),
    lifetime_earned INTEGER DEFAULT 0 CHECK (lifetime_earned >= 0),
    lifetime_spent INTEGER DEFAULT 0 CHECK (lifetime_spent >= 0),
    impact_score INTEGER DEFAULT 0 CHECK (impact_score >= 0),
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    xp INTEGER DEFAULT 0 CHECK (xp >= 0),
    streak_count INTEGER DEFAULT 0 CHECK (streak_count >= 0),
    last_activity_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 12: COIN_TRANSACTIONS (Immutable Ledger)
CREATE TABLE IF NOT EXISTS public.coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'bonus', 'penalty', 'refund', 'adjustment')),
    event_type TEXT DEFAULT 'complaint_verified',
    reference_id TEXT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotency constraint: Prevent awarding coins twice for the exact same event and reference
CREATE UNIQUE INDEX IF NOT EXISTS uq_coin_transactions_event 
    ON public.coin_transactions (user_id, event_type, reference_id) 
    WHERE reference_id IS NOT NULL;

-- Table 13: REWARDS CATALOG
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    coin_cost INTEGER NOT NULL CHECK (coin_cost > 0),
    stock INTEGER NULL CHECK (stock IS NULL OR stock >= 0),
    image_url TEXT NULL,
    category TEXT DEFAULT 'General',
    terms TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 14: REWARD_REDEMPTIONS
CREATE TABLE IF NOT EXISTS public.reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_code TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
    coins_spent INTEGER NOT NULL CHECK (coins_spent > 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'fulfilled', 'cancelled', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ NULL,
    verified_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    cancellation_reason TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 15: BADGES
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT NOT NULL,
    category TEXT DEFAULT 'achievement',
    criteria TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 16: USER_BADGES
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_badge UNIQUE (user_id, badge_id)
);

-- Table 17: MISSIONS
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward_coins INTEGER NOT NULL CHECK (reward_coins > 0),
    requirement_count INTEGER DEFAULT 1 CHECK (requirement_count > 0),
    event_type TEXT NOT NULL,
    mission_type TEXT DEFAULT 'standard' CHECK (mission_type IN ('standard', 'daily', 'weekly', 'challenge')),
    icon TEXT DEFAULT 'Target',
    expires_at TIMESTAMPTZ NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 18: USER_MISSIONS
CREATE TABLE IF NOT EXISTS public.user_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0),
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'claimed')),
    completed_at TIMESTAMPTZ NULL,
    claimed_at TIMESTAMPTZ NULL,
    CONSTRAINT uq_user_mission UNIQUE (user_id, mission_id)
);

-- Table 19: COMMUNITY_BOUNTIES
CREATE TABLE IF NOT EXISTS public.community_bounties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    reward_coins INTEGER NOT NULL CHECK (reward_coins > 0),
    xp_reward INTEGER DEFAULT 50,
    location TEXT NULL,
    deadline TIMESTAMPTZ NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'completed', 'expired')),
    created_by UUID REFERENCES public.profiles(id),
    claimed_by UUID NULL REFERENCES public.profiles(id),
    verified_by UUID NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 20: GAMIFICATION_RULES
CREATE TABLE IF NOT EXISTS public.gamification_rules (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID NULL REFERENCES public.profiles(id)
);

-- Table 21: AI_PREDICTIONS & FEEDBACK
CREATE TABLE IF NOT EXISTS public.ai_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    suggested_category TEXT NOT NULL,
    confidence NUMERIC(5, 4) NOT NULL,
    suggested_priority TEXT NOT NULL,
    source TEXT DEFAULT 'rule_based_baseline',
    signals JSONB DEFAULT '{}'::jsonb,
    human_corrected BOOLEAN DEFAULT FALSE,
    actual_category TEXT NULL,
    actual_priority TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 22: NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    reference_id TEXT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 23: AUDIT_LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NULL,
    old_data JSONB NULL,
    new_data JSONB NULL,
    ip_address TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 5. PERFORMANCE INDEXES
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_complaints_student ON public.complaints (student_id);
CREATE INDEX IF NOT EXISTS idx_complaints_staff ON public.complaints (assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints (status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints (category);
CREATE INDEX IF NOT EXISTS idx_complaints_created ON public.complaints (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user ON public.coin_transactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user ON public.reward_redemptions (user_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_voucher ON public.reward_redemptions (voucher_code);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_wallets_impact ON public.wallets (impact_score DESC);

-- ---------------------------------------------------------------------
-- 6. ATOMIC STORED PROCEDURES (RPCs) & SECURITY TRIGGERS
-- ---------------------------------------------------------------------

-- Trigger Function: Auto-create Profile & Wallet on new user registration in auth.users
-- Strictly validates permitted roles: Public signup can ONLY create 'student' or 'staff', never 'admin'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role TEXT;
    v_full_name TEXT;
BEGIN
    -- Extract requested role, strictly restricting public signup to student or staff only
    v_role := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'student'));
    
    -- IMPORTANT SECURITY RULE: Never allow public registration to create 'admin'
    IF v_role NOT IN ('student', 'staff') THEN
        v_role := 'student';
    END IF;

    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1));

    -- 1. Create Profile with permitted role (never admin)
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

    -- 2. Create Wallet
    INSERT INTO public.wallets (
        user_id,
        balance,
        lifetime_earned,
        lifetime_spent,
        impact_score,
        level,
        xp,
        streak_count,
        last_activity_at
    )
    VALUES (
        NEW.id,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trusted Administrative Role Assignment Function
CREATE OR REPLACE FUNCTION public.admin_assign_role(
    p_target_user_id UUID,
    p_new_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Ensure caller is an active administrator
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin' AND is_active = TRUE
    ) THEN
        RETURN jsonb_build_object('success', false, 'status_code', 403, 'message', 'Unauthorized: Only active administrators can assign user roles.');
    END IF;

    IF p_new_role NOT IN ('student', 'staff', 'admin') THEN
        RETURN jsonb_build_object('success', false, 'status_code', 400, 'message', 'Invalid role. Permitted roles are: student, staff, admin.');
    END IF;

    UPDATE public.profiles
    SET role = p_new_role,
        updated_at = NOW()
    WHERE id = p_target_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'status_code', 404, 'message', 'Target user profile not found.');
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Role successfully assigned to ' || p_new_role);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_assign_role(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_assign_role(UUID, TEXT) TO authenticated, service_role;

-- RPC 1: award_coins_atomic
-- Enforces wallet non-negativity, transaction ledger consistency, and idempotency
CREATE OR REPLACE FUNCTION public.award_coins_atomic(
    p_user_id UUID,
    p_amount INTEGER,
    p_transaction_type TEXT,
    p_event_type TEXT,
    p_reference_id TEXT,
    p_description TEXT,
    p_impact_points INTEGER DEFAULT 0,
    p_xp_points INTEGER DEFAULT 0,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_wallet RECORD;
    v_new_balance INTEGER;
    v_new_earned INTEGER;
    v_new_spent INTEGER;
    v_new_impact INTEGER;
    v_new_xp INTEGER;
    v_new_level INTEGER;
    v_tx_id UUID;
    v_already_awarded BOOLEAN;
BEGIN
    -- Validate user profile exists and is active
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND is_active = TRUE) THEN
        RETURN jsonb_build_object(
            'success', false,
            'status_code', 404,
            'message', 'User account not found or is currently inactive.'
        );
    END IF;

    -- Validate non-zero amount
    IF p_amount = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'status_code', 400,
            'message', 'Transaction amount cannot be zero.'
        );
    END IF;

    -- Validate transaction type
    IF p_transaction_type NOT IN ('earned', 'spent', 'bonus', 'penalty', 'refund', 'adjustment') THEN
        RETURN jsonb_build_object(
            'success', false,
            'status_code', 400,
            'message', 'Invalid transaction type specified.'
        );
    END IF;

    -- Check idempotency if reference_id is provided
    IF p_reference_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM public.coin_transactions 
            WHERE user_id = p_user_id 
              AND event_type = p_event_type 
              AND reference_id = p_reference_id
        ) INTO v_already_awarded;

        IF v_already_awarded THEN
            RETURN jsonb_build_object(
                'success', false,
                'already_awarded', true,
                'status_code', 200,
                'message', 'Reward has already been granted for this event.'
            );
        END IF;
    END IF;

    -- Ensure wallet exists
    INSERT INTO public.wallets (user_id, balance, lifetime_earned, lifetime_spent, impact_score, level, xp, streak_count, last_activity_at)
    VALUES (p_user_id, 0, 0, 0, 0, 1, 0, 0, NOW())
    ON CONFLICT (user_id) DO NOTHING;

    -- Lock wallet row for update
    SELECT * INTO v_wallet FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;

    -- Reject deductions that exceed available balance (never clamp silently)
    IF p_amount < 0 AND (v_wallet.balance + p_amount) < 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'status_code', 400,
            'message', 'Insufficient CampusCoins balance: deduction exceeds available funds.'
        );
    END IF;

    v_new_balance := v_wallet.balance + p_amount;
    IF p_amount > 0 THEN
        v_new_earned := v_wallet.lifetime_earned + p_amount;
        v_new_spent := v_wallet.lifetime_spent;
    ELSE
        v_new_earned := v_wallet.lifetime_earned;
        v_new_spent := v_wallet.lifetime_spent + ABS(p_amount);
    END IF;

    v_new_impact := GREATEST(0, v_wallet.impact_score + COALESCE(p_impact_points, 0));
    v_new_xp := GREATEST(0, v_wallet.xp + COALESCE(p_xp_points, 0));

    IF v_new_xp >= 2000 THEN v_new_level := 6;
    ELSIF v_new_xp >= 1000 THEN v_new_level := 5;
    ELSIF v_new_xp >= 500 THEN v_new_level := 4;
    ELSIF v_new_xp >= 250 THEN v_new_level := 3;
    ELSIF v_new_xp >= 100 THEN v_new_level := 2;
    ELSE v_new_level := 1;
    END IF;

    -- Update wallet atomically
    UPDATE public.wallets
    SET balance = v_new_balance,
        lifetime_earned = v_new_earned,
        lifetime_spent = v_new_spent,
        impact_score = v_new_impact,
        xp = v_new_xp,
        level = v_new_level,
        last_activity_at = NOW()
    WHERE user_id = p_user_id;

    -- Record in transaction ledger
    INSERT INTO public.coin_transactions (
        user_id, amount, transaction_type, event_type, reference_id, description, metadata, created_at
    )
    VALUES (
        p_user_id, p_amount, p_transaction_type, p_event_type, p_reference_id, p_description, p_metadata, NOW()
    )
    RETURNING id INTO v_tx_id;

    -- Notify user
    INSERT INTO public.notifications (user_id, title, message, type, reference_id)
    VALUES (
        p_user_id,
        CASE WHEN p_amount >= 0 THEN '🪙 CampusCoins Earned!' ELSE 'Coins Deducted' END,
        p_description,
        'coins_awarded',
        v_tx_id::text
    );

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_tx_id,
        'balance', v_new_balance,
        'impact_score', v_new_impact,
        'xp', v_new_xp,
        'level', v_new_level
    );
END;
$$;

-- Restrict execution to trusted server-side service role only
REVOKE ALL ON FUNCTION public.award_coins_atomic(UUID, INTEGER, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.award_coins_atomic(UUID, INTEGER, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, JSONB) TO service_role;

-- RPC 2: redeem_reward_atomic
-- Single atomic database transaction for reward redemption: locks stock & wallet, generates redemption
CREATE OR REPLACE FUNCTION public.redeem_reward_atomic(
    p_user_id UUID,
    p_reward_id UUID,
    p_voucher_code TEXT,
    p_expires_at TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_reward RECORD;
    v_wallet RECORD;
    v_redemption_id UUID;
    v_tx_id UUID;
BEGIN
    -- Validate user profile is active
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND is_active = TRUE) THEN
        RETURN jsonb_build_object('success', false, 'status_code', 403, 'message', 'User account is inactive or not found.');
    END IF;

    -- Validate voucher code format
    IF p_voucher_code IS NULL OR length(trim(p_voucher_code)) < 6 THEN
        RETURN jsonb_build_object('success', false, 'status_code', 400, 'message', 'Invalid voucher code format.');
    END IF;

    -- Validate voucher uniqueness
    IF EXISTS (SELECT 1 FROM public.reward_redemptions WHERE voucher_code = p_voucher_code) THEN
        RETURN jsonb_build_object('success', false, 'status_code', 409, 'message', 'Voucher code collision. Please retry redemption.');
    END IF;

    -- Lock reward row for update
    SELECT * INTO v_reward FROM public.rewards WHERE id = p_reward_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'status_code', 404, 'message', 'Reward item not found.');
    END IF;

    IF NOT v_reward.is_active THEN
        RETURN jsonb_build_object('success', false, 'status_code', 400, 'message', 'This reward item is currently inactive.');
    END IF;

    IF v_reward.stock IS NOT NULL AND v_reward.stock <= 0 THEN
        RETURN jsonb_build_object('success', false, 'status_code', 400, 'message', 'Reward is currently out of stock.');
    END IF;

    -- Lock wallet row for update
    SELECT * INTO v_wallet FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;
    IF NOT FOUND OR v_wallet.balance < v_reward.coin_cost THEN
        RETURN jsonb_build_object('success', false, 'status_code', 400, 'message', 'Insufficient CampusCoins balance to redeem this reward.');
    END IF;

    -- Decrement stock conditionally
    IF v_reward.stock IS NOT NULL THEN
        UPDATE public.rewards 
        SET stock = stock - 1 
        WHERE id = p_reward_id AND stock > 0;

        IF NOT FOUND THEN
            RETURN jsonb_build_object('success', false, 'status_code', 400, 'message', 'Reward ran out of stock during redemption.');
        END IF;
    END IF;

    -- Deduct coins from wallet conditionally
    UPDATE public.wallets
    SET balance = balance - v_reward.coin_cost,
        lifetime_spent = lifetime_spent + v_reward.coin_cost,
        last_activity_at = NOW()
    WHERE user_id = p_user_id AND balance >= v_reward.coin_cost;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet balance update failed constraint check.';
    END IF;

    -- Insert redemption record
    INSERT INTO public.reward_redemptions (
        voucher_code, user_id, reward_id, coins_spent, status, expires_at, created_at
    )
    VALUES (
        p_voucher_code, p_user_id, p_reward_id, v_reward.coin_cost, 'pending', p_expires_at, NOW()
    )
    RETURNING id INTO v_redemption_id;

    -- Record in transaction ledger
    INSERT INTO public.coin_transactions (
        user_id, amount, transaction_type, event_type, reference_id, description, metadata, created_at
    )
    VALUES (
        p_user_id, -v_reward.coin_cost, 'spent', 'reward_redemption', v_redemption_id::text,
        'Redeemed: ' || v_reward.name,
        jsonb_build_object('reward_name', v_reward.name, 'voucher_code', p_voucher_code, 'reward_id', p_reward_id),
        NOW()
    )
    RETURNING id INTO v_tx_id;

    -- Notification
    INSERT INTO public.notifications (user_id, title, message, type, reference_id)
    VALUES (
        p_user_id,
        '🎁 Reward Voucher Ready',
        'Your voucher for ' || v_reward.name || ' is ready! Code: ' || p_voucher_code,
        'reward_redeemed',
        v_redemption_id::text
    );

    RETURN jsonb_build_object(
        'success', true,
        'redemption_id', v_redemption_id,
        'voucher_code', p_voucher_code,
        'reward_name', v_reward.name,
        'coins_spent', v_reward.coin_cost,
        'new_balance', v_wallet.balance - v_reward.coin_cost
    );
END;
$$;

-- Restrict execution to trusted server-side service role only
REVOKE ALL ON FUNCTION public.redeem_reward_atomic(UUID, UUID, TEXT, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_reward_atomic(UUID, UUID, TEXT, TIMESTAMPTZ) TO service_role;

-- RPC 3: claim_mission_atomic
-- Validates mission requirements, prevents duplicate claims, and awards coins atomically
CREATE OR REPLACE FUNCTION public.claim_mission_atomic(
    p_user_id UUID,
    p_mission_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_mission RECORD;
    v_user_mission RECORD;
    v_award_result JSONB;
BEGIN
    -- Validate user profile is active
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND is_active = TRUE) THEN
        RETURN jsonb_build_object('success', false, 'status_code', 403, 'message', 'User account is inactive or not found.');
    END IF;

    -- Fetch active mission definition
    SELECT * INTO v_mission FROM public.missions WHERE id = p_mission_id AND is_active = TRUE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'status_code', 404, 'message', 'Active mission not found.');
    END IF;

    -- Lock user mission progress row
    SELECT * INTO v_user_mission FROM public.user_missions 
    WHERE user_id = p_user_id AND mission_id = p_mission_id FOR UPDATE;

    -- Reject incomplete mission claims
    IF NOT FOUND OR v_user_mission.progress < v_mission.requirement_count THEN
        RETURN jsonb_build_object(
            'success', false, 
            'status_code', 400, 
            'message', 'Mission requirements have not been completed yet.'
        );
    END IF;

    -- Reject duplicate claims
    IF v_user_mission.status = 'claimed' THEN
        RETURN jsonb_build_object('success', false, 'status_code', 400, 'message', 'Mission reward has already been claimed.');
    END IF;

    -- Mark claimed conditionally
    UPDATE public.user_missions
    SET status = 'claimed',
        claimed_at = NOW()
    WHERE user_id = p_user_id AND mission_id = p_mission_id AND status != 'claimed';

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'status_code', 400, 'message', 'Mission reward has already been claimed.');
    END IF;

    -- Award coins via award_coins_atomic
    v_award_result := public.award_coins_atomic(
        p_user_id,
        v_mission.reward_coins,
        'bonus',
        'mission_completed',
        p_mission_id::text,
        'Completed Mission: ' || v_mission.title,
        ROUND(v_mission.reward_coins / 2),
        v_mission.reward_coins,
        jsonb_build_object('mission_id', p_mission_id, 'mission_title', v_mission.title)
    );

    RETURN jsonb_build_object(
        'success', true,
        'mission_id', p_mission_id,
        'reward_coins', v_mission.reward_coins,
        'wallet', v_award_result
    );
END;
$$;

-- Restrict execution to trusted server-side service role only
REVOKE ALL ON FUNCTION public.claim_mission_atomic(UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_mission_atomic(UUID, UUID) TO service_role;

-- ---------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES (Hardened & Canonical)
-- ---------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_bounties ENABLE ROW LEVEL SECURITY;

-- Drop all previous policies to avoid overlapping permissive policies across migration runs
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
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "View active bounties" ON public.community_bounties;
DROP POLICY IF EXISTS "Staff and admin manage bounties" ON public.community_bounties;
DROP POLICY IF EXISTS "View active missions" ON public.missions;
DROP POLICY IF EXISTS "Admin manage missions" ON public.missions;
DROP POLICY IF EXISTS "Users view own user_missions" ON public.user_missions;
DROP POLICY IF EXISTS "Users update own user_missions" ON public.user_missions;

-- 1. PROFILES RLS
-- Users can view their own profile; admins can view all profiles; staff can view student profiles for assigned tickets
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT
    USING (
        auth.uid() = id 
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        OR (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'staff')
            AND EXISTS (SELECT 1 FROM public.complaints WHERE assigned_staff_id = auth.uid() AND student_id = profiles.id)
        )
        OR (leaderboard_visible = TRUE)
    );

-- Restrict profile updates to approved safe fields; prevent modifying own role, activation status, or email
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
        AND is_active = (SELECT p.is_active FROM public.profiles p WHERE p.id = auth.uid())
        AND email = (SELECT p.email FROM public.profiles p WHERE p.id = auth.uid())
    );

CREATE POLICY "Admin manage profiles" ON public.profiles FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 2. COMPLAINTS RLS
-- Students view own; staff view assigned; admin view all
CREATE POLICY "Students view own complaints" ON public.complaints FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "Staff view assigned complaints" ON public.complaints FOR SELECT
    USING (assigned_staff_id = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin')));

CREATE POLICY "Admin view all complaints" ON public.complaints FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Only active students can submit complaints for themselves
CREATE POLICY "Students insert complaints" ON public.complaints FOR INSERT
    WITH CHECK (
        auth.uid() = student_id 
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'student' AND is_active = TRUE)
    );

-- Role-restricted complaint updates:
CREATE POLICY "Admin update complaints" ON public.complaints FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Staff update assigned complaints" ON public.complaints FOR UPDATE
    USING (
        assigned_staff_id = auth.uid() 
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'staff' AND is_active = TRUE)
    )
    WITH CHECK (
        status IN ('in_progress', 'resolved')
    );

CREATE POLICY "Students update own complaints" ON public.complaints FOR UPDATE
    USING (
        student_id = auth.uid() 
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'student' AND is_active = TRUE)
    )
    WITH CHECK (
        student_id = auth.uid()
        AND status IN ('submitted', 'verified', 'reopened')
    );

-- 3. WALLETS & TRANSACTIONS RLS
-- Users can read their own wallet & transactions; Admins can view all
CREATE POLICY "Users view own wallet" ON public.wallets FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users view own transactions" ON public.coin_transactions FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Deny all direct client-side DML on financial tables: Only atomic RPCs via service_role can modify balances!
REVOKE INSERT, UPDATE, DELETE ON public.wallets FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.wallets TO authenticated;

REVOKE INSERT, UPDATE, DELETE ON public.coin_transactions FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.coin_transactions TO authenticated;

-- 4. REWARDS & REDEMPTIONS RLS
CREATE POLICY "View active rewards" ON public.rewards FOR SELECT
    USING (is_active = TRUE OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin manage rewards" ON public.rewards FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users view own redemptions" ON public.reward_redemptions FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin')));

CREATE POLICY "Staff and admin verify redemptions" ON public.reward_redemptions FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin') AND is_active = TRUE))
    WITH CHECK (status IN ('fulfilled', 'cancelled'));

-- Direct client inserts into reward_redemptions are revoked; redemptions must go through redeem_reward_atomic
REVOKE INSERT ON public.reward_redemptions FROM PUBLIC, anon, authenticated;
GRANT SELECT, UPDATE ON public.reward_redemptions TO authenticated;

-- 5. MISSIONS & USER MISSIONS RLS
CREATE POLICY "View active missions" ON public.missions FOR SELECT
    USING (is_active = TRUE OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin manage missions" ON public.missions FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users view own user_missions" ON public.user_missions FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users update own user_missions" ON public.user_missions FOR ALL
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 6. NOTIFICATIONS & BOUNTIES RLS
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "View active bounties" ON public.community_bounties FOR SELECT USING (TRUE);

CREATE POLICY "Staff and admin manage bounties" ON public.community_bounties FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin') AND is_active = TRUE));

-- ---------------------------------------------------------------------
-- 8. DEFAULT SEED DATA
-- ---------------------------------------------------------------------

-- Seed Departments
INSERT INTO public.departments (id, name, code, description)
VALUES
    ('d1000000-0000-0000-0000-000000000001', 'Computer Science and Engineering', 'CSE', 'Department of Computer Science'),
    ('d1000000-0000-0000-0000-000000000002', 'Electronics & Communication', 'ECE', 'Department of ECE'),
    ('d1000000-0000-0000-0000-000000000003', 'Mechanical Engineering', 'MECH', 'Department of Mechanical Engineering'),
    ('d1000000-0000-0000-0000-000000000004', 'Civil & Campus Infrastructure', 'CIVIL', 'Department of Civil Engineering & Works'),
    ('d1000000-0000-0000-0000-000000000005', 'Campus Facilities & Maintenance', 'FAC', 'Estate office and maintenance services')
ON CONFLICT (code) DO NOTHING;

-- Seed Buildings for Erode Sengunthar Engineering College, Perundurai 638057
INSERT INTO public.buildings (id, name, code, description, facility_type, latitude, longitude)
VALUES
    ('b1000000-0000-0000-0000-000000000001', 'Main Academic & Admin Block', 'MB', 'Principal office, administrative departments, conference hall', 'administrative', 11.31345, 77.55015),
    ('b1000000-0000-0000-0000-000000000002', 'CSE, IT & MCA Computing Block', 'CSEB', 'Computer science, IT, AICTE IDEA lab, server rooms', 'academic', 11.31395, 77.55065),
    ('b1000000-0000-0000-0000-000000000003', 'Science & Humanities Block (First Year)', 'SHB', 'First year engineering classrooms, physics & chemistry labs', 'academic', 11.31320, 77.55075),
    ('b1000000-0000-0000-0000-000000000004', 'Central Library & Digital Commons', 'LIB', 'Reference stacks, digital journals, reading halls', 'library', 11.31365, 77.55095),
    ('b1000000-0000-0000-0000-000000000005', 'ECE & EIE Block', 'ECEB', 'VLSI design, embedded systems, instrumentation labs', 'academic', 11.31425, 77.55040),
    ('b1000000-0000-0000-0000-000000000006', 'Mechanical & Robotics Engineering Block', 'MECHB', 'CAD/CAM labs, CNC workshop, machine shop', 'laboratory', 11.31465, 77.55085),
    ('b1000000-0000-0000-0000-000000000007', 'Civil & Agricultural Engineering Block', 'CIVILB', 'Structural testing, soil mechanics, environmental lab', 'academic', 11.31445, 77.55135),
    ('b1000000-0000-0000-0000-000000000008', 'EEE & Chemical Engineering Block', 'EEEB', 'Power electronics, electric machines, chemical reaction lab', 'academic', 11.31405, 77.55125),
    ('b1000000-0000-0000-0000-000000000009', 'Student Canteen & Food Court', 'CAN', 'Multi-cuisine cafeteria, dining hall, coin redemption counter', 'cafeteria', 11.31385, 77.54980),
    ('b1000000-0000-0000-0000-000000000010', 'Convention Center & Auditorium', 'AUD', '1,500-seat central auditorium for seminars and cultural events', 'auditorium', 11.31305, 77.55050),
    ('b1000000-0000-0000-0000-000000000011', 'Sports Arena & Athletic Grounds', 'SPRT', 'Track, basketball court, badminton, fitness center', 'sports', 11.31505, 77.55015),
    ('b1000000-0000-0000-0000-000000000012', 'Diamond Hostel & Student Residences', 'HSTL', 'Student residential living quarters and recreation mess', 'residential', 11.31475, 77.54925)
ON CONFLICT (code) DO NOTHING;

-- Seed SLA Configs
INSERT INTO public.sla_configs (priority, target_response_hours, target_resolution_hours)
VALUES
    ('critical', 2, 24),
    ('high', 4, 48),
    ('medium', 12, 72),
    ('low', 24, 120)
ON CONFLICT (priority) DO UPDATE 
    SET target_response_hours = EXCLUDED.target_response_hours,
        target_resolution_hours = EXCLUDED.target_resolution_hours;

-- Seed Rewards
INSERT INTO public.rewards (id, name, description, coin_cost, stock, image_url, category)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Canteen Meal Coupon', 'Meal voucher worth ₹100 redeemable at the main campus cafeteria.', 100, 50, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60', 'Food & Dining'),
    ('c0000000-0000-0000-0000-000000000002', 'Library Printing Credits (50 Pages)', '50 pages of high-speed black & white printing in the central library.', 150, 100, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop&q=60', 'Academic'),
    ('c0000000-0000-0000-0000-000000000003', 'Event VIP Priority Pass', 'VIP front-row entry pass to any campus tech symposium or cultural fest.', 250, 20, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60', 'Events'),
    ('c0000000-0000-0000-0000-000000000004', 'Dean Civic Appreciation Certificate', 'Official certificate of appreciation recognizing civic campus contributions.', 300, NULL, 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=60', 'Recognition'),
    ('c0000000-0000-0000-0000-000000000005', 'CampusCoins Branded Hoodie', 'Exclusive CampusCoins branded high-quality cotton hoodie.', 500, 15, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60', 'Merchandise')
ON CONFLICT (id) DO NOTHING;

-- Seed Missions
INSERT INTO public.missions (id, title, description, reward_coins, requirement_count, event_type, mission_type, icon)
VALUES
    ('m0000000-0000-0000-0000-000000000001', 'Report Your First Issue', 'Submit a valid campus issue verified by administration.', 25, 1, 'complaint_verified', 'standard', 'Sparkles'),
    ('m0000000-0000-0000-0000-000000000002', 'Campus Guardian (3 Issues)', 'Contribute to 3 verified campus complaints or updates.', 50, 3, 'complaint_verified', 'standard', 'Shield'),
    ('m0000000-0000-0000-0000-000000000003', 'Evidence Expert', 'Attach clear, high-quality photographic evidence on 2 reports.', 30, 2, 'evidence_verified', 'standard', 'Camera'),
    ('m0000000-0000-0000-0000-000000000004', 'Resolution Inspector', 'Inspect and confirm an issue marked resolved by technicians.', 30, 1, 'resolution_verified', 'standard', 'CheckCircle2'),
    ('m0000000-0000-0000-0000-000000000005', '7-Day Civic Habit', 'Log verified campus improvement activity across 7 days.', 75, 7, 'daily_activity', 'weekly', 'Calendar')
ON CONFLICT (id) DO NOTHING;

-- Seed Badges
INSERT INTO public.badges (id, name, description, icon_url, criteria)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'First Report', 'Submit your first verified campus complaint.', 'Sparkles', 'verified_complaints >= 1'),
    ('b0000000-0000-0000-0000-000000000002', 'Evidence Expert', 'Provide useful photographic/video evidence 5 times.', 'Camera', 'useful_evidence >= 5'),
    ('b0000000-0000-0000-0000-000000000003', 'Campus Helper', 'Earn 500 total campus impact score.', 'ShieldCheck', 'impact_score >= 500'),
    ('b0000000-0000-0000-0000-000000000004', 'Problem Solver', 'Successfully verify 5 resolved campus complaints.', 'CheckCircle2', 'verified_resolutions >= 5'),
    ('b0000000-0000-0000-0000-000000000005', 'High Impact Hero', 'Contribute to 3 high-impact verified campus issues.', 'Flame', 'high_impact >= 3'),
    ('b0000000-0000-0000-0000-000000000006', 'Campus Pillar', 'Reach 1000 total campus impact score.', 'Trophy', 'impact_score >= 1000')
ON CONFLICT (id) DO NOTHING;

-- Seed Gamification Rules
INSERT INTO public.gamification_rules (id, category, config, is_active)
VALUES
    ('coin_rewards', 'rules', '{
        "VALID_COMPLAINT": 20,
        "USEFUL_EVIDENCE": 10,
        "HIGH_IMPACT_ISSUE": 30,
        "RESOLUTION_VERIFICATION": 30,
        "USEFUL_FOLLOW_UP": 10,
        "DUPLICATE_IDENTIFICATION": 15,
        "SPAM_PENALTY": -30,
        "FAKE_REPORT_PENALTY": -50
    }'::jsonb, TRUE)
ON CONFLICT (id) DO UPDATE SET config = EXCLUDED.config;
