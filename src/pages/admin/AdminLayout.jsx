import { Outlet, Link, useLocation } from 'react-router-dom';
import '../../css/admin-light.css';

export default function AdminLayout() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>Admin Panel</h2>
        </div>
        <nav className="admin-nav">
          <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard')}`}>
            Dashboard
          </Link>
          <Link to="/admin/products" className={`nav-link ${isActive('/admin/products')}`}>
            Products
          </Link>
          <Link to="/admin/users" className={`nav-link ${isActive('/admin/users')}`}>
            Users
          </Link>
          <Link to="/admin/orders" className={`nav-link ${isActive('/admin/orders')}`}>
            Orders
          </Link>
          <Link to="/admin/coupons" className={`nav-link ${isActive('/admin/coupons')}`}>
            Coupons
          </Link>

          <Link to="/" className="nav-link nav-logout">
            Back to Store
          </Link>
        </nav>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
