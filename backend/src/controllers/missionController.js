const missionService = require('../services/missionService');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /api/missions - Get available missions with user progress
 */
const getMyMissions = async (req, res, next) => {
  try {
    const missions = await missionService.getAvailableMissions(req.user.id);
    return sendSuccess(res, 'Missions retrieved successfully', missions);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/missions/:id/claim - Claim completed mission reward
 */
const claimMissionReward = async (req, res, next) => {
  try {
    const result = await missionService.completeMission(req.user.id, req.params.id);
    return sendSuccess(res, 'Mission reward claimed successfully', result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyMissions,
  claimMissionReward,
};
