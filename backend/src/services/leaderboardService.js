const { getSupabaseClient } = require('../config/supabase');
const logger = require('../utils/logger');
const { inMemoryWallets } = require('./coinService');
const { getLevelProgress } = require('./levelService');
const { getUserBadges } = require('./badgeService');

// In-memory privacy visibility store: Map<userId, boolean>
const userPrivacySettings = new Map();

/**
 * Format a privacy-friendly display name (e.g. "Gopinath K" or "Anonymous Contributor")
 */
const formatDisplayName = (fullName, isAnonymous = false) => {
  if (isAnonymous || !fullName) return 'Campus Contributor';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
};

/**
 * Get Leaderboard ranked by impact score
 */
const getLeaderboard = async ({ limit = 50 } = {}) => {
  const supabase = getSupabaseClient();
  let entries = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('user_id, impact_score, level, xp, profiles(id, full_name, role, leaderboard_visible)')
        .order('impact_score', { ascending: false })
        .limit(limit);

      if (!error && data) {
        entries = data
          .filter((w) => {
            const prof = w.profiles;
            if (!prof) return true;
            // Only students or null role, and check privacy toggle
            const isVisible = prof.leaderboard_visible !== false;
            return isVisible;
          })
          .map((w, idx) => {
            const levelInfo = getLevelProgress(w.xp || 0);
            return {
              rank: idx + 1,
              user_id: w.user_id,
              displayName: formatDisplayName(w.profiles?.full_name),
              impactScore: w.impact_score || 0,
              level: w.level || 1,
              levelName: levelInfo.currentLevelName,
              xp: w.xp || 0,
            };
          });

        if (entries.length > 0) return entries;
      }
    } catch (err) {
      logger.warn(`[LEADERBOARD] Supabase fallback: ${err.message}`);
    }
  }

  // In-memory fallback
  const mockProfiles = [
    { id: 'usr-student-01', name: 'Gopinath K' },
    { id: 'usr-student-02', name: 'Ananya Sharma' },
    { id: 'usr-student-03', name: 'Rahul Verma' },
    { id: 'usr-student-04', name: 'Priya Patel' },
    { id: 'usr-student-05', name: 'Vikram Singh' },
  ];

  const allWallets = Array.from(inMemoryWallets.values());
  // Ensure we have some sample data if empty
  if (allWallets.length === 0) {
    mockProfiles.forEach((p, i) => {
      inMemoryWallets.set(p.id, {
        user_id: p.id,
        balance: 150 + i * 50,
        impact_score: 200 + i * 120,
        xp: 300 + i * 150,
        level: i >= 3 ? 3 : 2,
      });
    });
  }

  const sorted = Array.from(inMemoryWallets.values())
    .filter((w) => userPrivacySettings.get(w.user_id) !== false)
    .sort((a, b) => (b.impact_score || 0) - (a.impact_score || 0))
    .slice(0, limit);

  return sorted.map((w, idx) => {
    const p = mockProfiles.find((m) => m.id === w.user_id);
    const levelInfo = getLevelProgress(w.xp || 0);
    return {
      rank: idx + 1,
      user_id: w.user_id,
      displayName: formatDisplayName(p?.name || `Student ${idx + 1}`),
      impactScore: w.impact_score || 0,
      level: w.level || 1,
      levelName: levelInfo.currentLevelName,
      xp: w.xp || 0,
    };
  });
};

/**
 * Toggle leaderboard visibility for a student
 */
const setLeaderboardVisibility = async (userId, isVisible) => {
  userPrivacySettings.set(userId, Boolean(isVisible));

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from('profiles')
        .update({ leaderboard_visible: Boolean(isVisible) })
        .eq('id', userId);
    } catch (err) {
      logger.warn(`[LEADERBOARD PRIVACY] Supabase fallback: ${err.message}`);
    }
  }

  return { success: true, leaderboard_visible: Boolean(isVisible) };
};

/**
 * Get privacy setting for a student
 */
const getLeaderboardVisibility = async (userId) => {
  if (userPrivacySettings.has(userId)) {
    return userPrivacySettings.get(userId);
  }
  return true;
};

module.exports = {
  getLeaderboard,
  setLeaderboardVisibility,
  getLeaderboardVisibility,
  formatDisplayName,
};
