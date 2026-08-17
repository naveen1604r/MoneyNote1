const { getPool } = require('../config/db');

/**
 * GET /api/notifications
 * Fetch user notifications
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = getPool();

    let [rows] = await pool.query(
      'SELECT id, type, title, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // If no notifications exist, create initial system welcome notifications
    if (rows.length === 0) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, is_read) VALUES
         (?, 'system', 'Welcome to MoneyNote 🎉', 'Thank you for joining MoneyNote. Start by tracking your income and expenses.', FALSE),
         (?, 'savings', 'Savings Goal Reminder 💡', 'Set up a savings goal in the Savings tab to build better financial habits.', FALSE)`,
        [userId, userId]
      );

      [rows] = await pool.query(
        'SELECT id, type, title, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
    }

    const formatted = rows.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      message: item.message,
      isRead: Boolean(item.is_read),
      createdAt: item.created_at,
    }));

    return res.status(200).json({
      success: true,
      notifications: formatted,
    });
  } catch (error) {
    console.error('[GetNotifications Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications.',
    });
  }
};

/**
 * GET /api/notifications/unread-count
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = getPool();

    const [rows] = await pool.query(
      'SELECT COUNT(*) AS unreadCount FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    return res.status(200).json({
      success: true,
      count: parseInt(rows[0].unreadCount, 10) || 0,
    });
  } catch (error) {
    console.error('[GetUnreadCount Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch unread notification count.',
    });
  }
};

/**
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    const pool = getPool();

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('[MarkAsRead Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read.',
    });
  }
};

/**
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = getPool();

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('[MarkAllAsRead Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read.',
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
