const { asyncHandler } = require('../middleware/errorHandler');
const authService = require('../services/auth.service');
const { AppError } = require('../utils/errorHandler');
const { successResponse } = require('../utils/responseHandler');

// Cookie configuration
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
};

const accessTokenCookieOptions = {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000, // 15 minutes for access token
};

/**
 * Register new user
 */
const register = asyncHandler(async (req, res) => {
  const userData = req.body;
  const result = await authService.register(userData);
  
  // Set cookies
  res.cookie('accessToken', result.tokens.accessToken, accessTokenCookieOptions);
  res.cookie('refreshToken', result.tokens.refreshToken, cookieOptions);
  
  // Remove tokens from response body for security
  const { tokens, ...responseData } = result;
  
  successResponse(res, {
    message: 'User registered successfully',
    data: responseData
  }, 201);
});

/**
 * Login user
 */
const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const result = await authService.login(email, password);
  
  // Adjust cookie expiration based on remember me
  const refreshCookieOptions = {
    ...cookieOptions,
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 // 30 days if remember me, else 7 days
  };
  
  // Set cookies
  res.cookie('accessToken', result.tokens.accessToken, accessTokenCookieOptions);
  res.cookie('refreshToken', result.tokens.refreshToken, refreshCookieOptions);
  
  // Set session data
  req.session.userId = result.user.id;
  req.session.userRole = result.user.role;
  req.session.loginTime = new Date();
  
  // Remove tokens from response body for security
  const { tokens, ...responseData } = result;
  
  successResponse(res, {
    message: 'Login successful',
    data: responseData
  });
});

/**
 * Refresh access token
 */
const refreshToken = asyncHandler(async (req, res) => {
  // Get refresh token from cookie or body
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  
  if (!refreshToken) {
    throw new AppError('Refresh token not provided', 401);
  }
  
  const result = await authService.refreshToken(refreshToken);
  
  // Update cookies with new tokens
  res.cookie('accessToken', result.accessToken, accessTokenCookieOptions);
  res.cookie('refreshToken', result.refreshToken, cookieOptions);
  
  successResponse(res, {
    message: 'Token refreshed successfully',
    data: {
      message: 'Tokens updated in cookies'
    }
  });
});

/**
 * Logout user
 */
const logout = asyncHandler(async (req, res) => {
  // Get refresh token from cookie or body
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  
  if (refreshToken) {
    await authService.logout(refreshToken);
  }
  
  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
  });
  
  successResponse(res, {
    message: 'Logout successful'
  });
});

/**
 * Logout from all devices
 */
const logoutAll = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  await authService.logoutAll(userId);
  
  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
  });
  
  successResponse(res, {
    message: 'Logged out from all devices successfully'
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
  
  // Logout from all other devices after password change
  await authService.logoutAll(userId);
  
  // Clear current session cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  
  successResponse(res, {
    message: 'Password changed successfully. Please login again.'
  });
});

/**
 * Request password reset
 */
const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.requestPasswordReset(email);
  
  successResponse(res, {
    message: 'Password reset email sent successfully'
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

/**
 * Verify email
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  await authService.verifyEmail(token);
  
  successResponse(res, {
    message: 'Email verified successfully'
  });
});

/**
 * Check authentication status
 */
const checkAuth = asyncHandler(async (req, res) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;
  
  if (!accessToken && !refreshToken) {
    throw new AppError('Not authenticated', 401);
  }
  
  successResponse(res, {
    message: 'User is authenticated',
    data: {
      user: req.user,
      session: {
        loginTime: req.session.loginTime,
        userId: req.session.userId
      }
    }
  });
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getProfile,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  checkAuth
};