import { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productAPI } from '../services/api.js';
import { getImageUrl, getPlaceholderImage } from '../utils/imageHelper.js';
import ProductCard from '../components/ProductCard.jsx';
import { CartContext } from '../context/CartContext.jsx';
import { Loader } from '../components/Loader.jsx';
import '../css/products-premium.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [favorites, setFavorites] = useState(new Set());
  const [categoryCounts, setCategoryCounts] = useState({});
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const categories = [
    { name: 'Cosmetics', icon: '💄', value: 'cosmetics' },
    { name: 'Jewelry', icon: '💍', value: 'jewelry' },
    { name: 'Perfume', icon: '🧴', value: 'perfume' },
    { name: 'Watches', icon: '⌚', value: 'watches' },
    { name: 'Bags', icon: '👜', value: 'bags' }
  ];

  const sortOptions = [
    { label: 'Relevance', value: '' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Newest First', value: 'newest' },
    { label: 'Best Selling', value: 'rating' }
  ];

  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category') || '';
  const sortQuery = searchParams.get('sort') || '';
  const pageQuery = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    setCurrentPage(pageQuery);
  }, [pageQuery]);

  useEffect(() => {
    fetchProducts();
    fetchCategoryCounts();
  }, [searchQuery, categoryQuery, sortQuery, currentPage, priceRange]);

  const fetchCategoryCounts = async () => {
    try {
      const counts = {};
      const minPrice = searchParams.get('minPrice') || undefined;
      const maxPrice = searchParams.get('maxPrice') || undefined;

      // Fetch count for all categories
      for (const cat of categories) {
        const response = await productAPI.getAllProducts({
          category: cat.value,
          search: searchQuery || undefined,
          limit: 1,
          minPrice: minPrice ? parseInt(minPrice) : undefined,
          maxPrice: maxPrice ? parseInt(maxPrice) : undefined
        });
        counts[cat.value] = response?.data?.total || 0;
      }

      // Fetch count for all products (no category filter)
      const allResponse = await productAPI.getAllProducts({
        search: searchQuery || undefined,
        limit: 1,
        minPrice: minPrice ? parseInt(minPrice) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined
      });
      counts['all'] = allResponse?.data?.total || 0;

      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error fetching category counts:', error);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const minPrice = searchParams.get('minPrice') || undefined;
      const maxPrice = searchParams.get('maxPrice') || undefined;
      
      const response = await productAPI.getAllProducts({
        category: categoryQuery || undefined,
        search: searchQuery || undefined,
        sort: sortQuery || undefined,
        page: currentPage,
        limit: 12,
        minPrice: minPrice ? parseInt(minPrice) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined
      });
      
      if (response && response.data) {
        setProducts(response.data.products || []);
        setTotalProducts(response.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchParams(prev => {
      if (value) {
        prev.set('search', value);
      } else {
        prev.delete('search');
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleCategoryChange = (category) => {
    setSearchParams(prev => {
      if (category) {
        prev.set('category', category);
      } else {
        prev.delete('category');
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleSortChange = (sort) => {
    setSearchParams(prev => {
      if (sort) {
        prev.set('sort', sort);
      } else {
        prev.delete('sort');
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handlePageChange = (page) => {
    setSearchParams(prev => {
      prev.set('page', page.toString());
      return prev;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const getActiveFilters = () => {
    const filters = [];
    if (searchQuery) filters.push({ type: 'search', value: searchQuery, label: `Search: ${searchQuery}` });
    if (categoryQuery) filters.push({ type: 'category', value: categoryQuery, label: `Category: ${categoryQuery}` });
    if (sortQuery) filters.push({ type: 'sort', value: sortQuery, label: `Sort: ${sortQuery}` });
    return filters;
  };

  const removeFilter = (filterType) => {
    setSearchParams(prev => {
      if (filterType === 'search') prev.delete('search');
      if (filterType === 'category') prev.delete('category');
      if (filterType === 'sort') prev.delete('sort');
      prev.set('page', '1');
      return prev;
    });
  };

  const handlePriceApply = () => {
    const min = parseInt(minPrice) || 0;
    const max = parseInt(maxPrice) || 100000;
    setPriceRange([min, max]);
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('minPrice', min.toString());
    newParams.set('maxPrice', max.toString());
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePricePreset = (preset) => {
    let min, max;
    if (preset === '0-1k') { min = 0; max = 1000; }
    else if (preset === '1k-5k') { min = 1000; max = 5000; }
    else if (preset === '5k-10k') { min = 5000; max = 10000; }
    else if (preset === '10k+') { min = 10000; max = 100000; }
    
    setMinPrice(min);
    setMaxPrice(max);
    setPriceRange([min, max]);
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('minPrice', min.toString());
    newParams.set('maxPrice', max.toString());
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const totalPages = Math.ceil(totalProducts / 12);

  return (
    <div className="premium-products-container">
      <Loader visible={isLoading} size="md" />
      {/* Hero Section */}
      <div className="premium-hero">
        <div className="hero-content">
          <h1>🛍️ Premium Collection</h1>
          <p>Discover curated products handpicked for quality and value</p>
          <div className="breadcrumb">Home / Products</div>
        </div>
        <div className="hero-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      {/* Active Filters Bar */}
      {getActiveFilters().length > 0 && (
        <div className="active-filters-bar">
          <div className="filters-container">
            <span className="filters-label">Active Filters:</span>
            <div className="filter-tags">
              {getActiveFilters().map((filter, idx) => (
                <span key={idx} className="filter-tag">
                  {filter.label}
                  <button onClick={() => removeFilter(filter.type)} className="remove-tag">✕</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="premium-wrapper">
        {/* Sidebar with Advanced Filters */}
        <aside className="premium-sidebar">
          {/* Quick Search */}
          <div className="sidebar-section search-section">
            <h3>🔍 Quick Search</h3>
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearch}
                className="premium-search"
              />
              <span className="search-icon">🔎</span>
            </div>
          </div>

          {/* Category Filter with Icons */}
          <div className="sidebar-section">
            <div className="section-header">
              <h3>📂 Categories</h3>
              <span className="count-badge">{categories.length}</span>
            </div>
            <div className="category-list">
              <label className="category-item">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={!categoryQuery}
                  onChange={() => handleCategoryChange('')}
                />
                <span className="category-name">All Categories</span>
                <span className="category-count">({categoryCounts['all'] || 0})</span>
              </label>
              {categories.map((cat) => (
                <label key={cat.value} className="category-item">
                  <input
                    type="radio"
                    name="category"
                    value={cat.value}
                    checked={categoryQuery === cat.value}
                    onChange={() => handleCategoryChange(cat.value)}
                  />
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-name">{cat.name}</span>
                  <span className="category-count">({categoryCounts[cat.value] || 0})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || categoryQuery || sortQuery) && (
            <button
              className="clear-all-filters"
              onClick={() => setSearchParams('')}
            >
              ✨ Clear All Filters
            </button>
          )}
        </aside>

        {/* Main Products Area */}
        <main className="premium-main">
          {/* Toolbar */}
          <div className="products-toolbar">
            <div className="toolbar-left">
              {totalProducts > 0 && (
                <div className="results-info">
                  <span className="total-count">{totalProducts} Products</span>
                  <span className="page-info">Page {currentPage}</span>
                </div>
              )}
            </div>

            <div className="toolbar-right">
              <select
                value={sortQuery}
                onChange={(e) => handleSortChange(e.target.value)}
                className="sort-dropdown"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <div className="view-toggle">
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  ⊞⊞⊞
                </button>
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  ≡
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          {isLoading ? (
            <div className={`products-display ${viewMode}-view`}>
              {[...Array(12)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-bar"></div>
                  <div className="skeleton-bar short"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className={`products-display ${viewMode}-view`}>
              {products.map((product) => (
                <div
                  key={product.id}
                  className="premium-product-item"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="product-card-content">
                    <div className="product-image-wrapper">
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
                    </div>
                    <div className="product-details">
                      <h4 className="product-name">{product.name}</h4>
                      <p className="product-category">{product.category}</p>
                      <div className="product-pricing">
                        <span className="product-price">₹{Math.round(product.price * (1 - (product.discount || 0) / 100))}</span>
                        {product.discount > 0 && (
                          <span className="product-original-price">₹{product.price}</span>
                        )}
                      </div>
                      <div className="product-actions">
                        <button 
                          className="btn-add-cart"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await addToCart(product.id, 1);
                              alert('Product added to cart!');
                            } catch (error) {
                              alert('Failed to add product to cart');
                              console.error(error);
                            }
                          }}
                        >
                          🛒 Add Cart
                        </button>
                        <button 
                          className="btn-buy-now"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/order-confirmation/${product.id}`);
                          }}
                        >
                          ⚡ Buy Now
                        </button>
                        <button 
                          className={`wishlist-btn-small ${favorites.has(product.id) ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(product.id);
                          }}
                        >
                          {favorites.has(product.id) ? '❤️' : '🤍'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-premium">
              <div className="empty-illustration">🔍</div>
              <h3>No Products Found</h3>
              <p>Try adjusting your filters or search terms</p>
              <button 
                className="reset-btn"
                onClick={() => setSearchParams('')}
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="premium-pagination">
              <button
                className="page-btn prev"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                ← Previous
              </button>

              <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      className={`page-num ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                className="page-btn next"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
