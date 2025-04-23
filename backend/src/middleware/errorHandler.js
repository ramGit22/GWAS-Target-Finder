const logger = require('../utils/logger');

/**
 * Global error handler middleware
 */
exports.errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Log error
  logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  // Log stack trace for internal server errors
  if (statusCode === 500) {
    logger.error(err.stack);
  }
  
  res.status(statusCode).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected error occurred'
      : err.message
  });
};

/**
 * Custom error class with status code
 */
exports.ApiError = class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
};

/**
 * Async function wrapper to avoid try/catch blocks in route handlers
 */
exports.asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
