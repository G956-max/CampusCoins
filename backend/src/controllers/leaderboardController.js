const leaderboardService = require('../services/leaderboardService');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /api/leaderboard - Get ranked student leaderboard by impact score
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;
    const leaderboard = await leaderboardService.getLeaderboard({
      limit: parseInt(limit, 10),
    });
    return sendSuccess(res, 'Leaderboard retrieved successfully', leaderboard);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/leaderboard/visibility - Get personal leaderboard visibility
 */
const getVisibility = async (req, res, next) => {
  try {
    const isVisible = await leaderboardService.getLeaderboardVisibility(req.user.id);
    return sendSuccess(res, 'Visibility setting retrieved', { leaderboard_visible: isVisible });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/leaderboard/visibility - Toggle personal leaderboard visibility
 */
const setVisibility = async (req, res, next) => {
  try {
    const { leaderboard_visible } = req.body;
    const result = await leaderboardService.setLeaderboardVisibility(
      req.user.id,
      Boolean(leaderboard_visible)
    );
    return sendSuccess(res, 'Visibility preference updated', result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLeaderboard,
  getVisibility,
  setVisibility,
};
