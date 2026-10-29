const crypto = require('crypto');
const config = require('../config/env');
const { getSupabaseClient } = require('../config/supabase');
const logger = require('../utils/logger');
const { deductCoins, refundCoins, getWallet } = require('./coinService');
const { logAudit } = require('./auditService');
const { createNotification } = require('./notificationService');

// Initial seed catalog for in-memory fallback
const initialRewards = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Canteen Meal Coupon',
    description: 'Free meal voucher worth ₹100 redeemable at the main campus cafeteria.',
    coin_cost: 100,
    stock: 50,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60',
    category: 'Food & Dining',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    name: 'Library Printing Credits (50 Pages)',
    description: '50 pages of high-speed black & white printing in the central library.',
    coin_cost: 150,
    stock: 100,
    image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop&q=60',
    category: 'Academic',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    name: 'Event VIP Priority Pass',
    description: 'VIP front-row entry pass to any campus tech symposium or cultural fest.',
    coin_cost: 250,
    stock: 20,
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60',
    category: 'Events',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    name: 'Dean Civic Appreciation Certificate',
    description: 'Official certificate of appreciation recognizing civic campus contributions.',
    coin_cost: 300,
    stock: 999,
    image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=60',
    category: 'Recognition',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    name: 'CampusCoins Branded Hoodie',
    description: 'Exclusive CampusCoins branded high-quality cotton hoodie.',
    coin_cost: 500,
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60',
    category: 'Merchandise',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const inMemoryRewards = new Map(initialRewards.map((r) => [r.id, { ...r }]));
const inMemoryRedemptions = [];

/**
 * Generate a cryptographically secure, human-readable single-use voucher code
 * Example: VCH-8F2A-3D91-E04C
 */
const generateVoucherCode = () => {
  const bytes = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `VCH-${bytes.substring(0, 4)}-${bytes.substring(4, 8)}-${bytes.substring(8, 12)}`;
};

/**
 * Get active rewards for students
 */
const getAvailableRewards = async () => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .order('coin_cost', { ascending: true });

      if (!error && data && data.length > 0) return data;
    } catch (err) {
      logger.warn(`[REWARDS] Supabase fallback: ${err.message}`);
    }
  }

  return Array.from(inMemoryRewards.values())
    .filter((r) => r.is_active)
    .sort((a, b) => a.coin_cost - b.coin_cost);
};

/**
 * Get all rewards for admin
 */
const getAllRewardsAdmin = async () => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) return data;
    } catch (err) {
      logger.warn(`[REWARDS ADMIN] Supabase fallback: ${err.message}`);
    }
  }

  return Array.from(inMemoryRewards.values());
};

/**
 * Create a new reward
 */
const createReward = async ({ name, description, coin_cost, stock, image_url, category = 'General', is_active = true }) => {
  if (!name || !coin_cost || coin_cost <= 0) {
    throw new Error('Reward name and positive coin cost are required');
  }

  const newReward = {
    id: `reward-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name,
    description: description || '',
    coin_cost: Number(coin_cost),
    stock: stock !== null && stock !== undefined && stock !== '' ? Number(stock) : null,
    image_url: image_url || null,
    category,
    is_active: Boolean(is_active),
    created_at: new Date().toISOString(),
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('rewards').insert(newReward).select().single();
      if (!error && data) return data;
    } catch (err) {
      logger.warn(`[REWARD CREATE] Supabase fallback: ${err.message}`);
    }
  }

  inMemoryRewards.set(newReward.id, newReward);
  return newReward;
};

/**
 * Update an existing reward
 */
const updateReward = async (rewardId, updates) => {
  const reward = inMemoryRewards.get(rewardId);
  if (!reward) throw new Error('Reward not found');

  const updated = {
    ...reward,
    ...updates,
    coin_cost: updates.coin_cost !== undefined ? Number(updates.coin_cost) : reward.coin_cost,
    stock: updates.stock !== undefined ? (updates.stock === null ? null : Number(updates.stock)) : reward.stock,
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .update(updates)
        .eq('id', rewardId)
        .select()
        .single();
      if (!error && data) return data;
    } catch (err) {
      logger.warn(`[REWARD UPDATE] Supabase fallback: ${err.message}`);
    }
  }

  inMemoryRewards.set(rewardId, updated);
  return updated;
};

/**
 * Delete a reward
 */
const deleteReward = async (rewardId) => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('rewards').delete().eq('id', rewardId);
    } catch (err) {
      logger.warn(`[REWARD DELETE] Supabase fallback: ${err.message}`);
    }
  }

  inMemoryRewards.delete(rewardId);
  return { success: true };
};

/**
 * Atomically redeem a reward for a student
 * Generates single-use QR voucher code with strict expiry and auditability.
 */
const redeemReward = async (userId, rewardId) => {
  if (!userId || !rewardId) throw new Error('User ID and Reward ID are required');

  const supabase = getSupabaseClient();
  let reward = null;

  // Check Supabase first
  if (supabase) {
    try {
      const { data } = await supabase.from('rewards').select('*').eq('id', rewardId).maybeSingle();
      if (data) reward = data;
    } catch (err) {
      logger.warn(`[REWARD FETCH] ${err.message}`);
    }
  }

  if (!reward) reward = inMemoryRewards.get(rewardId);

  if (!reward) {
    const error = new Error('Reward not found');
    error.statusCode = 404;
    throw error;
  }

  if (!reward.is_active) {
    const error = new Error('Reward is currently inactive');
    error.statusCode = 400;
    throw error;
  }

  if (reward.stock !== null && reward.stock <= 0) {
    const error = new Error('Reward is currently out of stock');
    error.statusCode = 400;
    throw error;
  }

  const wallet = await getWallet(userId);
  if (wallet.balance < reward.coin_cost) {
    const error = new Error(`Insufficient CampusCoins. Required: ${reward.coin_cost}, Current balance: ${wallet.balance}`);
    error.statusCode = 400;
    throw error;
  }

  const voucherCode = generateVoucherCode();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days validity
  const redemptionId = `redempt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // 1. Try atomic Supabase RPC if configured
  if (supabase) {
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('redeem_reward_atomic', {
        p_user_id: userId,
        p_reward_id: reward.id,
        p_voucher_code: voucherCode,
        p_expires_at: expiresAt,
      });

      if (rpcError) {
        if (config.nodeEnv === 'production' || !config.allowDevMockAuth) {
          logger.error(`[REDEEM RPC] Supabase execution failed: ${rpcError.message}`);
          const err = new Error(rpcError.message || 'Database error during reward redemption');
          err.statusCode = 500;
          throw err;
        }
        logger.warn(`[REDEEM RPC] Fallback: ${rpcError.message}`);
      } else if (rpcData) {
        if (!rpcData.success) {
          const err = new Error(rpcData.message || 'Redemption failed');
          err.statusCode = rpcData.status_code || 400;
          throw err;
        }
        return {
          success: true,
          redemption: {
            id: rpcData.redemption_id,
            voucher_code: voucherCode,
            user_id: userId,
            reward_id: reward.id,
            reward_name: reward.name,
            coins_spent: reward.coin_cost,
            status: 'pending',
            expires_at: expiresAt,
            created_at: new Date().toISOString(),
            reward,
          },
          newBalance: rpcData.new_balance,
        };
      }
    } catch (err) {
      if (err.statusCode || config.nodeEnv === 'production' || !config.allowDevMockAuth) {
        throw err;
      }
      logger.warn(`[REDEEM RPC] Fallback: ${err.message}`);
    }
  }

  // 2. Verified Atomic Fallback (Dev/Offline only)
  if (config.nodeEnv === 'production' || (!config.allowDevMockAuth && supabase)) {
    const err = new Error('Database redemption failed in production mode');
    err.statusCode = 500;
    throw err;
  }

  const deductionResult = await deductCoins({
    userId,
    amount: reward.coin_cost,
    transactionType: 'spent',
    eventType: 'reward_redemption',
    referenceId: redemptionId,
    description: `Redeemed Reward: "${reward.name}" (Code: ${voucherCode})`,
    metadata: {
      reward_id: reward.id,
      reward_name: reward.name,
      voucher_code: voucherCode,
      redemption_id: redemptionId,
    },
  });

  if (!deductionResult.success) {
    const error = new Error(deductionResult.message || 'Redemption transaction failed');
    error.statusCode = deductionResult.statusCode || 400;
    throw error;
  }

  let redemptionRecord = null;
  try {
    // Decrement stock atomically
    if (reward.stock !== null) {
      reward.stock = Math.max(0, reward.stock - 1);
      inMemoryRewards.set(reward.id, reward);
    }

    redemptionRecord = {
      id: redemptionId,
      voucher_code: voucherCode,
      user_id: userId,
      reward_id: reward.id,
      reward_name: reward.name,
      coins_spent: reward.coin_cost,
      status: 'pending',
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
      reward: {
        id: reward.id,
        name: reward.name,
        image_url: reward.image_url,
        description: reward.description,
        coin_cost: reward.coin_cost,
      },
    };

    inMemoryRedemptions.unshift(redemptionRecord);
  } catch (creationErr) {
    logger.error(`[REDEEM FALLBACK] Error after deduction, refunding coins: ${creationErr.message}`);
    await refundCoins({
      userId,
      amount: reward.coin_cost,
      referenceId: redemptionId,
      description: `Rollback: Failed redemption for "${reward.name}"`,
    });
    throw creationErr;
  }

  await logAudit({
    userId,
    action: 'REWARD_REDEEMED',
    entityType: 'reward_redemption',
    entityId: redemptionId,
    newData: { rewardId: reward.id, rewardName: reward.name, voucherCode, coinsSpent: reward.coin_cost },
  });

  await createNotification({
    userId,
    title: `🎁 Voucher Ready: ${reward.name}`,
    message: `Your voucher code is ${voucherCode}. Present it to staff before ${new Date(expiresAt).toLocaleDateString()}.`,
    type: 'reward_redeemed',
    referenceId: redemptionId,
  });

  return {
    success: true,
    redemption: redemptionRecord,
    newBalance: deductionResult.balance,
  };
};

/**
 * Verify & Fulfill a QR voucher code by authorized Staff / Admin
 * Prevents reuse, expiry bypass, and unauthorized verification.
 */
const verifyVoucherCode = async (voucherCode, verifierUser) => {
  if (!voucherCode || typeof voucherCode !== 'string') {
    const error = new Error('Valid voucher code is required');
    error.statusCode = 400;
    throw error;
  }

  const cleanCode = voucherCode.trim().toUpperCase();
  const supabase = getSupabaseClient();
  let redemption = null;

  // 1. Search in Supabase if connected
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('reward_redemptions')
        .select('*, rewards(*), profiles!user_id(id, full_name, email, student_id)')
        .eq('voucher_code', cleanCode)
        .maybeSingle();

      if (!error && data) redemption = data;
    } catch (err) {
      logger.warn(`[VERIFY VOUCHER] Supabase fetch: ${err.message}`);
    }
  }

  // 2. Search in memory
  if (!redemption) {
    redemption = inMemoryRedemptions.find((r) => r.voucher_code === cleanCode);
  }

  if (!redemption) {
    const error = new Error(`Voucher code "${cleanCode}" was not found or is invalid.`);
    error.statusCode = 404;
    throw error;
  }

  // Check already fulfilled
  if (redemption.status === 'fulfilled') {
    const error = new Error(
      `Voucher already redeemed on ${new Date(redemption.verified_at || redemption.updated_at || Date.now()).toLocaleString()}. Single-use vouchers cannot be reused.`
    );
    error.statusCode = 400;
    throw error;
  }

  // Check cancelled
  if (redemption.status === 'cancelled') {
    const error = new Error('This voucher was previously cancelled and the coins were refunded.');
    error.statusCode = 400;
    throw error;
  }

  // Check expired
  if (redemption.expires_at && new Date() > new Date(redemption.expires_at)) {
    redemption.status = 'expired';
    const error = new Error(`Voucher expired on ${new Date(redemption.expires_at).toLocaleDateString()}.`);
    error.statusCode = 400;
    throw error;
  }

  // Check status is strictly pending
  if (redemption.status !== 'pending') {
    const error = new Error(`Voucher cannot be fulfilled. Current status: ${redemption.status}`);
    error.statusCode = 400;
    throw error;
  }

  // Valid voucher -> Mark fulfilled atomically
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const { data: updatedRows, error: updateErr } = await supabase
        .from('reward_redemptions')
        .update({
          status: 'fulfilled',
          verified_at: now,
          verified_by: verifierUser.id,
        })
        .eq('id', redemption.id)
        .eq('status', 'pending')
        .select();

      if (updateErr) {
        if (config.nodeEnv === 'production' || !config.allowDevMockAuth) {
          logger.error(`[VERIFY UPDATE] Supabase error in production: ${updateErr.message}`);
          throw updateErr;
        }
      } else if (!updatedRows || updatedRows.length === 0) {
        const error = new Error('Voucher has already been fulfilled or is no longer pending.');
        error.statusCode = 400;
        throw error;
      }
    } catch (err) {
      if (err.statusCode || config.nodeEnv === 'production' || !config.allowDevMockAuth) {
        throw err;
      }
      logger.warn(`[VERIFY UPDATE] Supabase error: ${err.message}`);
    }
  }

  redemption.status = 'fulfilled';
  redemption.verified_at = now;
  redemption.verified_by = verifierUser.id;
  redemption.verified_by_name = verifierUser.full_name || verifierUser.email;

  await logAudit({
    userId: verifierUser.id,
    action: 'VOUCHER_VERIFIED',
    entityType: 'reward_redemption',
    entityId: redemption.id,
    newData: {
      voucherCode: cleanCode,
      studentId: redemption.user_id,
      rewardName: redemption.reward_name || redemption.rewards?.name,
    },
  });

  await createNotification({
    userId: redemption.user_id,
    title: '🎉 Voucher Successfully Verified',
    message: `Your voucher for ${redemption.reward_name || redemption.rewards?.name} has been verified and fulfilled by campus staff.`,
    type: 'reward_fulfilled',
    referenceId: redemption.id,
  });

  return {
    success: true,
    message: 'Voucher verified successfully. Benefit fulfilled.',
    redemption,
  };
};

/**
 * Get redemption history for a student
 */
const getUserRedemptions = async (userId) => {
  if (!userId) throw new Error('User ID is required');

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('reward_redemptions')
        .select('*, rewards(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) return data;
    } catch (err) {
      logger.warn(`[USER REDEMPTIONS] Supabase fallback: ${err.message}`);
    }
  }

  return inMemoryRedemptions.filter((r) => r.user_id === userId);
};

/**
 * Get all redemptions for admin
 */
const getAllRedemptionsAdmin = async ({ status } = {}) => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      let query = supabase
        .from('reward_redemptions')
        .select('*, rewards(*), profiles(id, full_name, email)')
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) return data;
    } catch (err) {
      logger.warn(`[ALL REDEMPTIONS] Supabase fallback: ${err.message}`);
    }
  }

  let list = inMemoryRedemptions;
  if (status && status !== 'all') {
    list = list.filter((r) => r.status === status);
  }
  return list;
};

/**
 * Admin: Approve a redemption
 */
const approveRedemption = async (redemptionId, adminUser) => {
  const redemption = inMemoryRedemptions.find((r) => r.id === redemptionId);
  if (!redemption) throw new Error('Redemption not found');

  redemption.status = 'approved';
  redemption.approved_at = new Date().toISOString();
  redemption.approved_by = adminUser?.id;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from('reward_redemptions')
        .update({ status: 'approved' })
        .eq('id', redemptionId);
    } catch (err) {
      logger.warn(`[APPROVE REDEMPTION] Supabase fallback: ${err.message}`);
    }
  }

  await logAudit({
    userId: adminUser?.id || 'admin',
    action: 'REWARD_APPROVED',
    entityType: 'reward_redemption',
    entityId: redemptionId,
    newData: { redemptionId },
  });

  await createNotification({
    userId: redemption.user_id,
    title: `✅ Reward Approved: ${redemption.reward_name}`,
    message: 'Your redemption has been approved by admin! Prepare for collection.',
    type: 'reward_approved',
  });

  return redemption;
};

/**
 * Admin: Mark redemption as fulfilled
 */
const fulfillRedemption = async (redemptionId, adminUser) => {
  const redemption = inMemoryRedemptions.find((r) => r.id === redemptionId);
  if (!redemption) throw new Error('Redemption not found');

  redemption.status = 'fulfilled';
  redemption.fulfilled_at = new Date().toISOString();
  redemption.fulfilled_by = adminUser?.id;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from('reward_redemptions')
        .update({ status: 'fulfilled' })
        .eq('id', redemptionId);
    } catch (err) {
      logger.warn(`[FULFILL REDEMPTION] Supabase fallback: ${err.message}`);
    }
  }

  await logAudit({
    userId: adminUser?.id || 'admin',
    action: 'REWARD_FULFILLED',
    entityType: 'reward_redemption',
    entityId: redemptionId,
    newData: { redemptionId },
  });

  await createNotification({
    userId: redemption.user_id,
    title: `🎉 Reward Delivered: ${redemption.reward_name}`,
    message: 'Your reward has been marked as fulfilled. Enjoy your benefit!',
    type: 'reward_fulfilled',
  });

  return redemption;
};

/**
 * Admin: Cancel redemption and automatically refund coins
 */
const cancelRedemption = async (redemptionId, adminUser, reason = 'Cancelled by Administrator') => {
  const redemption = inMemoryRedemptions.find((r) => r.id === redemptionId);
  if (!redemption) throw new Error('Redemption not found');

  if (redemption.status === 'cancelled') {
    throw new Error('Redemption is already cancelled');
  }
  if (redemption.status === 'fulfilled') {
    throw new Error('Cannot cancel an already fulfilled redemption');
  }

  redemption.status = 'cancelled';
  redemption.cancelled_at = new Date().toISOString();
  redemption.cancellation_reason = reason;

  // Restock reward
  const reward = inMemoryRewards.get(redemption.reward_id);
  if (reward && reward.stock !== null) {
    reward.stock += 1;
    inMemoryRewards.set(reward.id, reward);
  }

  // Refund coins atomically
  const refundResult = await refundCoins({
    userId: redemption.user_id,
    amount: redemption.coins_spent,
    referenceId: redemptionId,
    description: `Refund for Cancelled Redemption: "${redemption.reward_name}"`,
    metadata: {
      redemption_id: redemptionId,
      reason,
      cancelled_by: adminUser?.id,
    },
  });

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from('reward_redemptions')
        .update({ status: 'cancelled' })
        .eq('id', redemptionId);
      if (reward && reward.stock !== null) {
        await supabase.from('rewards').update({ stock: reward.stock }).eq('id', reward.id);
      }
    } catch (err) {
      logger.warn(`[CANCEL REDEMPTION] Supabase fallback: ${err.message}`);
    }
  }

  await logAudit({
    userId: adminUser?.id || 'admin',
    action: 'REWARD_CANCELLED',
    entityType: 'reward_redemption',
    entityId: redemptionId,
    newData: { redemptionId, refundAmount: redemption.coins_spent, reason },
  });

  await createNotification({
    userId: redemption.user_id,
    title: `↩️ Reward Cancelled & Refunded`,
    message: `${redemption.coins_spent} CampusCoins have been refunded to your wallet. Reason: ${reason}`,
    type: 'reward_cancelled',
  });

  return {
    success: true,
    redemption,
    refundResult,
  };
};

module.exports = {
  getAvailableRewards,
  getAllRewardsAdmin,
  createReward,
  updateReward,
  deleteReward,
  redeemReward,
  verifyVoucherCode,
  getUserRedemptions,
  getAllRedemptionsAdmin,
  approveRedemption,
  fulfillRedemption,
  cancelRedemption,
  inMemoryRewards,
  inMemoryRedemptions,
};
