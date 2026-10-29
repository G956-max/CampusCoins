import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_API_URL } from '../config/constants';
import { supabase, isSupabaseConfigured } from '../config/supabase';

const client = axios.create({
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach dynamic baseUrl and auth headers
client.interceptors.request.use(async (config) => {
  // 1. Resolve Base URL
  const customUrl = await AsyncStorage.getItem('campuscoins_api_url');
  config.baseURL = customUrl || DEFAULT_API_URL;

  // 2. Attach Auth Token
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
        return config;
      }
    } catch (e) {
      // ignore
    }
  }

  // 3. Fallback to mock session
  const savedRole = (await AsyncStorage.getItem('campuscoins_mock_role')) || 'student';
  const savedUserId =
    (await AsyncStorage.getItem('campuscoins_mock_user_id')) ||
    (savedRole === 'staff'
      ? 'b8000000-0000-0000-0000-000000000002'
      : savedRole === 'admin'
      ? 'b8000000-0000-0000-0000-000000000003'
      : 'b8000000-0000-0000-0000-000000000001');

  config.headers.Authorization = `Bearer mock-${savedRole}-token`;
  config.headers['x-mock-role'] = savedRole;
  config.headers['x-mock-user-id'] = savedUserId;

  return config;
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      error.message ||
      'Unable to connect to campus server';
    return Promise.reject(new Error(message));
  }
);

export default client;

