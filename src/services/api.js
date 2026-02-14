import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

export const authService = {
    login: async (username, password) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        const response = await api.post('/login', formData);
        return response.data;
    },
};

export const dashboardService = {
    getSummary: () => api.get('/dashboard'),
};

export const productService = {
    getAll: () => api.get('/products'),
    create: (data) => api.post('/products', data),
};

export const vendorService = {
    getAll: () => api.get('/vendors'),
    create: (data) => api.post('/vendors', data),
};

export const categoryService = {
    getAll: () => api.get('/categories'),
    create: (data) => api.post('/categories', data),
};

export const saleService = {
    create: (data) => api.post('/sales', data),
};

export const poService = {
    getAll: () => api.get('/purchase_orders'),
    create: (data) => api.post('/purchase_orders', data),
    approve: (id) => api.put(`/purchase_orders/${id}/approve`),
    receive: (id) => api.put(`/purchase_orders/${id}/receive`),
};
