const express = require('express');
const { configureApp, configureErrorHandling } = require('./config/app');
const routes = require('./routes');
const connectDB = require('./config/database');
const environment = require('./config/environment');

// Create Express application
const app = express();

// Configure application middleware
configureApp(app);

// Connect to database
connectDB();

// API Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'WorkFlowPulse Backend API',
    version: '1.0.0',
    environment: environment.NODE_ENV,
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api',
      docs: '/api/docs'
    }
  });
});

// Configure error handling
configureErrorHandling(app);

// Export app for use in server.js
module.exports = app;