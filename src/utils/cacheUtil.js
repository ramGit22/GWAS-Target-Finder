const logger = require('./logger');

/**
 * Simple in-memory cache with expiration
 */
class Cache {
  constructor(ttlMs = 3600000) { // Default TTL: 1 hour
    this.cache = {};
    this.ttlMs = ttlMs;
  }
  
  /**
   * Set a value in the cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlMs - Optional custom TTL in milliseconds
   */
  set(key, value, ttlMs = this.ttlMs) {
    this.cache[key] = {
      value,
      expiry: Date.now() + ttlMs
    };
  }
  
  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if not found/expired
   */
  get(key) {
    const item = this.cache[key];
    
    // Return null if item doesn't exist
    if (!item) {
      return null;
    }
    
    // Check if item has expired
    if (Date.now() > item.expiry) {
      delete this.cache[key];
      return null;
    }
    
    return item.value;
  }
  
  /**
   * Check if a key exists in the cache and is not expired
   * @param {string} key - Cache key
   * @returns {boolean} Whether the key exists and is valid
   */
  has(key) {
    const item = this.cache[key];
    
    if (!item) {
      return false;
    }
    
    if (Date.now() > item.expiry) {
      delete this.cache[key];
      return false;
    }
    
    return true;
  }
  
  /**
   * Delete a key from the cache
   * @param {string} key - Cache key
   */
  delete(key) {
    delete this.cache[key];
  }
  
  /**
   * Clear all items from the cache
   */
  clear() {
    this.cache = {};
  }
  
  /**
   * Remove all expired items from the cache
   * @returns {number} Number of items removed
   */
  cleanup() {
    let count = 0;
    const now = Date.now();
    
    Object.keys(this.cache).forEach(key => {
      if (now > this.cache[key].expiry) {
        delete this.cache[key];
        count++;
      }
    });
    
    if (count > 0) {
      logger.debug(`Cleaned up ${count} expired cache items`);
    }
    
    return count;
  }
  
  /**
   * Get the current size of the cache
   * @returns {number} Number of items in the cache
   */
  size() {
    return Object.keys(this.cache).length;
  }
}

// Create caches with different TTLs for different types of data
const snpLocationCache = new Cache(24 * 3600000); // 24 hours for SNP locations
const geneDataCache = new Cache(24 * 3600000);    // 24 hours for gene data
const drugTargetCache = new Cache(12 * 3600000);  // 12 hours for drug target data

module.exports = {
  snpLocationCache,
  geneDataCache,
  drugTargetCache
};
