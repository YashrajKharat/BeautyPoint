import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { productAPI, userAPI, orderAPI } from '../../services/api.js';
import '../../css/admin-light.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const [products, users, orders] = await Promise.all([
        productAPI.getAll(),
        userAPI.getAllUsers(),
        orderAPI.getAllOrders()
      ]);

      const productsArray = products.data?.products || products.data || [];
      const usersArray = Array.isArray(users.data) ? users.data : [];
      const ordersArray = Array.isArray(orders.data) ? orders.data : [];
      
      // Calculate total revenue only for delivered orders
      const totalRevenue = ordersArray.reduce((sum, order) => {
        const orderStatus = (order.status || order.orderStatus || '').toLowerCase();
        if (orderStatus === 'delivered') {
          return sum + (order.total_amount || order.totalAmount || 0);
        }
        return sum;
      }, 0);

      setStats({
        totalProducts: productsArray.length,
        totalUsers: usersArray.length,
        totalOrders: ordersArray.length,
        totalRevenue: totalRevenue
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn-header">
          Logout
        </button>
      </div>
      {isLoading ? (
        <div className="loading">Loading statistics...</div>
      ) : (
        <div className="admin-dashboard">
          <div className="stat-card">
            <div className="label">Total Products</div>
            <div className="value">{stats.totalProducts}</div>
            <div className="change positive">+5% from last week</div>
          </div>
          <div className="stat-card">
            <div className="label">Total Users</div>
            <div className="value">{stats.totalUsers}</div>
            <div className="change positive">+12% from last week</div>
          </div>
          <div className="stat-card">
            <div className="label">Total Orders</div>
            <div className="value">{stats.totalOrders}</div>
            <div className="change positive">+8% from last week</div>
          </div>
          <div className="stat-card">
            <div className="label">Total Revenue</div>
            <div className="value">₹{stats.totalRevenue.toFixed(0)}</div>
            <div className="change positive">+15% from last week</div>
          </div>
        </div>
      )}
    </div>
  );
}
