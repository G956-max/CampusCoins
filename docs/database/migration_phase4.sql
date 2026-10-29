-- =====================================================================
-- CAMPUSCOINS - PHASE 4 DATABASE MIGRATION (INCREMENTAL ARCHIVE)
-- NOTE: The single CANONICAL cumulative migration script for CampusCoins is:
--       docs/database/migration_complete.sql
-- This file is maintained for historical versioning and aligns with canonical signatures.
-- =====================================================================

-- 1. EXTEND WALLETS TABLE
ALTER TABLE public.wallets 
    ADD COLUMN IF NOT EXISTS impact_score INTEGER DEFAULT 0 CHECK (impact_score >= 0),
    ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1 CHECK (level >= 1),
    ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0 CHECK (xp >= 0),
    ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0 CHECK (streak_count >= 0),
    ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ NULL;

-- 2. EXTEND COIN TRANSACTIONS TABLE
ALTER TABLE public.coin_transactions 
    ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'complaint_verified',
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Idempotency constraint: Same user cannot get rewarded for the exact same event and reference
CREATE UNIQUE INDEX IF NOT EXISTS uq_coin_transactions_event 
    ON public.coin_transactions (user_id, event_type, reference_id) 
    WHERE reference_id IS NOT NULL;

-- 3. EXTEND PROFILES FOR LEADERBOARD PRIVACY
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS leaderboard_visible BOOLEAN DEFAULT TRUE;

-- 4. EXTEND MISSIONS TABLE
ALTER TABLE public.missions 
    ADD COLUMN IF NOT EXISTS requirement_count INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'complaint_verified';

-- 5. GAMIFICATION RULES TABLE (Centralized Admin Config)
CREATE TABLE IF NOT EXISTS public.gamification_rules (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id)
);

-- 6. PERFORMANCE & QUERY INDEXES
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_created ON public.coin_transactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_event_type ON public.coin_transactions (event_type);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user ON public.reward_redemptions (user_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_status ON public.reward_redemptions (status);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges (user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_user ON public.user_missions (user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_impact ON public.wallets (impact_score DESC);

-- 7. ATOMIC FUNCTIONS (PostgreSQL RPC)

-- FUNCTION: award_coins_atomic
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
                'message', 'Reward has already been granted for this event.'
            );
        END IF;
    END IF;

    -- Ensure wallet exists (create if missing)
    INSERT INTO public.wallets (user_id, balance, lifetime_earned, lifetime_spent, impact_score, level, xp, streak_count, last_activity_at)
    VALUES (p_user_id, 0, 0, 0, 0, 1, 0, 0, NOW())
    ON CONFLICT (user_id) DO NOTHING;

    -- Lock and retrieve wallet
    SELECT * INTO v_wallet FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;

    -- Calculate new balances
    v_new_balance := v_wallet.balance + p_amount;
    IF v_new_balance < 0 THEN
        v_new_balance := 0; -- Floor at 0 for penalties
    END IF;

    IF p_amount > 0 THEN
        v_new_earned := v_wallet.lifetime_earned + p_amount;
        v_new_spent := v_wallet.lifetime_spent;
    ELSE
        v_new_earned := v_wallet.lifetime_earned;
        v_new_spent := v_wallet.lifetime_spent + ABS(p_amount);
    END IF;

    v_new_impact := GREATEST(0, v_wallet.impact_score + p_impact_points);
    v_new_xp := GREATEST(0, v_wallet.xp + p_xp_points);

    -- Level calculation: Level 1 (0), Level 2 (100), Level 3 (250), Level 4 (500), Level 5 (1000), Level 6 (2000)
    IF v_new_xp >= 2000 THEN
        v_new_level := 6;
    ELSIF v_new_xp >= 1000 THEN
        v_new_level := 5;
    ELSIF v_new_xp >= 500 THEN
        v_new_level := 4;
    ELSIF v_new_xp >= 250 THEN
        v_new_level := 3;
    ELSIF v_new_xp >= 100 THEN
        v_new_level := 2;
    ELSE
        v_new_level := 1;
    END IF;

    -- Update wallet
    UPDATE public.wallets
    SET balance = v_new_balance,
        lifetime_earned = v_new_earned,
        lifetime_spent = v_new_spent,
        impact_score = v_new_impact,
        xp = v_new_xp,
        level = v_new_level,
        last_activity_at = NOW()
    WHERE user_id = p_user_id;

    -- Insert immutable transaction ledger entry
    INSERT INTO public.coin_transactions (
        user_id,
        amount,
        transaction_type,
        event_type,
        reference_id,
        description,
        metadata,
        created_at
    )
    VALUES (
        p_user_id,
        p_amount,
        p_transaction_type,
        p_event_type,
        p_reference_id,
        p_description,
        p_metadata,
        NOW()
    )
    RETURNING id INTO v_tx_id;

    -- Audit log entry
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_data)
    VALUES (
        p_user_id,
        CASE WHEN p_amount >= 0 THEN 'COINS_AWARDED' ELSE 'COINS_DEDUCTED' END,
        'coin_transaction',
        v_tx_id,
        jsonb_build_object(
            'amount', p_amount,
            'event_type', p_event_type,
            'reference_id', p_reference_id,
            'new_balance', v_new_balance,
            'new_impact', v_new_impact,
            'new_level', v_new_level
        )
    );

    -- Notification
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
        p_user_id,
        CASE WHEN p_amount >= 0 THEN 'CampusCoins Earned!' ELSE 'Coins Deducted' END,
        p_description,
        'coins_awarded'
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

-- FUNCTION: redeem_reward_atomic
CREATE OR REPLACE FUNCTION public.redeem_reward_atomic(
    p_user_id UUID,
    p_reward_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_reward RECORD;
    v_wallet RECORD;
    v_redemption_id UUID;
    v_tx_id UUID;
BEGIN
    -- 1. Verify reward exists, active, and has stock
    SELECT * INTO v_reward FROM public.rewards WHERE id = p_reward_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'status_code', 404, 'message', 'Reward not found.');
    END IF;

    IF NOT v_reward.is_active THEN
        RETURN jsonb_build_object('success', false, 'status_code', 400, 'message', 'This reward is currently inactive.');
    END IF;

    IF v_reward.stock IS NOT NULL AND v_reward.stock <= 0 THEN
        RETURN jsonb_build_object('success', false, 'status_code', 400, 'message', 'Reward is currently out of stock.');
    END IF;

    -- 2. Verify student wallet and balance
    SELECT * INTO v_wallet FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;
    IF NOT FOUND OR v_wallet.balance < v_reward.coin_cost THEN
        RETURN jsonb_build_object('success', false, 'status_code', 400, 'message', 'Insufficient CampusCoins balance.');
    END IF;

    -- 3. Deduct stock if limited
    IF v_reward.stock IS NOT NULL THEN
        UPDATE public.rewards
        SET stock = stock - 1
        WHERE id = p_reward_id;
    END IF;

    -- 4. Deduct coins and update wallet
    UPDATE public.wallets
    SET balance = balance - v_reward.coin_cost,
        lifetime_spent = lifetime_spent + v_reward.coin_cost,
        last_activity_at = NOW()
    WHERE user_id = p_user_id;

    -- 5. Create redemption record
    INSERT INTO public.reward_redemptions (
        user_id,
        reward_id,
        coins_spent,
        status,
        created_at
    )
    VALUES (
        p_user_id,
        p_reward_id,
        v_reward.coin_cost,
        'pending',
        NOW()
    )
    RETURNING id INTO v_redemption_id;

    -- 6. Create coin transaction
    INSERT INTO public.coin_transactions (
        user_id,
        amount,
        transaction_type,
        event_type,
        reference_id,
        description,
        metadata,
        created_at
    )
    VALUES (
        p_user_id,
        -v_reward.coin_cost,
        'spent',
        'reward_redemption',
        v_redemption_id,
        'Redeemed: ' || v_reward.name,
        jsonb_build_object('reward_name', v_reward.name, 'redemption_id', v_redemption_id),
        NOW()
    )
    RETURNING id INTO v_tx_id;

    -- 7. Audit Log
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_data)
    VALUES (
        p_user_id,
        'REWARD_REDEEMED',
        'reward_redemption',
        v_redemption_id,
        jsonb_build_object('reward_id', p_reward_id, 'cost', v_reward.coin_cost)
    );

    -- 8. Notification
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
        p_user_id,
        'Reward Redeemed',
        'You have successfully requested ' || v_reward.name || ' for ' || v_reward.coin_cost || ' CampusCoins.',
        'reward_redeemed'
    );

    RETURN jsonb_build_object(
        'success', true,
        'redemption_id', v_redemption_id,
        'reward_name', v_reward.name,
        'coins_spent', v_reward.coin_cost,
        'new_balance', v_wallet.balance - v_reward.coin_cost
    );
END;
$$;

-- FUNCTION: cancel_redemption_and_refund_atomic
CREATE OR REPLACE FUNCTION public.cancel_redemption_and_refund_atomic(
    p_redemption_id UUID,
    p_admin_id UUID,
    p_reason TEXT DEFAULT 'Cancelled by Admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_redemption RECORD;
    v_reward RECORD;
    v_wallet RECORD;
    v_tx_id UUID;
BEGIN
    SELECT * INTO v_redemption FROM public.reward_redemptions WHERE id = p_redemption_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Redemption not found.');
    END IF;

    IF v_redemption.status = 'cancelled' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Redemption is already cancelled.');
    END IF;

    IF v_redemption.status = 'fulfilled' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Cannot cancel an already fulfilled redemption.');
    END IF;

    -- 1. Update redemption status to cancelled
    UPDATE public.reward_redemptions
    SET status = 'cancelled'
    WHERE id = p_redemption_id;

    -- 2. Restock reward if applicable
    SELECT * INTO v_reward FROM public.rewards WHERE id = v_redemption.reward_id FOR UPDATE;
    IF FOUND AND v_reward.stock IS NOT NULL THEN
        UPDATE public.rewards
        SET stock = stock + 1
        WHERE id = v_reward.id;
    END IF;

    -- 3. Refund coins to student wallet
    UPDATE public.wallets
    SET balance = balance + v_redemption.coins_spent,
        lifetime_spent = GREATEST(0, lifetime_spent - v_redemption.coins_spent),
        last_activity_at = NOW()
    WHERE user_id = v_redemption.user_id;

    -- 4. Insert refund coin transaction
    INSERT INTO public.coin_transactions (
        user_id,
        amount,
        transaction_type,
        event_type,
        reference_id,
        description,
        metadata,
        created_at
    )
    VALUES (
        v_redemption.user_id,
        v_redemption.coins_spent,
        'refund',
        'reward_cancellation_refund',
        p_redemption_id,
        'Refund for cancelled reward: ' || COALESCE(v_reward.name, 'Item') || ' (' || p_reason || ')',
        jsonb_build_object('redemption_id', p_redemption_id, 'reason', p_reason, 'cancelled_by', p_admin_id),
        NOW()
    )
    RETURNING id INTO v_tx_id;

    -- 5. Audit Log
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_data)
    VALUES (
        p_admin_id,
        'REWARD_CANCELLED',
        'reward_redemption',
        p_redemption_id,
        jsonb_build_object('student_id', v_redemption.user_id, 'refund_amount', v_redemption.coins_spent, 'reason', p_reason)
    );

    -- 6. Notification to student
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
        v_redemption.user_id,
        'Reward Cancelled & Coins Refunded',
        'Your redemption has been cancelled. ' || v_redemption.coins_spent || ' CampusCoins have been refunded to your wallet.',
        'reward_refunded'
    );

    RETURN jsonb_build_object(
        'success', true,
        'redemption_id', p_redemption_id,
        'refunded_amount', v_redemption.coins_spent
    );
END;
$$;

-- Explicitly revoke public execution of RPCs; grant only to trusted backend service_role
REVOKE EXECUTE ON FUNCTION public.award_coins_atomic(UUID, INTEGER, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.award_coins_atomic(UUID, INTEGER, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, JSONB) TO service_role;

REVOKE EXECUTE ON FUNCTION public.redeem_reward_atomic(UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_reward_atomic(UUID, UUID) TO service_role;

REVOKE EXECUTE ON FUNCTION public.cancel_redemption_and_refund_atomic(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_redemption_and_refund_atomic(UUID, UUID, TEXT) TO service_role;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_rules ENABLE ROW LEVEL SECURITY;

-- Wallets RLS
CREATE POLICY "Users can view own wallet"
    ON public.wallets FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Coin Transactions RLS
CREATE POLICY "Users can view own transactions"
    ON public.coin_transactions FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Rewards RLS
CREATE POLICY "Anyone authenticated can view active rewards"
    ON public.rewards FOR SELECT
    USING (is_active = TRUE OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can manage rewards"
    ON public.rewards FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Reward Redemptions RLS
CREATE POLICY "Users can view own redemptions"
    ON public.reward_redemptions FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can update redemptions"
    ON public.reward_redemptions FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Badges RLS
CREATE POLICY "All users can view badges catalog"
    ON public.badges FOR SELECT
    USING (TRUE);

CREATE POLICY "Users can view own user badges"
    ON public.user_badges FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Missions RLS
CREATE POLICY "All users can view active missions"
    ON public.missions FOR SELECT
    USING (is_active = TRUE OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view own user missions"
    ON public.user_missions FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Gamification Rules RLS
CREATE POLICY "All users can read gamification rules"
    ON public.gamification_rules FOR SELECT
    USING (TRUE);

CREATE POLICY "Admin can manage gamification rules"
    ON public.gamification_rules FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 9. SEED INITIAL DATA (REWARDS, BADGES, MISSIONS, RULES)

-- Seed Initial Rewards
INSERT INTO public.rewards (id, name, description, coin_cost, stock, image_url, is_active)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Canteen Coupon', 'Free meal voucher worth ₹100 at the main campus cafeteria.', 100, 50, '/images/rewards/canteen.svg', TRUE),
    ('c0000000-0000-0000-0000-000000000002', 'Printing Credits', '50 pages of high-speed black & white printing in the central library.', 150, 100, '/images/rewards/printing.svg', TRUE),
    ('c0000000-0000-0000-0000-000000000003', 'Event Priority Pass', 'VIP front-row entry pass to any campus tech symposium or cultural fest.', 250, 20, '/images/rewards/pass.svg', TRUE),
    ('c0000000-0000-0000-0000-000000000004', 'Campus Certificate', 'Official certificate of appreciation recognizing civic campus contributions.', 300, NULL, '/images/rewards/certificate.svg', TRUE),
    ('c0000000-0000-0000-0000-000000000005', 'College Merchandise', 'Exclusive CampusCoins branded high-quality hoodie or insulated mug.', 500, 15, '/images/rewards/merch.svg', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Badges
INSERT INTO public.badges (id, name, description, icon_url, criteria)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'First Report', 'Submit your first verified campus complaint.', 'Sparkles', 'verified_complaints >= 1'),
    ('b0000000-0000-0000-0000-000000000002', 'Evidence Expert', 'Provide useful photographic/video evidence 5 times.', 'Camera', 'useful_evidence >= 5'),
    ('b0000000-0000-0000-0000-000000000003', 'Campus Helper', 'Earn 500 total campus impact score.', 'ShieldCheck', 'impact_score >= 500'),
    ('b0000000-0000-0000-0000-000000000004', 'Problem Solver', 'Successfully verify 5 resolved campus complaints.', 'CheckCircle2', 'verified_resolutions >= 5'),
    ('b0000000-0000-0000-0000-000000000005', 'Consistency', 'Contribute verified campus actions on 7 different days.', 'Calendar', 'active_days >= 7'),
    ('b0000000-0000-0000-0000-000000000006', 'High Impact', 'Contribute to 3 high-impact verified campus issues.', 'Flame', 'high_impact >= 3'),
    ('b0000000-0000-0000-0000-000000000007', 'Community Contributor', 'Reach 1000 total campus impact score.', 'Trophy', 'impact_score >= 1000')
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Missions
INSERT INTO public.missions (id, title, description, reward_coins, requirement_count, event_type, is_active)
VALUES
    ('m0000000-0000-0000-0000-000000000001', 'Report Your First Issue', 'Submit a valid campus issue verified by administration.', 25, 1, 'complaint_verified', TRUE),
    ('m0000000-0000-0000-0000-000000000002', 'Help Improve 3 Issues', 'Contribute to 3 verified campus complaints or updates.', 50, 3, 'complaint_verified', TRUE),
    ('m0000000-0000-0000-0000-000000000003', 'Provide Useful Evidence', 'Attach clear, high-quality evidence verified on your reports.', 30, 2, 'evidence_verified', TRUE),
    ('m0000000-0000-0000-0000-000000000004', 'Verify a Resolution', 'Inspect and confirm an issue marked resolved by technicians.', 30, 1, 'resolution_verified', TRUE),
    ('m0000000-0000-0000-0000-000000000005', 'Contribute for 7 Days', 'Log verified campus improvement activity across 7 days.', 75, 7, 'daily_activity', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Seed Default Configurable Gamification Rules
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
    }'::jsonb, TRUE),
    ('level_tiers', 'levels', '[
        {"level": 1, "name": "Campus Observer", "min_xp": 0, "max_xp": 99},
        {"level": 2, "name": "Campus Contributor", "min_xp": 100, "max_xp": 249},
        {"level": 3, "name": "Campus Helper", "min_xp": 250, "max_xp": 499},
        {"level": 4, "name": "Campus Champion", "min_xp": 500, "max_xp": 999},
        {"level": 5, "name": "Campus Leader", "min_xp": 1000, "max_xp": 1999},
        {"level": 6, "name": "Campus Impact Maker", "min_xp": 2000, "max_xp": 999999}
    ]'::jsonb, TRUE)
ON CONFLICT (id) DO UPDATE SET config = EXCLUDED.config;
