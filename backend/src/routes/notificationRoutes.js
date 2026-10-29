const express = require('express');
const {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
} = require('../controllers/notificationController');
const { verifyAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyAuth);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markRead);
router.post('/mark-all-read', markAllRead);

module.exports = router;
