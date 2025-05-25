const { Pulse, Project } = require('../models');
const { AppError } = require('../utils/errorHandler');
const { calculateDuration, formatDuration } = require('../utils/dateUtils');

/**
 * Start new work session
 */
const startSession = async (sessionData) => {
  const { userId, projectId, description, tags } = sessionData;

  // Verify project exists and belongs to user
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Check if user has any active sessions
  const activeSession = await Pulse.findOne({
    userId,
    status: 'active'
  });

  if (activeSession) {
    throw new AppError('You already have an active session. Please stop it first.', 400);
  }

  // Create new session
  const session = await Pulse.create({
    userId,
    projectId,
    description,
    tags,
    startTime: new Date(),
    status: 'active'
  });

  return await session.populate('projectId', 'name status priority');
};

/**
 * Stop work session
 */
const stopSession = async (sessionId, userId) => {
  const session = await Pulse.findOne({ _id: sessionId, userId });
  
  if (!session) {
    throw new AppError('Session not found', 404);
  }

  if (session.status !== 'active') {
    throw new AppError('Session is not active', 400);
  }

  // Calculate duration
  const endTime = new Date();
  const duration = calculateDuration(session.startTime, endTime);

  // Update session
  session.endTime = endTime;
  session.duration = duration;
  session.status = 'completed';
  
  await session.save();

  return await session.populate('projectId', 'name status priority');
};

/**
 * Pause work session
 */
const pauseSession = async (sessionId, userId) => {
  const session = await Pulse.findOne({ _id: sessionId, userId });
  
  if (!session) {
    throw new AppError('Session not found', 404);
  }

  if (session.status !== 'active') {
    throw new AppError('Session is not active', 400);
  }

  session.status = 'paused';
  session.pausedAt = new Date();
  
  await session.save();

  return await session.populate('projectId', 'name status priority');
};

/**
 * Resume work session
 */
const resumeSession = async (sessionId, userId) => {
  const session = await Pulse.findOne({ _id: sessionId, userId });
  
  if (!session) {
    throw new AppError('Session not found', 404);
  }

  if (session.status !== 'paused') {
    throw new AppError('Session is not paused', 400);
  }

  // Calculate pause duration and add to total break time
  if (session.pausedAt) {
    const pauseDuration = calculateDuration(session.pausedAt, new Date());
    session.totalBreakTime += pauseDuration;
  }

  session.status = 'active';
  session.pausedAt = null;
  
  await session.save();

  return await session.populate('projectId', 'name status priority');
};

/**
 * Get user sessions with filtering
 */
const getUserSessions = async (userId, query) => {
  const {
    page = 1,
    limit = 10,
    sort = '-startTime',
    projectId,
    status,
    startDate,
    endDate
  } = query;

  // Build filter
  const filter = { userId };
  
  if (projectId) filter.projectId = projectId;
  if (status) filter.status = status;
  
  if (startDate || endDate) {
    filter.startTime = {};
    if (startDate) filter.startTime.$gte = new Date(startDate);
    if (endDate) filter.startTime.$lte = new Date(endDate);
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;
  const sessions = await Pulse.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('projectId', 'name status priority hourlyRate');

  const total = await Pulse.countDocuments(filter);

  return {
    sessions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get session by ID
 */
const getSessionById = async (sessionId, userId) => {
  const session = await Pulse.findOne({ _id: sessionId, userId })
    .populate('projectId', 'name status priority hourlyRate');

  if (!session) {
    throw new AppError('Session not found', 404);
  }

  return session;
};

/**
 * Update session
 */
const updateSession = async (sessionId, userId, updateData) => {
  const allowedUpdates = ['description', 'tags'];
  const updates = {};
  
  Object.keys(updateData).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = updateData[key];
    }
  });

  const session = await Pulse.findOneAndUpdate(
    { _id: sessionId, userId },
    updates,
    { new: true, runValidators: true }
  ).populate('projectId', 'name status priority');

  if (!session) {
    throw new AppError('Session not found', 404);
  }

  return session;
};

/**
 * Delete session
 */
const deleteSession = async (sessionId, userId) => {
  const session = await Pulse.findOne({ _id: sessionId, userId });
  
  if (!session) {
    throw new AppError('Session not found', 404);
  }

  if (session.status === 'active') {
    throw new AppError('Cannot delete active session', 400);
  }

  await Pulse.findByIdAndDelete(sessionId);
};

/**
 * Add break to session
 */
const addBreak = async (sessionId, userId, breakData) => {
  const session = await Pulse.findOne({ _id: sessionId, userId });
  
  if (!session) {
    throw new AppError('Session not found', 404);
  }

  const breakEntry = {
    startTime: new Date(),
    reason: breakData.reason,
    duration: breakData.duration || 0
  };

  session.breaks.push(breakEntry);
  session.totalBreakTime += breakEntry.duration;
  
  await session.save();

  return await session.populate('projectId', 'name status priority');
};

/**
 * Get active session for user
 */
const getActiveSession = async (userId) => {
  const session = await Pulse.findOne({
    userId,
    status: { $in: ['active', 'paused'] }
  }).populate('projectId', 'name status priority');

  return session;
};

module.exports = {
  startSession,
  stopSession,
  pauseSession,
  resumeSession,
  getUserSessions,
  getSessionById,
  updateSession,
  deleteSession,
  addBreak,
  getActiveSession
};