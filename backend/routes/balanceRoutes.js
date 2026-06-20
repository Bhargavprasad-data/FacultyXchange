import express from 'express';
import { query } from '../config/pgClient.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get balance tracking for a specific faculty
// @route   GET /api/balance
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Classes I have substituted FOR OTHERS (I took their classes)
    const { rows: takenPendingRows } = await query(
      "SELECT COUNT(*) FROM substitute_class WHERE substitute_faculty_id = $1 AND compensation_status = 'Pending'",
      [userId]
    );

    const { rows: takenTotalRows } = await query(
      "SELECT COUNT(*) FROM substitute_class WHERE substitute_faculty_id = $1",
      [userId]
    );

    // Classes OTHERS substituted FOR ME (I owe them)
    const { rows: toTakeRows } = await query(
      "SELECT COUNT(*) FROM substitute_class WHERE original_faculty_id = $1 AND compensation_status = 'Pending'",
      [userId]
    );
    
    const takenClasses = parseInt(takenPendingRows[0].count, 10) || 0;
    const takenClassesTotal = parseInt(takenTotalRows[0].count, 10) || 0;
    const toTakeClasses = parseInt(toTakeRows[0].count, 10) || 0;
    const toReceiveClasses = takenClasses;

    res.json({
      classesTaken: takenClassesTotal, // Total history I took
      classesToTake: toTakeClasses,    // Compensation still pending for me to do
      classesToReceive: toReceiveClasses // Compensation others still owe me
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
