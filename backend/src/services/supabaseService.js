const { getSupabaseClient } = require('../config/supabase');
const logger = require('../utils/logger');

/**
 * Supabase Database Service Abstraction
 * Acts as the centralized interface for all persistence operations.
 * Concrete queries will be linked to database tables in Phase 2.
 */
class SupabaseService {
  constructor() {
    this.client = null;
  }

  getClient() {
    if (!this.client) {
      this.client = getSupabaseClient();
    }
    return this.client;
  }

  isConfigured() {
    return Boolean(this.getClient());
  }

  async checkConnection() {
    const client = this.getClient();
    if (!client) {
      return {
        connected: false,
        message: 'Supabase credentials not configured yet (Scheduled for Phase 2)'
      };
    }

    try {
      // In Phase 2, this will ping the database
      return {
        connected: true,
        message: 'Supabase client ready'
      };
    } catch (error) {
      logger.error('Supabase connection check failed', error.message);
      return {
        connected: false,
        message: error.message
      };
    }
  }
}

module.exports = new SupabaseService();
