import { body, validationResult } from 'express-validator';

// ✅ SECURITY: Validation middleware for user registration
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .toLowerCase()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Valid phone number is required'),
];

// ✅ SECURITY: Validation middleware for login
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .toLowerCase()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// ✅ SECURITY: Validation middleware for product creation
export const validateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Product name must be 3-100 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ max: 50 })
    .withMessage('Category too long'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Valid price is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description too long'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a positive number'),
];

// ✅ SECURITY: Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

export default {
  validateRegister,
  validateLogin,
  validateProduct,
  handleValidationErrors
};
