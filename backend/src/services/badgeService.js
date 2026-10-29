const { getSupabaseClient } = require('../config/supabase');
const logger = require('../utils/logger');
const { INITIAL_BADGES } = require('../config/rewardRules');
const { logAudit } = require('./auditService');
const { createNotification } = require('./notificationService');

// In-memory user badges store: Map<userId, Set<badgeId>>
const inMemoryUserBadges = new Map();

/**
 * Get all badges for a user with unlocked status
 */
const getUserBadges = async (userId) => {
  if (!userId) throw new Error('User ID is required');

  const supabase = getSupabaseClient();
  let unlockedBadgeIds = new Set();
  let badgeRecords = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('badge_id, awarded_at')
        .eq('user_id', userId);

      if (!error && data) {
        data.forEach((ub) => unlockedBadgeIds.add(ub.badge_id));
        badgeRecords = data;
      }
    } catch (err) {
      logger.warn(`[BADGES] Supabase fetch fallback: ${err.message}`);
    }
  }

  // Fallback to memory
  if (inMemoryUserBadges.has(userId)) {
    inMemoryUserBadges.get(userId).forEach((b) => unlockedBadgeIds.add(b.badge_id || b));
  }

  const allBadges = INITIAL_BADGES.map((badge) => {
    const isUnlocked = unlockedBadgeIds.has(badge.id);
    const userRecord = badgeRecords.find((r) => r.badge_id === badge.id) ||
      (inMemoryUserBadges.get(userId) || []).find((r) => (r.badge_id || r) === badge.id);

    return {
      ...badge,
      unlocked: isUnlocked,
      awarded_at: isUnlocked ? (userRecord?.awarded_at || new Date().toISOString()) : null,
    };
  });

  return allBadges;
};

/**
 * Award a badge to a user idempotently
 */
const awardBadge = async (userId, badgeId) => {
  if (!userId || !badgeId) return null;

  const badgeDef = INITIAL_BADGES.find((b) => b.id === badgeId);
  if (!badgeDef) return null;

  const now = new Date().toISOString();
  const supabase = getSupabaseClient();
  let isNew = false;

  if (supabase) {
    try {
      const { data: existing } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_id', badgeId)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from('user_badges').insert({
          user_id: userId,
          badge_id: badgeId,
          awarded_at: now,
        });
        if (!error) isNew = true;
      }
    } catch (err) {
      logger.warn(`[BADGE AWARD] Supabase error: ${err.message}`);
    }
  }

  // In-memory handling
  if (!inMemoryUserBadges.has(userId)) {
    inMemoryUserBadges.set(userId, []);
  }
  const userList = inMemoryUserBadges.get(userId);
  const existsInMemory = userList.some((b) => (b.badge_id || b) === badgeId);

  if (!existsInMemory) {
    userList.push({ badge_id: badgeId, awarded_at: now });
    isNew = true;
  }

  if (isNew) {
    logger.info(`[BADGE UNLOCKED] User ${userId} unlocked badge: ${badgeDef.name}`);
    await logAudit({
      userId,
      action: 'BADGE_AWARDED',
      entityType: 'user_badge',
      entityId: badgeId,
      newData: { badgeName: badgeDef.name },
    });

    await createNotification({
      userId,
      title: `🎖️ Badge Unlocked: ${badgeDef.name}!`,
      message: badgeDef.description,
      type: 'badge_unlocked',
    });

    return { success: true, badge: badgeDef, newlyUnlocked: true };
  }

  return { success: false, alreadyUnlocked: true };
};

/**
 * Check and evaluate badges for a user based on their stats
 */
const checkBadges = async (userId, stats = {}) => {
  if (!userId) return [];
  const newlyAwarded = [];

  // 1. First Report
  if ((stats.verifiedComplaints || 0) >= 1) {
    const res = await awardBadge(userId, 'badge-first-report');
    if (res?.newlyUnlocked) newlyAwarded.push(res.badge);
  }

  // 2. Evidence Expert
  if ((stats.usefulEvidence || 0) >= 5) {
    const res = await awardBadge(userId, 'badge-evidence-expert');
    if (res?.newlyUnlocked) newlyAwarded.push(res.badge);
  }

  // 3. Campus Helper (500 impact score)
  if ((stats.impactScore || 0) >= 500) {
    const res = await awardBadge(userId, 'badge-campus-helper');
    if (res?.newlyUnlocked) newlyAwarded.push(res.badge);
  }

  // 4. Problem Solver (5 verified resolutions)
  if ((stats.verifiedResolutions || 0) >= 5) {
    const res = await awardBadge(userId, 'badge-problem-solver');
    if (res?.newlyUnlocked) newlyAwarded.push(res.badge);
  }

  // 5. Consistency (7 active days)
  if ((stats.activeDays || 0) >= 7) {
    const res = await awardBadge(userId, 'badge-consistency');
    if (res?.newlyUnlocked) newlyAwarded.push(res.badge);
  }

  // 6. High Impact (3 high-impact issues)
  if ((stats.highImpactIssues || 0) >= 3) {
    const res = await awardBadge(userId, 'badge-high-impact');
    if (res?.newlyUnlocked) newlyAwarded.push(res.badge);
  }

  // 7. Community Contributor (1000 impact score)
  if ((stats.impactScore || 0) >= 1000) {
    const res = await awardBadge(userId, 'badge-community-contributor');
    if (res?.newlyUnlocked) newlyAwarded.push(res.badge);
  }

  return newlyAwarded;
};

module.exports = {
  getUserBadges,
  awardBadge,
  checkBadges,
  inMemoryUserBadges,
};
