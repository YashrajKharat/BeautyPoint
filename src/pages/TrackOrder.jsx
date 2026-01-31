import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { orderAPI } from '../services/api.js';
import { Loader } from '../components/Loader.jsx';
import '../css/track-order-premium.css';

export default function TrackOrder() {
  const { isAuthenticated } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getOrders();
      const ordersData = Array.isArray(response.data) ? response.data : response.data.orders || [];
      setOrders(ordersData);
      if (ordersData.length > 0) {
        setSelectedOrder(ordersData[0]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const canCancelOrder = (status) => {
    if (!status) {
      return true;
    }
    const nonCancelableStatuses = ['Shipped', 'In Transit', 'In transit', 'Delivered', 'Cancelled'];
    return !nonCancelableStatuses.some(s => s.toLowerCase() === status.toLowerCase());
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    setIsCancelling(true);
    try {
      await orderAPI.cancelOrder(selectedOrder.id, {
        reason: cancellationReason || 'Customer requested cancellation'
      });

      const updatedOrders = orders.map(order =>
        order.id === selectedOrder.id
          ? { ...order, status: 'Cancelled' }
          : order
      );
      setOrders(updatedOrders);
      setSelectedOrder({ ...selectedOrder, status: 'Cancelled' });

      setShowCancelModal(false);
      setCancellationReason('');
      alert('Order cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const getReturnEligibility = (order) => {
    if (!order || !order.status || order.status.toLowerCase() !== 'delivered') {
      return { eligible: false, message: 'Not delivered yet' };
    }

    // Use updatedAt as delivery date (approximation) or tracking update
    const deliveryDate = new Date(order.updatedAt || order.updated_at);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - deliveryDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isEligible = diffDays <= 7;

    const deadline = new Date(deliveryDate);
    deadline.setDate(deadline.getDate() + 7);

    return {
      eligible: isEligible,
      daysLeft: 7 - diffDays,
      deadline: deadline.toLocaleDateString(),
      message: isEligible ? `Eligible for return until ${deadline.toLocaleDateString()}` : `Return window closed on ${deadline.toLocaleDateString()}`
    };
  };

  const handleReturnOrder = () => {
    if (!selectedOrder) return;
    const { eligible, message } = getReturnEligibility(selectedOrder);

    if (eligible) {
      const confirmReturn = window.confirm(`Initiate return for Order #${selectedOrder.id}?\n\nPolicy: 7-Day Returns\n${message}\n\nOur team will review your request and contact you.`);
      if (confirmReturn) {
        alert('Return Request Submitted! ✅\n\nOur courier partner will pick up the item within 24-48 hours. Refund will be processed after quality check.');
      }
    } else {
      alert(`Cannot Return Order.\n\n${message}\n\nPolicy: Products can only be returned within 7 days of delivery.`);
    }
  };

  const getFilteredAndSortedOrders = () => {
    let filtered = orders.filter(order => {
      const searchLower = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        (order.tracking?.trackingNumber && order.tracking.trackingNumber.toLowerCase().includes(searchLower))
      );
    });

    filtered.sort((a, b) => {
      // Support both camelCase (createdAt) and snake_case (created_at)
      const dateA = a.createdAt || a.created_at;
      const dateB = b.createdAt || b.created_at;

      const dateObjA = new Date(dateA);
      const dateObjB = new Date(dateB);

      if (sortOrder === 'newest') {
        return dateObjB - dateObjA;
      } else if (sortOrder === 'oldest') {
        return dateObjA - dateObjB;
      }
      return 0;
    });

    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return '#4CAF50';
      case 'in transit': return '#2196F3';
      case 'processing': return '#FF9800';
      case 'cancelled': return '#F44336';
      default: return '#2196F3';
    }
  };

  const filteredOrders = getFilteredAndSortedOrders();

  if (isLoading) {
    return (
      <div className="track-loading">
        <div className="spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="premium-track-container">
      <Loader visible={isLoading} size="md" />
      {/* Hero Section */}
      <div className="premium-track-hero">
        <div className="hero-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <div className="track-hero-content">
          <h1>Track Your Orders</h1>
          <p>Monitor your purchases and get real-time delivery updates</p>
          <div className="breadcrumb">Home / Orders / Track</div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders-container">
          <div className="no-orders-card">
            <div className="empty-icon">📦</div>
            <h2>No Orders Yet</h2>
            <p>You haven't placed any orders yet. Start shopping to track your purchases!</p>
            <a href="/products" className="cta-button">Browse Products</a>
          </div>
        </div>
      ) : (
        <div className="premium-track-wrapper">
          {/* Sidebar with Search and Filter */}
          <aside className="track-sidebar">
            {/* Search Section */}
            <div className="sidebar-section search-section">
              <h3>🔍 Search Orders</h3>
              <div className="search-wrapper">
                <input
                  type="text"
                  placeholder="Order ID or Tracking#..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="track-search"
                />
                <span className="search-icon">🔎</span>
              </div>
            </div>

            {/* Sort Section */}
            <div className="sidebar-section">
              <div className="section-header">
                <h3>📅 Sort Orders</h3>
              </div>
              <div className="sort-options">
                <label className="sort-item">
                  <input
                    type="radio"
                    name="sort"
                    value="newest"
                    checked={sortOrder === 'newest'}
                    onChange={(e) => setSortOrder(e.target.value)}
                  />
                  <span>Newest First</span>
                </label>
                <label className="sort-item">
                  <input
                    type="radio"
                    name="sort"
                    value="oldest"
                    checked={sortOrder === 'oldest'}
                    onChange={(e) => setSortOrder(e.target.value)}
                  />
                  <span>Oldest First</span>
                </label>
              </div>
            </div>

            {/* Stats Section */}
            <div className="sidebar-section stats-section">
              <h3>📊 Your Stats</h3>
              <div className="stat-item">
                <span className="stat-label">Total Orders</span>
                <span className="stat-value">{orders.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Delivered</span>
                <span className="stat-value delivered">{orders.filter(o => (o.status || o.orderStatus) && (o.status || o.orderStatus).toLowerCase() === 'delivered').length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending</span>
                <span className="stat-value pending">{orders.filter(o => (o.status || o.orderStatus) && (o.status || o.orderStatus).toLowerCase() === 'pending').length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Cancelled</span>
                <span className="stat-value cancelled">{orders.filter(o => (o.status || o.orderStatus) && (o.status || o.orderStatus).toLowerCase() === 'cancelled').length}</span>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="track-main">
            {/* Orders List */}
            <div className="orders-grid">
              <div className="grid-header">
                <h2>Your Orders ({filteredOrders.length})</h2>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="no-results">
                  <p>No orders found matching your search.</p>
                </div>
              ) : (
                <div className="orders-list">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`order-card ${selectedOrder?.id === order.id ? 'active' : ''}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="order-card-header">
                        <div className="order-info">
                          <div className="order-id">Order #{(order.id || 'N/A').toString().slice(-8).toUpperCase()}</div>
                          <div className="order-date">
                            {new Date(order.createdAt || order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        <div className="order-status-badge" style={{ borderColor: getStatusColor(order.status || order.orderStatus) }}>
                          <span className="status-dot" style={{ backgroundColor: getStatusColor(order.status || order.orderStatus) }}></span>
                          <span>{order.status || order.orderStatus || 'Processing'}</span>
                        </div>
                      </div>

                      <div className="order-card-body">
                        <div className="order-detail">
                          <span className="detail-label">Total Amount</span>
                          <span className="detail-value">₹{(order.total_amount || order.totalAmount || 0)?.toFixed(2)}</span>
                        </div>
                        <div className="order-detail">
                          <span className="detail-label">Items</span>
                          <span className="detail-value">{(order.order_items || order.items)?.length || 0}</span>
                        </div>
                        <div className="order-detail">
                          <span className="detail-label">Tracking</span>
                          <span className="detail-value">{order.tracking?.trackingNumber || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Details Panel */}
            {selectedOrder && (
              <div className="order-details-panel">
                <div className="details-header">
                  <h2>Order Details</h2>
                  <div className="header-actions">
                    {canCancelOrder(selectedOrder.status || selectedOrder.orderStatus) ? (
                      <button
                        className="cancel-order-btn"
                        onClick={() => setShowCancelModal(true)}
                        title="Cancel this order"
                      >
                        ✕ Cancel Order
                      </button>
                    ) : null}

                    {/* Return Button Logic */}
                    {(selectedOrder.status || selectedOrder.orderStatus)?.toLowerCase() === 'delivered' && (
                      <button
                        className={`cancel-order-btn ${!getReturnEligibility(selectedOrder).eligible ? 'disabled' : ''}`}
                        style={{
                          backgroundColor: getReturnEligibility(selectedOrder).eligible ? '#FF9800' : '#ccc',
                          borderColor: getReturnEligibility(selectedOrder).eligible ? '#F57C00' : '#bbb',
                          cursor: getReturnEligibility(selectedOrder).eligible ? 'pointer' : 'not-allowed',
                          marginLeft: '10px'
                        }}
                        onClick={handleReturnOrder}
                        title={getReturnEligibility(selectedOrder).message}
                      >
                        {getReturnEligibility(selectedOrder).eligible ? '↩ Return Order' : 'Start Return'}
                      </button>
                    )}

                    <button className="close-details" onClick={() => setSelectedOrder(null)}>✕</button>
                  </div>
                </div>

                {/* Order Information */}
                <div className="details-section">
                  <h3>📋 Order Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Order ID</span>
                      <span className="info-value">{selectedOrder.id}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Date</span>
                      <span className="info-value">
                        {new Date(selectedOrder.createdAt || selectedOrder.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Total Amount</span>
                      <span className="info-value">₹{(selectedOrder.total_amount || selectedOrder.totalAmount || 0)?.toFixed(2)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Status</span>
                      <span className="info-value" style={{ color: getStatusColor(selectedOrder.status || selectedOrder.orderStatus) }}>
                        {selectedOrder.status || selectedOrder.orderStatus || 'Processing'} {canCancelOrder(selectedOrder.status || selectedOrder.orderStatus) && '✓ Cancellable'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tracking Information */}
                <div className="details-section">
                  <h3>📍 Tracking Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Tracking Number</span>
                      <span className="info-value">{selectedOrder.tracking?.trackingNumber || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Carrier</span>
                      <span className="info-value">{selectedOrder.tracking?.carrier || 'Standard Shipping'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Current Location</span>
                      <span className="info-value">{selectedOrder.tracking?.updates?.[0]?.location || 'In Transit'}</span>
                    </div>
                  </div>
                </div>

                {/* Items Ordered */}
                <div className="details-section">
                  <h3>📦 Items Ordered</h3>
                  <div className="items-list">
                    {(selectedOrder.order_items || selectedOrder.items)?.map((item, idx) => {
                      const product = item.products || item.productId;
                      return (
                        <div key={idx} className="item-row">
                          <div className="item-info">
                            <span className="item-name">{product?.name || 'Product'}</span>
                            <span className="item-quantity">Qty: {item.quantity}</span>
                          </div>
                          <span className="item-price">₹{(item.price * item.quantity)?.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="details-section">
                  <h3>🏠 Shipping Address</h3>
                  <div className="address-box">
                    <p>{selectedOrder.shippingAddress?.street}</p>
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}</p>
                    <p>{selectedOrder.shippingAddress?.country}</p>
                  </div>
                </div>

                {/* Timeline Updates */}
                <div className="details-section">
                  <h3>📌 Delivery Timeline</h3>
                  <div className="timeline">
                    {selectedOrder.tracking?.updates?.map((update, idx) => (
                      <div key={idx} className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-status">{update.status}</div>
                          <div className="timeline-location">{update.location}</div>
                          <div className="timeline-message">{update.message}</div>
                          {update.timestamp && (
                            <div className="timeline-date">
                              {new Date(update.timestamp).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}
      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => !isCancelling && setShowCancelModal(false)}>
          <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Order</h3>
              <button
                className="modal-close"
                onClick={() => !isCancelling && setShowCancelModal(false)}
                disabled={isCancelling}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="warning-text">⚠️ Are you sure you want to cancel this order?</p>
              <p className="info-text">Order ID: {(selectedOrder?.id || 'N/A').toString().slice(-8).toUpperCase()}</p>

              <div className="form-group">
                <label>Reason for cancellation (optional)</label>
                <textarea
                  className="cancel-textarea"
                  placeholder="Please let us know why you're cancelling this order..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  disabled={isCancelling}
                  rows="4"
                />
              </div>

              <p className="refund-info">💡 Your payment will be refunded within 5-7 business days.</p>
            </div>

            <div className="modal-footer">
              <button
                className="modal-btn cancel-btn"
                onClick={() => !isCancelling && setShowCancelModal(false)}
                disabled={isCancelling}
              >
                Keep Order
              </button>
              <button
                className="modal-btn confirm-btn"
                onClick={handleCancelOrder}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}    </div>
  );
}
