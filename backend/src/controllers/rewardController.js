const rewardStoreService = require('../services/rewardStoreService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * GET /api/rewards - Get active reward catalog
 */
const getAvailableRewards = async (req, res, next) => {
  try {
    const rewards = await rewardStoreService.getAvailableRewards();
    return sendSuccess(res, 'Available rewards retrieved', rewards);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/rewards/:id/redeem - Redeem a reward (Server-side coin calculation)
 */
const redeemReward = async (req, res, next) => {
  try {
    const result = await rewardStoreService.redeemReward(req.user.id, req.params.id);
    return sendSuccess(res, 'Reward redeemed successfully', result, 201);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }
    next(err);
  }
};

/**
 * GET /api/rewards/redemptions - Get student's redemption history
 */
const getMyRedemptions = async (req, res, next) => {
  try {
    const redemptions = await rewardStoreService.getUserRedemptions(req.user.id);
    return sendSuccess(res, 'Redemption history retrieved', redemptions);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/rewards/verify-voucher - Staff/Admin verifies and fulfills a student voucher
 */
const verifyVoucher = async (req, res, next) => {
  try {
    const { voucher_code } = req.body;
    if (!voucher_code) {
      return sendError(res, 'Voucher code is required', 400);
    }

    const result = await rewardStoreService.verifyVoucherCode(voucher_code, req.user);
    return sendSuccess(res, 'Voucher verified and redeemed successfully', result);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }
    next(err);
  }
};

module.exports = {
  getAvailableRewards,
  redeemReward,
  getMyRedemptions,
  verifyVoucher,
};
