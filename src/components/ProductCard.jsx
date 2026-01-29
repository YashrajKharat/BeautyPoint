import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { getImageUrl } from '../utils/imageHelper.js';
import { CartContext } from '../context/CartContext.jsx';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

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
        {product.discount > 0 && (
          <span className="discount-badge-left">{product.discount}% OFF</span>
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
        <div className="price-section-bottom">
          <span className="price-current-bottom">₹{discountedPrice.toFixed(0)}</span>
          {product.discount > 0 && (
            <span className="price-original-bottom">₹{product.price.toFixed(0)}</span>
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
