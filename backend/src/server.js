const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/env');
const logger = require('./utils/logger');
const rateLimiter = require('./middleware/rateLimiter');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes/index');
const { initSlaWorker } = require('./services/slaService');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration - support frontend dev server and production
const allowedHeaders = ['Content-Type', 'Authorization'];
if (config.allowDevMockAuth) {
  allowedHeaders.push('x-mock-role', 'x-mock-user-id');
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    // Allow frontend URL in production or localhost in dev
    if (config.nodeEnv === 'production') {
      if (origin === config.frontendUrl) return callback(null, true);
      if (typeof origin === 'string' && origin.endsWith('.vercel.app')) return callback(null, true);
      return callback(new Error('CORS policy: Not allowed by origin.'));
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders,
}));

// Global Rate limiting
app.use('/api', rateLimiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });
}

// Mount API routes
app.use('/api', apiRoutes);

// Root route for ping
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'CampusCoins API Gateway',
    version: '1.0.0',
    status: 'online',
    mode: config.nodeEnv,
    authMode: config.allowDevMockAuth ? 'development_preview' : 'production_secure',
    endpoints: {
      health: '/api/health',
      complaints: '/api/complaints',
      wallet: '/api/wallet',
      rewards: '/api/rewards',
      missions: '/api/missions',
      map: '/api/locations/map',
    }
  });
});

// 404 Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

// Start Server if not on Vercel and not loaded as module in another runner
let server = null;
if (!process.env.VERCEL && (process.env.NODE_ENV !== 'test' || require.main === module)) {
  server = app.listen(config.port, () => {
    logger.info(`=========================================`);
    logger.info(` CampusCoins API Server started!`);
    logger.info(` Port: ${config.port}`);
    logger.info(` Mode: ${config.nodeEnv}`);
    logger.info(` Auth Security: ${config.allowDevMockAuth ? 'Dev/Mock Enabled' : 'Strict Production JWT'}`);
    logger.info(` Health check: http://localhost:${config.port}/api/health`);
    logger.info(`=========================================`);

    // Initialize SLA background periodic monitoring
    initSlaWorker();
  });
}

app.locals.server = server;

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }
});

module.exports = app;
