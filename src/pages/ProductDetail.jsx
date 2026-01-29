import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, cartAPI } from '../services/api.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { CartContext } from '../context/CartContext.jsx';
import { Loader } from '../components/Loader.jsx';
import { getImageUrl } from '../utils/imageHelper.js';
import '../css/product-detail-premium.css';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Only fetch if we have a valid ID
    if (id && id !== 'undefined' && typeof id === 'string' && id.trim()) {
      fetchProduct();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      if (!id) {
        console.warn('Product ID is missing');
        setIsLoading(false);
        return;
      }
      const response = await productAPI.getProductById(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product.id, 1);
      alert('Product added to cart!');
    } catch (error) {
      alert('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    sessionStorage.setItem('checkoutProduct', JSON.stringify(product));
    navigate('/checkout');
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  if (!id || id === 'undefined' || (typeof id === 'string' && !id.trim())) {
    return (
      <div className="product-not-found">
        <div className="not-found-card">
          <div className="not-found-icon">⚠️</div>
          <h2>Invalid Product ID</h2>
          <p>No product ID was provided. Please select a product from the list.</p>
          <button onClick={() => navigate('/products')} className="back-btn">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="product-detail-loading">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <div className="not-found-card">
          <div className="not-found-icon">❌</div>
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/products')} className="back-btn">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const discountedPrice = product.discount 
    ? product.price * (1 - product.discount / 100) 
    : product.price;
  const savings = product.discount ? product.price - discountedPrice : 0;

  return (
    <div className="premium-product-detail-container">
      <Loader visible={isLoading || isAdding} size="md" />
      {/* Hero Breadcrumb */}
      {/* <div className="detail-breadcrumb">
        <button onClick={() => navigate('/')} className="breadcrumb-link">Home</button>
        <span className="separator">/</span>
        <button onClick={() => navigate('/products')} className="breadcrumb-link">Products</button>
        <span className="separator">/</span>
        <span className="current-page">{product.name}</span>
      </div> */}

      <div className="product-detail-wrapper">
        {/* Product Image Section */}
        <div className="product-image-section">
          <div className="product-image-container">
            <img src={getImageUrl(product.image)} alt={product.name} className="product-image-main" />
            
            {product.discount > 0 && (
              <div className="discount-badge">
                <span className="discount-percent">{product.discount}%</span>
                <span className="discount-text">OFF</span>
              </div>
            )}

            <button 
              className={`favorite-btn ${isFavorite ? 'active' : ''}`}
              onClick={toggleFavorite}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          </div>

          {/* Image Gallery Placeholder */}
          <div className="image-thumbnails">
            <div className="thumbnail active">
              <img src={getImageUrl(product.image)} alt="Main" />
            </div>
          </div>
        </div>

        {/* Product Info Section */}
        <div className="product-info-section">
          {/* Header */}
          <div className="detail-header">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-category">📂 {product.category || 'Product'}</p>
          </div>

          {/* Rating */}
          <div className="detail-rating">
            <div className="stars">
              {'⭐'.repeat(Math.round(product.rating || 4))}
              {(5 - Math.round(product.rating || 4)) > 0 && '☆'.repeat(5 - Math.round(product.rating || 4))}
            </div>
            <span className="rating-text">({product.rating || 4}.0 out of 5)</span>
          </div>

          {/* Price Section */}
          <div className="detail-pricing">
            <div className="price-display">
              <span className="current-price">₹{discountedPrice.toFixed(2)}</span>
              {product.discount > 0 && (
                <>
                  <span className="original-price">₹{product.price.toFixed(2)}</span>
                  <span className="savings">Save ₹{savings.toFixed(2)}</span>
                </>
              )}
            </div>
          </div>

          {/* Stock Info */}
          <div className="detail-stock">
            {product.stock > 0 ? (
              <div className="in-stock-info">
                <span className="stock-status in-stock">✓ In Stock</span>
                <span className="stock-count">({product.stock} available)</span>
              </div>
            ) : (
              <span className="stock-status out-of-stock">✗ Out of Stock</span>
            )}
          </div>

          {/* Description */}
          <div className="detail-description">
            <h3>About this product</h3>
            <p>{product.description}</p>
          </div>

          {/* Quantity Note */}
          <div className="detail-quantity-note">
            <p className="quantity-note-text">
              💡 You can adjust the quantity on the checkout page. Click on <strong>"Buy Now"</strong> to proceed.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="detail-actions">
            <button
              className="action-btn add-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdding}
            >
              🛒 {isAdding ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              className="action-btn buy-now-btn"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              ⚡ Buy Now
            </button>
          </div>

          {/* Features */}
          {product.tags && product.tags.length > 0 && (
            <div className="detail-features">
              <h3>Features</h3>
              <div className="features-list">
                {product.tags.map((tag, idx) => (
                  <div key={idx} className="feature-tag">
                    <span className="feature-icon">✓</span>
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="detail-info-box">
            <div className="info-row">
              <span className="info-icon">🚚</span>
              <span className="info-text">Free Shipping on orders above ₹500</span>
            </div>
            <div className="info-row">
              <span className="info-icon">🔒</span>
              <span className="info-text">Secure Payment & Easy Returns</span>
            </div>
            <div className="info-row">
              <span className="info-icon">⏱️</span>
              <span className="info-text">Delivery within 3-5 business days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
