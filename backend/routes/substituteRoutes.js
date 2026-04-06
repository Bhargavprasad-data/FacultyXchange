import express from 'express';
import { createSubstituteClass, getSubstituteClasses, getAllSubstituteClasses } from '../controllers/substituteController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createSubstituteClass).get(protect, getSubstituteClasses);
router.route('/all').get(protect, admin, getAllSubstituteClasses);

export default router;
