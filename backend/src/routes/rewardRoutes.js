const express = require('express');
const {
  getAvailableRewards,
  redeemReward,
  getMyRedemptions,
  verifyVoucher,
} = require('../controllers/rewardController');
const { verifyAuth, requireRole } = require('../middleware/authMiddleware');
const { actionLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(verifyAuth);

router.get('/', getAvailableRewards);
router.get('/redemptions', getMyRedemptions);
router.post('/:id/redeem', actionLimiter, redeemReward);
router.post('/verify-voucher', requireRole(['staff', 'admin']), verifyVoucher);

module.exports = router;
