const { NODE_ENV, FRONTEND_URL } = require('./environment');

/**
 * CORS Configuration
 * Handles Cross-Origin Resource Sharing settings for different environments
 */

// Development allowed origins
const developmentOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
];

// Production allowed origins
const productionOrigins = [
  FRONTEND_URL,
  'https://workflowpulse.com',
  'https://www.workflowpulse.com',
  'https://app.workflowpulse.com'
].filter(Boolean); // Remove undefined values

// Staging allowed origins
const stagingOrigins = [
  'https://staging.workflowpulse.com',
  'https://dev.workflowpulse.com',
  FRONTEND_URL
].filter(Boolean);

/**
 * Get allowed origins based on environment
 */
const getAllowedOrigins = () => {
  switch (NODE_ENV) {
    case 'production':
      return productionOrigins;
    case 'staging':
      return stagingOrigins;
    case 'development':
    case 'dev':
    default:
      return developmentOrigins;
  }
};

/**
 * Dynamic origin checker
 * @param {string} origin - The origin to check
 * @param {function} callback - Callback function
 */
const corsOriginChecker = (origin, callback) => {
  const allowedOrigins = getAllowedOrigins();
  
  // Allow requests with no origin (mobile apps, Postman, etc.)
  if (!origin) {
    return callback(null, true);
  }
  
  // Check if origin is in allowed list
  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }
  
  // In development, allow localhost with any port
  if (NODE_ENV === 'development') {
    const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
    if (localhostRegex.test(origin)) {
      return callback(null, true);
    }
  }
  
  // Reject origin
  const error = new Error(`CORS policy violation: Origin ${origin} not allowed`);
  error.status = 403;
  return callback(error, false);
};

/**
 * Main CORS configuration object
 */
const corsConfig = {
  // Dynamic origin checking
  origin: corsOriginChecker,
  
  // Allow credentials (cookies, authorization headers)
  credentials: true,
  
  // Allowed HTTP methods
  methods: [
    'GET',
    'POST', 
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
    'HEAD'
  ],
  
  // Allowed headers
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token',
    'X-Refresh-Token',
    'X-API-Key',
    'X-Client-Version',
    'X-Request-ID'
  ],
  
  // Headers exposed to the client
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Per-Page',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
    'X-Request-ID'
  ],
  
  // Preflight cache duration (in seconds)
  maxAge: NODE_ENV === 'production' ? 86400 : 3600, // 24 hours in prod, 1 hour in dev
  
  // Handle preflight requests
  preflightContinue: false,
  
  // Success status for preflight
  optionsSuccessStatus: 204
};

/**
 * Simple CORS configuration for specific routes
 */
const simpleCorsConfig = {
  origin: getAllowedOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

/**
 * Restrictive CORS for admin routes
 */
const adminCorsConfig = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // More restrictive - require origin to be present
    if (!origin) {
      return callback(new Error('Origin required for admin routes'), false);
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Admin access denied'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Token']
};

/**
 * Public API CORS (more permissive)
 */
const publicApiCorsConfig = {
  origin: '*',
  credentials: false,
  methods: ['GET'],
  allowedHeaders: ['Content-Type', 'X-API-Key']
};

/**
 * WebSocket CORS configuration
 */
const websocketCorsConfig = {
  origin: getAllowedOrigins(),
  credentials: true
};

/**
 * CORS middleware factory for custom configurations
 */
const createCorsMiddleware = (customConfig = {}) => {
  const config = {
    ...corsConfig,
    ...customConfig
  };
  
  return require('cors')(config);
};

/**
 * Logging function for CORS events
 */
const logCorsEvent = (req, allowed = true) => {
  if (NODE_ENV === 'development') {
    const origin = req.headers.origin || 'no-origin';
    const method = req.method;
    const status = allowed ? 'ALLOWED' : 'BLOCKED';
    
    console.log(`[CORS] ${status}: ${method} from ${origin}`);
  }
};

/**
 * Enhanced CORS middleware with logging
 */
const corsWithLogging = (req, res, next) => {
  const cors = require('cors')(corsConfig);
  
  // Log the request
  logCorsEvent(req, true);
  
  cors(req, res, (err) => {
    if (err) {
      logCorsEvent(req, false);
      console.error('[CORS Error]:', err.message);
    }
    next(err);
  });
};

module.exports = {
  corsConfig,
  simpleCorsConfig,
  adminCorsConfig,
  publicApiCorsConfig,
  websocketCorsConfig,
  createCorsMiddleware,
  corsWithLogging,
  getAllowedOrigins,
  corsOriginChecker
};