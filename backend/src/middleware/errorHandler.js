const logger = require('../utils/logger');
const { sendError } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, err.stack);

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : err.message || 'Internal Server Error';

  return sendError(res, message, statusCode, err.errors || null);
};

module.exports = errorHandler;
