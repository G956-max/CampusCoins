const config = require('./env');

/**
 * Supabase Server Client Abstraction
 * In Phase 1, initializes or prepares the Supabase admin client.
 * Ready to be connected to Supabase in Phase 2 when database tables are migrated.
 */
let supabaseClient = null;

const initSupabase = () => {
  if (supabaseClient) return supabaseClient;

  const { url, serviceRoleKey } = config.supabase;
  if (!url || !serviceRoleKey) {
    // Graceful fallback logger for Phase 1
    return null;
  }

  try {
    // Dynamic require so backend doesn't crash if supabase-js is plugged in later
    const { createClient } = require('@supabase/supabase-js');
    supabaseClient = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    return supabaseClient;
  } catch (err) {
    console.warn('[Supabase] Client not initialized. Will be connected in Phase 2.');
    return null;
  }
};

module.exports = {
  getSupabaseClient: initSupabase
};
