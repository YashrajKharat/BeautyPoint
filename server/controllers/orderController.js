import { orderDB, cartDB, productDB, couponDB, userDB, supabase } from '../utils/supabaseDB.js';
import { sendOrderConfirmationEmail, sendOrderShippedEmail, sendOrderDeliveredEmail } from '../utils/emailService.js';
import crypto from 'crypto';

// Helper function to generate deterministic tracking number based on order ID
const generateTrackingNumber = (orderId) => {
  // Create a hash from the order ID to ensure it's always the same for the same order
  const hash = crypto.createHash('md5').update(orderId).digest('hex').substring(0, 8).toUpperCase();
  return `TRACK${hash}`;
};

// Helper function to enrich order with tracking data
const enrichOrderWithTracking = (order) => {
  if (!order) return null;

  const tracking = {
    trackingNumber: order.tracking_number || generateTrackingNumber(order.id),
    carrier: order.carrier || 'Standard Shipping',
    estimatedDelivery: order.estimated_delivery || new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    currentLocation: order.current_location || 'Processing',
    updates: order.tracking_updates || [
      {
        status: 'Order Confirmed',
        location: 'Warehouse',
        timestamp: order.created_at,
        message: 'Your order has been confirmed'
      }
    ]
  };

  return {
    ...order,
    tracking
  };
};

export const createOrder = async (req, res) => {
  try {
    const { shippingAddress, items, totalAmount, shippingCost, couponCode, discountAmount } = req.body;

    // console.log('📦 Creating order with data:', { shippingAddress, items, totalAmount, shippingCost });
    // console.log('👤 Current user ID:', req.userId);

    // Check if user is in admin table (not allowed to place orders as customers)
    // console.log('🔍 Checking if user is admin or customer...');
    // Check if user is admin (not allowed to place orders as customers)
    const user = await userDB.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        message: 'Admins cannot place orders. Please use a customer account to place orders.',
        error: 'Admin users cannot checkout'
      });
    }
    // console.log('✅ User is a customer, proceeding with order creation');

    let calculatedTotal = 0;
    let itemsToOrder = items || [];

    // If no items provided, use cart items
    if (!itemsToOrder || itemsToOrder.length === 0) {
      const cartItems = await cartDB.getByUser(req.userId);
      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }
      itemsToOrder = cartItems;
    }

    // Validate stock and calculate total
    for (let item of itemsToOrder) {
      // Support both productId and product_id formats
      const productId = item.product_id || item.productId;
      const product = await productDB.findById(productId);

      if (!product) {
        // console.error('❌ Product not found:', productId);
        return res.status(404).json({ message: 'Product not found' });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`
        });
      }

      calculatedTotal += product.price * item.quantity;

      // Update product stock
      await productDB.update(product.id, { stock: product.stock - item.quantity });
    }

    // Create order
    const finalTotalAmount = totalAmount || calculatedTotal;
    // console.log('💾 Saving order with total:', finalTotalAmount);

    const order = await orderDB.create({
      user_id: req.userId,
      total_amount: finalTotalAmount,
      status: 'pending',
      shipping_address: shippingAddress
    });

    // console.log('✅ Order created:', order.id);

    // Add order items
    for (let item of itemsToOrder) {
      try {
        const productId = item.product_id || item.productId;
        const product = await productDB.findById(productId);

        // console.log('📑 Adding item:', { productId, quantity: item.quantity });

        await orderDB.addOrderItem({
          order_id: order.id,
          product_id: productId,
          quantity: item.quantity,
          price: product.price,
          selected_color: item.selectedColor || item.selected_color
        });
      } catch (itemError) {
        // console.error('❌ Error adding order item:', itemError);
        throw itemError;
      }
    }

    // Clear cart
    try {
      await cartDB.clearCart(req.userId);
    } catch (cartError) {
      // console.warn('⚠️ Warning clearing cart:', cartError);
    }

    // Update coupon usage
    if (couponCode) {
      try {
        const coupon = await couponDB.findByCode(couponCode.toUpperCase());
        if (coupon) {
          await couponDB.update(coupon.id, {
            current_uses: (coupon.current_uses || 0) + 1
          });
        }
      } catch (couponError) {
        // console.error('Error updating coupon usage:', couponError);
      }
    }

    // Fetch the complete order with items
    const completeOrder = await orderDB.getById(order.id);

    // Send order confirmation email to user
    try {
      const user = await userDB.findById(req.userId);
      if (user && user.email) {
        await sendOrderConfirmationEmail(user.email, completeOrder, user.name || 'Customer');
      }
    } catch (emailError) {
      console.error('Warning: Failed to send order confirmation email:', emailError.message);
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      message: 'Order placed successfully',
      order: completeOrder
    });
  } catch (error) {
    // console.error('🔴 Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await orderDB.getByUser(req.userId);
    const enrichedOrders = (orders || []).map(enrichOrderWithTracking);
    res.json(enrichedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId || orderId === 'undefined') {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await orderDB.getById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user_id !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const enrichedOrder = enrichOrderWithTracking(order);
    res.json(enrichedOrder);
  } catch (error) {
    // console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

export const trackOrder = async (req, res) => {
  try {
    const order = await orderDB.getById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user_id !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const enrichedOrder = enrichOrderWithTracking(order);
    res.json({
      orderNumber: order.id,
      orderStatus: order.status,
      tracking: enrichedOrder.tracking,
      totalAmount: order.total_amount,
      createdAt: order.created_at
    });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking order', error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await orderDB.getById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If cancelling and restoring stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const orderItems = await orderDB.getById(req.params.orderId);
      if (orderItems.order_items) {
        for (let item of orderItems.order_items) {
          const product = await productDB.findById(item.product_id);
          if (product) {
            await productDB.update(product.id, { stock: product.stock + item.quantity });
          }
        }
      }
    }

    const updatedOrder = await orderDB.update(req.params.orderId, { status });

    // Enrich order with tracking data for emails
    const enrichedOrder = enrichOrderWithTracking(updatedOrder);

    // Send status update emails
    try {
      const user = await userDB.findById(order.user_id);
      if (user && user.email) {
        if (status.toLowerCase() === 'shipped') {
          await sendOrderShippedEmail(user.email, enrichedOrder, user.name || 'Customer');
        } else if (status.toLowerCase() === 'delivered') {
          await sendOrderDeliveredEmail(user.email, enrichedOrder, user.name || 'Customer');
        }
      }
    } catch (emailError) {
      console.error('Warning: Failed to send status update email:', emailError.message);
      // Don't fail the order status update if email fails
    }

    res.json({ message: 'Order status updated', order: enrichedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await orderDB.getById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user_id !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (['shipped', 'out-for-delivery', 'delivered'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel order at this stage' });
    }

    // Restore product stock
    const orderData = await orderDB.getById(req.params.orderId);
    if (orderData.order_items) {
      for (let item of orderData.order_items) {
        const product = await productDB.findById(item.product_id);
        if (product) {
          await productDB.update(product.id, { stock: product.stock + item.quantity });
        }
      }
    }

    const updatedOrder = await orderDB.update(req.params.orderId, { status: 'cancelled' });
    res.json({ message: 'Order cancelled successfully', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling order', error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await orderDB.getAll();
    const enrichedOrders = (orders || []).map(enrichOrderWithTracking);
    res.json(enrichedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

export const requestReturn = async (req, res) => {
  try {
    const order = await orderDB.getById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user_id !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Only delivered orders can be returned' });
    }

    const updatedOrder = await orderDB.update(req.params.orderId, { status: 'return-requested' });

    // Enrich and send email notification to user (optional but good practice)
    // For now just return success

    res.json({ message: 'Return requested successfully', order: enrichOrderWithTracking(updatedOrder) });
  } catch (error) {
    res.status(500).json({ message: 'Error requesting return', error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderDB.getById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow admin (checked by middleware) or user who owns it (though this is an admin feature)
    // adminMiddleware should be used on the route.

    await orderDB.delete(orderId);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
};