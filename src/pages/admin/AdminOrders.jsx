import { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api.js';
import '../../css/admin-light.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await orderAPI.getAllOrders();
      const ordersData = Array.isArray(response.data) ? response.data : [];
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to fetch orders: ' + error.message);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      // Send status field to backend
      await orderAPI.updateOrderStatus(orderId, { status: newStatus });
      alert('Order status updated successfully!');
      fetchOrders();
    } catch (error) {
      alert('Failed to update order status: ' + error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const statuses = ['pending', 'confirmed', 'shipped', 'out-for-delivery', 'delivered', 'cancelled', 'return-requested', 'returned'];

  return (
    <div className="admin-orders">
      <div className="orders-header">
        <h1>Orders Management</h1>
        <p className="order-count">Total Orders: {orders.length}</p>
      </div>

      {isLoading ? (
        <div className="loading">Loading orders...</div>
      ) : (
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User Email</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Order Date</th>
                <th>Delivery Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const userEmail = order.users?.email || order.user_email || 'N/A';
                const totalAmount = order.total_amount || order.totalAmount || 0;
                const status = order.status || order.orderStatus || 'pending';
                const orderDate = order.created_at || order.createdAt;
                const shippingAddress = order.shipping_address || order.deliveryAddress || {};
                const addressStr = typeof shippingAddress === 'string'
                  ? shippingAddress
                  : `${shippingAddress.street || ''}, ${shippingAddress.city || ''}`;
                const isCancelled = status.toLowerCase() === 'cancelled';

                return (
                  <tr key={order.id}>
                    <td>{order.id?.substring(0, 8)}...</td>
                    <td>{userEmail}</td>
                    <td>₹{totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${status.toLowerCase()}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      {orderDate ? new Date(orderDate).toLocaleDateString() : 'Invalid Date'}
                    </td>
                    <td>{addressStr.substring(0, 30)}{addressStr.length > 30 ? '...' : ''}</td>
                    <td className="actions">
                      <select
                        value={status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        disabled={updatingId === order.id || isCancelled}
                        className="status-select"
                        title={isCancelled ? 'Cannot edit cancelled orders' : ''}
                      >
                        {statuses.map(st => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <p className="no-data">No orders found</p>
      )}
    </div>
  );
}
