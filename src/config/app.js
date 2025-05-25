const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const compression = require('compression');

const { corsWithLogging, adminCorsConfig, publicApiCorsConfig } = require('./cors');
const sessionConfig = require('./session');
const { NODE_ENV } = require('./environment');
const { errorHandler, notFoundHandler } = require('../middleware/errorHandler');
const { apiLimiter } = require('../middleware/rateLimiter');

const configureApp = (app) => {
  // Trust proxy for production
  if (NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // Security middleware
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // CORS configuration - Apply before other middleware
  app.use(corsWithLogging);
  
  // Specific CORS for admin routes
  app.use('/api/admin', require('cors')(adminCorsConfig));
  
  // Public API with different CORS
  app.use('/api/public', require('cors')(publicApiCorsConfig));

  // Compression
  app.use(compression());

  // Rate limiting
  app.use('/api/', apiLimiter);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Cookie parser
  app.use(cookieParser());

  // Session configuration
  app.use(session(sessionConfig));

  // Logging
  if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: NODE_ENV,
      cors: {
        enabled: true,
        origin: req.headers.origin || 'no-origin'
      }
    });
  });

  return app;
};

const configureErrorHandling = (app) => {
  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
};

module.exports = {
  configureApp,
  configureErrorHandling
};