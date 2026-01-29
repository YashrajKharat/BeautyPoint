import { useState, useEffect } from 'react';
import { couponAPI } from '../../services/api.js';
import '../../css/admin-coupon.css';

export default function AdminCoupon() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [formData, setFormData] = useState({
    code: '',
    discountPercent: '',
    description: '',
    expiryDate: '',
    minOrderAmount: '',
    maxUsageCount: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, [filterActive]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterActive !== 'all') {
        params.isActive = filterActive === 'active';
      }
      const response = await couponAPI.getAllCoupons(params);
      setCoupons(response.data.data);
    } catch (error) {
      setFormError('Failed to fetch coupons');
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    // Validation
    if (!formData.code.trim()) {
      setFormError('Coupon code is required');
      return;
    }
    if (formData.discountPercent === '' || formData.discountPercent < 0 || formData.discountPercent > 100) {
      setFormError('Discount percent must be between 0 and 100');
      return;
    }
    if (!formData.expiryDate) {
      setFormError('Expiry date is required');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        code: formData.code,
        discountPercent: Number(formData.discountPercent),
        description: formData.description,
        expiryDate: formData.expiryDate,
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        maxUsageCount: formData.maxUsageCount ? Number(formData.maxUsageCount) : null
      };

      if (editingId) {
        await couponAPI.updateCoupon(editingId, submitData);
        setSuccessMessage('Coupon updated successfully!');
      } else {
        await couponAPI.createCoupon(submitData);
        setSuccessMessage('Coupon created successfully!');
      }

      // Reset form
      setFormData({
        code: '',
        discountPercent: '',
        description: '',
        expiryDate: '',
        minOrderAmount: '',
        maxUsageCount: ''
      });
      setShowForm(false);
      setEditingId(null);

      // Refresh list
      fetchCoupons();

      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to save coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code || '',
      discountPercent: coupon.discount_percent || '',
      description: coupon.description || '',
      expiryDate: coupon.expiry_date ? coupon.expiry_date.split('T')[0] : '',
      minOrderAmount: coupon.min_order_amount || '',
      maxUsageCount: coupon.max_uses || ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await couponAPI.deleteCoupon(id);
        setSuccessMessage('Coupon deleted successfully!');
        fetchCoupons();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        setFormError('Failed to delete coupon');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      code: '',
      discountPercent: '',
      description: '',
      expiryDate: '',
      minOrderAmount: '',
      maxUsageCount: ''
    });
    setFormError('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="admin-coupon-container">
      <div className="coupon-header">
        <div className="header-content">
          <h1>🎟️ Coupon Management</h1>
          <p>Create, manage, and track coupon codes for promotions</p>
        </div>
        {!showForm && (
          <button
            className="btn-create-coupon"
            onClick={() => setShowForm(true)}
          >
            + Create New Coupon
          </button>
        )}
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="alert alert-success">
          ✓ {successMessage}
        </div>
      )}
      {formError && (
        <div className="alert alert-error">
          ✕ {formError}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="coupon-form-section">
          <h2>{editingId ? 'Edit Coupon' : 'Create New Coupon'}</h2>
          <form onSubmit={handleSubmit} className="coupon-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="code">Coupon Code *</label>
                <input
                  id="code"
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., SAVE10, WELCOME20"
                  disabled={loading || editingId}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="discountPercent">Discount Percent (0-100) *</label>
                <input
                  id="discountPercent"
                  type="number"
                  name="discountPercent"
                  min="0"
                  max="100"
                  value={formData.discountPercent}
                  onChange={handleInputChange}
                  placeholder="e.g., 10, 25, 50"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expiryDate">Expiry Date *</label>
                <input
                  id="expiryDate"
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="minOrderAmount">Minimum Order Amount (₹)</label>
                <input
                  id="minOrderAmount"
                  type="number"
                  name="minOrderAmount"
                  min="0"
                  value={formData.minOrderAmount}
                  onChange={handleInputChange}
                  placeholder="e.g., 500, 1000"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="maxUsageCount">Max Usage Count (leave empty for unlimited)</label>
                <input
                  id="maxUsageCount"
                  type="number"
                  name="maxUsageCount"
                  min="1"
                  value={formData.maxUsageCount}
                  onChange={handleInputChange}
                  placeholder="e.g., 100, 500"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="e.g., Welcome offer for new customers - valid on orders above ₹500"
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={loading}
                className="btn-submit"
              >
                {loading ? '⏳ Saving...' : editingId ? '✓ Update Coupon' : '✓ Create Coupon'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`tab ${filterActive === 'all' ? 'active' : ''}`}
          onClick={() => setFilterActive('all')}
        >
          All Coupons ({coupons.length})
        </button>
        <button
          className={`tab ${filterActive === 'active' ? 'active' : ''}`}
          onClick={() => setFilterActive('active')}
        >
          Active
        </button>
        <button
          className={`tab ${filterActive === 'inactive' ? 'active' : ''}`}
          onClick={() => setFilterActive('inactive')}
        >
          Inactive
        </button>
      </div>

      {/* Coupons Table */}
      <div className="coupons-table-wrapper">
        {loading && !showForm ? (
          <div className="loading-state">
            <p>⏳ Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">🎟️</p>
            <p className="empty-text">No coupons found</p>
            <p className="empty-subtext">Create your first coupon to get started</p>
          </div>
        ) : (
          <table className="coupons-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Expiry Date</th>
                <th>Usage</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                // Map snake_case database fields to camelCase
                const code = coupon.code || '';
                const discountPercent = coupon.discount_percent;
                const expiryDate = coupon.expiry_date || '';
                const currentUsageCount = coupon.current_uses || 0;
                const maxUsageCount = coupon.max_uses || null;
                const isActive = coupon.is_active !== false;
                
                console.log('Coupon data:', { code, discountPercent, discount_percent: coupon.discount_percent, coupon });
                
                const expired = isExpired(expiryDate);
                const usageStatus = maxUsageCount
                  ? `${currentUsageCount}/${maxUsageCount}`
                  : `${currentUsageCount}/∞`;

                return (
                  <tr key={coupon.id} className={expired ? 'expired-row' : ''}>
                    <td className="code-cell">
                      <span className="coupon-code-badge">{code}</span>
                    </td>
                    <td>
                      {discountPercent !== null && discountPercent !== undefined ? (
                        <span className="discount-badge">{discountPercent}% OFF</span>
                      ) : (
                        <span className="discount-badge">-</span>
                      )}
                    </td>
                    <td>
                      <span className={expired ? 'expired-date' : ''}>
                        {expiryDate ? formatDate(expiryDate) : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={currentUsageCount > 0 ? 'usage-count' : ''}>
                        {usageStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${isActive && !expired ? 'active' : 'inactive'}`}>
                        {expired ? 'Expired' : isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleEdit(coupon)}
                        title="Edit coupon"
                      >
                        ✎ Edit
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(coupon.id)}
                        title="Delete coupon"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats */}
      {coupons.length > 0 && (
        <div className="coupon-stats">
          <div className="stat-card">
            <div className="stat-icon">🎟️</div>
            <div className="stat-content">
              <p className="stat-label">Total Coupons</p>
              <p className="stat-value">{coupons.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✓</div>
            <div className="stat-content">
              <p className="stat-label">Active Coupons</p>
              <p className="stat-value">{coupons.filter(c => (c.is_active !== false) && !isExpired(c.expiry_date)).length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <p className="stat-label">Total Used</p>
              <p className="stat-value">{coupons.reduce((sum, c) => sum + (c.current_uses || 0), 0)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
