const express = require('express');
const {
  getInstitutionalAnalytics,
  exportComplaintsCsv,
  handleAiAssistantQuery,
} = require('../controllers/adminAnalyticsController');
const { verifyAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Strict Admin requirement
router.use(verifyAuth, requireRole(['admin']));

router.get('/', getInstitutionalAnalytics);
router.get('/export', exportComplaintsCsv);
router.get('/export-csv', exportComplaintsCsv);
router.post('/ai-assistant', handleAiAssistantQuery);

module.exports = router;
