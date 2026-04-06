import express from 'express';
import {
  getFaculty,
  getFacultyById,
  registerFaculty,
  updateFaculty,
  deleteFaculty,
} from '../controllers/facultyController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, admin, registerFaculty).get(protect, getFaculty);
router
  .route('/:id')
  .get(protect, admin, getFacultyById)
  .put(protect, admin, updateFaculty)
  .delete(protect, admin, deleteFaculty);

export default router;
