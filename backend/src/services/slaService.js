const { getSupabaseClient } = require('../config/supabase');
const logger = require('../utils/logger');
const { createNotification } = require('./notificationService');
const { logAudit } = require('./auditService');

// Default SLA thresholds in hours
const DEFAULT_SLA_HOURS = {
  critical: { response: 2, resolution: 24 },
  high: { response: 4, resolution: 48 },
  medium: { response: 12, resolution: 72 },
  low: { response: 24, resolution: 120 },
};

let currentSlaConfigs = { ...DEFAULT_SLA_HOURS };

// In-memory escalation ledger: Set of `${complaintId}_${priority}`
const inMemoryEscalations = new Map();

/**
 * Get current SLA rules
 */
const getSlaRules = () => currentSlaConfigs;

/**
 * Update SLA rules (Admin)
 */
const updateSlaRules = (newRules) => {
  currentSlaConfigs = {
    ...currentSlaConfigs,
    ...newRules,
  };
  return currentSlaConfigs;
};

/**
 * Calculate SLA status for an individual complaint
 */
const evaluateComplaintSla = (complaint) => {
  const priority = (complaint.priority || 'medium').toLowerCase();
  const rule = currentSlaConfigs[priority] || currentSlaConfigs.medium;
  const targetResolutionHours = rule.resolution;

  const createdAt = new Date(complaint.created_at).getTime();
  const resolvedAt = complaint.resolved_at ? new Date(complaint.resolved_at).getTime() : null;
  const now = Date.now();

  const elapsedMillis = (resolvedAt || now) - createdAt;
  const elapsedHours = Math.round((elapsedMillis / (1000 * 60 * 60)) * 10) / 10;
  const remainingHours = Math.round((targetResolutionHours - elapsedHours) * 10) / 10;

  const isTerminal = ['resolved', 'verified', 'rejected'].includes(complaint.status);
  const isBreached = elapsedHours > targetResolutionHours;
  const isAtRisk = !isTerminal && remainingHours <= 6 && remainingHours > 0;

  return {
    priority,
    targetHours: targetResolutionHours,
    elapsedHours,
    remainingHours: isTerminal ? 0 : Math.max(0, remainingHours),
    isBreached,
    isAtRisk,
    isTerminal,
    complianceStatus: isBreached ? 'BREACHED' : isAtRisk ? 'AT_RISK' : 'ON_TRACK',
  };
};

/**
 * Perform idempotent SLA check across all active complaints
 */
const checkAndEscalateOverdueComplaints = async () => {
  const complaintService = require('./complaintService');
  const allResult = await complaintService.getAdminComplaints({ limit: 100 });
  const complaints = allResult?.data || [];

  const activeComplaints = complaints.filter(
    (c) => !['resolved', 'verified', 'rejected'].includes(c.status)
  );

  const breachedList = [];
  const atRiskList = [];
  const newEscalations = [];

  for (const complaint of activeComplaints) {
    const sla = evaluateComplaintSla(complaint);

    if (sla.isBreached) {
      breachedList.push({ complaint, sla });
      complaint.sla_breached = true;

      // Idempotency key: same complaint will not trigger duplicate escalation notification
      const escalationKey = `${complaint.id}_${sla.priority}`;

      if (!inMemoryEscalations.has(escalationKey)) {
        inMemoryEscalations.set(escalationKey, {
          complaintId: complaint.id,
          priority: sla.priority,
          elapsedHours: sla.elapsedHours,
          targetHours: sla.targetHours,
          escalatedAt: new Date().toISOString(),
        });

        newEscalations.push(complaint);

        // Notify staff and student
        if (complaint.assigned_staff_id) {
          await createNotification({
            userId: complaint.assigned_staff_id,
            title: `⚠️ SLA Escalation: ${complaint.title}`,
            message: `Ticket ${complaint.tracking_code || complaint.id} has exceeded its ${sla.targetHours}h resolution SLA. Immediate action required.`,
            type: 'sla_breached',
            referenceId: complaint.id,
          });
        }

        await logAudit({
          userId: 'system_sla_worker',
          action: 'SLA_BREACH_ESCALATED',
          entityType: 'complaint',
          entityId: complaint.id,
          newData: {
            priority: sla.priority,
            elapsedHours: sla.elapsedHours,
            targetHours: sla.targetHours,
          },
        });
      }
    } else if (sla.isAtRisk) {
      atRiskList.push({ complaint, sla });
    }
  }

  return {
    timestamp: new Date().toISOString(),
    totalActive: activeComplaints.length,
    overdueCount: breachedList.length,
    atRiskCount: atRiskList.length,
    newEscalationsCount: newEscalations.length,
    breachedList: breachedList.slice(0, 10),
    atRiskList: atRiskList.slice(0, 10),
  };
};

/**
 * Get comprehensive SLA performance report
 */
const getSlaPerformanceReport = async () => {
  const complaintService = require('./complaintService');
  const allResult = await complaintService.getAdminComplaints({ limit: 100 });
  const complaints = allResult?.data || [];

  let totalComplaints = complaints.length;
  let resolvedComplaints = 0;
  let onTimeResolved = 0;
  let breachedCount = 0;
  let atRiskCount = 0;

  for (const c of complaints) {
    const sla = evaluateComplaintSla(c);
    if (sla.isTerminal) {
      resolvedComplaints++;
      if (!sla.isBreached) onTimeResolved++;
    } else {
      if (sla.isBreached) breachedCount++;
      if (sla.isAtRisk) atRiskCount++;
    }
  }

  const complianceRate = resolvedComplaints > 0
    ? Math.round((onTimeResolved / resolvedComplaints) * 100)
    : 100;

  return {
    metrics: {
      totalComplaints,
      resolvedComplaints,
      complianceRate,
      overdueActive: breachedCount,
      atRiskCount,
      rules: currentSlaConfigs,
    },
    activeEscalations: Array.from(inMemoryEscalations.values()),
  };
};

/**
 * Start periodic background SLA monitoring worker
 */
let workerInterval = null;
const initSlaWorker = (intervalMs = 5 * 60 * 1000) => {
  if (workerInterval) clearInterval(workerInterval);
  logger.info('[SLA] Background SLA monitoring worker initialized (interval: 5m)');
  workerInterval = setInterval(async () => {
    try {
      await checkAndEscalateOverdueComplaints();
    } catch (err) {
      logger.warn(`[SLA WORKER] Cycle error: ${err.message}`);
    }
  }, intervalMs);
};

module.exports = {
  getSlaRules,
  updateSlaRules,
  evaluateComplaintSla,
  checkAndEscalateOverdueComplaints,
  getSlaPerformanceReport,
  initSlaWorker,
};
