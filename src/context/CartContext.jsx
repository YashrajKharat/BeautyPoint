import { createContext, useState, useCallback } from 'react';
import { cartAPI } from '../services/api.js';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  const fetchCart = useCallback(async () => {
    try {
      const response = await cartAPI.getCart();
      setCart(response.data.items || []);
      calculateTotal(response.data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }, []);

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => {
      const product = item.products || item.productId;
      const itemPrice = product?.price || item.price || 0;
      return sum + (itemPrice * item.quantity);
    }, 0);
    setCartTotal(total);
  };

  const addToCart = async (productId, quantity, color) => {
    try {
      await cartAPI.addToCart({ productId, quantity, color });
      await fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await cartAPI.removeFromCart({ productId });
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      await cartAPI.updateCartItem({ productId, quantity });
      await fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCart([]);
      setCartTotal(0);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      cartTotal,
      fetchCart,
      addToCart,
      removeFromCart,
      updateCartItem,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
