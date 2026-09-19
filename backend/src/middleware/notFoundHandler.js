const { sendError } = require('../utils/apiResponse');

const notFoundHandler = (req, res, next) => {
  return sendError(res, `Resource not found: ${req.method} ${req.originalUrl}`, 404);
};

module.exports = notFoundHandler;
