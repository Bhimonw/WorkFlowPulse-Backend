const { SUCCESS_MESSAGES, ERROR_CODES } = require('./constants');

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Response object
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
  
  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} errorCode - Error code
 * @param {*} details - Error details
 * @returns {Object} Response object
 */
const sendError = (res, message = 'Internal Server Error', statusCode = 500, errorCode = ERROR_CODES.SERVER_ERROR, details = null) => {
  const response = {
    success: false,
    message,
    errorCode,
    timestamp: new Date().toISOString()
  };
  
  if (details && process.env.NODE_ENV === 'development') {
    response.details = details;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Response data
 * @param {Object} pagination - Pagination info
 * @param {string} message - Success message
 * @returns {Object} Response object
 */
const sendPaginated = (res, data, pagination, message = 'Success') => {
  const response = {
    success: true,
    message,
    data,
    pagination: {
      currentPage: pagination.page,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      itemsPerPage: pagination.limit,
      hasNextPage: pagination.page < pagination.totalPages,
      hasPrevPage: pagination.page > 1
    },
    timestamp: new Date().toISOString()
  };
  
  return res.status(200).json(response);
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {Array|Object} errors - Validation errors
 * @returns {Object} Response object
 */
const sendValidationError = (res, errors) => {
  return sendError(
    res,
    'Validation failed',
    400,
    ERROR_CODES.VALIDATION_ERROR,
    errors
  );
};

/**
 * Send authentication error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Response object
 */
const sendAuthError = (res, message = 'Authentication failed') => {
  return sendError(
    res,
    message,
    401,
    ERROR_CODES.AUTHENTICATION_ERROR
  );
};

/**
 * Send authorization error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Response object
 */
const sendAuthorizationError = (res, message = 'Access denied') => {
  return sendError(
    res,
    message,
    403,
    ERROR_CODES.AUTHORIZATION_ERROR
  );
};

/**
 * Send not found error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Response object
 */
const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(
    res,
    message,
    404,
    ERROR_CODES.NOT_FOUND_ERROR
  );
};

/**
 * Send rate limit error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Response object
 */
const sendRateLimitError = (res, message = 'Too many requests') => {
  return sendError(
    res,
    message,
    429,
    ERROR_CODES.RATE_LIMIT_ERROR
  );
};

/**
 * Send duplicate error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Response object
 */
const sendDuplicateError = (res, message = 'Resource already exists') => {
  return sendError(
    res,
    message,
    409,
    ERROR_CODES.DUPLICATE_ERROR
  );
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
  sendValidationError,
  sendAuthError,
  sendAuthorizationError,
  sendNotFound,
  sendRateLimitError,
  sendDuplicateError
};