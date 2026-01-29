import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { orderAPI, productAPI } from '../services/api.js';
import { getImageUrl, getPlaceholderImage } from '../utils/imageHelper.js';
import '../css/pages-flipkart.css';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Only fetch if we have a valid orderId
    if (orderId && orderId !== 'undefined' && typeof orderId === 'string' && orderId.trim()) {
      fetchOrderOrProduct();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, orderId]);

  const fetchOrderOrProduct = async () => {
    try {
      if (!orderId) {
        console.warn('Order/Product ID is missing');
        setIsLoading(false);
        return;
      }
      
      // Try to fetch as order first
      try {
        const response = await orderAPI.getOrderById(orderId);
        // Response might be wrapped in .data or .order or be direct
        const orderData = response.data?.order || response.data || response;
        setOrder(orderData);
      } catch (orderError) {
        // If order not found, treat as product ID and fetch product
        const productResponse = await productAPI.getProductById(orderId);
        if (productResponse.data) {
          setProduct(productResponse.data);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="loading">Loading...</div>;

  // Check if we have a valid orderId - if not, show error and redirect option
  if (!orderId || orderId === 'undefined' || (typeof orderId === 'string' && !orderId.trim())) {
    return (
      <div className="order-confirmation-container">
        <div className="confirmation-card">
          <div className="not-found-icon">⚠️</div>
          <h2>Invalid Order ID</h2>
          <p>No valid order or product ID was provided.</p>
          <button onClick={() => navigate('/products')} className="back-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }
  
  // If it's a product (direct buy now), show product confirmation
  if (product) {
    return (
      <div className="order-confirmation-container">
        <div className="confirmation-card">
          <div className="success-icon">✓</div>
          <h1>Order Ready!</h1>
          <p>Your order is ready for checkout</p>

          <div className="product-summary">
            <div className="product-image">
              <img 
                src={getImageUrl(product.image)} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = getPlaceholderImage();
                }}
              />
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="category">Category: {product.category}</p>
              <div className="pricing">
                <span className="price">₹{Math.round(product.price * (1 - (product.discount || 0) / 100))}</span>
                {product.discount > 0 && (
                  <span className="original-price">₹{product.price}</span>
                )}
                {product.discount > 0 && (
                  <span className="discount">{product.discount}% OFF</span>
                )}
              </div>
              <p className="description">{product.description}</p>
              <div className="stock-info">
                <span className={`stock ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              onClick={() => {
                // Store product in session/localStorage for checkout to use
                sessionStorage.setItem('checkoutProduct', JSON.stringify(product));
                navigate('/checkout');
              }} 
              className="checkout-btn"
            >
              Proceed to Checkout
            </button>
            <button onClick={() => navigate('/products')} className="continue-shopping-btn">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // If it's an actual order, show order confirmation
  if (!order) return <div className="error">Order not found</div>;

  return (
    <div className="order-confirmation-container">
      <div className="confirmation-card">
        <div className="success-icon">✓</div>
        <h1>Order Confirmed!</h1>
        <p>Thank you for your purchase</p>

        <div className="order-details">
          <div className="detail-row">
            <span className="label">Order Number:</span>
            <span className="value">{order.id || order.orderNumber || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Total Amount:</span>
            <span className="value">₹{(order.total_amount || order.totalAmount || 0).toFixed(2)}</span>
          </div>
          <div className="detail-row">
            <span className="label">Order Status:</span>
            <span className="value status">{order.status || order.orderStatus || 'Pending'}</span>
          </div>
          {order.tracking && (
            <>
              <div className="detail-row">
                <span className="label">Tracking Number:</span>
                <span className="value">{order.tracking?.trackingNumber || 'Not assigned yet'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Estimated Delivery:</span>
                <span className="value">
                  {order.tracking?.estimatedDelivery 
                    ? new Date(order.tracking.estimatedDelivery).toLocaleDateString()
                    : 'To be updated'}
                </span>
              </div>
            </>
          )}
        </div>

        {order.items && order.items.length > 0 && (
          <div className="items-summary">
            <h3>Items Ordered:</h3>
            {order.items.map((item) => {
              const product = item.products || item.productId;
              const productName = product?.name || 'Product';
              return (
                <div key={item.product_id || item.productId?.id || item.productId?._id} className="item">
                  <span>{productName}</span>
                  <span>x{item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="action-buttons">
          <button onClick={() => navigate('/track')} className="track-btn">
            Track Order
          </button>
          <button onClick={() => navigate('/')} className="continue-shopping-btn">
            Continue Shopping
          </button>
        </div>

        <p className="confirmation-message">
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
}
