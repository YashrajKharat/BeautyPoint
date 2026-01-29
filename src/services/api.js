import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Don't set Content-Type if data is FormData (let browser set it)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// User API calls
export const userAPI = {
  register: (data) => api.post('/users/register', data),
  login: (data) => api.post('/users/login', data),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAllUsers: () => api.get('/users'),
  deleteUser: (id) => api.delete(`/users/${id}`),
  checkAdminExists: () => api.get('/users/check-admin-exists')
};

// Product API calls
export const productAPI = {
  getAll: () => api.get('/products'),
  getAllProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  searchProducts: (query, category) => api.get('/products/search', { params: { query, category } }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
};

// Cart API calls
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart/add', data),
  removeFromCart: (data) => api.post('/cart/remove', data),
  updateCartItem: (data) => api.post('/cart/update', data),
  clearCart: () => api.post('/cart/clear')
};

// Order API calls
export const orderAPI = {
  createOrder: (data) => api.post('/orders/create', data),
  getOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  trackOrder: (id) => api.get(`/orders/${id}/track`),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  cancelOrder: (id, data) => api.put(`/orders/${id}/cancel`, data),
  getAllOrders: () => api.get('/orders/admin/all')
};



// Coupon API calls
export const couponAPI = {
  validateCoupon: (code, orderAmount) => api.post('/coupons/validate', { code, orderAmount }),
  createCoupon: (data) => api.post('/coupons/create', data),
  getAllCoupons: (params) => api.get('/coupons/all', { params }),
  getCouponById: (id) => api.get(`/coupons/${id}`),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
  trackCouponUsage: (data) => api.post('/coupons/track-usage', data)
};

export default api;
