import axios from 'axios';
import { supabase, isSupabaseConfigured } from '../config/supabase';

const API_BASE_URL =
  typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? ''
    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');

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

// Request Interceptor: Attach Supabase JWT Token & ensure /api prefix
api.interceptors.request.use(
  async (config) => {
    // Ensure all internal routes have /api prefix so Vercel rewrites them to the Express backend
    if (config.url && !config.url.startsWith('/api') && !config.url.startsWith('http')) {
      config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }

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

    // Development / Demo fallback: If no session token, attach demo credentials matching current active role
    if (!config.headers.Authorization) {
      let activeRole = 'student';
      let activeUserId = 'b8000000-0000-0000-0000-000000000001';

      try {
        const stored = localStorage.getItem('campuscoins_demo_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          activeRole = parsed?.profile?.role || parsed?.user?.user_metadata?.role || activeRole;
          activeUserId = parsed?.profile?.id || parsed?.user?.id || activeUserId;
        }
      } catch (e) {
        // Fallback default
      }

      config.headers.Authorization = `Bearer mock-${activeRole}-token`;
      config.headers['x-mock-role'] = activeRole;
      config.headers['x-mock-user-id'] = activeUserId;
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
