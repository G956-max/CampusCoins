const express = require('express');
const { getMyMissions, claimMissionReward } = require('../controllers/missionController');
const { verifyAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyAuth);

router.get('/', getMyMissions);
router.post('/:id/claim', claimMissionReward);

module.exports = router;
