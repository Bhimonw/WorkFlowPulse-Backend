const { asyncHandler } = require('../middleware/errorHandler');
const pulseService = require('../services/pulse.service');
const { successResponse } = require('../utils/responseHandler');

/**
 * Start new work session
 */
const startSession = asyncHandler(async (req, res) => {
  const sessionData = {
    ...req.body,
    userId: req.user.id
  };
  
  const session = await pulseService.startSession(sessionData);
  
  successResponse(res, {
    message: 'Work session started successfully',
    data: session
  }, 201);
});

/**
 * Stop current work session
 */
const stopSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const session = await pulseService.stopSession(id, userId);
  
  successResponse(res, {
    message: 'Work session stopped successfully',
    data: session
  });
});

/**
 * Pause work session
 */
const pauseSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const session = await pulseService.pauseSession(id, userId);
  
  successResponse(res, {
    message: 'Work session paused successfully',
    data: session
  });
});

/**
 * Resume work session
 */
const resumeSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const session = await pulseService.resumeSession(id, userId);
  
  successResponse(res, {
    message: 'Work session resumed successfully',
    data: session
  });
});

/**
 * Get user's work sessions
 */
const getSessions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const query = req.query;
  const sessions = await pulseService.getUserSessions(userId, query);
  
  successResponse(res, {
    message: 'Work sessions retrieved successfully',
    data: sessions
  });
});

/**
 * Get session by ID
 */
const getSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const session = await pulseService.getSessionById(id, userId);
  
  successResponse(res, {
    message: 'Work session retrieved successfully',
    data: session
  });
});

/**
 * Update session details
 */
const updateSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const updateData = req.body;
  
  const session = await pulseService.updateSession(id, userId, updateData);
  
  successResponse(res, {
    message: 'Work session updated successfully',
    data: session
  });
});

/**
 * Delete session
 */
const deleteSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  await pulseService.deleteSession(id, userId);
  
  successResponse(res, {
    message: 'Work session deleted successfully'
  });
});

/**
 * Add break to session
 */
const addBreak = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const breakData = req.body;
  
  const session = await pulseService.addBreak(id, userId, breakData);
  
  successResponse(res, {
    message: 'Break added successfully',
    data: session
  });
});

/**
 * Get active session
 */
const getActiveSession = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const session = await pulseService.getActiveSession(userId);
  
  successResponse(res, {
    message: 'Active session retrieved successfully',
    data: session
  });
});

module.exports = {
  startSession,
  stopSession,
  pauseSession,
  resumeSession,
  getSessions,
  getSession,
  updateSession,
  deleteSession,
  addBreak,
  getActiveSession
};