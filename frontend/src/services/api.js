import axios from 'axios';
import { supabase, isSupabaseConfigured } from '../config/supabase';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL !== undefined
    ? import.meta.env.VITE_API_BASE_URL
    : import.meta.env.PROD
    ? ''
    : 'http://localhost:5000';

/**
 * Standardized Axios client instance
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Supabase JWT Token
api.interceptors.request.use(
  async (config) => {
    // Attach real Supabase session token
    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
        }
      } catch (err) {
        console.warn('[API Interceptor] Supabase session retrieval notice:', err);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Centralized error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';

    if (error.response?.status === 401) {
      console.warn('[API] Session expired or unauthenticated.');
    }

    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.errors = error.response?.data?.errors;
    return Promise.reject(customError);
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
