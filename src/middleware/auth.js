const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { JWT_SECRET } = require('../config/environment');
const { AppError } = require('../utils/errorHandler');
const { asyncHandler } = require('./errorHandler');

/**
 * Authenticate user with JWT from cookie or header
 */
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from cookie first, then from header
  if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Access token not provided', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('User account is deactivated', 401);
    }

    // Add user to request object
    req.user = user;
    
    // Update session if exists
    if (req.session) {
      req.session.lastActivity = new Date();
    }
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid access token', 401);
    } else if (error.name === 'TokenExpiredError') {
      throw new AppError('Access token expired', 401);
    }
    throw error;
  }
});

/**
 * Optional authentication - doesn't throw error if no token
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    await authenticate(req, res, next);
  } catch (error) {
    // Continue without authentication
    next();
  }
});

/**
 * Authorize user roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    next();
  };
};

/**
 * Check if user owns the resource
 */
const checkOwnership = (resourceUserIdField = 'userId') => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (req.user.role !== 'admin' && req.user._id.toString() !== resourceUserId) {
      throw new AppError('Access denied: You can only access your own resources', 403);
    }

    next();
  });
};

/**
 * Session validation middleware
 */
const validateSession = asyncHandler(async (req, res, next) => {
  if (req.session && req.session.userId) {
    // Check if session user matches authenticated user
    if (req.user && req.session.userId !== req.user._id.toString()) {
      req.session.destroy();
      throw new AppError('Session mismatch', 401);
    }
    
    // Update last activity
    req.session.lastActivity = new Date();
  }
  
  next();
});

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  checkOwnership,
  validateSession
};