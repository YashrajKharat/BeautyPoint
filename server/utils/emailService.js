import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root directory
// Load .env from project root directory (up 2 levels from utils)
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Create email transporter
// Create email transporter
// Use explicit SMTP settings for better reliability on Render
// Switched to Port 465 (SSL) and enabled debug logging
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  debug: true, // Show debug output
  logger: true // Log information to console
});

// Helper to send mail asynchronously (Fire & Forget)
const sendMailWithTimeout = async (mailOptions) => {
  // Return immediately to keep UI fast
  // We process the email in the background
  console.log('🚀 Triggering background email to:', mailOptions.to);

  transporter.sendMail(mailOptions)
    .then(info => console.log('✅ Background email sent:', info.messageId))
    .catch(error => console.error('❌ Background email failed:', error.message));

  return true;
};

/**
 * Send OTP via email
 * @param {string} email - Recipient email address
 * @param {string} otp - OTP code to send
 * @returns {Promise<boolean>} - Success status
 */
export const sendOTPEmail = async (email, otp) => {
  try {
    // Check if email is properly configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return true; // Allow process to continue for testing
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: '🔐 Your Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF6B9D 0%, #FF8C42 100%); padding: 30px; text-align: center; border-radius: 10px;">
            <h1 style="color: white; margin: 0;">🔐 Password Reset</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #333; margin-top: 0;">Hi there!</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              We received a request to reset your password. Use the OTP code below to proceed:
            </p>
            
            <div style="background: white; border: 2px solid #FF6B9D; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <p style="margin: 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Your OTP Code:</p>
              <h1 style="margin: 15px 0 0 0; color: #FF6B9D; font-size: 48px; font-weight: bold; font-family: 'Courier New', monospace; letter-spacing: 5px;">
                ${otp}
              </h1>
            </div>
            
            <div style="background: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #1565c0; font-size: 14px;">
                <strong>⏱️ This OTP is valid for 10 minutes only.</strong> Do not share this code with anyone.
              </p>
            </div>
            
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
              If you didn't request this password reset, please ignore this email. Your account is secure.
            </p>
            
            <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2024 Ecommerce Platform. All rights reserved.
              </p>
              <p style="color: #999; font-size: 11px; margin: 5px 0 0 0;">
                This is an automated email, please do not reply to this message.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await sendMailWithTimeout(mailOptions);
    console.log(`✅ OTP email sent to ${email} (Message ID: ${result.messageId})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${email}:`, error.message);

    // Fallback for development: log OTP to console
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Email sending failed. Falling back to console log for testing.');
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📧 OTP FOR TESTING (Email service failed)`);
      console.log(`Email: ${email}`);
      console.log(`OTP Code: ${otp}`);
      console.log(`Error: ${error.message}`);
      console.log(`${'='.repeat(60)}\n`);
      return true; // Allow testing to continue
    }

    return false;
  }
};

/**
 * Send password reset confirmation email
 * @param {string} email - Recipient email address
 * @returns {Promise<boolean>} - Success status
 */
export const sendPasswordResetConfirmation = async (email) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: '✅ Your Password Has Been Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px;">
            <h1 style="color: white; margin: 0;">✅ Password Reset Successful</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #333; margin-top: 0;">Password Updated!</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            
            <div style="background: #ecfdf5; border-left: 4px solid #10B981; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #065f46; font-size: 14px;">
                <strong>🔒 Your account is now secure.</strong> If you did not make this change, please contact our support team immediately.
              </p>
            </div>
            
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
              If you have any issues logging in or have questions, please don't hesitate to contact us.
            </p>
            
            <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2024 Ecommerce Platform. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await sendMailWithTimeout(mailOptions);
    console.log(`✅ Password reset confirmation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send confirmation email to ${email}:`, error.message);
    return false;
  }
};

/**
 * Verify email configuration
 * @returns {Promise<boolean>} - Whether email service is properly configured
 */
export const verifyEmailConfig = async () => {
  try {
    // Set a timeout for verification to prevent hanging
    const verifyPromise = transporter.verify();

    // Create a timeout promise that resolves false after 3 seconds
    const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(false), 3000));

    // Race them
    await Promise.race([verifyPromise, timeoutPromise]);

    console.log('✅ Email service is properly configured');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error.message);
    // In production, we don't want to crash, we just want to log that email won't work
    return false;
  }
};

/**
 * Send Order Confirmation Email
 * @param {string} email - Recipient email address
 * @param {object} order - Order details including items
 * @param {string} customerName - Customer's name
 * @returns {Promise<boolean>} - Success status
 */
export const sendOrderConfirmationEmail = async (email, order, customerName) => {
  try {
    // Check if email is properly configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return true;
    }

    // Generate product list HTML
    let productsHTML = '';
    if (order.order_items && order.order_items.length > 0) {
      productsHTML = order.order_items.map((item) => {
        const product = item.products || item.product;
        return `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">${product?.name || 'Product'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; color: #333;">x${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #333;">₹${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `;
      }).join('');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: '✅ Order Confirmation - Your Order Has Been Placed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px;">
            <h1 style="color: white; margin: 0;">✅ Order Confirmed!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${customerName},</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Thank you for your purchase! Your order has been successfully placed and confirmed.
            </p>

            <div style="background: #f0f4ff; padding: 20px; border-left: 4px solid #667eea; border-radius: 4px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">Order Information</h3>
              <p style="margin: 8px 0; color: #333;">
                <strong>Order ID:</strong> ${order.id}
              </p>
              <p style="margin: 8px 0; color: #333;">
                <strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p style="margin: 8px 0; color: #333;">
                <strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">Pending</span>
              </p>
            </div>

            <h3 style="color: #333; margin-top: 30px;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f0f4ff;">
                  <th style="padding: 12px; text-align: left; color: #667eea;">Product</th>
                  <th style="padding: 12px; text-align: center; color: #667eea;">Quantity</th>
                  <th style="padding: 12px; text-align: right; color: #667eea;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${productsHTML}
              </tbody>
            </table>

            <div style="background: #f0f4ff; padding: 20px; border-radius: 4px; margin-top: 20px;">
              <div style="display: flex; justify-content: space-between; font-size: 18px; margin-bottom: 10px;">
                <strong style="color: #333;">Total Amount:</strong>
                <strong style="color: #667eea;">₹${order.total_amount.toFixed(2)}</strong>
              </div>
            </div>

            <div style="background: #e8f5e9; padding: 20px; border-radius: 4px; margin-top: 20px; border-left: 4px solid #4CAF50;">
              <h3 style="color: #2e7d32; margin-top: 0;">What's Next?</h3>
              <ul style="color: #555; line-height: 1.8;">
                <li>We'll process your order and prepare it for shipment</li>
                <li>You'll receive a tracking number once your order ships</li>
                <li>Check your account for real-time updates on your order status</li>
              </ul>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #999; font-size: 14px;">
                If you have any questions, please don't hesitate to contact us.
              </p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Premium Store. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await sendMailWithTimeout(mailOptions);
    console.log(`✅ Order confirmation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error.message);
    return false;
  }
};

/**
 * Send Order Shipped Email
 * @param {string} email - Recipient email address
 * @param {object} order - Order details
 * @param {string} customerName - Customer's name
 * @returns {Promise<boolean>} - Success status
 */
export const sendOrderShippedEmail = async (email, order, customerName) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return true;
    }

    const trackingNumber = order.tracking?.trackingNumber || 'To be updated';
    const estimatedDelivery = order.tracking?.estimatedDelivery
      ? new Date(order.tracking.estimatedDelivery).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'Within 5-7 business days';

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: '📦 Your Order Has Been Shipped!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
          <div style="background: linear-gradient(135deg, #FF6B9D 0%, #FF8C42 100%); padding: 30px; text-align: center; border-radius: 10px;">
            <h1 style="color: white; margin: 0;">📦 Your Order Has Shipped!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${customerName},</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Great news! Your order is on its way to you. You can track your package using the tracking number below.
            </p>

            <div style="background: #fff3e0; padding: 20px; border-left: 4px solid #FF8C42; border-radius: 4px; margin: 20px 0;">
              <h3 style="color: #FF8C42; margin-top: 0;">Tracking Information</h3>
              <p style="margin: 8px 0; color: #333;">
                <strong>Order ID:</strong> ${order.id}
              </p>
              <p style="margin: 8px 0; color: #333;">
                <strong>Tracking Number:</strong> <span style="font-family: monospace; background: #fff; padding: 4px 8px; border-radius: 3px;">${trackingNumber}</span>
              </p>
              <p style="margin: 8px 0; color: #333;">
                <strong>Carrier:</strong> ${order.tracking?.carrier || 'Standard Shipping'}
              </p>
              <p style="margin: 8px 0; color: #333;">
                <strong>Estimated Delivery:</strong> ${estimatedDelivery}
              </p>
            </div>

            <div style="background: #e8f5e9; padding: 20px; border-radius: 4px; margin-top: 20px; border-left: 4px solid #4CAF50;">
              <h3 style="color: #2e7d32; margin-top: 0;">What to Expect</h3>
              <ul style="color: #555; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Your package is out for delivery</li>
                <li>Track your shipment using the tracking number</li>
                <li>Ensure someone is available to receive the package</li>
              </ul>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #999; font-size: 14px;">
                If you have any questions, please contact us.
              </p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Premium Store. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await sendMailWithTimeout(mailOptions);
    console.log(`✅ Order shipped email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending order shipped email:', error.message);
    return false;
  }
};

/**
 * Send Order Delivered Email
 * @param {string} email - Recipient email address
 * @param {object} order - Order details
 * @param {string} customerName - Customer's name
 * @returns {Promise<boolean>} - Success status
 */
export const sendOrderDeliveredEmail = async (email, order, customerName) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: '✅ Your Order Has Been Delivered!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; text-align: center; border-radius: 10px;">
            <h1 style="color: white; margin: 0;">✅ Your Order Has Been Delivered!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${customerName},</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Your order has been successfully delivered! We hope you enjoy your purchase. Thank you for shopping with us!
            </p>

            <div style="background: #e8f5e9; padding: 20px; border-left: 4px solid #4CAF50; border-radius: 4px; margin: 20px 0;">
              <h3 style="color: #2e7d32; margin-top: 0;">Delivery Details</h3>
              <p style="margin: 8px 0; color: #333;">
                <strong>Order ID:</strong> ${order.id}
              </p>
              <p style="margin: 8px 0; color: #333;">
                <strong>Delivered on:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p style="margin: 8px 0; color: #333;">
                <strong>Total Amount:</strong> ₹${order.total_amount.toFixed(2)}
              </p>
            </div>

            <div style="background: #f3e5f5; padding: 20px; border-radius: 4px; margin-top: 20px; border-left: 4px solid #9c27b0;">
              <h3 style="color: #6a1b9a; margin-top: 0;">We'd Love Your Feedback!</h3>
              <p style="color: #555; line-height: 1.6; margin: 0;">
                Please rate your shopping experience and let us know how we can improve. Your feedback helps us serve you better!
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #999; font-size: 14px;">
                If you have any questions about your order, please don't hesitate to contact us.
              </p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Premium Store. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await sendMailWithTimeout(mailOptions);
    console.log(`✅ Order delivered email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending order delivered email:', error.message);
    return false;
  }
};

export default {
  sendOTPEmail,
  sendPasswordResetConfirmation,
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  verifyEmailConfig
};
