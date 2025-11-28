import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth endpoints
export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (userData) => api.post('/auth/register', userData);

// Market endpoints
export const getMarkets = () => api.get('/markets');
export const getMarketById = (id) => api.get(`/markets/${id}`);
export const createMarket = (marketData, token) =>
    api.post('/markets', marketData, { headers: { Authorization: `Bearer ${token}` } });

// Product endpoints
export const getProducts = () => api.get('/products');
export const getProductById = (id) => api.get(`/products/${id}`);
export const getCategories = () => api.get('/products/categories/all');
export const createProduct = (productData, token) =>
    api.post('/products', productData, { headers: { Authorization: `Bearer ${token}` } });

// Price endpoints
export const getPrices = () => api.get('/prices');
export const getPricesByProduct = (productId) => api.get(`/prices/product/${productId}`);
export const getPricesByMarket = (marketId) => api.get(`/prices/market/${marketId}`);
export const submitPrice = (priceData, token) =>
    api.post('/prices', priceData, { headers: { Authorization: `Bearer ${token}` } });
export const verifyPrice = (id, token) =>
    api.patch(`/prices/${id}/verify`, {}, { headers: { Authorization: `Bearer ${token}` } });

export default api;
