require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');
const logger = require('./utils/logger');

// Initialize express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(require('./middleware/rateLimiter'));

// Routes
app.use('/', routes);

// Error handler middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // In production, we might want to gracefully shutdown
  // process.exit(1);
});

module.exports = app; // For testing
