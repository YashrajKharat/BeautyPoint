import { userDB } from '../utils/supabaseDB.js';
import { supabase } from '../utils/supabaseDB.js';
import { generateToken } from '../middleware/authMiddleware.js';
import bcrypt from 'bcryptjs';
import { sendOTPEmail, sendPasswordResetConfirmation } from '../utils/emailService.js';

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role = 'user' } = req.body;

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if user already exists
    const existingUser = await userDB.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // If trying to register as admin, strict check for ONLY ONE admin
    if (role === 'admin') {
      const { data: existingAdmins, error: adminCheckError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin')
        .limit(1);

      if (adminCheckError) throw adminCheckError;

      if (existingAdmins && existingAdmins.length > 0) {
        return res.status(400).json({ message: 'Admin slot is already taken. Only one admin is allowed.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userDB.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role
    });

    const token = generateToken(user.id);
    res.status(201).json({
      message: role === 'admin' ? 'Admin registered successfully' : 'User registered successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userDB.findByEmail(email);

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = generateToken(user.id);
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const whatsappLogin = async (req, res) => {
  try {
    const { phone, name, email } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    let user = await userDB.findByPhone(phone);

    if (!user) {
      // Create new user (Sign Up)
      // Generate random password for WhatsApp users
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await userDB.create({
        name: name || 'User',
        email: email || null, // Email is optional now
        phone: phone,
        password: hashedPassword,
        role: 'user'
      });
    }

    const token = generateToken(user.id);
    res.json({
      message: 'WhatsApp login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'WhatsApp login failed', error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await userDB.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await userDB.update(req.userId, { name, phone, address });

    const { password, ...userWithoutPassword } = user;
    res.json({ message: 'Profile updated', user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Admin endpoints
export const getAllUsers = async (req, res) => {
  try {
    const users = await userDB.getAll();
    // Remove passwords from response
    const usersWithoutPassword = users.map(u => {
      const { password, ...user } = u;
      return user;
    });
    res.json(usersWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userDB.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const { data: admins } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin');

      if (admins && admins.length <= 1) {
        return res.status(400).json({ message: 'Cannot delete the only admin.' });
      }
    }

    // Delete related records first (cascade delete)
    // Delete from orders and order_items
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', id);

    if (!ordersError && orders && orders.length > 0) {
      const orderIds = orders.map(o => o.id);

      // Delete order items first
      await supabase
        .from('order_items')
        .delete()
        .in('order_id', orderIds);

      // Delete orders
      await supabase
        .from('orders')
        .delete()
        .eq('user_id', id);
    }

    // Delete from cart
    await supabase
      .from('cart')
      .delete()
      .eq('user_id', id);

    // Finally delete the user
    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) throw error;

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Password Reset Functions
export const sendPasswordResetOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await userDB.findByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP expiration to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Update user with OTP
    await userDB.update(user.id, {
      reset_otp: {
        code: otp,
        expiresAt: expiresAt,
        attempts: 0
      }
    });

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);

    // In development, allow process to continue even if email fails
    if (!emailSent && process.env.NODE_ENV !== 'development') {
      return res.status(500).json({
        message: 'OTP generated but failed to send email. Please try again.'
      });
    }

    res.json({
      message: emailSent
        ? 'OTP sent to your email. Check your inbox.'
        : 'OTP generated. Check your server console for OTP (email service not configured).',
      // Keep testOTP only in development mode
      ...(process.env.NODE_ENV === 'development' && { testOTP: otp })
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
};

export const verifyPasswordResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await userDB.findByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP exists
    if (!user.reset_otp || !user.reset_otp.code) {
      return res.status(400).json({ message: 'No OTP request found. Please request a new OTP.' });
    }

    // Check if OTP has expired
    if (new Date() > new Date(user.reset_otp.expiresAt)) {
      await userDB.update(user.id, { reset_otp: null });
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Check OTP attempts (limit to 5 attempts)
    if (user.reset_otp.attempts >= 5) {
      await userDB.update(user.id, { reset_otp: null });
      return res.status(429).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (user.reset_otp.code !== otp) {
      const updatedAttempts = user.reset_otp.attempts + 1;
      await userDB.update(user.id, {
        reset_otp: {
          ...user.reset_otp,
          attempts: updatedAttempts
        }
      });
      const remainingAttempts = 5 - updatedAttempts;
      return res.status(400).json({
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.`
      });
    }

    // OTP is valid
    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Validate input
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await userDB.findByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP exists and verify it
    if (!user.reset_otp || !user.reset_otp.code) {
      return res.status(400).json({ message: 'No OTP request found' });
    }

    // Check OTP expiration
    if (new Date() > new Date(user.reset_otp.expiresAt)) {
      await userDB.update(user.id, { reset_otp: null });
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Verify OTP
    if (user.reset_otp.code !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    await userDB.update(user.id, {
      password: hashedPassword,
      reset_otp: null
    });

    // Send password reset confirmation email
    await sendPasswordResetConfirmation(email);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

export const makeAdmin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await userDB.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'User is already an admin' });
    }

    // Check if there is already an admin in the USERS table
    const { data: existingAdmins, error } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (existingAdmins && existingAdmins.length > 0) {
      return res.status(400).json({ message: 'Admin slot is already taken. Only one admin is allowed.' });
    }

    await userDB.update(user.id, { role: 'admin' });

    res.json({
      message: 'User promoted to admin successfully',
      user: { id: user.id, name: user.name, email: user.email, role: 'admin' }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error promoting user to admin', error: error.message });
  }
};

export const checkAdminExists = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (error) throw error;

    const adminExists = data && data.length > 0;
    res.json({ adminExists });
  } catch (error) {
    res.status(500).json({ message: 'Error checking admin existence', error: error.message });
  }
};