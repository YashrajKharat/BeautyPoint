import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { getImageUrl } from '../utils/imageHelper.js';
import { CartContext } from '../context/CartContext.jsx';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  // const discountedPrice = ... (Removed, backend handles this)

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    try {
      await addToCart(product.id, 1);
      alert(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="product-card-grid">
      {/* Left - Image */}
      <div className="product-card-image-left">
        <img src={getImageUrl(product.image)} alt={product.name} />
        {product.discount_percentage > 0 && (
          <span className="discount-badge-left">{product.discount_percentage}% OFF</span>
        )}
      </div>

      {/* Right - Content */}
      <div className="product-card-content-right">
        {/* Rating - Top Right */}
        <div className="rating-top-right">
          <span className="rating-badge-top">⭐ {product.rating || 0}</span>
        </div>

        {/* Name - Center */}
        <div className="product-name-center">
          <h3>{product.name}</h3>
        </div>

        {/* Description */}
        {product.description && (
          <div className="product-desc-section">
            <p>{product.description.substring(0, 80)}...</p>
          </div>
        )}

        {/* Price */}
        <div className="price-section-bottom" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <span className="price-current-bottom" style={{ fontSize: '18px', fontWeight: 'bold' }}>
            ₹{parseFloat(product.price).toFixed(0)}
          </span>

          {product.original_price > product.price && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
              <span className="price-original-bottom" style={{ textDecoration: 'line-through', color: '#999', fontSize: '14px' }}>
                ₹{parseFloat(product.original_price).toFixed(0)}
              </span>
              <span style={{ fontSize: '12px', color: '#ff4b8b', fontWeight: 'bold' }}>
                {product.discount_percentage}% OFF
              </span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="buttons-section">
          <button
            className="btn-add-to-cart"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
          <button
            className="btn-buy-now"
            onClick={handleBuyNow}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
