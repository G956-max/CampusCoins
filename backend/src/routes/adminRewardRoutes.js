const express = require('express');
const {
  getAllRewards,
  createReward,
  updateReward,
  deleteReward,
  getAllRedemptions,
  approveRedemption,
  fulfillRedemption,
  cancelRedemption,
} = require('../controllers/adminRewardController');
const { verifyAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Strict Admin requirement
router.use(verifyAuth, requireRole(['admin']));

router.get('/', getAllRewards);
router.post('/', createReward);
router.patch('/:id', updateReward);
router.delete('/:id', deleteReward);

router.get('/redemptions', getAllRedemptions);
router.post('/redemptions/:id/approve', approveRedemption);
router.post('/redemptions/:id/fulfill', fulfillRedemption);
router.post('/redemptions/:id/cancel', cancelRedemption);

module.exports = router;
