import express from 'express';
import { createTimetableEntry, getAllTimetables, getTimetable, createMyTimetableEntry, updateMyTimetableEntry, deleteMyTimetableEntry } from '../controllers/timetableController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, admin, createTimetableEntry);
router.route('/all').get(protect, admin, getAllTimetables);
router.route('/my').post(protect, createMyTimetableEntry);
router.route('/my/:id').put(protect, updateMyTimetableEntry).delete(protect, deleteMyTimetableEntry);
router.route('/:facultyId').get(protect, getTimetable);

export default router;
