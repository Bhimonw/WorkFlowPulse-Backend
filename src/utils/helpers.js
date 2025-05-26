const crypto = require('crypto');
const { REGEX_PATTERNS } = require('./constants');

/**
 * Generate random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
const generateRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Capitalize first letter of string
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 */
const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert string to slug format
 * @param {string} str - Input string
 * @returns {string} Slug string
 */
const slugify = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
const isValidEmail = (email) => {
  return REGEX_PATTERNS.EMAIL.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} Is strong password
 */
const isStrongPassword = (password) => {
  return REGEX_PATTERNS.PASSWORD.test(password);
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} Is valid ObjectId
 */
const isValidObjectId = (id) => {
  return REGEX_PATTERNS.MONGODB_ID.test(id);
};

/**
 * Remove sensitive fields from object
 * @param {Object} obj - Object to clean
 * @param {Array} fields - Fields to remove
 * @returns {Object} Cleaned object
 */
const removeSensitiveFields = (obj, fields = ['password', '__v']) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const cleaned = { ...obj };
  fields.forEach(field => {
    delete cleaned[field];
  });
  
  return cleaned;
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} Is empty object
 */
const isEmpty = (obj) => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string' || Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate hash from string
 * @param {string} str - String to hash
 * @param {string} algorithm - Hash algorithm (default: sha256)
 * @returns {string} Hash string
 */
const generateHash = (str, algorithm = 'sha256') => {
  return crypto.createHash(algorithm).update(str).digest('hex');
};

/**
 * Mask sensitive data
 * @param {string} str - String to mask
 * @param {number} visibleChars - Number of visible characters at start and end
 * @returns {string} Masked string
 */
const maskSensitiveData = (str, visibleChars = 2) => {
  if (!str || str.length <= visibleChars * 2) return str;
  
  const start = str.substring(0, visibleChars);
  const end = str.substring(str.length - visibleChars);
  const middle = '*'.repeat(str.length - visibleChars * 2);
  
  return start + middle + end;
};

module.exports = {
  generateRandomString,
  generateRandomNumber,
  capitalize,
  slugify,
  isValidEmail,
  isStrongPassword,
  isValidObjectId,
  removeSensitiveFields,
  deepClone,
  isEmpty,
  formatFileSize,
  generateHash,
  maskSensitiveData
};