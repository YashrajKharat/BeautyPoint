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



  // State for gallery and colors
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    if (product) {
      // Initialize image to first in gallery or main image
      if (product.images && product.images.length > 0) {
        setSelectedImage(product.images[0]);
      } else {
        setSelectedImage(product.image);
      }

      // Initialize color if only one exists? Or force user to choose?
      // Let's force choose if multiple, or auto-select if 1
      const colors = getProductColors(product);
      if (colors.length === 1) {
        setSelectedColor(colors[0]);
      }
    }
  }, [product]);

  // Helper to get colors safely
  const getProductColors = (p) => {
    if (!p || !p.colors) return [];
    if (Array.isArray(p.colors)) return p.colors;
    try {
      return JSON.parse(p.colors);
    } catch (e) {
      if (typeof p.colors === 'string') return p.colors.split(',').map(c => c.trim()).filter(c => c);
      return [];
    }
  };

  const productColors = product ? getProductColors(product) : [];

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (productColors.length > 0 && !selectedColor) {
      alert('Please select a color');
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product.id, 1, selectedColor); // Updated API call
      alert('Product added to cart!');
    } catch (error) {
      alert('Failed to add to cart: ' + error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (productColors.length > 0 && !selectedColor) {
      alert('Please select a color');
      return;
    }

    const checkoutItem = {
      ...product,
      selectedColor: selectedColor
    };

    sessionStorage.setItem('checkoutProduct', JSON.stringify(checkoutItem));
    navigate('/checkout');
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  if (!id || id === 'undefined' || (typeof id === 'string' && !id.trim())) {
    // ... (unchanged error UI)
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
      <div className="product-detail-wrapper">
        {/* Product Image Section */}
        <div className="product-image-section">
          <div className="product-image-container">
            <img
              src={getImageUrl(selectedImage || product.image)}
              alt={product.name}
              className="product-image-main"
            />

            {product.discount_percentage > 0 && (
              <div className="discount-badge">
                <span className="discount-percent">{product.discount_percentage}%</span>
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

          {/* Image Gallery */}
          {(product.images && product.images.length > 0) && (
            <div className="image-thumbnails">
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={getImageUrl(img)} alt={`View ${idx + 1}`} />
                </div>
              ))}
            </div>
          )}
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
              <span className="current-price">₹{parseFloat(product.price).toFixed(2)}</span>

              {product.original_price > product.price && (
                <>
                  <span className="original-price" style={{ textDecoration: 'line-through', color: '#888', marginLeft: '10px' }}>
                    ₹{parseFloat(product.original_price).toFixed(2)}
                  </span>
                  <span className="savings" style={{ marginLeft: '10px', color: '#155724', fontWeight: 'bold' }}>
                    Save ₹{Math.round(product.original_price - product.price)} ({product.discount_percentage}%)
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Colors Selection */}
          {productColors.length > 0 && (
            <div className="detail-attrs">
              <h3>Available Colors</h3>
              <div className="color-options" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {productColors.map((color, idx) => {
                  // Determine if color is a hex code or name to style it
                  const isHex = color.startsWith('#');
                  const style = isHex ? { backgroundColor: color } : { backgroundColor: '#eee' };

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedColor(color)}
                      className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
                      title={color}
                      style={{
                        ...style,
                        width: '35px',
                        height: '35px',
                        borderRadius: '50%',
                        border: selectedColor === color ? '3px solid #000' : '1px solid #ccc',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px'
                      }}
                    >
                      {!isHex && color}
                    </div>
                  );
                })}
              </div>
              {selectedColor && <p style={{ marginTop: '5px', fontSize: '14px' }}>Selected: <strong>{selectedColor}</strong></p>}
            </div>
          )}

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
          {/* ... Rest of UI ... */}
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
