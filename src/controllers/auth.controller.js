const { asyncHandler } = require('../middleware/errorHandler');
const authService = require('../services/auth.service');
const { AppError } = require('../utils/errorHandler');
const { successResponse } = require('../utils/responseHandler');

/**
 * Register new user
 */
const register = asyncHandler(async (req, res) => {
  const userData = req.body;
  const result = await authService.register(userData);
  
  successResponse(res, {
    message: 'User registered successfully',
    data: result
  }, 201);
});

/**
 * Login user
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  
  successResponse(res, {
    message: 'Login successful',
    data: result
  });
});

/**
 * Refresh access token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshToken(refreshToken);
  
  successResponse(res, {
    message: 'Token refreshed successfully',
    data: result
  });
});

/**
 * Logout user
 */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);
  
  successResponse(res, {
    message: 'Logout successful'
  });
});

/**
 * Get current user profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  
  successResponse(res, {
    message: 'Profile retrieved successfully',
    data: user
  });
});

/**
 * Update user profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updateData = req.body;
  const user = await authService.updateProfile(userId, updateData);
  
  successResponse(res, {
    message: 'Profile updated successfully',
    data: user
  });
});

/**
 * Change password
 */
const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;
  
  await authService.changePassword(userId, currentPassword, newPassword);
  
  successResponse(res, {
    message: 'Password changed successfully'
  });
});

/**
 * Request password reset
 */
const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.requestPasswordReset(email);
  
  successResponse(res, {
    message: 'Password reset email sent'
  });
});

/**
 * Reset password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);
  
  successResponse(res, {
    message: 'Password reset successfully'
  });
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword
};