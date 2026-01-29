import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  getAllUsers, 
  deleteUser,
  sendPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPassword,
  makeAdmin,
  checkAdminExists
} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { 
  validateRegister, 
  validateLogin,
  handleValidationErrors 
} from '../middleware/validationMiddleware.js';
import { sendOrderConfirmationSMS } from '../utils/smsService.js';

const router = express.Router();

// ✅ SECURITY: Validation added to auth routes
router.post('/register', validateRegister, handleValidationErrors, registerUser);
router.post('/login', validateLogin, handleValidationErrors, loginUser);
router.get('/check-admin-exists', checkAdminExists);
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);

// Password Reset Routes
router.post('/password-reset/send-otp', sendPasswordResetOTP);
router.post('/password-reset/verify-otp', verifyPasswordResetOTP);
router.post('/password-reset/reset', resetPassword);

// Admin routes - require admin role
// Place specific routes BEFORE generic routes
router.post('/make-admin', authMiddleware, adminMiddleware, makeAdmin);
router.get('/', authMiddleware, adminMiddleware, getAllUsers);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);

// Test SMS endpoint (for debugging)
router.post('/test-sms', async (req, res) => {
  try {
    const { phone, name } = req.body;
    
    if (!phone || !name) {
      return res.status(400).json({ message: 'Phone and name required' });
    }
    
    console.log('🧪 [TEST] SMS endpoint called with:', { phone, name });
    const result = await sendOrderConfirmationSMS(phone, 'TEST123', name);
    
    res.json({ 
      message: 'Test SMS sent',
      success: result,
      phone: phone,
      name: name
    });
  } catch (error) {
    console.error('🧪 [TEST] Error:', error);
    res.status(500).json({ 
      message: 'Error sending test SMS', 
      error: error.message 
    });
  }
});

export default router;

