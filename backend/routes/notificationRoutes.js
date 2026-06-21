import express from 'express';
import { getNotifications, markAsRead, clearAllNotifications } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getNotifications).delete(protect, clearAllNotifications);
router.route('/:id/read').put(protect, markAsRead);

export default router;
