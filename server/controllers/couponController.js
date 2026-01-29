import { couponDB } from '../utils/supabaseDB.js';

export const createCoupon = async (req, res) => {
  try {
    // Accept both camelCase and snake_case from frontend
    const code = req.body.code;
    const discountPercent = req.body.discountPercent || req.body.discount_percent;
    const maxUsageCount = req.body.maxUsageCount || req.body.max_uses;
    const expiryDate = req.body.expiryDate || req.body.expiry_date;

    if (!code || discountPercent === undefined || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Code, discount percent, and expiry date are required'
      });
    }

    const newCoupon = await couponDB.create({
      code: code.toUpperCase(),
      discount_percent: discountPercent,
      max_uses: maxUsageCount || null,
      expiry_date: expiryDate,
      current_uses: 0
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: newCoupon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create coupon',
      error: error.message
    });
  }
};

export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await couponDB.getAll();
    res.status(200).json({
      success: true,
      count: coupons?.length || 0,
      data: coupons || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons',
      error: error.message
    });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    const coupon = await couponDB.findByCode(code.toUpperCase());

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon code not found'
      });
    }

    const now = new Date();
    if (coupon.expiry_date && new Date(coupon.expiry_date) < now) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has expired'
      });
    }

    if (coupon.current_uses >= coupon.max_uses) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has reached maximum uses'
      });
    }

    const discount = (orderTotal * coupon.discount_percent) / 100;

    res.status(200).json({
      success: true,
      message: 'Coupon is valid',
      data: {
        couponId: coupon.id,
        code: coupon.code,
        discountPercent: coupon.discount_percent,
        discountAmount: discount,
        finalTotal: orderTotal - discount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to validate coupon',
      error: error.message
    });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    // Accept both camelCase and snake_case from frontend
    const code = req.body.code;
    const discountPercent = req.body.discountPercent || req.body.discount_percent;
    const maxUsageCount = req.body.maxUsageCount || req.body.max_uses;
    const expiryDate = req.body.expiryDate || req.body.expiry_date;

    if (!code || discountPercent === undefined || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Code, discount percent, and expiry date are required'
      });
    }

    const updatedCoupon = await couponDB.update(id, {
      code: code.toUpperCase(),
      discount_percent: discountPercent,
      max_uses: maxUsageCount || null,
      expiry_date: expiryDate
    });

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: updatedCoupon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update coupon',
      error: error.message
    });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await couponDB.delete(id);
    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete coupon',
      error: error.message
    });
  }
};
