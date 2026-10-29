const config = require('../config/env');
const { getSupabaseClient } = require('../config/supabase');
const logger = require('../utils/logger');
const { getCoinRules, getImpactRules } = require('../config/rewardRules');
const { calculateLevel, getLevelProgress } = require('./levelService');
const { logAudit } = require('./auditService');
const { createNotification } = require('./notificationService');

// In-memory repositories for local offline/testing fallback
const inMemoryWallets = new Map();
const inMemoryTransactions = [];

/**
 * Initialize default wallet object - Zero starting balance
 */
const createInitialWallet = (userId) => {
  return {
    id: `wallet-${userId}`,
    user_id: userId,
    balance: 0,
    lifetime_earned: 0,
    lifetime_spent: 0,
    impact_score: 0,
    level: 1,
    xp: 0,
    streak_count: 0,
    last_activity_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
};

/**
 * Fetch or initialize a user's wallet
 */
const getWallet = async (userId) => {
  if (!userId) throw new Error('User ID is required to get wallet');

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        logger.warn(`[WALLET] Supabase fetch notice: ${error.message}`);
      }

      if (data) {
        return {
          ...data,
          levelProgress: getLevelProgress(data.xp || 0),
        };
      }

      // If not found in Supabase, create it
      const newWallet = {
        user_id: userId,
        balance: 0,
        lifetime_earned: 0,
        lifetime_spent: 0,
        impact_score: 0,
        level: 1,
        xp: 0,
        streak_count: 0,
        last_activity_at: new Date().toISOString(),
      };
      const { data: created, error: createErr } = await supabase
        .from('wallets')
        .insert(newWallet)
        .select()
        .single();

      if (createErr) {
        logger.warn(`[WALLET] Supabase wallet creation notice: ${createErr.message}`);
      } else if (created) {
        return {
          ...created,
          levelProgress: getLevelProgress(created.xp || 0),
        };
      }
    } catch (err) {
      logger.warn(`[WALLET] Supabase fetch notice: ${err.message}`);
    }
  }

  // In-memory fallback (only used in offline dev or explicitly enabled mock dev environment)
  if (!inMemoryWallets.has(userId)) {
    inMemoryWallets.set(userId, createInitialWallet(userId));
  }
  const wallet = inMemoryWallets.get(userId);
  return {
    ...wallet,
    levelProgress: getLevelProgress(wallet.xp || 0),
  };
};

/**
 * Check whether an event has already been rewarded for a reference
 */
const hasEventBeenRewarded = async (userId, eventType, referenceId) => {
  if (!referenceId) return false;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('coin_transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('event_type', eventType)
        .eq('reference_id', referenceId)
        .maybeSingle();

      if (!error && data) return true;
    } catch (err) {
      logger.warn(`[COIN CHECK] Supabase check fallback: ${err.message}`);
    }
  }

  // In-memory check
  return inMemoryTransactions.some(
    (tx) =>
      tx.user_id === userId &&
      tx.event_type === eventType &&
      String(tx.reference_id) === String(referenceId)
  );
};

/**
 * Core Atomic Award Coins Function
 */
const awardCoins = async ({
  userId,
  amount,
  transactionType = 'earned',
  eventType = 'complaint_verified',
  referenceId = null,
  description = 'Coins awarded',
  metadata = {},
  impactPoints = 0,
  xpPoints = null,
}) => {
  if (!userId) throw new Error('User ID is required');
  if (typeof amount !== 'number' || isNaN(amount) || amount === 0) {
    throw new Error('Valid non-zero amount is required');
  }

  // Idempotency check
  if (referenceId) {
    const alreadyRewarded = await hasEventBeenRewarded(userId, eventType, referenceId);
    if (alreadyRewarded) {
      logger.info(`[COIN] Event ${eventType} already rewarded for ref ${referenceId}, skipping.`);
      return {
        success: false,
        alreadyRewarded: true,
        message: 'Reward has already been granted for this event.',
        amount: 0,
      };
    }
  }

  const earnedXP = xpPoints !== null ? xpPoints : Math.max(0, amount);
  const now = new Date().toISOString();

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      // Try atomic RPC if available
      const { data: rpcData, error: rpcError } = await supabase.rpc('award_coins_atomic', {
        p_user_id: userId,
        p_amount: amount,
        p_transaction_type: transactionType,
        p_event_type: eventType,
        p_reference_id: referenceId,
        p_description: description,
        p_impact_points: impactPoints,
        p_xp_points: earnedXP,
        p_metadata: metadata,
      });

      if (rpcError) {
        if (config.nodeEnv === 'production' || !config.allowDevMockAuth) {
          logger.error(`[COIN] Supabase RPC award_coins_atomic failed: ${rpcError.message}`);
          const err = new Error(rpcError.message || 'Database error processing coin reward');
          err.statusCode = 500;
          throw err;
        }
        logger.warn(`[COIN] RPC fallback in dev mode: ${rpcError?.message || 'not present'}`);
      } else if (rpcData) {
        return rpcData;
      }
    } catch (err) {
      if (config.nodeEnv === 'production' || !config.allowDevMockAuth) {
        throw err;
      }
      logger.warn(`[COIN] Supabase RPC error: ${err.message}`);
    }
  }

  // In-memory atomic fallback
  const currentWallet = await getWallet(userId);
  const newBalance = Math.max(0, currentWallet.balance + amount);
  const newEarned = amount > 0 ? currentWallet.lifetime_earned + amount : currentWallet.lifetime_earned;
  const newSpent = amount < 0 ? currentWallet.lifetime_spent + Math.abs(amount) : currentWallet.lifetime_spent;
  const newImpact = Math.max(0, currentWallet.impact_score + impactPoints);
  const newXP = Math.max(0, currentWallet.xp + earnedXP);
  const newLevel = calculateLevel(newXP);

  const updatedWallet = {
    ...currentWallet,
    balance: newBalance,
    lifetime_earned: newEarned,
    lifetime_spent: newSpent,
    impact_score: newImpact,
    xp: newXP,
    level: newLevel,
    last_activity_at: now,
  };
  inMemoryWallets.set(userId, updatedWallet);

  const transactionRecord = {
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    user_id: userId,
    amount,
    transaction_type: transactionType,
    event_type: eventType,
    reference_id: referenceId,
    description,
    metadata,
    created_at: now,
  };
  inMemoryTransactions.unshift(transactionRecord);

  // Notifications & Audit Logs
  await logAudit({
    userId,
    action: amount >= 0 ? 'COINS_AWARDED' : 'COINS_DEDUCTED',
    entityType: 'coin_transaction',
    entityId: transactionRecord.id,
    newData: {
      amount,
      event_type: eventType,
      reference_id: referenceId,
      new_balance: newBalance,
      new_impact: newImpact,
      new_level: newLevel,
    },
  });

  await createNotification({
    userId,
    title: amount >= 0 ? `🪙 +${amount} CampusCoins!` : `🪙 ${amount} CampusCoins`,
    message: description,
    type: amount >= 0 ? 'coins_earned' : 'coins_deducted',
  });

  return {
    success: true,
    transaction_id: transactionRecord.id,
    balance: newBalance,
    impact_score: newImpact,
    xp: newXP,
    level: newLevel,
    amount,
  };
};

/**
 * Deduct coins atomically (e.g. store purchase)
 */
const deductCoins = async ({
  userId,
  amount,
  transactionType = 'spent',
  eventType = 'reward_redemption',
  referenceId = null,
  description = 'Coins spent',
  metadata = {},
}) => {
  if (amount <= 0) throw new Error('Deduction amount must be positive');
  const wallet = await getWallet(userId);
  if (wallet.balance < amount) {
    return {
      success: false,
      message: 'Insufficient CampusCoins balance',
      statusCode: 400,
    };
  }

  return await awardCoins({
    userId,
    amount: -amount,
    transactionType,
    eventType,
    referenceId,
    description,
    metadata,
    impactPoints: 0,
    xpPoints: 0,
  });
};

/**
 * Refund coins atomically
 */
const refundCoins = async ({
  userId,
  amount,
  referenceId = null,
  description = 'Coins refunded',
  metadata = {},
}) => {
  if (amount <= 0) throw new Error('Refund amount must be positive');
  return await awardCoins({
    userId,
    amount,
    transactionType: 'refund',
    eventType: 'refund',
    referenceId,
    description,
    metadata,
    impactPoints: 0,
    xpPoints: 0,
  });
};

/**
 * Get paginated and filtered coin transactions
 */
const getTransactions = async (userId, { page = 1, limit = 20, type, eventType, search } = {}) => {
  if (!userId) throw new Error('User ID is required');

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      let query = supabase
        .from('coin_transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (type && type !== 'all') {
        query = query.eq('transaction_type', type);
      }
      if (eventType) {
        query = query.eq('event_type', eventType);
      }
      if (search) {
        query = query.ilike('description', `%${search}%`);
      }

      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, count, error } = await query;
      if (!error && data) {
        return {
          transactions: data,
          total: count || data.length,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil((count || data.length) / limit),
        };
      }
    } catch (err) {
      logger.warn(`[TRANSACTIONS] Supabase query fallback: ${err.message}`);
    }
  }

  // In-memory filtering
  let filtered = inMemoryTransactions.filter((tx) => tx.user_id === userId);
  if (type && type !== 'all') {
    filtered = filtered.filter((tx) => tx.transaction_type === type);
  }
  if (eventType) {
    filtered = filtered.filter((tx) => tx.event_type === eventType);
  }
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter((tx) => (tx.description || '').toLowerCase().includes(s));
  }

  const total = filtered.length;
  const offset = (page - 1) * limit;
  const paginated = filtered.slice(offset, offset + limit);

  return {
    transactions: paginated,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit) || 1,
  };
};

// ==========================================
// COMPLAINT LIFECYCLE REWARD HOOKS
// ==========================================

/**
 * 1. Complaint Verified Reward (+20 coins)
 */
const processComplaintVerifiedReward = async (complaint, adminUser) => {
  const targetUserId = complaint?.user_id || complaint?.student_id;
  if (!complaint || !targetUserId) return null;
  const rules = getCoinRules();
  const impactRules = getImpactRules();
  const amount = rules.VALID_COMPLAINT || 20;
  const impactPoints = impactRules.VALID_COMPLAINT || 20;

  return await awardCoins({
    userId: targetUserId,
    amount,
    transactionType: 'earned',
    eventType: 'complaint_verified',
    referenceId: complaint.id,
    description: `Verified Complaint: "${complaint.title || 'Campus Issue'}"`,
    metadata: {
      complaint_id: complaint.id,
      verified_by: adminUser?.id || 'admin',
    },
    impactPoints,
  });
};

/**
 * 2. Useful Evidence Verified Reward (+10 coins)
 */
const processEvidenceVerifiedReward = async (complaint, evidenceId, adminUser) => {
  const targetUserId = complaint?.user_id || complaint?.student_id;
  if (!complaint || !targetUserId) return null;
  const rules = getCoinRules();
  const impactRules = getImpactRules();
  const amount = rules.USEFUL_EVIDENCE || 10;
  const impactPoints = impactRules.USEFUL_EVIDENCE || 10;

  return await awardCoins({
    userId: targetUserId,
    amount,
    transactionType: 'earned',
    eventType: 'evidence_verified',
    referenceId: evidenceId || `${complaint.id}-evidence`,
    description: `Useful Evidence Verified for: "${complaint.title || 'Campus Issue'}"`,
    metadata: {
      complaint_id: complaint.id,
      evidence_id: evidenceId,
      verified_by: adminUser?.id || 'admin',
    },
    impactPoints,
  });
};

/**
 * 3. High Impact Issue Reward (+30 coins)
 */
const processHighImpactReward = async (complaint, adminUser) => {
  const targetUserId = complaint?.user_id || complaint?.student_id;
  if (!complaint || !targetUserId) return null;
  const rules = getCoinRules();
  const impactRules = getImpactRules();
  const amount = rules.HIGH_IMPACT_ISSUE || 30;
  const impactPoints = impactRules.HIGH_IMPACT_ISSUE || 30;

  return await awardCoins({
    userId: targetUserId,
    amount,
    transactionType: 'earned',
    eventType: 'high_impact',
    referenceId: `${complaint.id}-high-impact`,
    description: `High Impact Campus Issue Tagged: "${complaint.title || 'Campus Issue'}"`,
    metadata: {
      complaint_id: complaint.id,
      tagged_by: adminUser?.id || 'admin',
    },
    impactPoints,
  });
};

/**
 * 4. Resolution Verified by Student Reward (+30 coins)
 */
const processResolutionVerifiedReward = async (complaint, studentUser) => {
  const targetUserId = complaint?.user_id || complaint?.student_id;
  if (!complaint || !targetUserId) return null;
  const rules = getCoinRules();
  const impactRules = getImpactRules();
  const amount = rules.RESOLUTION_VERIFICATION || 30;
  const impactPoints = impactRules.RESOLUTION_VERIFICATION || 30;

  return await awardCoins({
    userId: targetUserId,
    amount,
    transactionType: 'earned',
    eventType: 'resolution_verified',
    referenceId: `${complaint.id}-resolution-verified`,
    description: `Resolution Verified: "${complaint.title || 'Campus Issue'}"`,
    metadata: {
      complaint_id: complaint.id,
      verified_by: studentUser?.id || targetUserId,
    },
    impactPoints,
  });
};

/**
 * 5. Useful Follow-up Reward (+10 coins)
 */
const processFollowUpReward = async (complaint, updateId, studentUser) => {
  const targetUserId = complaint?.user_id || complaint?.student_id;
  if (!complaint || !targetUserId) return null;
  const rules = getCoinRules();
  const impactRules = getImpactRules();
  const amount = rules.USEFUL_FOLLOW_UP || 10;
  const impactPoints = impactRules.USEFUL_FOLLOW_UP || 10;

  return await awardCoins({
    userId: targetUserId,
    amount,
    transactionType: 'earned',
    eventType: 'follow_up',
    referenceId: updateId || `${complaint.id}-update-${Date.now()}`,
    description: `Constructive Follow-up: "${complaint.title || 'Campus Issue'}"`,
    metadata: {
      complaint_id: complaint.id,
      update_id: updateId,
    },
    impactPoints,
  });
};

/**
 * 6. Duplicate Identification Reward (+15 coins)
 */
const processDuplicateReward = async (complaint, studentUser) => {
  const targetUserId = studentUser?.id || complaint?.user_id || complaint?.student_id;
  if (!complaint || !targetUserId) return null;
  const rules = getCoinRules();
  const impactRules = getImpactRules();
  const amount = rules.DUPLICATE_IDENTIFICATION || 15;
  const impactPoints = impactRules.DUPLICATE_IDENTIFICATION || 15;

  return await awardCoins({
    userId: targetUserId,
    amount,
    transactionType: 'earned',
    eventType: 'duplicate_identified',
    referenceId: `${complaint.id}-duplicate`,
    description: `Helpful Duplicate Identification: "${complaint.title || 'Campus Issue'}"`,
    metadata: {
      complaint_id: complaint.id,
    },
    impactPoints,
  });
};

/**
 * 7. Spam Penalty (-30 coins)
 */
const processSpamPenalty = async (complaint, adminUser) => {
  const targetUserId = complaint?.user_id || complaint?.student_id;
  if (!complaint || !targetUserId) return null;
  const rules = getCoinRules();
  const impactRules = getImpactRules();
  const amount = Math.abs(rules.SPAM_PENALTY || 30);
  const impactPenalty = Math.abs(impactRules.SPAM_PENALTY || 30);

  return await awardCoins({
    userId: targetUserId,
    amount: -amount,
    transactionType: 'penalty',
    eventType: 'spam_penalty',
    referenceId: `${complaint.id}-spam`,
    description: `Spam Penalty for Complaint: "${complaint.title || 'Campus Issue'}"`,
    metadata: {
      complaint_id: complaint.id,
      penalized_by: adminUser?.id || 'admin',
    },
    impactPoints: -impactPenalty,
    xpPoints: 0,
  });
};

/**
 * 8. Fake Report Penalty (-50 coins)
 */
const processFakeReportPenalty = async (complaint, adminUser) => {
  const targetUserId = complaint?.user_id || complaint?.student_id;
  if (!complaint || !targetUserId) return null;
  const rules = getCoinRules();
  const impactRules = getImpactRules();
  const amount = Math.abs(rules.FAKE_REPORT_PENALTY || 50);
  const impactPenalty = Math.abs(impactRules.FAKE_REPORT_PENALTY || 50);

  return await awardCoins({
    userId: targetUserId,
    amount: -amount,
    transactionType: 'penalty',
    eventType: 'fake_report_penalty',
    referenceId: `${complaint.id}-fake-report`,
    description: `Fake Report Penalty for Complaint: "${complaint.title || 'Campus Issue'}"`,
    metadata: {
      complaint_id: complaint.id,
      penalized_by: adminUser?.id || 'admin',
    },
    impactPoints: -impactPenalty,
    xpPoints: 0,
  });
};

module.exports = {
  getWallet,
  awardCoins,
  deductCoins,
  refundCoins,
  getTransactions,
  hasEventBeenRewarded,
  processComplaintVerifiedReward,
  processEvidenceVerifiedReward,
  processHighImpactReward,
  processResolutionVerifiedReward,
  processFollowUpReward,
  processDuplicateReward,
  processSpamPenalty,
  processFakeReportPenalty,
  inMemoryWallets,
  inMemoryTransactions,
};
