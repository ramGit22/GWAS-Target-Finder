const axios = require('axios');
const logger = require('./logger');

/**
 * Creates a configured axios instance for an API
 * @param {string} baseURL - Base URL for the API
 * @param {object} defaultHeaders - Default headers to include in all requests
 * @param {number} timeout - Request timeout in ms
 * @returns {object} Configured axios instance
 */
const createClient = (baseURL, defaultHeaders = {}, timeout = 30000) => {
  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      ...defaultHeaders
    }
  });

  // Request interceptor for logging
  client.interceptors.request.use(
    config => {
      logger.debug(`API Request: ${config.method.toUpperCase()} ${config.url}`);
      return config;
    },
    error => {
      logger.error(`API Request Error: ${error.message}`);
      return Promise.reject(error);
    }
  );

  // Response interceptor for logging
  client.interceptors.response.use(
    response => {
      logger.debug(`API Response: ${response.status} from ${response.config.url}`);
      return response;
    },
    error => {
      if (error.response) {
        logger.error(`API Error: ${error.response.status} - ${error.response.data.message || 'Unknown error'} from ${error.config.url}`);
      } else if (error.request) {
        logger.error(`API No Response: ${error.message} for ${error.config.url}`);
      } else {
        logger.error(`API Request Setup Error: ${error.message}`);
      }
      return Promise.reject(error);
    }
  );

  return client;
};

module.exports = {
  createClient
};
