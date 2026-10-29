const rewardStoreService = require('../services/rewardStoreService');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /api/admin/rewards - List all rewards
 */
const getAllRewards = async (req, res, next) => {
  try {
    const rewards = await rewardStoreService.getAllRewardsAdmin();
    return sendSuccess(res, 'All rewards retrieved', rewards);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/rewards - Create new reward
 */
const createReward = async (req, res, next) => {
  try {
    const { name, description, coin_cost, stock, image_url, category, is_active } = req.body;
    const reward = await rewardStoreService.createReward({
      name,
      description,
      coin_cost,
      stock,
      image_url,
      category,
      is_active,
    });
    return sendSuccess(res, 'Reward created successfully', reward, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/rewards/:id - Update reward
 */
const updateReward = async (req, res, next) => {
  try {
    const updated = await rewardStoreService.updateReward(req.params.id, req.body);
    return sendSuccess(res, 'Reward updated successfully', updated);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/admin/rewards/:id - Delete reward
 */
const deleteReward = async (req, res, next) => {
  try {
    const result = await rewardStoreService.deleteReward(req.params.id);
    return sendSuccess(res, 'Reward deleted successfully', result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/rewards/redemptions - List all redemptions
 */
const getAllRedemptions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const redemptions = await rewardStoreService.getAllRedemptionsAdmin({ status });
    return sendSuccess(res, 'Redemptions retrieved successfully', redemptions);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/rewards/redemptions/:id/approve - Approve redemption
 */
const approveRedemption = async (req, res, next) => {
  try {
    const result = await rewardStoreService.approveRedemption(req.params.id, req.user);
    return sendSuccess(res, 'Redemption approved successfully', result);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/rewards/redemptions/:id/fulfill - Fulfill redemption
 */
const fulfillRedemption = async (req, res, next) => {
  try {
    const result = await rewardStoreService.fulfillRedemption(req.params.id, req.user);
    return sendSuccess(res, 'Redemption marked as fulfilled', result);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/rewards/redemptions/:id/cancel - Cancel redemption and refund coins
 */
const cancelRedemption = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const result = await rewardStoreService.cancelRedemption(req.params.id, req.user, reason);
    return sendSuccess(res, 'Redemption cancelled and coins refunded', result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllRewards,
  createReward,
  updateReward,
  deleteReward,
  getAllRedemptions,
  approveRedemption,
  fulfillRedemption,
  cancelRedemption,
};
