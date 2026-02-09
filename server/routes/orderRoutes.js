import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  trackOrder,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  requestReturn,
  deleteOrder
} from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = express.Router();

// User routes
router.post('/create', authMiddleware, createOrder);
router.get('/', authMiddleware, getOrders);
router.get('/:orderId', authMiddleware, getOrderById);
router.get('/:orderId/track', authMiddleware, trackOrder);
router.put('/:orderId/cancel', authMiddleware, cancelOrder);
router.put('/:orderId/return', authMiddleware, requestReturn);

// Admin only routes
router.get('/admin/all', authMiddleware, adminMiddleware, getAllOrders);
router.put('/:orderId/status', authMiddleware, adminMiddleware, updateOrderStatus);
router.delete('/:orderId', authMiddleware, adminMiddleware, deleteOrder);

export default router;
