const { asyncHandler } = require('../middleware/errorHandler');
const userService = require('../services/user.service');
const { successResponse } = require('../utils/responseHandler');

/**
 * Get all users (Admin only)
 */
const getUsers = asyncHandler(async (req, res) => {
  const query = req.query;
  const users = await userService.getAllUsers(query);
  
  successResponse(res, {
    message: 'Users retrieved successfully',
    data: users
  });
});

/**
 * Get user by ID (Admin only)
 */
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  
  successResponse(res, {
    message: 'User retrieved successfully',
    data: user
  });
});

/**
 * Update user (Admin only)
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const user = await userService.updateUser(id, updateData);
  
  successResponse(res, {
    message: 'User updated successfully',
    data: user
  });
});

/**
 * Delete user (Admin only)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await userService.deleteUser(id);
  
  successResponse(res, {
    message: 'User deleted successfully'
  });
});

/**
 * Activate/Deactivate user (Admin only)
 */
const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await userService.toggleUserStatus(id);
  
  successResponse(res, {
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    data: user
  });
});

/**
 * Get user statistics (Admin only)
 */
const getUserStats = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const stats = await userService.getUserStats(id);
  
  successResponse(res, {
    message: 'User statistics retrieved successfully',
    data: stats
  });
});

/**
 * Get user dashboard data
 */
const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { period } = req.query; // today, week, month, year
  const dashboard = await userService.getDashboardData(userId, period);
  
  successResponse(res, {
    message: 'Dashboard data retrieved successfully',
    data: dashboard
  });
});

/**
 * Get user activity log
 */
const getActivityLog = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const query = req.query;
  const activities = await userService.getActivityLog(userId, query);
  
  successResponse(res, {
    message: 'Activity log retrieved successfully',
    data: activities
  });
});

/**
 * Update user preferences
 */
const updatePreferences = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const preferences = req.body;
  const user = await userService.updatePreferences(userId, preferences);
  
  successResponse(res, {
    message: 'Preferences updated successfully',
    data: user.preferences
  });
});

/**
 * Upload user avatar
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const file = req.file;
  const user = await userService.uploadAvatar(userId, file);
  
  successResponse(res, {
    message: 'Avatar uploaded successfully',
    data: { avatar: user.avatar }
  });
});

/**
 * Delete user avatar
 */
const deleteAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  await userService.deleteAvatar(userId);
  
  successResponse(res, {
    message: 'Avatar deleted successfully'
  });
});

/**
 * Get user time tracking summary
 */
const getTimeTrackingSummary = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate, groupBy } = req.query;
  const summary = await userService.getTimeTrackingSummary(userId, {
    startDate,
    endDate,
    groupBy
  });
  
  successResponse(res, {
    message: 'Time tracking summary retrieved successfully',
    data: summary
  });
});

/**
 * Export user data
 */
const exportUserData = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { format, includeProjects, includeSessions } = req.query;
  
  const result = await userService.exportUserData(userId, {
    format,
    includeProjects: includeProjects === 'true',
    includeSessions: includeSessions === 'true'
  });
  
  res.setHeader('Content-Type', result.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
  res.send(result.data);
});

/**
 * Request account deletion
 */
const requestAccountDeletion = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { reason } = req.body;
  
  await userService.requestAccountDeletion(userId, reason);
  
  successResponse(res, {
    message: 'Account deletion request submitted successfully'
  });
});

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats,
  getDashboard,
  getActivityLog,
  updatePreferences,
  uploadAvatar,
  deleteAvatar,
  getTimeTrackingSummary,
  exportUserData,
  requestAccountDeletion
};