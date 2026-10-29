/**
 * Centralized Reward Configuration for CampusCoins Frontend (Phase 4)
 * Mirror of backend rules for display and client calculations.
 */

export const REWARD_RULES = {
  VALID_COMPLAINT: 20,
  USEFUL_EVIDENCE: 10,
  HIGH_IMPACT_ISSUE: 30,
  RESOLUTION_VERIFICATION: 30,
  USEFUL_FOLLOW_UP: 10,
  DUPLICATE_IDENTIFICATION: 15,
  BOUNTY_COMPLETION: 0,
  SPAM_PENALTY: -30,
  FAKE_REPORT_PENALTY: -50,
};

export const IMPACT_RULES = {
  VALID_COMPLAINT: 20,
  USEFUL_EVIDENCE: 10,
  HIGH_IMPACT_ISSUE: 30,
  RESOLUTION_VERIFICATION: 30,
  USEFUL_FOLLOW_UP: 10,
  DUPLICATE_IDENTIFICATION: 15,
  SPAM_PENALTY: -30,
  FAKE_REPORT_PENALTY: -50,
};

export const LEVEL_TIERS = [
  { level: 1, name: 'Campus Observer', minXP: 0, maxXP: 99, color: 'text-slate-400', badgeBg: 'bg-slate-500/10 border-slate-500/20' },
  { level: 2, name: 'Campus Contributor', minXP: 100, maxXP: 249, color: 'text-emerald-400', badgeBg: 'bg-emerald-500/10 border-emerald-500/20' },
  { level: 3, name: 'Campus Helper', minXP: 250, maxXP: 499, color: 'text-blue-400', badgeBg: 'bg-blue-500/10 border-blue-500/20' },
  { level: 4, name: 'Campus Champion', minXP: 500, maxXP: 999, color: 'text-purple-400', badgeBg: 'bg-purple-500/10 border-purple-500/20' },
  { level: 5, name: 'Campus Leader', minXP: 1000, maxXP: 1999, color: 'text-amber-400', badgeBg: 'bg-amber-500/10 border-amber-500/20' },
  { level: 6, name: 'Campus Impact Maker', minXP: 2000, maxXP: Infinity, color: 'text-rose-400', badgeBg: 'bg-rose-500/10 border-rose-500/20' },
];

export const calculateLevelInfo = (xp = 0) => {
  const safeXP = Math.max(0, Number(xp) || 0);
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (safeXP >= LEVEL_TIERS[i].minXP) {
      const currentTier = LEVEL_TIERS[i];
      const nextTier = LEVEL_TIERS[i + 1] || null;

      if (!nextTier) {
        return {
          currentLevel: currentTier.level,
          currentLevelName: currentTier.name,
          currentXP: safeXP,
          nextLevelXP: safeXP,
          progressPercentage: 100,
          isMaxLevel: true,
          color: currentTier.color,
          badgeBg: currentTier.badgeBg,
        };
      }

      const rangeSpan = nextTier.minXP - currentTier.minXP;
      const progressInTier = safeXP - currentTier.minXP;
      const progressPercentage = Math.min(
        100,
        Math.max(0, Math.round((progressInTier / rangeSpan) * 100))
      );

      return {
        currentLevel: currentTier.level,
        currentLevelName: currentTier.name,
        currentXP: safeXP,
        nextLevelXP: nextTier.minXP,
        progressPercentage,
        isMaxLevel: false,
        color: currentTier.color,
        badgeBg: currentTier.badgeBg,
      };
    }
  }

  return {
    currentLevel: 1,
    currentLevelName: LEVEL_TIERS[0].name,
    currentXP: safeXP,
    nextLevelXP: LEVEL_TIERS[1].minXP,
    progressPercentage: 0,
    isMaxLevel: false,
    color: LEVEL_TIERS[0].color,
    badgeBg: LEVEL_TIERS[0].badgeBg,
  };
};
