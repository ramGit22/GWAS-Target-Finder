const logger = require('./logger');

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} initialDelay - Initial delay in ms before first retry
 * @param {number} maxDelay - Maximum delay in ms
 * @returns {Promise} Result of the function call
 */
const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000, maxDelay = 10000) => {
  let retries = 0;
  let delay = initialDelay;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      retries++;
      
      // If we've reached max retries or the error is not retryable, throw
      if (retries >= maxRetries || !isRetryableError(error)) {
        throw error;
      }
      
      // Log retry attempt
      logger.warn(`Retrying API call after error: ${error.message}, attempt ${retries}/${maxRetries}`);
      
      // Implement exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increase delay for next retry, but cap at maxDelay
      delay = Math.min(delay * 2, maxDelay);
    }
  }
};

/**
 * Check if an error is retryable (e.g., rate limits, network issues)
 * @param {Error} error - The error to check
 * @returns {boolean} Whether the error is retryable
 */
const isRetryableError = (error) => {
  // Network errors are retryable
  if (!error.response) {
    return true;
  }
  
  // Retry on certain status codes
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  return retryableStatusCodes.includes(error.response.status);
};

/**
 * Rate limiter for API calls
 * @param {Function} fn - Function to rate limit
 * @param {number} interval - Minimum interval between calls in ms
 * @returns {Function} Rate-limited function
 */
const rateLimiter = (fn, interval = 500) => {
  let lastCallTime = 0;
  
  return async (...args) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    
    if (timeSinceLastCall < interval) {
      const delayTime = interval - timeSinceLastCall;
      logger.debug(`Rate limiting: delaying API call by ${delayTime}ms`);
      await new Promise(resolve => setTimeout(resolve, delayTime));
    }
    
    lastCallTime = Date.now();
    return fn(...args);
  };
};

/**
 * Process a batch of items with a function and limit concurrency
 * @param {Array} items - Array of items to process
 * @param {Function} fn - Function to apply to each item
 * @param {number} concurrency - Maximum number of concurrent operations
 * @returns {Promise<Array>} Results array
 */
const processBatch = async (items, fn, concurrency = 3) => {
  const results = [];
  
  // Process items in batches
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchPromises = batch.map(item => fn(item).catch(error => {
      logger.error(`Error processing item: ${error.message}`);
      return { error };
    }));
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
};

module.exports = {
  retryWithBackoff,
  rateLimiter,
  processBatch
};
