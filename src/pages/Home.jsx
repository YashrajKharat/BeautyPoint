import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api.js';
import { getImageUrl, getPlaceholderImage } from '../utils/imageHelper.js';
import ProductCard from '../components/ProductCard.jsx';
import '../css/home-premium-ultra.css';
import '../css/product-card-small.css';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');

  const [contactFormData, setContactFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactFormLoading, setContactFormLoading] = useState(false);
  const [contactFormMessage, setContactFormMessage] = useState('');
  const [contactFormError, setContactFormError] = useState('');
  const [showChatWidget, setShowChatWidget] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { name: 'cosmetics', label: 'Cosmetics', icon: '✨', color: '#F6C1CC' },
    { name: 'jewelry', label: 'Jewelry', icon: '💎', color: '#D4AF37' },
    { name: 'perfume', label: 'Perfume', icon: '🌸', color: '#F6C1CC' },
    { name: 'watches', label: 'Watches', icon: '⌚', color: '#D4AF37' },
    { name: 'bags', label: 'Bags', icon: '👜', color: '#8B7355' }
  ];

  const brands = ['All Brands', 'Luxury', 'Affordable', 'Premium', 'Best Sellers'];

  const promoCards = [
    { id: 1, title: 'New Arrivals', discount: 'Up to 40% OFF', color: 'linear-gradient(135deg, #F6C1CC, #ffffff)', img: '✨' },
    { id: 2, title: 'Flash Sale', discount: 'Limited Time', color: 'linear-gradient(135deg, #D4AF37, #F6C1CC)', img: '⚡' },
    { id: 3, title: 'Trending Now', discount: 'Shop Today', color: 'linear-gradient(135deg, #F6C1CC, #D4AF37)', img: '🔥' }
  ];

  const stats = [
    { label: 'Premium Brands', value: '500+', icon: '👑' },
    { label: 'Happy Customers', value: '1M+', icon: '💕' },
    { label: 'Free Returns', value: '7 Days', icon: '🔄' },
    { label: 'Express Delivery', value: '1-2 Days', icon: '🚚' }
  ];

  useEffect(() => {
    fetchProducts();
    fetchFeaturedProducts();
  }, [category, search]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await productAPI.getAllProducts({
        category: category || undefined,
        search: search || undefined,
        page: 1,
        limit: 12
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const response = await productAPI.getAllProducts({
        limit: 8
      });
      setFeaturedProducts(response.data.products.slice(0, 8));
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search)}`);
    }
  };

  const handleShopNow = () => {
    navigate('/products');
  };

  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactFormSubmit = async (e) => {
    e.preventDefault();
    setContactFormMessage('');
    setContactFormError('');

    if (!contactFormData.name.trim() || !contactFormData.email.trim() || !contactFormData.subject.trim() || !contactFormData.message.trim()) {
      setContactFormError('Please fill in all fields');
      return;
    }

    setContactFormLoading(true);
    try {
      // Simulate sending email (in production, connect to backend)
      const emailContent = `
Name: ${contactFormData.name}
Email: ${contactFormData.email}
Subject: ${contactFormData.subject}
Message: ${contactFormData.message}
      `;

      // Send email via mailto (fallback)
      window.location.href = `mailto:support@luxestore.com?subject=${encodeURIComponent(contactFormData.subject)}&body=${encodeURIComponent(emailContent)}`;

      setContactFormMessage('✓ Thank you! Your message has been sent. We\'ll get back to you soon.');
      setContactFormData({ name: '', email: '', subject: '', message: '' });

      setTimeout(() => setContactFormMessage(''), 5000);
    } catch (error) {
      setContactFormError('Failed to send message. Please try again.');
      setTimeout(() => setContactFormError(''), 5000);
    } finally {
      setContactFormLoading(false);
    }
  };

  const handleGetDirections = () => {
    window.open('https://maps.app.goo.gl/q7nEgj1F4v1VznnP6?g_st=com.google.maps.preview.copy', '_blank');
  };

  const handleLiveChat = () => {
    setShowChatWidget(!showChatWidget);
  };

  return (
    <div className="ultra-home-container">
      {/* HERO SECTION WITH GRADIENT */}
      <section className="ultra-hero-section">
        <div className="hero-gradient-bg"></div>
        <div className="hero-animated-shapes">
          <div className="shape shape-1">✨</div>
          <div className="shape shape-2">💎</div>
          <div className="shape shape-3">🌸</div>
          <div className="shape shape-4">⚡</div>
        </div>
        <div className="hero-content-wrapper">
          <h1 className="hero-title-ultra">Discover Premium Excellence</h1>
          <p className="hero-subtitle-ultra">Curated luxury collections just for you. Find everything you love.</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={handleShopNow}>Shop Now</button>
            <button className="btn-secondary" onClick={() => navigate('/products')}>Browse Collections</button>
          </div>
        </div>
      </section>

      {/* PROMO CARDS WITH ANIMATIONS */}
      <section className="ultra-promo-section">
        <div className="container">
          <div className="promo-cards-container">
            {promoCards.map((card) => (
              <div key={card.id} className="promo-card-ultra" style={{ background: card.color }}>
                <div className="promo-glow"></div>
                <div className="promo-content">
                  <div className="promo-emoji-ultra">{card.img}</div>
                  <h3 className="promo-title">{card.title}</h3>
                  <p className="promo-subtitle">{card.discount}</p>
                  <a href="/products" className="promo-link">Shop Now →</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEARCH SECTION */}
      <section className="ultra-search-section">
        <div className="container">
          <form className="search-form-ultra" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search products, brands, collections..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input-ultra"
              />
            </div>
            <button type="submit" className="search-btn-ultra">Search</button>
          </form>
        </div>
      </section>

      {/* CATEGORIES WITH ICONS */}
      <section className="ultra-categories-section">
        <div className="container">
          <h2 className="section-title-ultra">Shop by Category</h2>
          <div className="categories-grid-ultra">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className={`category-card-ultra`}
                onClick={() => navigate(`/products?category=${cat.name}`)}
                style={{ '--cat-color': cat.color }}
              >
                <div className="category-icon-large">{cat.icon}</div>
                <h3 className="category-name">{cat.label}</h3>
                <p className="category-count">Explore →</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BRAND FILTER */}
      <section className="ultra-brand-section">
        <div className="container">
          <h2 className="section-title-ultra">Filter by Brand</h2>
          <div className="brand-filter-ultra">
            {brands.map((brand, idx) => (
              <button
                key={idx}
                className={`brand-btn ${selectedBrand === brand ? 'active' : ''}`}
                onClick={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featuredProducts.length > 0 && (
        <section className="ultra-featured-section">
          <div className="container">
            <div className="section-header-ultra">
              <h2>✨ Trending Now</h2>
            </div>
            <div className="featured-carousel-ultra">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="featured-card-ultra"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="featured-image-container">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = getPlaceholderImage();
                      }}
                    />
                    {product.discount > 0 && (
                      <span className="discount-badge">{product.discount}% OFF</span>
                    )}
                    <div className="featured-overlay">
                      <button className="view-btn">View Details</button>
                    </div>
                  </div>
                  <h4 className="featured-name">{product.name}</h4>
                  <p className="featured-cat">{product.category}</p>
                  <p className="featured-price">₹{Math.round(product.price * (1 - (product.discount || 0) / 100))}</p>
                </div>
              ))}
            </div>
            <div className="trending-see-more">
              <a href="/products" className="see-more-btn">See More →</a>
            </div>
          </div>
        </section>
      )}

      {/* STATS SECTION */}
      <section className="ultra-stats-section">
        <div className="container">
          <div className="stats-grid-ultra">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card-ultra">
                <div className="stat-icon-ultra">{stat.icon}</div>
                <div className="stat-content">
                  <div className="stat-number">{stat.value}</div>
                  <div className="stat-text">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS GRID */}
      <section className="ultra-products-section">
        <div className="container">
          <div className="section-header-ultra">
            <h2>🔥 Best Sellers</h2>
            {category && <span className="category-tag">{category.toUpperCase()}</span>}
          </div>

          {isLoading ? (
            <div className="products-grid-ultra">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="product-skeleton"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="products-grid-ultra">
                {products.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="product-item"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              <div className="see-more-container">
                <button
                  className="see-more-btn"
                  onClick={() => navigate('/products')}
                >
                  See More Products →
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p className="empty-emoji">😢</p>
              <p className="empty-text">No products found. Try a different search!</p>
            </div>
          )}
        </div>
      </section>

      {/* CONTACT US */}
      <section className="ultra-contact-section">
        <div className="container">
          <div className="contact-header">
            <h2 className="section-title-ultra">Get in Touch</h2>
            <p className="contact-subtitle">Have questions? We're here to help!</p>
          </div>
          <div className="contact-cards-grid">
            <div className="contact-card">
              <div className="contact-icon">📧</div>
              <h3>Email</h3>
              <p>beautypoint800@gmail.com</p>
              <a href="mailto:beautypoint800@gmail.com" className="contact-link">Send Email →</a>
            </div>
            <div className="contact-card">
              <div className="contact-icon">📱</div>
              <h3>Phone</h3>
              <p>+91 8850584703</p>
              <a href="tel:+91 8850584703" className="contact-link">Call Now →</a>
            </div>
            <div className="contact-card">
              <div className="contact-icon">📍</div>
              <h3>Address</h3>
              <p>Panchawati Chs,Plot No - 10,opposite Sai Sammarth Hospital, Sector 34, Kamothe.</p>
              <button onClick={handleGetDirections} className="contact-link">Get Directions →</button>
            </div>
            <div className="contact-card">
              <div className="contact-icon">💬</div>
              <h3>Live Chat</h3>
              <p>Chat with our team</p>
              <button onClick={handleLiveChat} className="contact-link">Start Chat →</button>
            </div>
          </div>
          <div className="contact-form-container">
            <h3>Send us a Message</h3>
            <form className="contact-form" onSubmit={handleContactFormSubmit}>
              <div className="form-row">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={contactFormData.name}
                  onChange={handleContactFormChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={contactFormData.email}
                  onChange={handleContactFormChange}
                  required
                />
              </div>
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={contactFormData.subject}
                onChange={handleContactFormChange}
                required
              />
              <textarea
                name="message"
                placeholder="Your Message"
                rows="5"
                value={contactFormData.message}
                onChange={handleContactFormChange}
                required
              ></textarea>
              <button
                type="submit"
                className="submit-btn"
                disabled={contactFormLoading}
              >
                {contactFormLoading ? '⏳ Sending...' : 'Send Message'}
              </button>
              {contactFormMessage && (
                <div className="contact-success-message">
                  {contactFormMessage}
                </div>
              )}
              {contactFormError && (
                <div className="contact-error-message">
                  {contactFormError}
                </div>
              )}
            </form>
            {showChatWidget && (
              <div className="chat-widget">
                <div className="chat-header">
                  <span>💬 Live Chat Support</span>
                  <button className="chat-close" onClick={() => setShowChatWidget(false)}>✕</button>
                </div>
                <div className="chat-body">
                  <p className="chat-message agent">Hello! 👋 How can we help you today?</p>
                  <p className="chat-message time">Our team typically responds within 2 minutes during business hours (9 AM - 6 PM IST)</p>
                  <input type="text" placeholder="Type your message..." className="chat-input" />
                  <button className="chat-send-btn">Send</button>
                </div>
              </div>
            )}
          </div>
          <div className="contact-navigation">
            <button className="nav-btn home-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑ Back to Top</button>
            <button className="nav-btn products-btn" onClick={() => navigate('/products')}>Browse Products →</button>
          </div>
        </div>
      </section>
    </div>
  );
}
