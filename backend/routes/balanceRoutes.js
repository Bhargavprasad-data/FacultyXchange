import express from 'express';
import SubstituteClass from '../models/SubstituteClass.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get balance tracking for a specific faculty
// @route   GET /api/balance
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Classes I have substituted FOR OTHERS (I took their classes)
    const takenClasses = await SubstituteClass.countDocuments({
      substituteFaculty: userId,
      compensationStatus: 'Pending' // Still owed to me
    });

    const takenClassesTotal = await SubstituteClass.countDocuments({
      substituteFaculty: userId,
    }); // Total history I took

    // Classes OTHERS substituted FOR ME (I owe them)
    const toTakeClasses = await SubstituteClass.countDocuments({
      originalFaculty: userId,
      compensationStatus: 'Pending' // I still need to compensate
    });
    
    // Classes others must compensate FOR ME
    const toReceiveClasses = takenClasses;

    res.json({
      classesTaken: takenClassesTotal, // Total lifetime classes taught for others
      classesToTake: toTakeClasses,    // Compensation still pending for me to do
      classesToReceive: toReceiveClasses // Compensation others still owe me
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
