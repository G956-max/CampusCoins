const {
  getSlaPerformanceReport,
  getSlaRules,
  updateSlaRules,
  checkAndEscalateOverdueComplaints,
} = require('../services/slaService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const getSlaReport = async (req, res, next) => {
  try {
    const report = await getSlaPerformanceReport();
    return sendSuccess(res, 'SLA performance report retrieved', report);
  } catch (err) {
    next(err);
  }
};

const getRules = async (req, res, next) => {
  try {
    const rules = getSlaRules();
    return sendSuccess(res, 'SLA rules retrieved', rules);
  } catch (err) {
    next(err);
  }
};

const updateRules = async (req, res, next) => {
  try {
    const updated = updateSlaRules(req.body);
    return sendSuccess(res, 'SLA rules updated', updated);
  } catch (err) {
    next(err);
  }
};

const triggerEscalationCheck = async (req, res, next) => {
  try {
    const results = await checkAndEscalateOverdueComplaints();
    return sendSuccess(res, 'SLA check completed', results);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSlaReport,
  getRules,
  updateRules,
  triggerEscalationCheck,
};
