import { cartDB, productDB } from '../utils/supabaseDB.js';

export const getCart = async (req, res) => {
  try {
    const items = await cartDB.getByUser(req.userId);
    res.json({ userId: req.userId, items: items || [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    const product = await productDB.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if item already in cart
    const cartItems = await cartDB.getByUser(req.userId);
    const existingItem = cartItems?.find(item => item.product_id === productId);
    
    if (existingItem) {
      // Update quantity
      await cartDB.updateQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      // Add new item
      await cartDB.addItem(req.userId, productId, quantity);
    }

    const updatedCart = await cartDB.getByUser(req.userId);
    res.json({ message: 'Item added to cart', cart: updatedCart });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { cartId } = req.body;
    
    await cartDB.removeItem(cartId);
    const updatedCart = await cartDB.getByUser(req.userId);
    res.json({ message: 'Item removed from cart', cart: updatedCart });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from cart', error: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { cartId, quantity } = req.body;
    
    if (quantity <= 0) {
      await cartDB.removeItem(cartId);
    } else {
      await cartDB.updateQuantity(cartId, quantity);
    }

    const updatedCart = await cartDB.getByUser(req.userId);
    res.json({ message: 'Cart updated', cart: updatedCart });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart', error: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    await cartDB.clearCart(req.userId);
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
};
