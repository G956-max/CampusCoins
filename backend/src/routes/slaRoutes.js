const express = require('express');
const {
  getSlaReport,
  getRules,
  updateRules,
  triggerEscalationCheck,
} = require('../controllers/slaController');
const { verifyAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyAuth, requireRole(['admin']));

router.get('/', getSlaReport);
router.get('/rules', getRules);
router.put('/rules', updateRules);
router.post('/check-escalations', triggerEscalationCheck);

module.exports = router;
