const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  allowDevMockAuth: (process.env.NODE_ENV === 'test' || process.env.ALLOW_DEV_MOCK_AUTH === 'true') && process.env.NODE_ENV !== 'production',
  aiServiceUrl: process.env.AI_SERVICE_URL || '',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
};

module.exports = config;
