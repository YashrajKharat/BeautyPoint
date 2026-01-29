import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { CartContext } from '../context/CartContext.jsx';
import { orderAPI, couponAPI } from '../services/api.js';
import { Loader } from '../components/Loader.jsx';
import '../css/checkout-premium.css';
import '../css/checkout-coupon.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const { cart, fetchCart, clearCart } = useContext(CartContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [checkoutProductQuantity, setCheckoutProductQuantity] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const hasInitialized = useRef(false);
  const [formData, setFormData] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || ''
  });

  // Validation rules for checkout form
  const validateCheckoutForm = () => {
    const errors = {};
    
    if (!formData.street.trim()) {
      errors.street = true;
    }
    
    if (!formData.city.trim()) {
      errors.city = true;
    }
    
    if (!formData.state.trim()) {
      errors.state = true;
    }
    
    if (!formData.zipCode.trim()) {
      errors.zipCode = true;
    } else if (!/^\d{5,10}$/.test(formData.zipCode.replace(/\s/g, ''))) {
      errors.zipCode = true;
    }
    
    if (!formData.country.trim()) {
      errors.country = true;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormDataChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check if coming from "Buy Now" button - read BEFORE clearing
    const productFromSession = sessionStorage.getItem('checkoutProduct');
    
    if (productFromSession) {
      // Coming from "Buy Now" button
      try {
        const product = JSON.parse(productFromSession);
        setCheckoutProduct(product);
        setCheckoutProductQuantity(1);
        console.log('Using single product from session:', product.name);
        // Clear after reading
        sessionStorage.removeItem('checkoutProduct');
      } catch (error) {
        console.error('Error parsing checkout product:', error);
        setCheckoutProduct(null);
        sessionStorage.removeItem('checkoutProduct');
      }
    } else {
      // Coming from cart page - load cart items
      if (!hasInitialized.current) {
        hasInitialized.current = true;
        console.log('No checkout product in session, loading cart...');
        setIsCartLoading(true);
        fetchCart().then(() => {
          console.log('Cart fetched successfully');
          setIsCartLoading(false);
        }).catch((err) => {
          console.error('Error fetching cart:', err);
          setIsCartLoading(false);
        });
      }
    }
  }, [isAuthenticated, navigate, fetchCart]);

  const handleInputChange = (e) => {
    handleFormDataChange(e.target.name, e.target.value);
  };

  // Debug: Log whenever cart updates
  useEffect(() => {
    console.log('Cart updated in checkout:', {
      cartLength: cart?.length,
      cartItems: cart?.map(item => ({
        name: item.products?.name || item.name,
        price: item.products?.price || item.price,
        qty: item.quantity
      }))
    });
  }, [cart]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');
    
    try {
      const response = await couponAPI.validateCoupon(couponCode, checkoutSubtotal);
      setAppliedCoupon(response.data.data);
      setCouponCode('');
    } catch (error) {
      setCouponError(error.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    // Validate form before processing
    if (!validateCheckoutForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const shippingAddress = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country
      };

      const orderData = { shippingAddress };
      
      // Calculate totals
      const shippingCost = calculateShippingCost();
      const subtotalAfterDiscount = checkoutSubtotal - discountAmount;
      const totalAmount = subtotalAfterDiscount + shippingCost;
      
      if (checkoutProduct) {
        orderData.items = [{
          productId: checkoutProduct.id,
          quantity: checkoutProductQuantity,
          price: checkoutProduct.price
        }];
      } else {
        // Items from cart
        orderData.items = cart.map((item) => {
          const product = item.products || item.productId;
          const itemPrice = product?.price || item.price || 0;
          return {
            productId: product?.id || item.product_id,
            quantity: item.quantity,
            price: itemPrice
          };
        });
      }

      // Add shipping and total cost
      orderData.shippingCost = shippingCost;
      orderData.totalAmount = totalAmount;

      // Add coupon code if applied
      if (appliedCoupon) {
        orderData.couponCode = appliedCoupon.code;
        orderData.discountAmount = discountAmount;
      }

      const response = await orderAPI.createOrder(orderData);
      
      if (checkoutProduct) {
        sessionStorage.removeItem('checkoutProduct');
      } else {
        await clearCart();
      }
      
      navigate(`/order-confirmation/${response.data.order.id}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  const cartSubtotal = (cart?.length || 0) > 0 ? cart.reduce((total, item) => {
    // Try to get product details from various possible locations
    const product = item.products || item.product || item.productId;
    
    // Get price from product object or fallback to item.price
    let itemPrice = 0;
    if (product && typeof product === 'object') {
      itemPrice = product.price || 0;
    } else {
      itemPrice = item.price || 0;
    }
    
    const qty = item.quantity || 1;
    const itemTotal = itemPrice * qty;
    
    console.log('Cart item calculation:', { 
      productName: product?.name || 'Unknown', 
      price: itemPrice, 
      qty, 
      itemTotal,
      hasProducts: !!item.products,
      hasProduct: !!item.product,
      hasProductId: !!item.productId
    });
    
    return total + itemTotal;
  }, 0) : 0;

  console.log('=== CHECKOUT DEBUG ===');
  console.log('Full cart array:', cart);
  console.log('Checkout Summary:', { 
    isCheckoutProduct: !!checkoutProduct,
    cartLength: cart?.length,
    cartSubtotal,
    checkoutProduct: checkoutProduct?.name,
    hasCartItems: (cart?.length || 0) > 0
  });
  console.log('checkoutProduct value:', checkoutProduct);
  console.log('=== END DEBUG ===');

  const checkoutSubtotal = checkoutProduct ? (checkoutProduct.price * checkoutProductQuantity) : cartSubtotal;
  
  const calculateShippingCost = () => {
    return checkoutSubtotal > 300 ? 0 : 120;
  };

  const discountAmount = appliedCoupon ? Math.round(checkoutSubtotal * (appliedCoupon.discountPercent / 100)) : 0;
  const subtotalAfterDiscount = checkoutSubtotal - discountAmount;
  const orderTotal = subtotalAfterDiscount + calculateShippingCost();

  return (
    <div className="premium-checkout-container">
      <Loader visible={isLoading} size="md" />
      {/* Header */}
      <div className="checkout-header">
        <div className="header-content">
          <h1>Secure Checkout</h1>
          <p>Complete your purchase with confidence</p>
        </div>
      </div>

      <div className="checkout-wrapper">
        {/* Main Form Section */}
        <div className="checkout-form-section">
          <form onSubmit={handlePlaceOrder} className="checkout-form">
            {/* Shipping Address Section */}
            <div className="form-section">
              <div className="section-header">
                <h2>📍 Shipping Address</h2>
              </div>
              
              <div className="form-group">
                <label htmlFor="street">Street Address *</label>
                <input
                  id="street"
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="Enter your street address"
                  className={validationErrors.street ? 'input-error' : ''}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className={validationErrors.city ? 'input-error' : ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State *</label>
                  <input
                    id="state"
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className={validationErrors.state ? 'input-error' : ''}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="zipCode">ZIP Code *</label>
                  <input
                    id="zipCode"
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="ZIP Code"
                    className={validationErrors.zipCode ? 'input-error' : ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country">Country *</label>
                  <input
                    id="country"
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                    className={validationErrors.country ? 'input-error' : ''}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="form-section">
              <div className="section-header">
                <h2>💳 Payment Method</h2>
              </div>
              
              <div className="payment-option">
                <input type="radio" id="cod" name="payment" value="cod" defaultChecked />
                <label htmlFor="cod" className="payment-label">
                  <span className="payment-icon">🚚</span>
                  <div className="payment-info">
                    <span className="payment-name">Cash on Delivery (COD)</span>
                    <span className="payment-desc">Pay when your order is delivered</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Coupon Code Section */}
            <div className="form-section">
              <div className="section-header">
                <h2>🎟️ Apply Coupon Code</h2>
              </div>
              
              {appliedCoupon ? (
                <div className="applied-coupon">
                  <div className="coupon-badge">
                    <span className="coupon-code">{appliedCoupon.code}</span>
                    <span className="discount-badge">{appliedCoupon.discountPercent}% OFF</span>
                  </div>
                  <p className="coupon-desc">{appliedCoupon.description}</p>
                  <button 
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="remove-coupon-btn"
                  >
                    ✕ Remove Coupon
                  </button>
                </div>
              ) : (
                <div className="coupon-input-group">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError('');
                    }}
                    placeholder="Enter coupon code (e.g., SAVE10)"
                    className="coupon-input"
                    disabled={couponLoading}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="apply-coupon-btn"
                  >
                    {couponLoading ? '⏳ Checking...' : '✓ Apply'}
                  </button>
                </div>
              )}
              {couponError && <span className="coupon-error">{couponError}</span>}
            </div>

            {/* Place Order Button */}
            <button 
              type="submit" 
              disabled={isLoading} 
              className="place-order-btn"
            >
              {isLoading ? '⏳ Processing...' : '✓ Place Order'}
            </button>
          </form>
        </div>

        {/* Order Summary Section */}
        <div className="order-summary-section">
          <div className="summary-card">
            <div className="summary-header">
              <h2>📦 Order Summary</h2>
            </div>

            <div className="summary-items">
              {checkoutProduct ? (
                <div className="summary-item">
                  <div className="item-details">
                    <span className="item-name">{checkoutProduct.name}</span>
                    <div className="item-qty-selector">
                      <label>Quantity: </label>
                      <button 
                        type="button"
                        onClick={() => setCheckoutProductQuantity(Math.max(1, checkoutProductQuantity - 1))}
                        className="qty-btn"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={checkoutProductQuantity}
                        onChange={(e) => setCheckoutProductQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="qty-input"
                        min="1"
                      />
                      <button 
                        type="button"
                        onClick={() => setCheckoutProductQuantity(checkoutProductQuantity + 1)}
                        className="qty-btn"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <span className="item-price">₹{(checkoutProduct.price * checkoutProductQuantity).toFixed(2)}</span>
                </div>
              ) : isCartLoading ? (
                <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>Loading cart items...</p>
              ) : cart && cart.length > 0 ? (
                cart.map((item, index) => {
                  const product = item.products || item.productId;
                  const itemPrice = product?.price || item.price || 0;
                  const itemName = product?.name || item.name;
                  const qty = item.quantity || 1;
                  return (
                    <div key={`${product?.id || item.product_id}-${index}`} className="summary-item">
                      <div className="item-details">
                        <span className="item-name">{itemName}</span>
                        <span className="item-qty">Qty: {qty}</span>
                      </div>
                      <span className="item-price">₹{(itemPrice * qty).toFixed(2)}</span>
                    </div>
                  );
                })
              ) : (
                <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>Your cart is empty</p>
              )}
            </div>

            <div className="summary-divider"></div>

            {/* Price Breakdown */}
            <div className="price-breakdown">
              <div className="breakdown-row">
                <span className="breakdown-label">Subtotal</span>
                <span className="breakdown-value">₹{checkoutSubtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="breakdown-row discount-row">
                  <span className="breakdown-label">
                    Discount ({appliedCoupon.discountPercent}%)
                  </span>
                  <span className="breakdown-value discount">-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="breakdown-row">
                <span className="breakdown-label">Subtotal after discount</span>
                <span className="breakdown-value">₹{subtotalAfterDiscount.toFixed(2)}</span>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-label">Shipping</span>
                <span className={`breakdown-value ${calculateShippingCost() === 0 ? 'discount' : ''}`}>
                  {calculateShippingCost() === 0 ? 'FREE' : `₹${calculateShippingCost().toFixed(2)}`}
                </span>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-label">Tax</span>
                <span className="breakdown-value">₹0.00</span>
              </div>
            </div>

            <div className="summary-divider"></div>

            {/* Total */}
            <div className="summary-total">
              <span className="total-label">Order Total</span>
              <span className="total-price">₹{orderTotal.toFixed(2)}</span>
            </div>

            {/* Additional Info */}
            <div className="summary-info">
              <div className="info-item">
                <span className="info-icon">✓</span>
                <span>Secure Payment</span>
              </div>
              <div className="info-item">
                <span className="info-icon">✓</span>
                <span>Easy Returns</span>
              </div>
              <div className="info-item">
                <span className="info-icon">✓</span>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
