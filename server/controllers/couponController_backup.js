import { couponDB } from '../utils/supabaseDB.js';

// Create a new coupon (Admin only)
export const createCoupon = async (req, res) => {
  try {
    const { code, discount_percent, max_uses, expiry_date } = req.body;

    if (!code || discount_percent === undefined || !expiry_date) {
      return res.status(400).json({ message: 'Code, discount percent, and expiry date are required' });
    }

    if (discount_percent < 0 || discount_percent > 100) {
      return res.status(400).json({ message: 'Discount percent must be between 0 and 100' });
    }

    const existingCoupon = await couponDB.findByCode(code.toUpperCase());
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const newCoupon = await couponDB.create({
      code: code.toUpperCase(),
      discount_percent,
      max_uses: max_uses || null,
      expiry_date
    });

    res.status(201).json({ message: 'Coupon created successfully', data: newCoupon });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create coupon', error: error.message });
  }
};

// Get all coupons (Admin)
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await couponDB.getAll();
    res.status(200).json({ data: coupons || [] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch coupons', error: error.message });
  }
};

// Validate and apply coupon
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await couponDB.findByCode(code.toUpperCase());

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon code not found' });
    }

    // Check if coupon has expired
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    // Check usage limit
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return res.status(400).json({ message: 'Coupon usage limit has been reached' });
    }

    // Calculate discount
    const discountAmount = (orderAmount * coupon.discount_percent) / 100;

    res.status(200).json({
      message: 'Coupon is valid',
      data: {
        code: coupon.code,
        discountPercent: coupon.discount_percent,
        discountAmount: Math.round(discountAmount)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to validate coupon', error: error.message });
  }
};

// Delete coupon (Admin)
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await couponDB.delete(id);
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete coupon', error: error.message });
  }
};
