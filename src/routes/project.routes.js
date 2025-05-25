const express = require('express');
const { projectController } = require('../controllers');
const { auth, validation, rateLimiter } = require('../middleware');
const router = express.Router();

// All routes require authentication
router.use(auth.authenticate);
router.use(rateLimiter.apiLimiter);

// CRUD operations
router.get('/', 
  validation.validatePagination,
  projectController.getProjects
);

router.post('/', 
  validation.validateProject,
  projectController.createProject
);

router.get('/:id', 
  validation.validateObjectId,
  projectController.getProject
);

router.put('/:id', 
  validation.validateObjectId,
  validation.validateProjectUpdate,
  projectController.updateProject
);

router.delete('/:id', 
  validation.validateObjectId,
  projectController.deleteProject
);

// Project status management
router.patch('/:id/status', 
  validation.validateObjectId,
  validation.validateStatusUpdate,
  projectController.updateStatus
);

router.patch('/:id/archive', 
  validation.validateObjectId,
  projectController.archiveProject
);

router.patch('/:id/restore', 
  validation.validateObjectId,
  projectController.restoreProject
);

// Project analytics
router.get('/:id/stats', 
  validation.validateObjectId,
  projectController.getProjectStats
);

router.get('/:id/time-tracking', 
  validation.validateObjectId,
  validation.validateDateRange,
  projectController.getTimeTracking
);

router.get('/:id/pulses', 
  validation.validateObjectId,
  validation.validatePagination,
  projectController.getProjectPulses
);

// Project collaboration (if needed)
router.post('/:id/share', 
  validation.validateObjectId,
  validation.validateShareOptions,
  projectController.shareProject
);

router.get('/:id/export', 
  validation.validateObjectId,
  validation.validateExportOptions,
  projectController.exportProject
);

module.exports = router;