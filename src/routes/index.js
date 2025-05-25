const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const projectRoutes = require('./project.routes');
const pulseRoutes = require('./pulse.routes');
const printRoutes = require('./print.routes');

const router = express.Router();

// API versioning
const API_VERSION = '/api/v1';

// Mount routes
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/projects`, projectRoutes);
router.use(`${API_VERSION}/pulses`, pulseRoutes);
router.use(`${API_VERSION}/print`, printRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API documentation endpoint
router.get('/api/docs', (req, res) => {
  res.status(200).json({
    message: 'WorkFlowPulse API Documentation',
    version: 'v1',
    endpoints: {
      auth: `${API_VERSION}/auth`,
      users: `${API_VERSION}/users`,
      projects: `${API_VERSION}/projects`,
      pulses: `${API_VERSION}/pulses`,
      print: `${API_VERSION}/print`
    },
    documentation: '/api/docs',
    health: '/health'
  });
});

module.exports = router;