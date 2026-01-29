import express from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrderById, 
  trackOrder, 
  updateOrderStatus, 
  cancelOrder,
  getAllOrders
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

// Admin only routes
router.get('/admin/all', authMiddleware, adminMiddleware, getAllOrders);
router.put('/:orderId/status', authMiddleware, adminMiddleware, updateOrderStatus);

export default router;
