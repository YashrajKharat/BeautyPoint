import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import '../css/admin-navbar.css';

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-container">
        
        {/* Left - Logo and Brand */}
        <div className="navbar-brand" onClick={() => navigate('/admin/dashboard')}>
          <span className="brand-icon">⚙️</span>
          <span className="brand-text">Admin Panel</span>
        </div>

        {/* Center - Navigation Links */}
        <div className="navbar-nav-links">
          <button
            className={`nav-btn ${isActive('/admin/dashboard')}`}
            onClick={() => navigate('/admin/dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Dashboard</span>
          </button>

          <button
            className={`nav-btn ${isActive('/admin/products')}`}
            onClick={() => navigate('/admin/products')}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-label">Products</span>
          </button>

          <button
            className={`nav-btn ${isActive('/admin/users')}`}
            onClick={() => navigate('/admin/users')}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-label">Users</span>
          </button>

          <button
            className={`nav-btn ${isActive('/admin/orders')}`}
            onClick={() => navigate('/admin/orders')}
          >
            <span className="nav-icon">🛒</span>
            <span className="nav-label">Orders</span>
          </button>

          <button
            className={`nav-btn ${isActive('/admin/coupons')}`}
            onClick={() => navigate('/admin/coupons')}
          >
            <span className="nav-icon">🎟️</span>
            <span className="nav-label">Coupons</span>
          </button>
        </div> {/* ✅ CLOSED navbar-nav-links */}

        {/* Right - User Info and Logout */}
        <div className="navbar-actions">
          <div className="user-info">
            <span className="user-icon">👤</span>
            <span className="user-name">{user?.name || 'Admin'}</span>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

      </div>
    </nav>
  );
}
