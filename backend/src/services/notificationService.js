const { getSupabaseClient } = require('../config/supabase');
const logger = require('../utils/logger');

// Local in-memory notification list for offline/testing fallback
const inMemoryNotifications = [];

const createNotification = async ({ userId, title, message, type = 'complaint_update' }) => {
  if (!userId) return null;

  const timestamp = new Date().toISOString();
  const notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    user_id: userId,
    title,
    message,
    type,
    is_read: false,
    created_at: timestamp,
  };

  logger.info(`[NOTIFICATION] To User ${userId}: "${title}"`);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        title,
        message,
        type,
        is_read: false,
      });
    } catch (err) {
      logger.warn(`[NOTIFICATION] Supabase insert notice: ${err.message}`);
    }
  }

  inMemoryNotifications.unshift(notification);
  return notification;
};

module.exports = {
  createNotification,
  inMemoryNotifications,
};
