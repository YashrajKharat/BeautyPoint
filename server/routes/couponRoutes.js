import express from 'express';
import {
  createCoupon,
  getAllCoupons,
  validateCoupon,
  updateCoupon,
  deleteCoupon
} from '../controllers/couponController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Public routes
router.post('/validate', validateCoupon); // Validate coupon during checkout

// Admin routes (requires auth + admin role)
router.post('/create', authMiddleware, adminMiddleware, createCoupon); // Create coupon
router.get('/all', authMiddleware, adminMiddleware, getAllCoupons); // Get all coupons
router.put('/:id', authMiddleware, adminMiddleware, updateCoupon); // Update coupon
router.delete('/:id', authMiddleware, adminMiddleware, deleteCoupon); // Delete coupon

export default router;
