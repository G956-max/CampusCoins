const express = require('express');
const {
  getAnalytics,
  getRules,
  updateRules,
} = require('../controllers/adminGamificationController');
const { verifyAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Strict Admin requirement
router.use(verifyAuth, requireRole(['admin']));

router.get('/', getAnalytics);
router.get('/rules', getRules);
router.patch('/rules', updateRules);

module.exports = router;
