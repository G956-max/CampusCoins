import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Standardized Axios client instance
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (attaches JWT auth tokens when connected to Supabase in Phase 2)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campuscoins_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor (centralized response error handling)
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    
    // In Phase 2: Handle 401 Unauthorized token expirations
    if (error.response?.status === 401) {
      console.warn('[API] Session expired or unauthorized.');
    }

    return Promise.reject(new Error(message));
  }
);

/**
 * Health check service method
 */
export const checkHealth = async () => {
  try {
    const data = await api.get('/api/health');
    return {
      online: true,
      data,
    };
  } catch (error) {
    return {
      online: false,
      error: error.message,
    };
  }
};

export default api;
