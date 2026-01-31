import { cartDB, productDB } from '../utils/supabaseDB.js';

export const getCart = async (req, res) => {
  try {
    const items = await cartDB.getByUser(req.userId);

    // Ensure products are included - if not, fetch them
    let enrichedItems = items || [];
    if (enrichedItems.length > 0 && !enrichedItems[0].products) {
      // Fetch products for each cart item
      enrichedItems = await Promise.all(
        enrichedItems.map(async (item) => {
          const product = await productDB.findById(item.product_id);
          return { ...item, products: product };
        })
      );
    }

    res.json({ userId: req.userId, items: enrichedItems });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity, color } = req.body;

    const product = await productDB.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if item already in cart with same color
    const cartItems = await cartDB.getByUser(req.userId);
    const existingItem = cartItems?.find(item =>
      item.product_id === productId &&
      (item.selected_color === color || (!item.selected_color && !color))
    );

    if (existingItem) {
      // Update quantity
      await cartDB.updateQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      // Add new item
      await cartDB.addItem(req.userId, productId, quantity, color);
    }

    const updatedCart = await cartDB.getByUser(req.userId);
    res.json({ message: 'Item added to cart', cart: updatedCart });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;

    // Find the cart item by productId and userId
    const cartItems = await cartDB.getByUser(req.userId);
    const cartItem = cartItems?.find(item => item.product_id === productId);

    if (!cartItem) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    await cartDB.removeItem(cartItem.id);
    const updatedCart = await cartDB.getByUser(req.userId);
    res.json({ message: 'Item removed from cart', cart: updatedCart });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from cart', error: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Find the cart item by productId and userId
    const cartItems = await cartDB.getByUser(req.userId);
    const cartItem = cartItems?.find(item => item.product_id === productId);

    if (!cartItem) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      await cartDB.removeItem(cartItem.id);
    } else {
      await cartDB.updateQuantity(cartItem.id, quantity);
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
