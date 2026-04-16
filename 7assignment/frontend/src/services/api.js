import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const getRelated = (id) => api.get(`/products/${id}/related`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/me', data);
export const changePassword = (data) => api.put('/auth/change-password', data);

// Cart
export const getCart = () => api.get('/cart');
export const addToCart = (productId, quantity) => api.post('/cart/add', { productId, quantity });
export const updateCartItem = (productId, quantity) => api.put('/cart/update', { productId, quantity });
export const removeFromCart = (productId) => api.delete(`/cart/remove/${productId}`);
export const clearCart = () => api.delete('/cart/clear');

// Orders
export const createOrder = (data) => api.post('/orders', data);
export const getMyOrders = () => api.get('/orders/my');
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createPaymentIntent = (amount) => api.post('/orders/create-payment-intent', { amount });
export const confirmPayment = (id, data) => api.put(`/orders/${id}/pay`, data);

// Reviews
export const getReviews = (productId) => api.get(`/reviews/product/${productId}`);
export const createReview = (data) => api.post('/reviews', data);
export const markHelpful = (id) => api.put(`/reviews/${id}/helpful`);

// Wishlist
export const getWishlist = () => api.get('/wishlist');
export const toggleWishlist = (productId) => api.post(`/wishlist/toggle/${productId}`);

// Admin
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = () => api.get('/admin/users');
export const updateUserRole = (id, role) => api.put(`/admin/users/${id}/role`, { role });
export const getAllOrders = (params) => api.get('/orders', { params });
export const updateOrderStatus = (id, data) => api.put(`/orders/${id}/status`, data);

// Coupons
export const validateCoupon = (code, totalPrice) => api.post('/coupons/validate', { code, totalPrice });

export default api;