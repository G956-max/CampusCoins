const config = require('./env');

/**
 * Supabase Server Client Abstraction
 * Supports default singleton or scoped client with user JWT token for RLS compatibility
 */
let supabaseClient = null;

const getSupabaseClient = (userToken = null) => {
  const { url, serviceRoleKey } = config.supabase;
  if (!url || !serviceRoleKey) {
    return null;
  }

  try {
    const { createClient } = require('@supabase/supabase-js');

    // Scoped client with authenticated user token so Postgres RLS recognises auth.uid()
    if (userToken) {
      return createClient(url, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      });
    }

    if (supabaseClient) return supabaseClient;
    supabaseClient = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return supabaseClient;
  } catch (err) {
    console.warn('[Supabase] Client initialization notice:', err.message);
    return null;
  }
};

module.exports = {
  getSupabaseClient,
};
