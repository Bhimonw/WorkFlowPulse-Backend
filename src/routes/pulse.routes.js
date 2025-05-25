const express = require('express');
const { pulseController } = require('../controllers');
const { auth, validation, rateLimiter } = require('../middleware');
const router = express.Router();

// All routes require authentication
router.use(auth.authenticate);
router.use(rateLimiter.apiLimiter);

// Session management
router.post('/start', 
  validation.validatePulseStart,
  pulseController.startPulse
);

router.post('/stop', 
  validation.validatePulseStop,
  pulseController.stopPulse
);

router.post('/pause', 
  validation.validatePulseAction,
  pulseController.pausePulse
);

router.post('/resume', 
  validation.validatePulseAction,
  pulseController.resumePulse
);

// Current session info
router.get('/current', pulseController.getCurrentPulse);
router.get('/status', pulseController.getPulseStatus);

// Session history
router.get('/', 
  validation.validatePagination,
  validation.validateDateRange,
  pulseController.getPulses
);

router.get('/:id', 
  validation.validateObjectId,
  pulseController.getPulse
);

// Session modifications
router.put('/:id', 
  validation.validateObjectId,
  validation.validatePulseUpdate,
  pulseController.updatePulse
);

router.delete('/:id', 
  validation.validateObjectId,
  pulseController.deletePulse
);

// Session analytics
router.get('/analytics/daily', 
  validation.validateDateRange,
  pulseController.getDailyAnalytics
);

router.get('/analytics/weekly', 
  validation.validateDateRange,
  pulseController.getWeeklyAnalytics
);

router.get('/analytics/monthly', 
  validation.validateDateRange,
  pulseController.getMonthlyAnalytics
);

// Time tracking reports
router.get('/reports/summary', 
  validation.validateDateRange,
  pulseController.getTimeSummary
);

router.get('/reports/detailed', 
  validation.validateDateRange,
  validation.validateReportOptions,
  pulseController.getDetailedReport
);

// Bulk operations
router.post('/bulk/delete', 
  validation.validateBulkDelete,
  pulseController.bulkDeletePulses
);

router.post('/bulk/export', 
  validation.validateBulkExport,
  pulseController.bulkExportPulses
);

module.exports = router;