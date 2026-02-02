import { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { CartContext } from '../context/CartContext.jsx';
import '../css/navbar-modern.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, userRole, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isAdminPanel = location.pathname.startsWith('/admin');

  // Calculate total items in cart
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
    setShowUserMenu(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setShowUserMenu(false);
  };

  // Hide navbar completely in admin panel
  if (isAdminPanel) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-logo" onClick={() => navigate('/')}>
          <span className="logo-icon">🛍️</span>
          <span className="logo-text">Beauty Point</span>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {/* Desktop Menu */}
        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li><button className="nav-link" onClick={() => { navigate('/'); setIsMenuOpen(false); }}>
            <span className="nav-icon">🏠</span> Home
          </button></li>
          <li><button className="nav-link" onClick={() => { navigate('/products'); setIsMenuOpen(false); }}>
            <span className="nav-icon">📦</span> Products
          </button></li>
          <li><button className="nav-link" onClick={() => {
            if (location.pathname !== '/') {
              navigate('/');
              setTimeout(() => {
                document.querySelector('.ultra-contact-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 300);
            } else {
              document.querySelector('.ultra-contact-section')?.scrollIntoView({ behavior: 'smooth' });
            }
            setIsMenuOpen(false);
          }}>
            <span className="nav-icon">📧</span> Contact
          </button></li>
          <li><button className="nav-link" onClick={() => { navigate('/track'); setIsMenuOpen(false); }}>
            <span className="nav-icon">🚚</span> Track
          </button></li>
        </ul>

        {/* Actions */}
        <div className={`nav-actions ${isMenuOpen ? 'active' : ''}`}>
          {isAuthenticated ? (
            <>
              <button
                className="nav-link cart-link"
                onClick={() => { navigate('/cart'); setIsMenuOpen(false); }}
              >
                <span className="cart-icon">🛒</span>
                <span className="cart-text">Cart</span>
                {cartItemCount > 0 && (
                  <span className="cart-badge">{cartItemCount}</span>
                )}
              </button>

              {userRole === 'admin' && (
                <button
                  className="nav-link admin-link"
                  onClick={() => { navigate('/admin/dashboard'); setIsMenuOpen(false); }}
                >
                  <span className="admin-icon">⚙️</span> Admin
                </button>
              )}

              <div className="nav-user-container">
                <button
                  className="nav-user-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <span className="user-avatar">👤</span>
                  <span className="user-name">{user?.name}</span>
                  <span className={`dropdown-arrow ${showUserMenu ? 'active' : ''}`}>▼</span>
                </button>

                {showUserMenu && (
                  <div className="user-dropdown">
                    <button
                      className="dropdown-item"
                      onClick={handleLogout}
                    >
                      <span className="dropdown-icon">🚪</span> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              className="nav-link login-link"
              onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
            >
              <span className="auth-icon">🔓</span> Login
            </button>
          )}
        </div>
      </div>
    </nav >
  );
}
