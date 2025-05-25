const { asyncHandler } = require('../middleware/errorHandler');
const printService = require('../services/print.service');
const { successResponse } = require('../utils/responseHandler');

/**
 * Print session receipt
 */
const printSessionReceipt = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;
  const options = req.body;
  
  const result = await printService.printSessionReceipt(sessionId, userId, options);
  
  successResponse(res, {
    message: 'Session receipt printed successfully',
    data: result
  });
});

/**
 * Print project summary
 */
const printProjectSummary = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  const options = req.body;
  
  const result = await printService.printProjectSummary(projectId, userId, options);
  
  successResponse(res, {
    message: 'Project summary printed successfully',
    data: result
  });
});

/**
 * Print daily report
 */
const printDailyReport = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { date } = req.params;
  const options = req.body;
  
  const result = await printService.printDailyReport(userId, date, options);
  
  successResponse(res, {
    message: 'Daily report printed successfully',
    data: result
  });
});

/**
 * Export session data
 */
const exportSessionData = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;
  const { format } = req.query; // pdf, csv, json
  
  const result = await printService.exportSessionData(sessionId, userId, format);
  
  res.setHeader('Content-Type', result.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
  res.send(result.data);
});

/**
 * Export project data
 */
const exportProjectData = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  const { format, dateRange } = req.query;
  
  const result = await printService.exportProjectData(projectId, userId, format, dateRange);
  
  res.setHeader('Content-Type', result.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
  res.send(result.data);
});

/**
 * Get printer status
 */
const getPrinterStatus = asyncHandler(async (req, res) => {
  const status = await printService.getPrinterStatus();
  
  successResponse(res, {
    message: 'Printer status retrieved successfully',
    data: status
  });
});

module.exports = {
  printSessionReceipt,
  printProjectSummary,
  printDailyReport,
  exportSessionData,
  exportProjectData,
  getPrinterStatus
};