const { getLevelTiers } = require('../config/rewardRules');

/**
 * Calculate level number from XP
 * @param {number} xp 
 * @returns {number} Level (1-6+)
 */
const calculateLevel = (xp = 0) => {
  const safeXP = Math.max(0, Number(xp) || 0);
  const tiers = getLevelTiers();

  for (let i = tiers.length - 1; i >= 0; i--) {
    if (safeXP >= tiers[i].minXP) {
      return tiers[i].level;
    }
  }
  return 1;
};

/**
 * Get detailed progress towards the next level
 * @param {number} xp 
 * @returns {object} { currentLevel, currentLevelName, currentXP, nextLevelXP, progressPercentage }
 */
const getLevelProgress = (xp = 0) => {
  const safeXP = Math.max(0, Number(xp) || 0);
  const tiers = getLevelTiers();
  const currentLevelNum = calculateLevel(safeXP);
  const currentTier = tiers.find((t) => t.level === currentLevelNum) || tiers[0];
  const nextTier = tiers.find((t) => t.level === currentLevelNum + 1);

  if (!nextTier) {
    // Max level reached
    return {
      currentLevel: currentTier.level,
      currentLevelName: currentTier.name,
      currentXP: safeXP,
      nextLevelXP: safeXP,
      progressPercentage: 100,
      isMaxLevel: true,
    };
  }

  const rangeSpan = nextTier.minXP - currentTier.minXP;
  const currentProgressInTier = safeXP - currentTier.minXP;
  const progressPercentage = Math.min(
    100,
    Math.max(0, Math.round((currentProgressInTier / rangeSpan) * 100))
  );

  return {
    currentLevel: currentTier.level,
    currentLevelName: currentTier.name,
    currentXP: safeXP,
    nextLevelXP: nextTier.minXP,
    progressPercentage,
    isMaxLevel: false,
  };
};

/**
 * Get next level details
 * @param {number} xp 
 * @returns {object|null}
 */
const getNextLevel = (xp = 0) => {
  const safeXP = Math.max(0, Number(xp) || 0);
  const tiers = getLevelTiers();
  const currentLevelNum = calculateLevel(safeXP);
  return tiers.find((t) => t.level === currentLevelNum + 1) || null;
};

module.exports = {
  calculateLevel,
  getLevelProgress,
  getNextLevel,
};
