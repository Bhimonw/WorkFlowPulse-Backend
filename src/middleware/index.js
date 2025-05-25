const { authenticate, optionalAuth, authorize } = require('./auth');
const { validate, userSchemas, projectSchemas, pulseSchemas, querySchemas } = require('./validation');
const { globalErrorHandler, asyncHandler, notFoundHandler } = require('./errorHandler');
const { apiLimiter, authLimiter, passwordResetLimiter } = require('./rateLimiter');

module.exports = {
  // Authentication & Authorization
  authenticate,
  optionalAuth,
  authorize,
  
  // Validation
  validate,
  userSchemas,
  projectSchemas,
  pulseSchemas,
  querySchemas,
  
  // Error Handling
  globalErrorHandler,
  asyncHandler,
  notFoundHandler,
  
  // Rate Limiting
  apiLimiter,
  authLimiter,
  passwordResetLimiter
};