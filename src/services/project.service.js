const { Project, Pulse } = require('../models');
const { AppError } = require('../utils/errorHandler');
const { buildQueryFilter, buildSortOptions } = require('../utils/queryHelpers');

/**
 * Get user projects with filtering and pagination
 */
const getUserProjects = async (userId, query) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    search,
    status,
    priority,
    isArchived = false
  } = query;

  // Build filter
  const filter = { userId, isArchived };
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'client.name': { $regex: search, $options: 'i' } }
    ];
  }
  
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  // Execute query with pagination
  const skip = (page - 1) * limit;
  const projects = await Project.find(filter)
    .sort(buildSortOptions(sort))
    .skip(skip)
    .limit(parseInt(limit))
    .populate('totalSessions')
    .populate('totalHours')
    .populate('totalEarnings');

  const total = await Project.countDocuments(filter);

  return {
    projects,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get project by ID
 */
const getProjectById = async (projectId, userId) => {
  const project = await Project.findOne({ _id: projectId, userId })
    .populate('totalSessions')
    .populate('totalHours')
    .populate('totalEarnings');

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return project;
};

/**
 * Create new project
 */
const createProject = async (projectData) => {
  const project = await Project.create(projectData);
  return project;
};

/**
 * Update project
 */
const updateProject = async (projectId, userId, updateData) => {
  const project = await Project.findOneAndUpdate(
    { _id: projectId, userId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return project;
};

/**
 * Delete project
 */
const deleteProject = async (projectId, userId) => {
  const project = await Project.findOne({ _id: projectId, userId });
  
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Check if project has active sessions
  const activeSessions = await Pulse.countDocuments({
    projectId,
    status: 'active'
  });

  if (activeSessions > 0) {
    throw new AppError('Cannot delete project with active sessions', 400);
  }

  // Delete all related sessions
  await Pulse.deleteMany({ projectId });
  
  // Delete project
  await Project.findByIdAndDelete(projectId);
};

/**
 * Get project statistics
 */
const getProjectStats = async (projectId, userId) => {
  const project = await Project.findOne({ _id: projectId, userId });
  
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Get session statistics
  const sessionStats = await Pulse.aggregate([
    { $match: { projectId: project._id } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalHours: { $sum: '$duration' },
        totalBreakTime: { $sum: '$totalBreakTime' },
        averageSessionLength: { $avg: '$duration' },
        longestSession: { $max: '$duration' },
        shortestSession: { $min: '$duration' }
      }
    }
  ]);

  // Get daily statistics for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyStats = await Pulse.aggregate([
    {
      $match: {
        projectId: project._id,
        startTime: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$startTime' },
          month: { $month: '$startTime' },
          day: { $dayOfMonth: '$startTime' }
        },
        dailyHours: { $sum: '$duration' },
        dailySessions: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  const stats = sessionStats[0] || {
    totalSessions: 0,
    totalHours: 0,
    totalBreakTime: 0,
    averageSessionLength: 0,
    longestSession: 0,
    shortestSession: 0
  };

  // Calculate earnings
  const totalEarnings = stats.totalHours * (project.hourlyRate || 0);
  const completionPercentage = project.completionPercentage;

  return {
    project: {
      id: project._id,
      name: project.name,
      status: project.status,
      priority: project.priority,
      completionPercentage
    },
    statistics: {
      ...stats,
      totalEarnings,
      dailyStats,
      productivity: {
        workToBreakRatio: stats.totalBreakTime > 0 ? stats.totalHours / stats.totalBreakTime : stats.totalHours,
        averageProductiveHours: stats.totalHours - stats.totalBreakTime
      }
    }
  };
};

/**
 * Toggle project archive status
 */
const toggleArchive = async (projectId, userId) => {
  const project = await Project.findOne({ _id: projectId, userId });
  
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  project.isArchived = !project.isArchived;
  await project.save();

  return project;
};

module.exports = {
  getUserProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  toggleArchive
};