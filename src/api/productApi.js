import api from './axios';

export const productApi = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getTopSelling: () => api.get('/products/top-selling'),
  getRelated: (id) => api.get(`/products/${id}/related`),
  getVehicles: (params) => api.get('/products/vehicles', { params }),

  // Admin
  createProduct: (data) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProduct: (id, data) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

export const categoryApi = {
  getCategories: (params) => api.get('/categories', { params }),
  getCategory: (id) => api.get(`/categories/${id}`),
  createCategory: (data) => api.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

export const brandApi = {
  getBrands: () => api.get('/brands'),
  createBrand: (data) => api.post('/brands', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateBrand: (id, data) => api.put(`/brands/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteBrand: (id) => api.delete(`/brands/${id}`),
};

export const reviewApi = {
  getReviews: (productId) => api.get(`/reviews/product/${productId}`),
  createReview: (productId, data) => api.post(`/reviews/product/${productId}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};
