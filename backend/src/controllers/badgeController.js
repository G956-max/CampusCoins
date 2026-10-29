const badgeService = require('../services/badgeService');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /api/badges - Get all badges with unlocked status for user
 */
const getMyBadges = async (req, res, next) => {
  try {
    const badges = await badgeService.getUserBadges(req.user.id);
    return sendSuccess(res, 'Badges retrieved successfully', badges);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyBadges,
};
