const express = require('express');
const { printController } = require('../controllers');
const { auth, validation, rateLimiter } = require('../middleware');
const router = express.Router();

// All routes require authentication
router.use(auth.authenticate);
router.use(rateLimiter.apiLimiter);

// Thermal printing
router.post('/receipt', 
  validation.validatePrintReceipt,
  printController.printReceipt
);

router.post('/summary', 
  validation.validatePrintSummary,
  printController.printSummary
);

router.post('/report', 
  validation.validatePrintReport,
  printController.printReport
);

// Print templates
router.get('/templates', printController.getTemplates);
router.post('/templates', 
  validation.validateTemplate,
  printController.createTemplate
);
router.put('/templates/:id', 
  validation.validateObjectId,
  validation.validateTemplate,
  printController.updateTemplate
);
router.delete('/templates/:id', 
  validation.validateObjectId,
  printController.deleteTemplate
);

// Printer management
router.get('/printers', printController.getAvailablePrinters);
router.get('/printer/status', printController.getPrinterStatus);
router.post('/printer/test', printController.testPrinter);

// Export functionality
router.post('/export/pdf', 
  validation.validateExportPDF,
  printController.exportToPDF
);

router.post('/export/csv', 
  validation.validateExportCSV,
  printController.exportToCSV
);

router.post('/export/excel', 
  validation.validateExportExcel,
  printController.exportToExcel
);

// Print history
router.get('/history', 
  validation.validatePagination,
  printController.getPrintHistory
);

router.get('/history/:id', 
  validation.validateObjectId,
  printController.getPrintJob
);

module.exports = router;