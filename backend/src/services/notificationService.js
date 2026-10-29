const { getSupabaseClient } = require('../config/supabase');
const logger = require('../utils/logger');

// Local in-memory notification list for fallback
const inMemoryNotifications = [];

/**
 * Create a new notification
 */
const createNotification = async ({ userId, title, message, type = 'complaint_update', referenceId = null }) => {
  if (!userId) return null;

  const timestamp = new Date().toISOString();
  const notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    user_id: userId,
    title,
    message,
    type,
    reference_id: referenceId,
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
        reference_id: referenceId,
        is_read: false,
      });
    } catch (err) {
      logger.warn(`[NOTIFICATION] Supabase insert notice: ${err.message}`);
    }
  }

  inMemoryNotifications.unshift(notification);
  return notification;
};

/**
 * Fetch notifications for authenticated user
 */
const getUserNotifications = async (userId, { limit = 20, unreadOnly = false } = {}) => {
  if (!userId) throw new Error('User ID is required');

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) return data;
    } catch (err) {
      logger.warn(`[NOTIFICATIONS] Supabase fallback: ${err.message}`);
    }
  }

  let list = inMemoryNotifications.filter((n) => n.user_id === userId);
  if (unreadOnly) {
    list = list.filter((n) => !n.is_read);
  }
  return list.slice(0, limit);
};

/**
 * Mark a single notification as read
 */
const markNotificationAsRead = async (notificationId, userId) => {
  const notif = inMemoryNotifications.find((n) => n.id === notificationId && n.user_id === userId);
  if (notif) notif.is_read = true;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);
    } catch (err) {
      logger.warn(`[NOTIFICATIONS READ] ${err.message}`);
    }
  }

  return { success: true, notificationId };
};

/**
 * Mark all user notifications as read
 */
const markAllNotificationsAsRead = async (userId) => {
  inMemoryNotifications
    .filter((n) => n.user_id === userId)
    .forEach((n) => (n.is_read = true));

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);
    } catch (err) {
      logger.warn(`[NOTIFICATIONS READ ALL] ${err.message}`);
    }
  }

  return { success: true };
};

/**
 * Get count of unread notifications
 */
const getUnreadNotificationCount = async (userId) => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (!error && typeof count === 'number') return count;
    } catch (err) {
      logger.warn(`[NOTIFICATIONS COUNT] ${err.message}`);
    }
  }

  return inMemoryNotifications.filter((n) => n.user_id === userId && !n.is_read).length;
};

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  inMemoryNotifications,
};
