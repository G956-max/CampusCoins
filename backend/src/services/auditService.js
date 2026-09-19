const { getSupabaseClient } = require('../config/supabase');
const logger = require('../utils/logger');

// Local in-memory audit log storage for offline/testing fallback
const inMemoryAuditLogs = [];

const logAudit = async ({ userId, action, entityType = 'complaint', entityId = null, metadata = {} }) => {
  const timestamp = new Date().toISOString();
  const entry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
    created_at: timestamp,
  };

  logger.info(`[AUDIT] Action: ${action} | Entity: ${entityType}:${entityId} | User: ${userId}`);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata,
      });
    } catch (err) {
      logger.warn(`[AUDIT] Supabase insert notice: ${err.message}`);
    }
  }

  inMemoryAuditLogs.unshift(entry);
  return entry;
};

module.exports = {
  logAudit,
  inMemoryAuditLogs,
};
