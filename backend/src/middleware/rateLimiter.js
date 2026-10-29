const rateLimit = require('express-rate-limit');
const config = require('../config/env');

// General API Rate Limiter
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// Sensitive operations limiter (complaint submission, reward claim, redemption)
const actionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 actions per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Action rate limit reached. Please wait a few minutes before submitting again.'
  }
});

// Authentication rate limiter (brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

module.exports = generalLimiter;
module.exports.generalLimiter = generalLimiter;
module.exports.actionLimiter = actionLimiter;
module.exports.authLimiter = authLimiter;
