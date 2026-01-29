import { useEffect, useContext, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { CartContext } from '../context/CartContext.jsx';
import { Loader } from '../components/Loader.jsx';
import { getImageUrl } from '../utils/imageHelper.js';
import '../css/cart-premium.css';

export default function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { cart, fetchCart, removeFromCart, updateCartItem } = useContext(CartContext);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!hasInitialized.current) {
      hasInitialized.current = true;
      const loadCart = async () => {
        try {
          await fetchCart();
        } catch (error) {
          console.error('Failed to fetch cart:', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadCart();
    }
  }, [isAuthenticated, navigate, fetchCart]);

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const product = item.products || item.productId;
      const itemPrice = product?.price || item.price || 0;
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const calculateShippingCost = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 300 ? 0 : 120;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShippingCost();
  };

  const handleRemove = async (productId) => {
    await removeFromCart(productId);
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity > 0) {
      await updateCartItem(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="cart-loading">
        <div className="spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="empty-cart-container">
        <div className="empty-cart-card">
          <div className="empty-icon">🛒</div>
          <h2>Your Cart is Empty</h2>
          <p>You haven't added any products to your cart yet.</p>
          <button onClick={() => navigate('/products')} className="continue-shopping-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-cart-container">
      <Loader visible={isLoading} size="md" />
      {/* Header */}
      <div className="cart-header">
        <div className="header-content">
          <h1>Shopping Cart</h1>
          <p>You have {cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
        </div>
      </div>

      <div className="cart-wrapper">
        {/* Cart Items Section */}
        <div className="cart-items-section">
          <div className="items-header">
            <h2>📦 Cart Items</h2>
            <span className="item-count">{cart.length} items</span>
          </div>

          <div className="cart-items-list">
            {cart && cart.length > 0 ? (
              cart.map((item) => {
                // Handle both nested product structures: item.products (from Supabase) or item.productId
                const product = item.products || item.productId;
                const productId = product?.id || item.product_id || item.id;
                const productName = product?.name || item.name;
                const productImage = product?.image || item.image;
                const itemPrice = product?.price || item.price || 0;
                const itemQuantity = item.quantity;

                return (
                  <div key={productId} className="cart-item-card">
                    <div className="item-image">
                      <img src={getImageUrl(productImage)} alt={productName} />
                    </div>

                    <div className="item-info">
                      <h3 className="item-name">{productName}</h3>
                      <p className="item-price">₹{itemPrice?.toFixed(2) || '0.00'}</p>
                    </div>

                    <div className="quantity-controller">
                      <button
                        className="qty-btn"
                        onClick={() => handleQuantityChange(productId, itemQuantity - 1)}
                        title="Decrease quantity"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        className="qty-input"
                        value={itemQuantity}
                        readOnly
                      />
                      <button
                        className="qty-btn"
                        onClick={() => handleQuantityChange(productId, itemQuantity + 1)}
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="item-total-price">
                      <span className="label">Total</span>
                      <span className="price">₹{(itemPrice * itemQuantity)?.toFixed(2) || '0.00'}</span>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => handleRemove(productId)}
                      title="Remove from cart"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="no-items">No items in cart</p>
            )}
          </div>
        </div>

        {/* Cart Summary Section */}
        <div className="cart-summary-section">
          <div className="summary-card">
            <div className="summary-title">
              <h2>Order Summary</h2>
            </div>

            <div className="summary-body">
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">₹{calculateSubtotal().toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span className="summary-label">Shipping</span>
                <span className={`summary-value ${calculateShippingCost() === 0 ? 'free' : ''}`}>
                  {calculateShippingCost() === 0 ? 'FREE' : `₹${calculateShippingCost().toFixed(2)}`}
                </span>
              </div>

              <div className="summary-row">
                <span className="summary-label">Discount</span>
                <span className="summary-value discount">-₹0.00</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total-row">
                <span className="summary-label">Total Amount</span>
                <span className="summary-value-total">₹{calculateTotal().toFixed(2)}</span>
              </div>

              <button
                className="checkout-btn"
                onClick={handleCheckout}
              >
                ✓ Proceed to Checkout
              </button>

              <button
                className="continue-btn"
                onClick={() => navigate('/products')}
              >
                ← Continue Shopping
              </button>
            </div>

            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="badge">
                <span className="badge-icon">🔒</span>
                <span className="badge-text">Secure Checkout</span>
              </div>
              <div className="badge">
                <span className="badge-icon">🚚</span>
                <span className="badge-text">Free Shipping</span>
              </div>
              <div className="badge">
                <span className="badge-icon">↩️</span>
                <span className="badge-text">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
