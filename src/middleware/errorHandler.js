const { AppError } = require('../utils/errorHandler');
const logger = require('../utils/logger');
const environment = require('../config/environment');

/**
 * Global Error Handling Middleware
 */
const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error({
    error: err,
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      user: req.user?.id
    }
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    const message = errors.join(', ');
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401);
  }

  // Send error response
  sendErrorResponse(error, req, res);
};

/**
 * Send error response
 */
const sendErrorResponse = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        ...(environment.NODE_ENV === 'development' && { stack: err.stack })
      }
    });
  } else {
    // Programming or other unknown error: don't leak error details
    res.status(500).json({
      success: false,
      error: {
        message: 'Something went wrong',
        ...(environment.NODE_ENV === 'development' && {
          message: err.message,
          stack: err.stack
        })
      }
    });
  }
};

/**
 * Handle async errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

module.exports = {
  globalErrorHandler,
  asyncHandler,
  notFoundHandler
};