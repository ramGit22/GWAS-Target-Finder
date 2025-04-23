/**
 * Rate limiter middleware to restrict request frequency
 */
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Create rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: process.env.MAX_REQUESTS_PER_MINUTE || 60, // limit each IP to N requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.'
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  }
});

module.exports = apiLimiter;
