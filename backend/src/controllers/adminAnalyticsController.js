const { getAdminInstitutionalAnalytics, generateComplaintsCsv } = require('../services/analyticsService');
const { aiAdminAssistantQuery } = require('../services/aiService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * GET /api/admin/analytics - Real measured analytics dashboard data
 */
const getInstitutionalAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await getAdminInstitutionalAnalytics({ startDate, endDate });
    return sendSuccess(res, 'Institutional analytics retrieved', analytics);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/analytics/export - Download CSV report
 */
const exportComplaintsCsv = async (req, res, next) => {
  try {
    const csvContent = await generateComplaintsCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=campuscoins_complaints_${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/analytics/ai-assistant - Authorized Natural Language Query
 */
const handleAiAssistantQuery = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return sendError(res, 'Query string is required', 400);
    }

    const response = await aiAdminAssistantQuery(query, req.user);
    return sendSuccess(res, 'AI Assistant response generated', response);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

module.exports = {
  getInstitutionalAnalytics,
  exportComplaintsCsv,
  handleAiAssistantQuery,
};
