const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/env');
const logger = require('./utils/logger');
const rateLimiter = require('./middleware/rateLimiter');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes/index');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration - support frontend dev server and production
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    return callback(null, true); // Permissive in development for local frontend testing
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
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
    phase: 'Phase 1 - Foundation',
    endpoints: {
      health: '/api/health'
    }
  });
});

// 404 Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

// Start Server
const server = app.listen(config.port, () => {
  logger.info(`=========================================`);
  logger.info(` CampusCoins API Server started!`);
  logger.info(` Port: ${config.port}`);
  logger.info(` Mode: ${config.nodeEnv}`);
  logger.info(` Health check: http://localhost:${config.port}/api/health`);
  logger.info(`=========================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

module.exports = app;
