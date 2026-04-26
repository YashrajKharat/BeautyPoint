/**
 * META PIXEL INTEGRATION EXAMPLES
 * Copy-paste these into your corresponding page files
 */

// ============================================
// 1. PRODUCTDETAIL.JSX - Track Product Views
// ============================================
/*
import { useEffect } from 'react';
import { trackViewContent, trackAddToCart } from '../utils/metaPixel';

export default function ProductDetail() {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // Track product view when product loads
    if (product) {
      trackViewContent({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category || 'product',
        description: product.description
      });
    }
  }, [product]);

  const handleAddToCart = () => {
    // Track add to cart
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      category: product.category
    });
    // Then add to cart logic...
  };

  return (
    <div>
      {/* Product details UI */}
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
}
*/

// ============================================
// 2. CART.JSX - Track Cart Updates
// ============================================
/*
import { trackRemoveFromCart, trackInitiateCheckout } from '../utils/metaPixel';

export default function Cart() {
  const [cart, setCart] = useState([]);

  const handleRemoveItem = (item) => {
    // Track remove from cart
    trackRemoveFromCart({
      id: item.id,
      name: item.name,
      price: item.price
    });
    
    // Remove from cart logic
    const updated = cart.filter(i => i.id !== item.id);
    setCart(updated);
  };

  const handleCheckout = () => {
    // Track checkout initiation
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    trackInitiateCheckout({
      total: total,
      numItems: cart.length,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    });
    
    // Navigate to checkout
    navigate('/checkout');
  };

  return (
    <div>
      {/* Cart items */}
      <button onClick={handleCheckout}>Proceed to Checkout</button>
    </div>
  );
}
*/

// ============================================
// 3. CHECKOUT.JSX - Track Payment Info
// ============================================
/*
import { trackAddPaymentInfo } from '../utils/metaPixel';

export default function Checkout() {
  const handlePaymentSubmit = (paymentData) => {
    // Track when payment info is added
    trackAddPaymentInfo({
      total: orderTotal,
      payment_method: paymentData.method,
      currency: 'INR'
    });
    
    // Process payment
    processPayment(paymentData);
  };

  return (
    <form onSubmit={handlePaymentSubmit}>
      {/* Checkout form */}
    </form>
  );
}
*/

// ============================================
// 4. ORDERCONFIRMATION.JSX - Track Purchase (MOST IMPORTANT!)
// ============================================
/*
import { useEffect } from 'react';
import { trackPurchase } from '../utils/metaPixel';

export default function OrderConfirmation() {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Fetch order details
    const orderId = getOrderIdFromURL();
    fetchOrder(orderId).then(data => {
      setOrder(data);
      
      // CRITICAL: Track purchase when order is confirmed
      trackPurchase({
        id: data.id,
        total: data.total,
        currency: 'INR',
        numItems: data.items.length,
        products: data.items.map(item => ({
          id: item.productId,
          name: item.productName,
          price: item.price,
          quantity: item.quantity
        }))
      });
    });
  }, []);

  return (
    <div>
      <h1>Order Confirmed!</h1>
      <p>Order ID: {order?.id}</p>
      <p>Total: ₹{order?.total}</p>
    </div>
  );
}
*/

// ============================================
// 5. LOGIN.JSX - Track Login
// ============================================
/*
import { trackLogin, trackCompleteRegistration } from '../utils/metaPixel';

const handleLogin = async (credentials) => {
  try {
    const response = await loginUser(credentials);
    trackLogin();
    // Redirect to dashboard
  } catch (error) {
    console.error('Login failed:', error);
  }
};

const handleRegister = async (userData) => {
  try {
    const response = await registerUser(userData);
    trackCompleteRegistration({
      email: userData.email,
      status: true
    });
    // Redirect to confirmation
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
*/

// ============================================
// 6. PRODUCTS.JSX - Track Search
// ============================================
/*
import { trackSearch } from '../utils/metaPixel';

export default function Products() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    // Track search event
    trackSearch(query);
    
    // Perform search logic
    fetchProducts(query);
  };

  return (
    <div>
      <input 
        type="text" 
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search products..."
      />
    </div>
  );
}
*/

// ============================================
// 7. PROFILE.JSX or NEWSLETTER - Track Lead
// ============================================
/*
import { trackLead } from '../utils/metaPixel';

const handleNewsletterSignup = (email) => {
  trackLead({
    type: 'Newsletter Signup',
    category: 'email',
    email: email
  });
  // Save to newsletter list
};

const handleContactFormSubmit = (formData) => {
  trackLead({
    type: 'Contact Form',
    category: 'inquiry',
    ...formData
  });
  // Send email
};
*/

// ============================================
// 8. MAIN.JSX or APP.JSX - Global Page Tracking
// ============================================
/*
import { useEffect } from 'react';
import { trackPageView } from '../utils/metaPixel';
import { useLocation } from 'react-router-dom';

export default function App() {
  const location = useLocation();

  // Track page view on route change
  useEffect(() => {
    trackPageView();
  }, [location.pathname]);

  return (
    // Your app components
  );
}
*/

// ============================================
// QUICK IMPLEMENTATION CHECKLIST
// ============================================
/*
1. Copy metaPixel.js to src/utils/ ✅
2. Update ProductDetail.jsx with trackViewContent ⬜
3. Update Cart.jsx with trackAddToCart/RemoveFromCart ⬜
4. Update Checkout.jsx with trackAddPaymentInfo ⬜
5. Update OrderConfirmation.jsx with trackPurchase ⬜ (CRITICAL!)
6. Update Login.jsx with trackLogin ⬜
7. Update Register.jsx with trackCompleteRegistration ⬜
8. Update Products.jsx with trackSearch ⬜
9. Update App.jsx to track page views ⬜
10. Deploy to Vercel ⬜
11. Test with browser DevTools ⬜
12. Verify events in Meta Events Manager ⬜
13. Launch ad campaign ⬜
*/

export default {};
