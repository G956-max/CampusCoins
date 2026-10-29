const express = require('express');
const {
  getLeaderboard,
  getVisibility,
  setVisibility,
} = require('../controllers/leaderboardController');
const { verifyAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyAuth);

router.get('/', getLeaderboard);
router.get('/visibility', getVisibility);
router.patch('/visibility', setVisibility);

module.exports = router;
