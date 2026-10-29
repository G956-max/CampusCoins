const { getGamificationAnalytics } = require('../services/gamificationAnalyticsService');
const {
  getCoinRules,
  updateCoinRules,
  getImpactRules,
  updateImpactRules,
  getLevelTiers,
  updateLevelTiers,
} = require('../config/rewardRules');
const { logAudit } = require('../services/auditService');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /api/admin/gamification - Analytics & distribution charts
 */
const getAnalytics = async (req, res, next) => {
  try {
    const data = await getGamificationAnalytics();
    return sendSuccess(res, 'Gamification analytics retrieved', data);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/gamification/rules - Configurable gamification rules & levels
 */
const getRules = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Gamification rules retrieved', {
      coinRules: getCoinRules(),
      impactRules: getImpactRules(),
      levelTiers: getLevelTiers(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/gamification/rules - Update configurable rules
 */
const updateRules = async (req, res, next) => {
  try {
    const { coinRules, impactRules, levelTiers } = req.body;

    let updatedCoin = null;
    let updatedImpact = null;
    let updatedLevels = null;

    if (coinRules) {
      updatedCoin = updateCoinRules(coinRules);
    }
    if (impactRules) {
      updatedImpact = updateImpactRules(impactRules);
    }
    if (levelTiers && Array.isArray(levelTiers)) {
      updatedLevels = updateLevelTiers(levelTiers);
    }

    await logAudit({
      userId: req.user.id,
      action: 'ADMIN_GAMIFICATION_RULE_UPDATED',
      entityType: 'gamification_rules',
      entityId: 'global',
      newData: { coinRules, impactRules, levelTiers },
    });

    return sendSuccess(res, 'Gamification rules updated successfully', {
      coinRules: getCoinRules(),
      impactRules: getImpactRules(),
      levelTiers: getLevelTiers(),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAnalytics,
  getRules,
  updateRules,
};
