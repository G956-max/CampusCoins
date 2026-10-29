const express = require('express');
const { getMyBadges } = require('../controllers/badgeController');
const { verifyAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyAuth);

router.get('/', getMyBadges);

module.exports = router;
