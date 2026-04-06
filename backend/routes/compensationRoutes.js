import express from 'express';
import { createCompensationClass, getCompensationClasses, getAllCompensationClasses } from '../controllers/compensationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createCompensationClass).get(protect, getCompensationClasses);
router.route('/all').get(protect, admin, getAllCompensationClasses);

export default router;
