const express = require('express');
const { userController } = require('../controllers');
const { auth, validation, rateLimiter } = require('../middleware');
const router = express.Router();

// All routes require authentication
router.use(auth.authenticate);
router.use(rateLimiter.apiLimiter);

// Profile management
router.get('/profile', userController.getProfile);
router.put('/profile', 
  validation.validateUserUpdate,
  userController.updateProfile
);
router.delete('/profile', userController.deleteAccount);

// Avatar management
router.post('/avatar', userController.uploadAvatar);
router.delete('/avatar', userController.deleteAvatar);

// Preferences
router.get('/preferences', userController.getPreferences);
router.put('/preferences', 
  validation.validatePreferences,
  userController.updatePreferences
);

// Dashboard data
router.get('/dashboard', userController.getDashboard);
router.get('/stats', userController.getStats);
router.get('/activity', userController.getActivity);

// Time tracking analytics
router.get('/analytics/time', 
  validation.validateDateRange,
  userController.getTimeAnalytics
);
router.get('/analytics/productivity', 
  validation.validateDateRange,
  userController.getProductivityAnalytics
);
router.get('/analytics/earnings', 
  validation.validateDateRange,
  userController.getEarningsAnalytics
);

// Data export
router.get('/export/data', 
  validation.validateExportOptions,
  userController.exportData
);
router.get('/export/report', 
  validation.validateReportOptions,
  userController.generateReport
);

// Account status
router.put('/status', 
  auth.authorize(['admin']),
  validation.validateStatusUpdate,
  userController.updateStatus
);

// Admin routes
router.get('/list', 
  auth.authorize(['admin']),
  validation.validatePagination,
  userController.getUsers
);

module.exports = router;