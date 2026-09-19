import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Supabase Client Abstraction for Frontend
 * Safe initialization with fallback for Phase 1.
 * Tables and Realtime listeners will be connected in Phase 2.
 */
let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.warn('[Supabase Frontend] Initialization pending Phase 2 credentials.');
  }
}

export const isSupabaseConfigured = () => Boolean(supabase);

export default supabase;
