import { query } from '../config/pgClient.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, recipient_id, message, type, is_read, related_id, created_at FROM notification WHERE recipient_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(rows.map(r => ({
      _id: r.id,
      id: r.id,
      recipient: r.recipient_id,
      message: r.message,
      type: r.type,
      isRead: r.is_read,
      relatedId: r.related_id,
      createdAt: r.created_at
    })));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: checkRows } = await query('SELECT * FROM notification WHERE id = $1', [id]);
    const notification = checkRows[0];

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Ensure user owns this notification
    if (notification.recipient_id !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { rows: updatedRows } = await query(
      'UPDATE notification SET is_read = TRUE, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    const r = updatedRows[0];
    res.json({
      _id: r.id,
      id: r.id,
      recipient: r.recipient_id,
      message: r.message,
      type: r.type,
      isRead: r.is_read,
      relatedId: r.related_id,
      createdAt: r.created_at
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Clear all notifications for user
// @route   DELETE /api/notifications
// @access  Private
const clearAllNotifications = async (req, res) => {
  try {
    await query('DELETE FROM notification WHERE recipient_id = $1', [req.user.id]);
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { getNotifications, markAsRead, clearAllNotifications };
