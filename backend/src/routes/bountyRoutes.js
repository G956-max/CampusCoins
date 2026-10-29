const express = require('express');
const {
  getAllBounties,
  claimCommunityBounty,
  verifyCommunityBounty,
  createCommunityBounty,
} = require('../controllers/bountyController');
const { verifyAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyAuth);

router.get('/', getAllBounties);
router.post('/:id/claim', requireRole(['student']), claimCommunityBounty);
router.post('/:id/verify', requireRole(['staff', 'admin']), verifyCommunityBounty);
router.post('/', requireRole(['staff', 'admin']), createCommunityBounty);

module.exports = router;
