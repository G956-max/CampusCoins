import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://fscvotjtqatutitnvncc.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzY3ZvdGp0cWF0dXRpdG52bmNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMTU2NzQsImV4cCI6MjEwODY5MTY3NH0.8pURUaHI0lgkm_uo_pVcBsB8FVOdNahPftbwz-BNxHM';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

/**
 * Validates whether Supabase environment variables are populated
 */
export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    !supabaseUrl.includes('placeholder')
  );
};

/**
 * Official Supabase Client Instance
 * Configured with standard session persistence and auto token refresh
 */
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Maps raw Supabase or network errors into friendly, user-facing error messages
 */
export const mapAuthError = (error) => {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const message = typeof error === 'string' ? error : error.message || '';
  const lower = message.toLowerCase();

  if (lower.includes('invalid login credentials') || lower.includes('invalid credential')) {
    return 'Incorrect email or password.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please verify your college email before logging in.';
  }
  if (lower.includes('user already registered') || lower.includes('already exists')) {
    return 'This email is already registered.';
  }
  if (lower.includes('password should be at least') || lower.includes('weak password')) {
    return 'Password must contain at least 8 characters.';
  }
  if (lower.includes('account inactive') || lower.includes('deactivated')) {
    return 'Your account is currently inactive. Please contact the administrator.';
  }
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'Network connection error. Please check your internet connection.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  return message || 'Authentication failed. Please verify your details.';
};

export default supabase;
