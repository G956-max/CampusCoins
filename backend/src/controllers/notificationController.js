const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
} = require('../services/notificationService');
const { sendSuccess } = require('../utils/apiResponse');

const getNotifications = async (req, res, next) => {
  try {
    const { limit = 20, unreadOnly = 'false' } = req.query;
    const data = await getUserNotifications(req.user.id, {
      limit: parseInt(limit, 10),
      unreadOnly: unreadOnly === 'true',
    });
    return sendSuccess(res, 'Notifications retrieved', data);
  } catch (err) {
    next(err);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await getUnreadNotificationCount(req.user.id);
    return sendSuccess(res, 'Unread count retrieved', { unreadCount: count });
  } catch (err) {
    next(err);
  }
};

const markRead = async (req, res, next) => {
  try {
    const result = await markNotificationAsRead(req.params.id, req.user.id);
    return sendSuccess(res, 'Notification marked as read', result);
  } catch (err) {
    next(err);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    const result = await markAllNotificationsAsRead(req.user.id);
    return sendSuccess(res, 'All notifications marked as read', result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
};
