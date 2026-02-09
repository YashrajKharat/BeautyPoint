import { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api.js';
import '../../css/admin-light.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null); // Added state

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
                <th>Product & Use Detail</th>
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
                  : `${shippingAddress.street || ''}, ${shippingAddress.city || ''}, ${shippingAddress.zipCode || ''}`;

                const isCancelled = status.toLowerCase() === 'cancelled';
                const isExpanded = expandedOrderId === order.id;

                // Get product names summary
                const orderItems = order.order_items || [];
                const productSummary = orderItems.map(item => item.products?.name || 'Unknown Product').join(', ');

                return (
                  <>
                    <tr
                      key={order.id}
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      style={{ cursor: 'pointer', backgroundColor: isExpanded ? '#f9f9f9' : 'transparent' }}
                      className="order-row-main"
                    >
                      <td>
                        <span style={{ fontWeight: 'bold' }}>{order.id?.substring(0, 8)}...</span>
                        {isExpanded ? ' 🔼' : ' 🔽'}
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{productSummary.substring(0, 30)}{productSummary.length > 30 ? '...' : ''}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>{userEmail}</div>
                      </td>
                      <td>₹{totalAmount.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge status-${status.toLowerCase()}`}>
                          {status}
                        </span>
                      </td>
                      <td>
                        {orderDate ? new Date(orderDate).toLocaleDateString() : 'Invalid Date'}
                      </td>
                      <td>{addressStr.substring(0, 20)}...</td>
                      <td className="actions" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                          <select
                            value={status}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            disabled={updatingId === order.id || isCancelled}
                            className="status-select"
                          >
                            {statuses.map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteOrder(order.id);
                            }}
                            className="btn-delete"
                            title="Delete Order"
                            style={{ padding: '5px 10px' }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="order-details-row">
                        <td colSpan="7">
                          <div className="order-expansion-panel" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', margin: '10px 0' }}>
                            <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px' }}>Order Details</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                              <div className="detail-group">
                                <strong>Customer Info:</strong>
                                <p>Email: {userEmail}</p>
                                <p>Phone: {order.users?.phone || 'N/A'}</p>
                              </div>
                              <div className="detail-group">
                                <strong>Shipping Address:</strong>
                                <p>{typeof shippingAddress === 'string' ? shippingAddress : (
                                  <>
                                    {shippingAddress.street}<br />
                                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
                                    {shippingAddress.country}
                                  </>
                                )}</p>
                              </div>
                            </div>

                            <h4 style={{ marginBottom: '10px' }}>Ordered Items ({orderItems.length})</h4>
                            <div className="order-items-grid" style={{ display: 'grid', gap: '10px' }}>
                              {orderItems.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '10px', borderRadius: '6px', border: '1px solid #eee' }}>
                                  <img
                                    src={item.products?.images?.[0] || 'https://via.placeholder.com/50'}
                                    alt={item.products?.name}
                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', marginRight: '15px' }}
                                  />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold' }}>{item.products?.name || 'Unknown Product'}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                      Qty: {item.quantity} | Color: {item.selected_color || 'N/A'} | Price: ₹{item.price}
                                    </div>
                                  </div>
                                  <div style={{ fontWeight: 'bold', color: '#28a745' }}>
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
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
